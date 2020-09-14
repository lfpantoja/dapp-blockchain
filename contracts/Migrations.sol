// SPDX-License-Identifier: MIT
/** ENGLISH
Migrations are files which help deploy new changes in the contract to the ethereum blockchain. 
And this migration contract helps keep track which migrations have been executed already. 
So the process is to create a new migration file with an increased number and to deploy 
just run truffle migrate. Truffle will know which migrations to run based on the file number 
and last_completed_migration value on the blockchain. 

SPANISH

*/
pragma solidity >=0.4.22 <0.8.0;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }

}