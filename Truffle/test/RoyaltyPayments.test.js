const { expectEvent } = require('@openzeppelin/test-helpers');

const RoyaltyPayments = artifacts.require('../contracts/RoyaltyPayments.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('RoyaltyPayments', ([owner, mozis, artist, tester1]) => {
  let royaltyPayments

  let payees = [artist, mozis]
  let shares = [90, 10]

  beforeEach(async ()=> {
    royaltyPayments = await RoyaltyPayments.new(payees, shares, { from: owner })
  })

  describe('deployment', () => {
    it('deploys successfully', async () => {
      const address = await royaltyPayments.address
      address.should.not.equal(0x0, 'address does not equal 0x0')
      address.should.not.equal('', 'address does not equal ""')
      address.should.not.equal(null, 'address does not equal null')
      address.should.not.equal(undefined, 'address does not equal undefined')
    })

    it('tracks payees', async () => {
      let payee0 = await royaltyPayments.payee(0)
      let payee1 = await royaltyPayments.payee(1)

      payee0.toString().should.equal(payees[0].toString(), 'payee0 is correct')
      payee1.toString().should.equal(payees[1].toString(), 'payee1 is correct')
    })

    it('tracks shares', async () => {
      let shares0 = await royaltyPayments.shares(payees[0])
      let shares1 = await royaltyPayments.shares(payees[1])
      let totalShares = await royaltyPayments.totalShares()

      shares0.toString().should.equal(shares[0].toString(), 'shares0 is correct')
      shares1.toString().should.equal(shares[1].toString(), 'shares1 is correct')
      totalShares.toString().should.equal((shares[0] + shares[1]).toString(), 'total shares is correct')
    })
  })

  describe('royalty payments', () => {
    it('tracks payments and releases', async () => {
      let totalReleased = 999
      
      await royaltyPayments.sendTransaction({ from: tester1, value: 10 })
      totalReleased = await royaltyPayments.totalReleased({ from: tester1 })
      totalReleased.toString().should.equal('0', 'initial total released is correct')
      
      await royaltyPayments.release(artist, { from: tester1 })
      let artistReleased = await royaltyPayments.released(artist, { from: tester1 })
      artistReleased.toString().should.equal('9', 'artist amount released is correct')
      totalReleased = await royaltyPayments.totalReleased ({ from: tester1 })
      totalReleased.toString().should.equal('9', 'arter artist released, total released is correct')

      await royaltyPayments.release(mozis, { from: tester1 })
      let mozisReleased = await royaltyPayments.released(mozis, { from: tester1 })
      mozisReleased.toString().should.equal('1', 'mozis amount released is correct')
      totalReleased = await royaltyPayments.totalReleased({ from: tester1 })
      totalReleased.toString().should.equal('10', 'arter artist & mozis released, total released is correct')
    })
  })
})