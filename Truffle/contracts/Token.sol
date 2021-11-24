// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC2981Collection.sol";

contract Token is ERC1155, Ownable, ERC2981Collection {

    // CUSTOM FOR CUSTOMER
    uint256 public constant PENGUIN0 = 0;
    uint256 public constant PENGUIN1 = 1;
    uint256 public constant PENGUIN2 = 2;
    //

    constructor (
        address _artist,
        string memory _uriString,
        address _royaltyAddress,
        uint256 _royaltyPercent // 10000 = 100, 1000 = 10, 100 = 1
    ) ERC1155 (
        _uriString
    ) {
        _setRoyalties(_royaltyAddress, _royaltyPercent);

        // CUSTOM FOR CUSTOMER
        _mint(_artist, PENGUIN0, 1, "");
        _mint(_artist, PENGUIN1, 1, "");
        _mint(_artist, PENGUIN2, 1, "");
        //
    }
    
    // override uri - necessary for resale on OpenSea
    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        return string(
            abi.encodePacked(
                "www.me.com/",
                Strings.toString(_tokenId),
                ".json"
                )
            );
    }
}