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

    enum Action { USER_BET, USER_OUTCOME , REWARD_DISTRIBUTION }

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

    constructor(string[] memory _memeNames, address[] memory _memeTokenAddresses, address _creator, address _userContractAddress) {
        require(_memeNames.length == _memeTokenAddresses.length, "Meme names and tokens length mismatch");
        memeNames = _memeNames;
        memeTokenAddresses = _memeTokenAddresses;
        creator = _creator;
        userContract = User(_userContractAddress);
        battleEnded = false;
    }

    function didReceiveAttestation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata extraData
    ) external payable override {
        require(!battleEnded, "Battle has ended");
        require(msg.value > 0, "Amount must be greater than 0");

        (Action action, address memeToken, uint256 amount) = abi.decode(extraData, (Action, address, uint256));
        require(validMemeToken(memeToken), "Invalid meme token");

        // Fetch the user's current score before updating
        uint256 userScoreBefore = userContract.getUserScore(attester);

        if (action == Action.USER_BET) {
            // Handle betting
            require(msg.value >= amount, "Insufficient payment");

            Staker storage staker = stakers[memeToken][attester];
            staker.amount += amount;
            staker.hasStaked = true;
            totalStakedPerMeme[memeToken] += amount;

            emit Staked(attester, memeToken, amount);

            // Update user stats
            userContract.updateBetStats(attester, amount);

            // Fetch the user's updated score
            uint256 userScoreAfter = userContract.getUserScore(attester);

            // Emit an event with the user's scores
            emit UserScoreUpdated(attester, userScoreBefore, userScoreAfter);

        } else if (action == Action.USER_OUTCOME) {
            // Handle message sending
            emit MessageSent(attester, string(abi.encodePacked(extraData[64:])));
        }  else if (action == Action.REWARD_DISTRIBUTION) {
            // handle reward distributon logic here 
        }
    }

    function didReceiveRevocation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata extraData
    ) external payable override {
        // Implement revocation logic if needed
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