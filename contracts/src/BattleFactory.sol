// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin's ERC20 contract
import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

import {MemeBattle} from "./MemeBattle.sol";


// BattleFactory Contract
contract BattleFactory {
    struct BattleInfo {
        address battleAddress;
        string[] memeNames;
        address _userContractAddress;
    }

    BattleInfo[] public battles;

    

    event BattleCreated(address indexed battleAddress, string[] memeNames,address indexed userContarctAddress);

    function deployBattle(string[] memory memeNames , address _userContractAddress) external returns (address) {
       
        // Deploy a new battle contract
        MemeBattle newBattle = new MemeBattle(memeNames, msg.sender , _userContractAddress);

        // Store the battle and token details in the battles array
        battles.push(BattleInfo({
            battleAddress: address(newBattle),
            memeNames: memeNames,
            _userContractAddress : _userContractAddress
        }));

        // Emit event for the new battle creation
        emit BattleCreated(address(newBattle), memeNames , _userContractAddress);

        return address(newBattle);
    }

    function getBattleCount() external view returns (uint256) {
        return battles.length;
    }

    function getBattle(uint256 index) external view returns (address battleAddress, string[] memory memeNames , address _userContractAddress) {
        require(index < battles.length, "Battle index out of range");
        BattleInfo storage battle = battles[index];
        return (battle.battleAddress, battle.memeNames, battle._userContractAddress);
    }
}

