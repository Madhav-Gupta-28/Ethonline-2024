// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./User.sol";

contract MemeBattle is ISPHook, Ownable  , ReentrancyGuard{
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

    mapping(uint256 => Meme) public memes;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public betters;
    uint256 public winningMemeId;
    bool public battleEnded;
    uint256 public memeCount;
    mapping(address => uint256) public winnings;

    event BetPlaced(address indexed user, uint256 indexed memeId, uint256 amount);
    event WinnerDeclared(uint256 indexed memeId);
    event RewardClaimed(address indexed user, uint256 reward);
    event UserScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);

    constructor(string[] memory _memeNames, address _userContractAddress) Ownable(msg.sender) {
        s_baseIspContract = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
        userContract = User(_userContractAddress);
        
        for (uint256 i = 0; i < _memeNames.length; i++) {
            memeCount++;
            memes[memeCount] = Meme(_memeNames[i], 0);
        }
    }

    function didReceiveAttestation(
        address attester,
        uint64,
        uint64 attestationId,
        bytes calldata
    ) public payable override nonReentrant {
        Attestation memory attestationInfo = s_baseIspContract.getAttestation(attestationId);

        
        
        (address user  , uint256 meme_id , uint256 bet_amount , uint256 bet_timestamp , bool result  , uint256 win_amount , string memory action) = abi.decode(attestationInfo.data, (address,uint256,uint256,uint256,bool,uint256,string));

        require(msg.value >= bet_amount, "Insufficient payment");

        if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("USER_BET"))) {
            handleUserBet(attester, user , meme_id , bet_amount , bet_timestamp );
        } else if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("CLAIM"))) {
            handleClaimReward(attester , user , meme_id);
        } else {
            revert("Invalid action");
        }
    }

    function handleUserBet(address attester, address user,  uint256 meme_id ,uint256 bet_amount , uint256 bet_timestamp) internal {

        require(attester == user, "Attester must be the user");

        require(!battleEnded, "Battle has ended");
        require(meme_id <= memeCount && meme_id > 0, "Invalid meme ID");
        require(bet_amount > 0, "Bet amount must be greater than 0");
      
        require(bets[meme_id][user].amount == 0, "User has already bet on this meme");


        bets[meme_id][user].amount += bet_amount;
        betters[meme_id].push(user);
        memes[meme_id].totalStaked += bet_amount;

        emit BetPlaced(user, meme_id, bet_amount);

        uint256 userScoreBefore = userContract.getUserScore(user);
        userContract.updateBetStats(user, bet_amount);
        uint256 userScoreAfter = userContract.getUserScore(user);

        emit UserScoreUpdated(user, userScoreBefore, userScoreAfter);

        if (msg.value > bet_amount) {
            payable(user).transfer(msg.value - bet_amount);
        }
    }

    function handleDeclareWinner(uint256 winningMemeId) internal {
        require(!battleEnded, "Battle has already ended");
        require(memeCount > 0, "No memes in the battle");

        uint256 declaredWinningMemeId = winningMemeId;
        require(declaredWinningMemeId <= memeCount && declaredWinningMemeId > 0, "Invalid winning meme ID");

        winningMemeId = declaredWinningMemeId;
        battleEnded = true;

        uint256 totalPrizePool = address(this).balance;
        uint256 winningMemeStake = memes[winningMemeId].totalStaked;

        for (uint256 i = 0; i < betters[winningMemeId].length; i++) {
            address winner = betters[winningMemeId][i];
            uint256 betAmount = bets[winningMemeId][winner].amount;
            uint256 reward = (betAmount * totalPrizePool) / winningMemeStake;

            winnings[winner] = reward;
            
            uint256 userScoreBefore = userContract.getUserScore(winner);
            userContract.updateWinStats(winner);
            uint256 userScoreAfter = userContract.getUserScore(winner);

            emit UserScoreUpdated(winner, userScoreBefore, userScoreAfter);
        }

        for (uint256 i = 1; i <= memeCount; i++) {
            if (i != winningMemeId) {
                for (uint256 j = 0; j < betters[i].length; j++) {
                    address loser = betters[i][j];
                    userContract.updateLossStats(loser);
                }
            }
        }

        emit WinnerDeclared(winningMemeId);
    }

    function handleClaimReward(address attester , address user , uint256 meme_id) internal {
        require(battleEnded, "Battle has not ended yet");
        require(winnings[user] > 0, "No winnings to claim");
        require(!bets[winningMemeId][user].claimed, "Reward already claimed");

        uint256 reward = winnings[user];
        bets[winningMemeId][user].claimed = true;
        winnings[user] = 0;

        payable(user).transfer(reward);
        emit RewardClaimed(user, reward);
    }

    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        bytes calldata
    ) public payable override {
        revert("Bet revocation not allowed");
    }

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

    function getUserScore(address user) external view returns (uint256) {
        return userContract.getUserScore(user);
    }

    function getUserStats(address user) external view returns (User.UserStats memory) {
        return userContract.getUserStats(user);
    }

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

    receive() external payable {}
}