// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/BattleFactory.sol";
import "../src/User.sol";

contract DeployBattleFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy User contract
        User user = new User();
        console.log("User contract deployed to:", address(user));

        // Deploy BattleFactory
        BattleFactory battleFactory = new BattleFactory();
        console.log("BattleFactory deployed to:", address(battleFactory));

        // Create a new MemeBattle using BattleFactory
        string[] memory randomMemeNames = new string[](4);
        randomMemeNames[0] = "Doge";
        randomMemeNames[1] = "Grumpy Cat";
        randomMemeNames[2] = "Pepe";
        randomMemeNames[3] = "Distracted Boyfriend";

        address newMemeBattle = battleFactory.deployBattle(randomMemeNames, address(user));
        console.log("New MemeBattle deployed to:", newMemeBattle);

        vm.stopBroadcast();
    }
}