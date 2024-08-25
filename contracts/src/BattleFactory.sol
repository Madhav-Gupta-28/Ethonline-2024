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
        address[] memeTokenAddresses;
    }

    BattleInfo[] public battles;

    

    event BattleCreated(address indexed battleAddress, string[] memeNames, address[] memeTokenAddresses);

    function deployBattle(string[] memory memeNames) external returns (address) {
        address[] memory memeTokenAddresses = new address[](memeNames.length);

        // Deploy an ERC20 token for each meme using OpenZeppelin's ERC20 contract
        for (uint256 i = 0; i < memeNames.length; i++) {
            ERC20Token newToken = new ERC20Token(memeNames[i], memeNames[i]);
            memeTokenAddresses[i] = address(newToken);
        }

        // Deploy a new battle contract
        MemeBattle newBattle = new MemeBattle(memeNames, memeTokenAddresses, msg.sender);

        // Store the battle and token details in the battles array
        battles.push(BattleInfo({
            battleAddress: address(newBattle),
            memeNames: memeNames,
            memeTokenAddresses: memeTokenAddresses
        }));

        // Emit event for the new battle creation
        emit BattleCreated(address(newBattle), memeNames, memeTokenAddresses);

        return address(newBattle);
    }

    function getBattleCount() external view returns (uint256) {
        return battles.length;
    }

    function getBattle(uint256 index) external view returns (address battleAddress, string[] memory memeNames, address[] memory memeTokenAddresses) {
        require(index < battles.length, "Battle index out of range");
        BattleInfo storage battle = battles[index];
        return (battle.battleAddress, battle.memeNames, battle.memeTokenAddresses);
    }
}

// ERC20Token Contract extending OpenZeppelin's ERC20
contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));  // Mint initial supply of 1 million tokens to the deployer
    }
}