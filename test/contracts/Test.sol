// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {
  address public owner;
  constructor() {
    owner = msg.sender;
  }

  event Received(address sender, uint256 value);

  receive() external payable {
    emit Received(msg.sender, msg.value);
  }
}