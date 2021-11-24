// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Token.sol";
import "./ERC2981Collection.sol";

contract Exchange is Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _listingIds;

    struct Listing {
        uint256 listingId;
        address tokenAddress;
        uint256 tokenId;
        uint256 value;
        uint256 price;
        address seller;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => bool) public cancelled;
    mapping(uint256 => bool) public sales;

    event NewListing(uint256 listingId, address tokenAddress, uint256 tokenId, uint256 value, uint256 price, address seller);
    event Cancelled(uint256 listingId, address tokenAddress, uint256 tokenId, uint256 value, uint256 price, address seller);
    event Sale(uint256 listingId, address tokenAddress, uint256 tokenId, uint256 value, uint256 price, address from, address to);

    constructor () {}

    function createListing(address _tokenAddress, uint256 _tokenId, uint256 _value, uint256 _price) public {
        require(Token(_tokenAddress).balanceOf(msg.sender, _tokenId) >= _value);
        require(_price > 0, 'price must be greater than 0 wei');
        
        _listingIds.increment();
        uint256 _listingId = _listingIds.current();

        listings[_listingId] = Listing(_listingId, _tokenAddress, _tokenId, _value, _price, msg.sender);

        emit NewListing(_listingId, _tokenAddress, _tokenId, _value, _price, msg.sender);
    }

    function cancelListing(uint256 _listingId) public {
      Listing memory listing = listings[_listingId];

      require(listing.listingId == _listingId, 'listingId is not valid');
      // remove this? want to buy more?
      require(listing.seller == msg.sender, 'sender already owns tokenId');
      require(cancelled[listing.listingId] == false, 'listing already cancelled');

      cancelled[listing.listingId] = true;

      emit Cancelled(listing.listingId, listing.tokenAddress, listing.tokenId, listing.value, listing.price, listing.seller);
    }

    function purchaseListing(uint256 _listingId) public payable {
      // get listing
      // listing id existing
      // msg.sender != listing.seller
      // not cancelled
      // not sold
      // msg.value == price
      // listing seller has enough value of token for transfer

      // transfer NFT

      // get royalty amount
      // pay royalty

      // update sales mapping
      
      // emit event

      Listing memory listing = listings[_listingId];

      require(listing.listingId == _listingId, 'listingId is not valid');
      // remove this? want to buy more?
      require(listing.seller != msg.sender, 'sender already owns tokenId');
      require(cancelled[_listingId] == false, 'listing already cancelled');
      require(sales[_listingId] == false, 'listing already sold');
      require(Token(listing.tokenAddress).balanceOf(listing.seller, listing.tokenId) >= 0, 'seller has 0 of tokenId');
      require(Token(listing.tokenAddress).balanceOf(listing.seller, listing.tokenId) >= listing.value, 'seller does not have enough of tokenId');

      (address receiver, uint256 royaltyAmount) = Token(listing.tokenAddress).royaltyInfo(0, listing.price);
      require(msg.value == (listing.price + royaltyAmount));

      // pay
      payable(listing.seller).transfer(listing.price);
      payable(receiver).transfer(royaltyAmount);

      // transfer NFT
      Token(listing.tokenAddress).safeTransferFrom(listing.seller, msg.sender, listing.tokenId, listing.value, '0x0');

      sales[_listingId] = true;

      emit Sale(listing.listingId, listing.tokenAddress, listing.tokenId, listing.value, listing.price, listing.seller, msg.sender);
    }
}