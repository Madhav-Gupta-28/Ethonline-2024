// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserScore {
    struct UserStats {
        uint256 numberOfBets;
        uint256 totalAmountBet;
        uint256 totalWins;
        uint256 totalLosses;
        uint256 score 
    }

    mapping(address => UserStats) public userStats;

    // Update user's bet details
    function updateBetStats(address user, uint256 amount) external {
        userStats[user].numberOfBets += 1;
        userStats[user].totalAmountBet += amount;
    }

    // Update user's win details
    function updateWinStats(address user) external {
        userStats[user].totalWins += 1;
    }

    // Update user's loss details
    function updateLossStats(address user) external {
        userStats[user].totalLosses += 1;
    }

    // Get user's statistics
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
}
