// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract User {
    struct UserStats {
        uint256 numberOfBets;
        uint256 totalAmountBet;
        uint256 totalWins;
        uint256 totalLosses;
        uint256 score;
    }

    mapping(address => UserStats) public userStats;

    // Update user's bet details
    function updateBetStats(address user, uint256 amount) external {
        userStats[user].numberOfBets++;
        userStats[user].totalAmountBet += amount;
        updateScore(user);
    }

    // Update user's win details
    function updateWinStats(address user) external {
        userStats[user].totalWins++;
        updateScore(user);
    }

    // Update user's loss details
    function updateLossStats(address user) external {
        userStats[user].totalLosses++;
        updateScore(user);
    }

    // Get user's statistics
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }

    // Get user's score
    function getUserScore(address user) external view returns (uint256) {
        return userStats[user].score;
    }

    // Internal function to update the user's score
    function updateScore(address user) internal {
        UserStats storage stats = userStats[user];
        
        if (stats.numberOfBets == 0) {
            stats.score = 0;
            return;
        }
        
        uint256 winRatio = (stats.totalWins * 100) / stats.numberOfBets;
        uint256 avgBetAmount = stats.totalAmountBet / stats.numberOfBets;
        
        uint256 winRatioScore = winRatio * 10;
        uint256 betFrequencyScore = stats.numberOfBets * 5;
        uint256 betAmountScore = (avgBetAmount / 1e16) * 2;
        
        stats.score = (winRatioScore * 60 + betFrequencyScore * 30 + betAmountScore * 10) / 100;
    }
}