// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./User.sol";

/**
 * @title MemeBattle
 * @dev A contract for managing meme battles and bets
 * @notice This contract allows users to create battles, place bets, and claim rewards
 */
contract MemeBattle is ISPHook, Ownable, ReentrancyGuard {
    ISP private s_baseIspContract;
    User public userContract;

    struct Meme {
        string name;
        uint256 totalStaked;
    }

    struct Bet {
        uint256 amount;
        bool claimed;
    }

    struct Battle {
        string[] memes;
        uint256 winningMemeId;
        uint256 startTime;
        uint256 deadline;
        bool ended;
        mapping(uint256 => Meme) memeInfo;
        mapping(uint256 => mapping(address => Bet)) bets;
        mapping(uint256 => address[]) betters;
    }

    // Mapping of battle IDs to Battle structs
    mapping(string => Battle) public battles;
    // Mapping of battle IDs and user addresses to their winnings
    mapping(string => mapping(address => uint256)) public winnings;

    event BattleCreated(string battleId, string[] memes, uint256 startTime, uint256 deadline);
    event BetPlaced(string battleId, address indexed user, uint256 indexed memeId, uint256 amount);
    event WinnerDeclared(string battleId, uint256 indexed memeId);
    event RewardClaimed(string battleId, address indexed user, uint256 reward);
    event UserScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);

    /**
     * @dev Constructor to initialize the MemeBattle contract
     * @param _userContractAddress Address of the User contract
     */
    constructor(address _userContractAddress) Ownable(msg.sender) {
        s_baseIspContract = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
        userContract = User(_userContractAddress);
    }

    /**
     * @dev Creates a new battle
     * @param battleId ID of the battle
     * @param memeNames Array of meme names
     * @param duration Duration of the battle in seconds
     */
    function createBattle(string memory battleId, string[] memory memeNames, uint256 duration) external  {
        require(battles[battleId].startTime == 0, "Battle already exists");
        require(memeNames.length > 1, "At least two memes required");

        Battle storage newBattle = battles[battleId];
        newBattle.memes = memeNames;
        newBattle.startTime = block.timestamp;
        newBattle.deadline = block.timestamp + duration;

        for (uint256 i = 0; i < memeNames.length; i++) {
            newBattle.memeInfo[i + 1] = Meme(memeNames[i], 0);
        }

        emit BattleCreated(battleId, memeNames, newBattle.startTime, newBattle.deadline);
    }

    /**
     * @dev Handles incoming attestations
     * @param attester Address of the attester
     * @param attestationId ID of the attestation
     * @notice This function decodes the attestation data and routes it to the appropriate handler
     */
    function didReceiveAttestation(
        address attester,
        uint64,
        uint64 attestationId,
        bytes calldata
    ) public payable override nonReentrant {
        Attestation memory attestationInfo = s_baseIspContract.getAttestation(attestationId);
        
        (address user, string memory battleId, uint256 meme_id, uint256 bet_amount, uint256 bet_timestamp, uint256 win_amount, string memory action) = abi.decode(attestationInfo.data, (address,string,uint256,uint256,uint256,uint256,string));

        require(msg.value >= bet_amount, "Insufficient payment");

        if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("USER_BET"))) {
            handleUserBet(attester, user, battleId, meme_id, bet_amount, bet_timestamp);
        } else if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("CLAIM"))) {
            handleClaimReward(attester, user, battleId, meme_id);
        } else {
            revert("Invalid action");
        }
    }

    /**
     * @dev Handles user bet placement
     * @param attester Address of the attester
     * @param user Address of the user placing the bet
     * @param battleId ID of the battle
     * @param meme_id ID of the meme being bet on
     * @param bet_amount Amount of the bet
     * @param bet_timestamp Timestamp of the bet
     */
    function handleUserBet(
        address attester,
        address user,
        string memory battleId,
        uint256 meme_id,
        uint256 bet_amount,
        uint256 bet_timestamp
    ) internal {
        Battle storage battle = battles[battleId];
        require(attester == user, "Attester must be the user");
        require(!battle.ended, "Battle has ended");
        require(block.timestamp < battle.deadline, "Betting period has ended");
        
        uint256 memeIndex = findMemeIndex(battle, meme_id);
        require(memeIndex != 0, "Invalid meme ID");
        
        require(bet_amount > 0, "Bet amount must be greater than 0");
        require(battle.bets[memeIndex][user].amount == 0, "User has already bet on this meme");

        battle.bets[memeIndex][user].amount += bet_amount;
        battle.betters[memeIndex].push(user);
        battle.memeInfo[memeIndex].totalStaked += bet_amount;

        emit BetPlaced(battleId, user, memeIndex, bet_amount);

        uint256 userScoreBefore = userContract.getUserScore(battleId, user);
        userContract.updateBetStats(battleId, user, bet_amount);
        uint256 userScoreAfter = userContract.getUserScore(battleId, user);

        emit UserScoreUpdated(user, userScoreBefore, userScoreAfter);

        if (msg.value > bet_amount) {
            payable(user).transfer(msg.value - bet_amount);
        }
    }

    /**
     * @dev Declares the winner of a battle
     * @param battleId ID of the battle
     * @param winningMemeId ID of the winning meme
     */
    function declareWinner(string memory battleId, uint256 winningMemeId) external onlyOwner {
        Battle storage battle = battles[battleId];
        require(!battle.ended, "Battle has already ended");
        require(block.timestamp >= battle.deadline, "Betting period not over");
        require(winningMemeId <= battle.memes.length && winningMemeId > 0, "Invalid winning meme ID");

        battle.winningMemeId = winningMemeId;
        battle.ended = true;

        uint256 totalPrizePool = address(this).balance;
        uint256 winningMemeStake = battle.memeInfo[winningMemeId].totalStaked;

        for (uint256 i = 0; i < battle.betters[winningMemeId].length; i++) {
            address winner = battle.betters[winningMemeId][i];
            uint256 betAmount = battle.bets[winningMemeId][winner].amount;
            uint256 reward = (betAmount * totalPrizePool) / winningMemeStake;

            winnings[battleId][winner] = reward;
            
            uint256 userScoreBefore = userContract.getUserScore(battleId, winner);
            userContract.updateWinStats(battleId, winner);
            uint256 userScoreAfter = userContract.getUserScore(battleId, winner);

            emit UserScoreUpdated(winner, userScoreBefore, userScoreAfter);
        }

        for (uint256 i = 1; i <= battle.memes.length; i++) {
            if (i != winningMemeId) {
                for (uint256 j = 0; j < battle.betters[i].length; j++) {
                    address loser = battle.betters[i][j];
                    userContract.updateLossStats(battleId, loser);
                }
            }
        }

        emit WinnerDeclared(battleId, winningMemeId);
    }

    /**
     * @dev Handles reward claiming for winners
     * @param attester Address of the attester
     * @param user Address of the user claiming the reward
     * @param battleId ID of the battle
     * @param meme_id ID of the meme
     */
    function handleClaimReward(
        address attester,
        address user,
        string memory battleId,
        uint256 meme_id
    ) internal {
        Battle storage battle = battles[battleId];
        require(battle.ended, "Battle has not ended yet");
        require(winnings[battleId][user] > 0, "No winnings to claim");
        
        uint256 winningMemeIndex = findMemeIndex(battle, meme_id);
        require(winningMemeIndex == battle.winningMemeId, "Not the winning meme");
        require(!battle.bets[winningMemeIndex][user].claimed, "Reward already claimed");

        uint256 reward = winnings[battleId][user];
        battle.bets[winningMemeIndex][user].claimed = true;
        winnings[battleId][user] = 0;

        payable(user).transfer(reward);
        emit RewardClaimed(battleId, user, reward);
    }

    /**
     * @dev Finds the index of a meme in a battle
     * @param battle The Battle struct
     * @param meme_id ID of the meme to find
     * @return The index of the meme, or 0 if not found
     */
    function findMemeIndex(Battle storage battle, uint256 meme_id) internal view returns (uint256) {
        for (uint256 i = 1; i <= battle.memes.length; i++) {
            if (i == meme_id) {
                return i;
            }
        }
        return 0; // Return 0 if meme not found
    }

    /**
     * @dev Handles revocation of bets
     * @notice This function is not implemented and will revert if called
     */
    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        bytes calldata
    ) public payable override {
        revert("Bet revocation not allowed");
    }

    /**
     * @dev Handles incoming attestations for ERC20 tokens
     * @notice This function is not implemented and will revert if called
     */
    function didReceiveAttestation(
        address,
        uint64,
        uint64,
        IERC20,
        uint256,
        bytes calldata
    ) external pure override {
        revert("ERC20 tokens not supported");
    }

    /**
     * @dev Handles revocation of ERC20 tokens
     * @notice This function is not implemented and will revert if called
     */
    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        IERC20,
        uint256,
        bytes calldata
    ) external pure override {
        revert("ERC20 tokens not supported");
    }

    /**
     * @dev Converts a string to a uint256
     * @param s The string to convert
     * @return The resulting uint256
     */
    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint8 c = uint8(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }

    /**
     * @dev Gets the winnings for a user in a specific battle
     * @param battleId ID of the battle
     * @param user Address of the user
     * @return The amount of winnings for the user
     */
    function getWinnings(string memory battleId, address user) public view returns (uint256) {
        return winnings[battleId][user];
    }

    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {}
}