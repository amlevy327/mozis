const { expectEvent } = require('@openzeppelin/test-helpers');

const Token = artifacts.require('../contracts/Token.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([mozis, artist, buyer, tester]) => {
  let token
  let allEvents
  
  let URI_STRING = "www.me.com/"
  let ROYALTY_ADDRESS = "0xe4cbaeDaD15d2436b4d04137B3449d3E664b0b85"
  let ROYALTY_PERCENT = "1000"
  let ADDRESS_0x0 = '0x0000000000000000000000000000000000000000'


  beforeEach(async ()=> {
    token = await Token.new(artist, URI_STRING, ROYALTY_ADDRESS, ROYALTY_PERCENT, { from: mozis })
    allEvents = await token.getPastEvents("allEvents", {fromBlock: 0, toBlock: "latest"})
  })

  describe('Constructor', () => {
    describe('Contract', () => {
      it('deploys successfully', async () => {
        const address = await token.address

        address.should.not.equal(0x0, 'address does not equal 0x0')
        address.should.not.equal('', 'address does not equal ""')
        address.should.not.equal(null, 'address does not equal null')
        address.should.not.equal(undefined, 'address does not equal undefined')
      })
    })

    describe('Ownable', () => {
      it('transfers ownership to deployer', async () => {
        let contractOwner = await token.owner()
        contractOwner.toString().should.equal(mozis.toString(), 'contract owner is correct')
      })

      it('emits OwnershipTransferred event', async () => {
        let event = await allEvents[0]
        let previousOwner = event.args.previousOwner
        let newOwner = event.args.newOwner

        previousOwner.toString().should.equal(ADDRESS_0x0.toString())
        newOwner.toString().should.equal(mozis.toString())
      })
    })

    describe('ERC1155', () => {
      it('tracks uri', async () => {
        const uri = await token.uri(1, { from: tester })
        const uri_concat = URI_STRING + "1" + ".json"

        uri.toString().should.equal(uri_concat, 'uri is correct')
      })

      it('mints NFTs to correct addresses', async () => {
        const valueNFT0 = await token.balanceOf(artist, 0, { from: tester })
        const valueNFT1 = await token.balanceOf(artist, 1, { from: tester })
        const valueNFT2 = await token.balanceOf(artist, 2, { from: tester })
        
        valueNFT0.toString().should.equal("1", 'NFT0 is correct')
        valueNFT1.toString().should.equal("1", 'NFT1 is correct')
        valueNFT2.toString().should.equal("1", 'NFT2 is correct')
      })

      it('emits TransferSingle events', async () => {
        let event
        let from
        let to
        let id
        let value

        // NFT0
        event = await allEvents[1]
        from = event.args.from
        to = event.args.to
        id = event.args.id
        value = event.args.value

        from.toString().should.equal(ADDRESS_0x0.toString(), 'NFT 0 from address is correct')
        to.toString().should.equal(artist.toString(), 'NFT 0 to address is correct')
        id.toString().should.equal("0", 'NFT 0 id is correct')
        value.toString().should.equal("1", 'NFT 0 value is correct')

        // NFT1
        event = await allEvents[2]
        from = event.args.from
        to = event.args.to
        id = event.args.id
        value = event.args.value

        from.toString().should.equal(ADDRESS_0x0.toString(), 'NFT 1 from address is correct')
        to.toString().should.equal(artist.toString(), 'NFT 1 to address is correct')
        id.toString().should.equal("1", 'NFT 1 id is correct')
        value.toString().should.equal("1", 'NFT 1 value is correct')

        // NFT2
        event = await allEvents[3]
        from = event.args.from
        to = event.args.to
        id = event.args.id
        value = event.args.value

        from.toString().should.equal(ADDRESS_0x0.toString(), 'NFT 2 from address is correct')
        to.toString().should.equal(artist.toString(), 'NFT 2 to address is correct')
        id.toString().should.equal("2", 'NFT 2 id is correct')
        value.toString().should.equal("1", 'NFT 2 value is correct')
      })
    })

    describe('ERC2981collection', () => {
      it('tracks royalty address', async () => {
        const address = await token.royaltyAddress({ from: buyer })
        address.toString().should.equal(ROYALTY_ADDRESS, 'royalty address is correct')
      })

      it('tracks royalty percentage', async () => {
        const percentage = await token.royaltyPercent({ from: buyer })
        percentage.toString().should.equal(ROYALTY_PERCENT, 'royalty percent is correct')
      })
    })
  })

  describe('Ownable', async () => {
    let result 
    
    beforeEach(async ()=> {
      result = await token.transferOwnership(artist, { from: mozis })
    })

    it('tracks ownership transfer', async () => {
      let contractOwner = await token.owner()
      contractOwner.toString().should.equal(artist.toString(), 'new contract owner is correct')
    })

    it('emits OwnershipTransferred event', async () => {
      expectEvent(result, 'OwnershipTransferred', { previousOwner: mozis, newOwner: artist })
    })
  })

  describe('ERC2981collection', () => {
    it('outputs correct royalty info', async () => {
      let salePrice = 100
      let result = await token.royaltyInfo(1, salePrice)
      let receiver = result.receiver
      let royaltyAmount = result.royaltyAmount

      receiver.toString().should.equal(ROYALTY_ADDRESS.toString(), 'royalty address is correct')
      royaltyAmount.toString().should.equal((ROYALTY_PERCENT * salePrice / 10000).toString(), 'royalty amount is correct')
    })
  })

  /*

  TODO: MOVE TO MARKETPLACE CONTRACT

  describe('ERC1155', () => {
    let resultArtistApproval
    let resultTransferToBuyer

    beforeEach(async ()=> {
      resultArtistApproval = await token.setApprovalForAll(token.address, true, { from: artist })
      //resultTransferToBuyer = await token.safeTransferFrom(artist, buyer, 0, 1, "0x0", { from: buyer })
    })

    describe('Approval', async () => {
      it('tracks approval', async () => {
        let result = await token.isApprovedForAll(artist, token.address)
        result.toString().should.equal('true', 'token contract approved by artist')
      })

      it('emits ApprovalForAll event for artist', async () => {
        expectEvent(resultArtistApproval, 'ApprovalForAll', { account: artist, operator: token.address, approved: true})
      })
    })

    it('tracks NFT transfer', async () => {
      // approve token contract to transfer
      // transfer token
    })

    it('emits TransferSingle event', async () => {
      //expectEvent(resultArtistApproval, 'TransferSingle', { operator: token.address, from: artist, to: buyer, id: 0, value: 1})
    })
  })
*/
 
})