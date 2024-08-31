// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import "./User.sol";

contract MemeBattle is ISPHook {
    User public userContract;

    struct Staker {
        uint256 amount;
        bool hasStaked;
    }

    enum Action {
        USER_BET,
        MEME_WIN
    }

    string[] public memeNames;
    address public creator;
    mapping(uint256 => mapping(address => Staker)) public stakers;
    mapping(uint256 => uint256) public totalStakedPerMeme;
    mapping(uint256 => address[]) public stakersPerMeme;
    uint256 public winningMemeIndex;
    bool public battleEnded;

    event Staked(address indexed user, uint256 indexed memeIndex, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed memeIndex, uint256 amount);
    event MemeBattleEnded(uint256 indexed winningMemeIndex);
    event RewardDistributed(address indexed user, uint256 indexed memeIndex, uint256 reward);
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
        bytes calldata extraData
    ) external payable override {
        require(!battleEnded, "Battle has ended");

        (Action action, uint256 memeIndex, uint256 amount) = abi.decode(extraData, (Action, uint256, uint256));
        require(memeIndex < memeNames.length, "Invalid meme index");

        if (action == Action.USER_BET) {
            require(msg.value >= amount, "Insufficient payment");
            require(amount > 0, "Bet amount must be greater than 0");

            Staker storage staker = stakers[memeIndex][attester];
            staker.amount += amount;
            staker.hasStaked = true;
            totalStakedPerMeme[memeIndex] += amount;
            stakersPerMeme[memeIndex].push(attester);

            emit Staked(attester, memeIndex, amount);

            uint256 userScoreBefore = userContract.getUserScore(attester);
            userContract.updateBetStats(attester, amount);
            uint256 userScoreAfter = userContract.getUserScore(attester);

            emit UserScoreUpdated(attester, userScoreBefore, userScoreAfter);

            if (msg.value > amount) {
                payable(attester).transfer(msg.value - amount);
            }
        } else if (action == Action.MEME_WIN) {
            require(attester == creator, "Only the creator can declare a winner");
            require(!battleEnded, "Battle already ended");

            winningMemeIndex = memeIndex;
            battleEnded = true;

            emit MemeBattleEnded(winningMemeIndex);

            distributeRewards();
        }
    }

    function didReceiveRevocation(
        address revoker,
        bytes32 schemaId,
        bytes memory revocationData
    ) external override {
        // Implement revocation logic if needed
    }

    function unstake(uint256 memeIndex) external {
        require(!battleEnded, "Battle has ended");
        require(stakers[memeIndex][msg.sender].hasStaked, "No staked tokens found");
        require(stakers[memeIndex][msg.sender].amount > 0, "No staked tokens to unstake");

        uint256 amount = stakers[memeIndex][msg.sender].amount;
        payable(msg.sender).transfer(amount);

        totalStakedPerMeme[memeIndex] -= amount;
        delete stakers[memeIndex][msg.sender];

        emit Unstaked(msg.sender, memeIndex, amount);

        userContract.updateBetStats(msg.sender, 0);
    }

    function distributeRewards() internal {
        uint256 totalStake = 0;
        for (uint256 i = 0; i < memeNames.length; i++) {
            totalStake += totalStakedPerMeme[i];
        }

        uint256 winningStake = totalStakedPerMeme[winningMemeIndex];
        require(winningStake > 0, "No stakes on winning meme");

        for (uint256 i = 0; i < memeNames.length; i++) {
            bool isWinningMeme = (i == winningMemeIndex);

            for (uint256 j = 0; j < stakersPerMeme[i].length; j++) {
                address staker = stakersPerMeme[i][j];
                if (stakers[i][staker].amount > 0) {
                    uint256 userStake = stakers[i][staker].amount;
                    uint256 userScoreBefore = userContract.getUserScore(staker);

                    if (isWinningMeme) {
                        uint256 reward = (userStake * totalStake) / winningStake;
                        payable(staker).transfer(reward);
                        emit RewardDistributed(staker, i, reward);
                        userContract.updateWinStats(staker);
                    } else {
                        userContract.updateLossStats(staker);
                    }

                    uint256 userScoreAfter = userContract.getUserScore(staker);
                    emit UserScoreUpdated(staker, userScoreBefore, userScoreAfter);

                    delete stakers[i][staker];
                }
            }

            totalStakedPerMeme[i] = 0;
        }

        require(address(this).balance == 0, "Not all funds distributed");
    }

    function getUserScore(address user) external view returns (uint256) {
        return userContract.getUserScore(user);
    }

    function getUserStats(address user) external view returns (User.UserStats memory) {
        return userContract.getUserStats(user);
    }

    receive() external payable {}
}