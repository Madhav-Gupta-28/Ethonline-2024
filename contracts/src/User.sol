// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract User {
    struct UserStats {
        uint256 numberOfBets;
        uint256 totalAmountBet;
        uint256 totalWins;
        uint256 totalLosses;
        uint256 score;
    }

    mapping(address => UserStats) public userStats;

    mapping(string => mapping(address => UserStats)) public battleUserStats;

    // Update user's bet details
    function updateBetStats(string memory battleId, address user, uint256 amount) external {
        UserStats storage stats = battleUserStats[battleId][user];
        if (stats.numberOfBets == 0) {
            stats.score = 25; // Base score for new users
        }
        stats.numberOfBets++;
        stats.totalAmountBet += amount;
        updateScore(battleId, user);
        
        // Update global stats
        userStats[user].numberOfBets++;
        userStats[user].totalAmountBet += amount;
        updateScore("global", user);
    }

    // Update user's win details
    function updateWinStats(string memory battleId, address user) external {
        battleUserStats[battleId][user].totalWins++;
        updateScore(battleId, user);
        
        // Update global stats
        userStats[user].totalWins++;
        updateScore("global", user);
    }

    // Update user's loss details
    function updateLossStats(string memory battleId, address user) external {
        battleUserStats[battleId][user].totalLosses++;
        updateScore(battleId, user);
        
        // Update global stats
        userStats[user].totalLosses++;
        updateScore("global", user);
    }

    // Get user's statistics
    function getUserStats(string memory battleId, address user) external view returns (UserStats memory) {
        return battleUserStats[battleId][user];
    }

    // Get user's score
    function getUserScore(string memory battleId, address user) external view returns (uint256) {
        return battleUserStats[battleId][user].score;
    }

    // Internal function to update the user's score
    function updateScore(string memory battleId, address user) internal {
        UserStats storage stats = battleUserStats[battleId][user];
        
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

    // Get global user stats
    function getGlobalUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
}