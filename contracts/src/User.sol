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

    function updateBetStats(address user, uint256 amount) external {
        userStats[user].numberOfBets++;
        userStats[user].totalAmountBet += amount;
        userStats[user].score = calculateScore(user);
    }

    function updateWinStats(address user) external {
        userStats[user].totalWins++;
        userStats[user].score = calculateScore(user);
    }

    function updateLossStats(address user) external {
        userStats[user].totalLosses++;
        userStats[user].score = calculateScore(user);
    }

    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }

    function calculateScore(address user) public view returns (uint256) {
        UserStats memory stats = userStats[user];
        
        // Avoid division by zero
        if (stats.numberOfBets == 0) return 0;
        
        // Calculate win ratio (0-100)
        uint256 winRatio = (stats.totalWins * 100) / stats.numberOfBets;
        
        // Calculate average bet amount (in wei)
        uint256 avgBetAmount = stats.totalAmountBet / stats.numberOfBets;
        
        // Score components
        uint256 winRatioScore = winRatio * 10;  // 0-1000 points
        uint256 betFrequencyScore = stats.numberOfBets * 5;  // 5 points per bet
        uint256 betAmountScore = (avgBetAmount / 1e16) * 2;  // 2 points per 0.01 ETH average bet
        
        // Combine scores with different weights
        uint256 totalScore = (winRatioScore * 60 + betFrequencyScore * 30 + betAmountScore * 10) / 100;
        
        return totalScore;
    }
}