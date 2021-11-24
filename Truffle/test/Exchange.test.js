const { expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const Exchange = artifacts.require('../contracts/Exchange.sol')
const Token = artifacts.require('../contracts/Token.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([mozis, artist, buyer, tester]) => {
  let exchange
  let allEvents

  const EVM_REVERT = 'VM Exception while processing transaction: revert'

  let URI_STRING = "www.me.com/"
  let ROYALTY_ADDRESS = "0xe4cbaeDaD15d2436b4d04137B3449d3E664b0b85"
  let ROYALTY_PERCENT = "1000"
  let ADDRESS_0x0 = '0x0000000000000000000000000000000000000000'

  let royaltyAddress

  beforeEach(async ()=> {
    token = await Token.new(artist, URI_STRING, ROYALTY_ADDRESS, ROYALTY_PERCENT, { from: mozis })
    exchange = await Exchange.new({ from: mozis })
    allEvents = await exchange.getPastEvents("allEvents", {fromBlock: 0, toBlock: "latest"})
  })

  describe('Constructor', () => {
    describe('Contract', () => {
      it('deploys successfully', async () => {
        const address = await exchange.address

        address.should.not.equal(0x0, 'address does not equal 0x0')
        address.should.not.equal('', 'address does not equal ""')
        address.should.not.equal(null, 'address does not equal null')
        address.should.not.equal(undefined, 'address does not equal undefined')
      })
    })

    describe('Ownable', () => {
      it('transfers ownership to deployer', async () => {
        let contractOwner = await exchange.owner()
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
  })

  describe('New Listing', () => {
    let result
    const tokenId = '1'
    const value = '1'
    const price = '10'

    beforeEach(async ()=> {
      exchange = await Exchange.new({ from: mozis })
    })

    describe('Success', () => {
      beforeEach(async ()=> {
        result = await exchange.createListing(token.address, tokenId, value, price, { from: artist })
      })

      it('creates a new listing', async () => {
        result = await exchange.listings('1')
        result.listingId.toString().should.equal('1', 'listingId is correct')
      })

      it('emits a NewListing event', async () => {
        expectEvent(result, 'NewListing', { listingId: '1', tokenAddress: token.address, tokenId: tokenId, value: value, price: price })
      })
    })

    describe('Failure', () => {
      it('reverts if value is less than balance of msg.sender for tokenId', async () => {
        await exchange.createListing(token.address, tokenId, 2, price, { from: artist }).should.be.rejectedWith(EVM_REVERT)
      })

      it('reverts if price is not more than 0', async () => {
        await exchange.createListing(token.address, tokenId, value, 0, { from: artist }).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })

  describe('Cancel Listing', () => {
    let result
    const tokenId = '1'
    const value = '1'
    const price = '10'

    beforeEach(async ()=> {
      exchange = await Exchange.new({ from: mozis })
      await exchange.createListing(token.address, tokenId, value, price, { from: artist })
    })

    describe('Success', () => {
      beforeEach(async ()=> {
        result = await exchange.cancelListing(1, { from: artist })
        expectEvent(result, 'Cancelled', { listingId: '1', tokenAddress: token.address, tokenId: tokenId, value: value, price: price })
      })

      it('updated cancelled mapping', async () => {
        result = await exchange.cancelled('1', { from: tester })
        result.toString().should.equal('true', 'cancelled mapping is correct')
      })

      it('emits a Cancelled event', async () => {
        expectEvent(result, 'Cancelled', { listingId: '1', tokenAddress: token.address, tokenId: tokenId, value: value, price: price })
      })
    })

    describe('Failure', () => {
      it('reverts if listing does not exist', async () => {
        await exchange.cancelListing(2, { from: artist }).should.be.rejectedWith(EVM_REVERT)
      })

      it('reverts if msg.sender does not own listing', async () => {
        await exchange.cancelListing(1, { from: tester }).should.be.rejectedWith(EVM_REVERT)
      })

      it('reverts if listing was already cancelled', async () => {
        await exchange.cancelListing(1, { from: artist })
        .then(await exchange.cancelListing(1, { from: artist }).should.be.rejectedWith(EVM_REVERT))
      })
    })
  })

  describe('Purchase Listing', () => {
    let result
    const tokenId = '1'
    const value = '1'
    const price = '1000000000000000000'
    const totalCost = parseInt(price) + (parseInt(price) * ROYALTY_PERCENT / 10000 )
    console.log(totalCost)

    beforeEach(async ()=> {
      exchange = await Exchange.new({ from: mozis })
      token = await Token.new(artist, URI_STRING, ROYALTY_ADDRESS, ROYALTY_PERCENT, { from: mozis })
      await exchange.createListing(token.address, tokenId, value, price, { from: artist })
    })

    describe('Success', () => {
      let artistPreviousBalance
      let artistExpectedBalance
      let artistActualBalance

      let royaltyAccountPreviousBalance
      let royaltyAccountExpectedBalance
      let royaltyAccountActualBalance

      beforeEach(async ()=> {
        await token.setApprovalForAll(exchange.address, true, { from: artist })
        artistPreviousBalance = await web3.eth.getBalance(artist)

        result = await token.royaltyInfo(0, 100)
        royaltyAddress = result.receiver
        royaltyAccountPreviousBalance = await web3.eth.getBalance(royaltyAddress)
        
        result = await exchange.purchaseListing(1, { from: buyer, value: totalCost })
      })

      it('updates sales mapping', async () => {
        result = await exchange.sales('1')
        result.toString().should.equal('true', 'sales mapping is correct')
      })

      it('transfers NFTs', async () => {
        result = await token.balanceOf(buyer, tokenId)
        result.toString().should.equal(value, 'nft transfered correctly')
      })

      it('makes payment to seller', async () => {
        artistActualBalance = await web3.eth.getBalance(artist);
        artistExpectedBalance = parseInt(artistPreviousBalance) + parseInt(price)
        
        artistActualBalance.toString().should.equal(artistExpectedBalance.toString(), 'seller eth balance updated correctly')
      })

      it('makes royalty payment', async () => {
        royaltyAccountActualBalance = await web3.eth.getBalance(royaltyAddress);
        royaltyAccountExpectedBalance = parseInt(royaltyAccountPreviousBalance) + (parseInt(price) * ROYALTY_PERCENT / 10000)

        royaltyAccountActualBalance.toString().should.equal(royaltyAccountExpectedBalance.toString(), 'royalty address eth balance updated correctly')
      })

      it('emits a TransferSingle event', async () => {
        allEvents = await token.getPastEvents("allEvents", {fromBlock: 0, toBlock: "latest"})

        // second to last event (sale event is last)
        const event = await allEvents[allEvents.length - 1]
        const from = event.args.from
        const to = event.args.to
        const id = event.args.id
        const value = event.args.value

        from.toString().should.equal(artist.toString(), 'from address is correct')
        to.toString().should.equal(buyer.toString(), 'to address is correct')
        id.toString().should.equal(tokenId.toString(), 'tokenId is correct')
        value.toString().should.equal(value.toString(), 'value is correct')
      })

      it('emits a Sale event', async () => {
        expectEvent(result, 'Sale', { listingId: '1', tokenAddress: token.address, tokenId: tokenId, value: value, price: price })
      })
    })

    describe('Failure with exchange approval', () => {
      beforeEach(async ()=> {
        await token.setApprovalForAll(exchange.address, true, { from: artist })
      })

      it('reverts if listing does not exist', async () => {
        await exchange.purchaseListing(2, { from: buyer, value: totalCost }).should.be.rejectedWith(EVM_REVERT)
      })

      it('reverts if msg.sender is listing seller', async () => {
        await exchange.purchaseListing(1, { from: artist, value: totalCost }).should.be.rejectedWith(EVM_REVERT)
      })

      it('reverts if listingId is true in cancelled mapping', async () => {
        await exchange.cancelListing(1, { from: artist })
        .then(await exchange.purchaseListing(1, { from: buyer, value: totalCost }).should.be.rejectedWith(EVM_REVERT))
      })

      it('reverts if listingId is true in sales mapping', async () => {
        await exchange.purchaseListing(1, { from: buyer, value: totalCost })
        .then(await exchange.purchaseListing(1, { from: buyer, value: totalCost }).should.be.rejectedWith(EVM_REVERT))
      })

      it('reverts if listing seller balance of token is 0', async () => {
        await token.safeTransferFrom(artist, mozis, '1', '1', '0x0',{ from: artist })
        .then(await exchange.purchaseListing(1, { from: buyer, value: totalCost }).should.be.rejectedWith(EVM_REVERT))
      })

      it('reverts if listing seller balance of token is less than listing value', async () => {
        await token.safeTransferFrom(artist, mozis, '1', '1', '0x0',{ from: artist })
        .then(await exchange.purchaseListing(1, { from: buyer, value: totalCost }).should.be.rejectedWith(EVM_REVERT))
      })

      it('reverts if msg.value does not equal price (with royalties?)', async () => {
        await exchange.purchaseListing(1, { from: buyer, value: 1 }).should.be.rejectedWith(EVM_REVERT)
      })
    })

    describe('Failure without exchange approval', () => {
      it('reverts if marketplace not approved', async () => {
        await exchange.purchaseListing(1, { from: buyer, value: totalCost }).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })
})