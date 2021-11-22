/*
const {
  EVM_REVERT,
  URI_STRING,
  ROYALTY_ADDRESS,
  ROYALTY_PERCENTAGE
} = require('./helpers');
*/

const { expectEvent } = require('@openzeppelin/test-helpers');

const Token = artifacts.require('../contracts/Token.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([owner, artist, buyer]) => {
  let token
  
  let URI_STRING = "www.me.com/"
  let ROYALTY_ADDRESS = "0xe4cbaeDaD15d2436b4d04137B3449d3E664b0b85"
  let ROYALTY_PERCENT = "1000"

  // deployment
  // uri
  // set royalies
  // mint
  // events

  beforeEach(async ()=> {
    token = await Token.new(artist, URI_STRING, ROYALTY_ADDRESS, ROYALTY_PERCENT, { from: owner })
  })

  describe('deployment', () => {
    it('deploys successfully', async () => {
      const address = await token.address
      address.should.not.equal(0x0, 'address does not equal 0x0')
      address.should.not.equal('', 'address does not equal ""')
      address.should.not.equal(null, 'address does not equal null')
      address.should.not.equal(undefined, 'address does not equal undefined')
    })

    it('tracks contract ownerhship', async () => {
      let contractOwner = await token.owner()
      contractOwner.toString().should.equal(owner.toString(), 'contract owner is correct')
    })

    /*
    // emits ownership event - Ownable
    it('emits ownerhship event', async () => {
      expectEvent(token, 'OwnershipTransferred', { id: '0',  })
    })
    */

    it('tracks the uri', async () => {
      const uri = await token.uri(1, { from: buyer })
      const uri_concat = URI_STRING + "1" + ".json"
      uri.toString().should.equal(uri_concat, 'uri is correct')
    })

    it('tracks the royalty address', async () => {
      const address = await token.royaltyAddress({ from: buyer })
      address.toString().should.equal(ROYALTY_ADDRESS, 'royalty address is correct')
    })

    it('tracks the royalty percentage', async () => {
      const percentage = await token.royaltyPercent({ from: buyer })
      percentage.toString().should.equal(ROYALTY_PERCENT, 'royalty percent is correct')
    })

    it('mints NFTs correctly', async () => {
      const valueNFT0 = await token.balanceOf(artist, 0, { from: buyer })
      const valueNFT1 = await token.balanceOf(artist, 1, { from: buyer })
      const valueNFT2 = await token.balanceOf(artist, 2, { from: buyer })
      
      valueNFT0.toString().should.equal("1", 'NFT0 is correct')
      valueNFT1.toString().should.equal("1", 'NFT1 is correct')
      valueNFT2.toString().should.equal("1", 'NFT2 is correct')
    })

    // test events
  })

  describe('royalties', () => {
    it('tracks royalty info', async () => {
      let salePrice = 100
      let result = await token.royaltyInfo(1, salePrice)
      let receiver = result.receiver
      let royaltyAmount = result.royaltyAmount

      receiver.toString().should.equal(ROYALTY_ADDRESS.toString(), 'royalty address is correct')
      royaltyAmount.toString().should.equal((ROYALTY_PERCENT * salePrice / 10000).toString(), 'royalty amount is correct')
    })

    // test events
  })
})