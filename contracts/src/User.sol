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
        UserStats storage stats = userStats[user];
        if (stats.numberOfBets == 0) {
            stats.score = 25; // Base score for new users
        }
        stats.numberOfBets++;
        stats.totalAmountBet += amount;
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
            stats.score = 25;
            return;
        }
        
        uint256 winRatio = (stats.totalWins * 100) / stats.numberOfBets;
        uint256 avgBetAmount = stats.totalAmountBet / stats.numberOfBets;
        
        // Calculate score components
        uint256 winRatioScore = (winRatio * 50) / 100; // 0-50 points based on win ratio
        uint256 betFrequencyScore = (stats.numberOfBets > 100) ? 25 : (stats.numberOfBets * 25) / 100; // 0-25 points based on bet frequency
        uint256 betAmountScore = (avgBetAmount > 1 ether) ? 25 : (avgBetAmount * 25) / 1 ether; // 0-25 points based on average bet amount
        
        // Combine scores
        uint256 rawScore = winRatioScore + betFrequencyScore + betAmountScore;
        
        // Apply smoothing to prevent large swings
        if (rawScore > stats.score) {
            stats.score = stats.score + ((rawScore - stats.score) / 10);
        } else {
            stats.score = stats.score - ((stats.score - rawScore) / 10);
        }
        
        // Ensure score stays within 0-100 range
        stats.score = (stats.score > 100) ? 100 : stats.score;
    }
}