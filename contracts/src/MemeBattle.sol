// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
// MemeBattle Contract
contract MemeBattle {
    struct Staker {
        uint256 amount;  // Amount staked by the user
        bool hasStaked;  // Whether the user has staked or not
    }

    string[] public memeNames;  // Array of meme names
    address[] public memeTokenAddresses;  // Corresponding token addresses for each meme
    address public creator;  // Address of the contract creator
    mapping(address => mapping(address => Staker)) public stakers;  // Mapping of meme token -> staker -> stake details
    mapping(address => uint256) public totalStakedPerMeme;  // Total staked amount per meme token
    address public winningMemeToken;  // The winning meme token address
    bool public battleEnded;  // Whether the battle has ended

    event Staked(address indexed user, address indexed memeToken, uint256 amount);
    event Unstaked(address indexed user, address indexed memeToken, uint256 amount);
    event MemeBattleEnded(address indexed winningMemeToken);
    event RewardDistributed(address indexed user, address indexed memeToken, uint256 reward);
    event MessageSent(address indexed user, string message);

    constructor(string[] memory _memeNames, address[] memory _memeTokenAddresses, address _creator) {
        require(_memeNames.length == _memeTokenAddresses.length, "Meme names and tokens length mismatch");
        memeNames = _memeNames;
        memeTokenAddresses = _memeTokenAddresses;
        creator = _creator;
        battleEnded = false;
    }

    // Stake tokens on a meme
    function stake(address memeToken, uint256 amount) external {
        require(!battleEnded, "Battle has ended");
        require(validMemeToken(memeToken), "Invalid meme token");
        require(amount > 0, "Amount must be greater than 0");

        ERC20(memeToken).transferFrom(msg.sender, address(this), amount);

        Staker storage staker = stakers[memeToken][msg.sender];
        staker.amount += amount;
        staker.hasStaked = true;
        totalStakedPerMeme[memeToken] += amount;

        emit Staked(msg.sender, memeToken, amount);
    }

    // Unstake tokens from a meme
    function unstake(address memeToken) external {
        require(stakers[memeToken][msg.sender].hasStaked, "No staked tokens found");
        require(stakers[memeToken][msg.sender].amount > 0, "No staked tokens to unstake");

        uint256 amount = stakers[memeToken][msg.sender].amount;

        ERC20(memeToken).transfer(msg.sender, amount);

        totalStakedPerMeme[memeToken] -= amount;
        delete stakers[memeToken][msg.sender];

        emit Unstaked(msg.sender, memeToken, amount);
    }

    // Send a message (Note: This function only emits an event, actual chat would be handled off-chain)
    function sendMessage(string calldata message) external {
        emit MessageSent(msg.sender, message);
    }

    // End the battle and set the winning meme token
    function endBattle(address _winningMemeToken) external {
        require(msg.sender == creator, "Only the creator can end the battle");
        require(validMemeToken(_winningMemeToken), "Invalid winning meme token");
        require(!battleEnded, "Battle already ended");

        winningMemeToken = _winningMemeToken;
        battleEnded = true;

        emit MemeBattleEnded(_winningMemeToken);

        distributeRewards();
    }

    // Distribute rewards to the stakers of the winning meme token
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
                    if (stakers[memeTokenAddresses[i]][msg.sender].amount > 0) {
                        uint256 userStake = stakers[memeTokenAddresses[i]][msg.sender].amount;
                        uint256 reward = (userStake * rewardPool) / totalStakedPerMeme[winningMemeToken];
                        ERC20(memeTokenAddresses[i]).transfer(msg.sender, reward);
                        emit RewardDistributed(msg.sender, memeTokenAddresses[i], reward);
                    }
                }
            } else {
                // Burn a portion of losing tokens and transfer the rest to the winning pool
                uint256 burnAmount = (totalStakedPerMeme[memeTokenAddresses[i]] * 20) / 100;  // Burn 20%
                uint256 transferAmount = totalStakedPerMeme[memeTokenAddresses[i]] - burnAmount;

                ERC20(memeTokenAddresses[i]).transfer(address(0), burnAmount);  // Burn tokens
                ERC20(memeTokenAddresses[i]).transfer(address(winningMemeToken), transferAmount);  // Transfer to winning pool
            }
        }
    }

    // Check if a token is a valid meme token
    function validMemeToken(address memeToken) internal view returns (bool) {
        for (uint256 i = 0; i < memeTokenAddresses.length; i++) {
            if (memeTokenAddresses[i] == memeToken) {
                return true;
            }
        }
        return false;
    }
}