// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC2981Collection.sol";

/*
Listing - structure
Listing - mapping - listingID to Listing structure
Cancelled - mapping - listingID to bool
Sold - mapping - listingID to bool

Counter for listings
*/

contract Token is ERC1155, Ownable, ERC2981Collection {
  /*
    using Counters for Counters.Counter;
    Counters.Counter private _listingIds;
    */
    uint256 public constant PENGUIN0 = 0;
    uint256 public constant PENGUIN1 = 1;
    uint256 public constant PENGUIN2 = 2;
    
    /*
    // WIP
    
    struct Listing {
        uint256 listingId,
        uint256 tokenId,
        uint256 value,
        uint256 price,
        address seller
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => bool) public cancelled;
    mapping(uint256 => bool) public sales;

    event NewListing(uint256 listingId, uint256 tokenId, uint256 value, uint256 price, address seller);
    event Cancelled(uint256 listingId, uint256 tokenId)
    event Sale(uint256 listingId, uint256 tokenId, uint256 value, uint256 price, address from, address to);

    //
    */
    
    /*
    // TESTING - REMOVE LATER
    address payable public payments;
    //
    */

    constructor (
        address _artist,
        string memory _uriString,
        address _royaltyAddress,
        uint256 _royaltyPercentage // 10000 = 100, 1000 = 10, 100 = 1
    ) ERC1155 (
        _uriString
    ) {
        // payments = payable(_payments); // TESTING - REMOVE LATER
        _setRoyalties(_royaltyAddress, _royaltyPercentage);

        // THIS WILL BE CUSTOMIZED TO NEEDS OF BRAND
        _mint(_artist, PENGUIN0, 1, "");
        _mint(_artist, PENGUIN1, 1, "");
        _mint(_artist, PENGUIN2, 1, "");
    }
    
    // override
    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        return string(
            abi.encodePacked(
                "https://bafybeib33zblvfqnc4t54yhx7uav2oxg3h5lypg6nvtvyhyvx6qgsqg2fe.ipfs.dweb.link/",
                Strings.toString(_tokenId),
                ".json"
                )
            );
    }

    /*
    // marketplace
    function createListing(uint256 _tokenId, uint256 _value, uint256 _price) public returns (uint256 listingId) {
        // must own token - balance greater than value of tokenId
        // price must be greater than 0
        // increment counter
        // set tokenId
        // create listing and add to mapping
        // trigger event
        // approve this contract to transfer
        
        _listingIds.increment();
        uint256 listingId = _listingIds.current();
    }

    event NewListing(uint256 listingId, uint256 tokenId, uint256 value, uint256 price, address seller);
    */
    
    /*
    // TESTING - REMOVE LATER
    function payContract() public payable {
        payable(payments).transfer(address(this).balance);
    }
    function getBalance() public view returns (uint256) {
        return (address(this).balance);
    }
    function payTokenContract() public payable {
    }
    //
    */
}