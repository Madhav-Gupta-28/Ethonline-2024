// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import "./User.sol";

contract MemeBattle is ISPHook {
    User public userContract;

    struct Staker {
        uint256 amount;
        bool hasStaked;
    }

    enum Action { USER_BET, MEME_WIN}

    string[] public memeNames;
    address[] public memeTokenAddresses;
    address public creator;
    mapping(address => mapping(address => Staker)) public stakers;
    mapping(address => uint256) public totalStakedPerMeme;
    address public winningMemeToken;
    bool public battleEnded;

    event Staked(address indexed user, address indexed memeToken, uint256 amount);
    event Unstaked(address indexed user, address indexed memeToken, uint256 amount);
    event MemeBattleEnded(address indexed winningMemeToken);
    event RewardDistributed(address indexed user, address indexed memeToken, uint256 reward);
    event MessageSent(address indexed user, string message);
    event UserScoreUpdated(address user, uint256 scoreBefore, uint256 scoreAfter);

    constructor(string[] memory _memeNames, address _creator, address _userContractAddress) {
        memeNames = _memeNames;
        creator = _creator;
        userContract = User(_userContractAddress);
        battleEnded = false;
    }

    function didReceiveAttestation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata  extraData
        ) external payable  {
        require(!battleEnded, "Battle has ended");

        (Action action, address memeToken, uint256 amount) = abi.decode(extraData, (Action, address, uint256));
        require(validMemeToken(memeToken), "Invalid meme token");

        if (action == Action.USER_BET) {
            require(msg.value >= amount, "Insufficient payment");

            Staker storage staker = stakers[memeToken][attester];
            staker.amount += amount;
            staker.hasStaked = true;
            totalStakedPerMeme[memeToken] += amount;

            emit Staked(attester, memeToken, amount);

            // Update user stats
            uint256 userScoreBefore = userContract.getUserScore(attester);
            userContract.updateBetStats(attester, amount);
            uint256 userScoreAfter = userContract.getUserScore(attester);

            emit UserScoreUpdated(attester, userScoreBefore, userScoreAfter);

        } else if (action == Action.MEME_WIN) {
            require(attester == creator, "Only the creator can declare a winner");
            require(!battleEnded, "Battle already ended");

            winningMemeToken = memeToken;
            battleEnded = true;

            emit MemeBattleEnded(winningMemeToken);

            // Calculate total stakes
            uint256 totalStake = 0;
            for (uint256 i = 0; i < memeTokenAddresses.length; i++) {
                totalStake += totalStakedPerMeme[memeTokenAddresses[i]];
            }

            uint256 winningStake = totalStakedPerMeme[winningMemeToken];
            require(winningStake > 0, "No stakes on winning meme");

            // Distribute rewards to winners
            for (uint256 i = 0; i < memeTokenAddresses.length; i++) {
                address currentMemeToken = memeTokenAddresses[i];
                bool isWinningMeme = (currentMemeToken == winningMemeToken);

                for (uint256 j = 0; j < memeTokenAddresses.length; j++) {
                    address staker = address(uint160(j)); // Replace with actual staker address
                    if (stakers[currentMemeToken][staker].amount > 0) {
                        uint256 userStake = stakers[currentMemeToken][staker].amount;
                        uint256 userScoreBefore = userContract.getUserScore(staker);

                        if (isWinningMeme) {
                            // Calculate reward proportional to stake
                            uint256 reward = (userStake * totalStake) / winningStake;
                            payable(staker).transfer(reward);
                            emit RewardDistributed(staker, currentMemeToken, reward);
                            userContract.updateWinStats(staker);
                        } else {
                            userContract.updateLossStats(staker);
                        }

                        uint256 userScoreAfter = userContract.getUserScore(staker);
                        emit UserScoreUpdated(staker, userScoreBefore, userScoreAfter);

                        // Clear staker's data
                        delete stakers[currentMemeToken][staker];
                    }
                }

            // Reset total staked amount for this meme
            totalStakedPerMeme[currentMemeToken] = 0;
            }

        // Ensure all funds have been distributed
        require(address(this).balance == 0, "Not all funds distributed");
        }
    }

    function didReceiveRevocation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata extraData
    ) external payable  {
        // Implement revocation logic if needed
    }

    function didReceiveAttestation(
            address attester,
            uint64, // schemaId
            uint64, // attestationId
            IERC20, // resolverFeeERC20Token
            uint256, // resolverFeeERC20Amount
            bytes calldata // extraData
        )
            external
            view
        {
        // Logic here
        }

    function didReceiveRevocation(
            address attester,
            uint64, // schemaId
            uint64, // attestationId
            IERC20, // resolverFeeERC20Token
            uint256, // resolverFeeERC20Amount
            bytes calldata // extraData
        )
            external
            view
        {
        // Logic here
        }

    


    function unstake(address memeToken) external {
        require(stakers[memeToken][msg.sender].hasStaked, "No staked tokens found");
        require(stakers[memeToken][msg.sender].amount > 0, "No staked tokens to unstake");

        uint256 amount = stakers[memeToken][msg.sender].amount;
        payable(msg.sender).transfer(amount);

        totalStakedPerMeme[memeToken] -= amount;
        delete stakers[memeToken][msg.sender];

        emit Unstaked(msg.sender, memeToken, amount);

        // Update user stats for unstaking
        userContract.updateBetStats(msg.sender, 0);
    }

    function endBattle(address _winningMemeToken) external {
        require(msg.sender == creator, "Only the creator can end the battle");
        require(validMemeToken(_winningMemeToken), "Invalid winning meme token");
        require(!battleEnded, "Battle already ended");

        winningMemeToken = _winningMemeToken;
        battleEnded = true;

        emit MemeBattleEnded(_winningMemeToken);

        distributeRewards();
    }

    function distributeRewards() internal {
        uint256 totalLosingStake = 0;

        for (uint256 i = 0; i < memeTokenAddresses.length; i++) {
            if (memeTokenAddresses[i] != winningMemeToken) {
                totalLosingStake += totalStakedPerMeme[memeTokenAddresses[i]];
            }
        }

        uint256 rewardPool = totalStakedPerMeme[winningMemeToken] + totalLosingStake;

        for (uint256 i = 0; i < memeTokenAddresses.length; i++) {
            if (memeTokenAddresses[i] == winningMemeToken) {
                for (uint256 j = 0; j < memeTokenAddresses.length; j++) {
                    address staker = address(uint160(j)); // This is a placeholder, replace with actual staker address
                    if (stakers[memeTokenAddresses[i]][staker].amount > 0) {
                        uint256 userStake = stakers[memeTokenAddresses[i]][staker].amount;
                        uint256 reward = (userStake * rewardPool) / totalStakedPerMeme[winningMemeToken];
                        payable(staker).transfer(reward);
                        emit RewardDistributed(staker, memeTokenAddresses[i], reward);
                        
                        // Update user win stats
                        userContract.updateWinStats(staker);
                    }
                }
            } else {
                for (uint256 j = 0; j < memeTokenAddresses.length; j++) {
                    address staker = address(uint160(j)); // This is a placeholder, replace with actual staker address
                    if (stakers[memeTokenAddresses[i]][staker].amount > 0) {
                        // Update user loss stats
                        userContract.updateLossStats(staker);
                    }
                }
                
                // Handle losing tokens (e.g., burn or redistribute)
                uint256 burnAmount = (totalStakedPerMeme[memeTokenAddresses[i]] * 20) / 100;
                uint256 transferAmount = totalStakedPerMeme[memeTokenAddresses[i]] - burnAmount;
                payable(address(this)).transfer(burnAmount);
                payable(address(winningMemeToken)).transfer(transferAmount);
            }
        }
    }

    function validMemeToken(address memeToken) internal view returns (bool) {
        for (uint256 i = 0; i < memeTokenAddresses.length; i++) {
            if (memeTokenAddresses[i] == memeToken) {
                return true;
            }
        }
        return false;
    }

    function getUserScore(address user) external view returns (uint256) {
        return userContract.getUserScore(user);
    }

    function getUserStats(address user) external view returns (User.UserStats memory) {
        return userContract.getUserStats(user);
    }

    receive() external payable {}
}