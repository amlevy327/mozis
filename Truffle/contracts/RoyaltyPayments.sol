// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract RoyaltyPayments is PaymentSplitter {
    
    constructor (address[] memory _payees, uint256[] memory _shares) PaymentSplitter (_payees, _shares ) payable {
    }
}