import { useMoralis } from "react-moralis";
import {
  tokenContractLoaded,
  exchangeContractLoaded,
  ownershipChangesLoaded,
  transferSinglesLoaded,
  listingsLoaded,
  cancelledLoaded,
  salesLoaded,
  ownershipChanged,
  tokenTransferredSingle,
  listingCreated,
  listingCancelled,
  listingPurchased
} from './actions.js'
import Token from '../contracts/Token.json'
import Exchange from '../contracts/Exchange.json'


const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis()
// check for connection first?
const web3 = await enableWeb3()

// LOAD CONTRACTS

export const loadTokenContract = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
    dispatch(tokenContractLoaded(token))
    return token
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const loadExchangeContract = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeContractLoaded(exchange))
    return exchange
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

// GET 

// get token uri

// get royalty info? - need this?

// token contract owner? - need this? part of token contact?

// UPDATE

// update token contract owner? - need this? only Mozis would use this once.

// create listing

// cancel listing

// purchase listing

// EVENTS

// load token contract owner change
export const loadTokenContractOwnershipChanges = async (token, dispatch) => {
  const ownershipChangesStream = await token.getPastEvents('OwnershipTransferred', { fromBlock: 0, toBlock: 'latest' })
  console.log('ownerships stream: ', ownershipChangesStream)
  const ownershipChanges = ownershipChangesStream.map((event) => event.returnValues)
  dispatch(ownershipChangesLoaded(ownershipChanges))
}

// load TransferSingle from ERC1155
export const loadTokenTransferSingles = async (token, dispatch) => {
  const transferSinglesStream = await token.getPastEvents('TransferSingle', { fromBlock: 0, toBlock: 'latest' })
  console.log('transferSingles stream: ', transferSinglesStream)
  const transferSingles = transferSinglesStream.map((event) => event.returnValues)
  dispatch(transferSinglesLoaded(transferSingles))
}

// load listings
export const loadListings = async (exchange, dispatch) => {
  const listingsStream = await exchange.getPastEvents('NewListing', { fromBlock: 0, toBlock: 'latest' })
  console.log('listing stream: ', listingsStream)
  const listings = listingsStream.map((event) => event.returnValues)
  dispatch(listingsLoaded(listings))
}

// load cancelled
export const loadCancelled = async (exchange, dispatch) => {
  const cancelledStream = await exchange.getPastEvents('Cancelled', { fromBlock: 0, toBlock: 'latest' })
  console.log('cancelled stream: ', cancelledStream)
  const cancelled = cancelledStream.map((event) => event.returnValues)
  dispatch(cancelledLoaded(cancelled))
}

// load sales
export const loadSales = async (exchange, dispatch) => {
  const salesStream = await exchange.getPastEvents('Sale', { fromBlock: 0, toBlock: 'latest' })
  console.log('sale stream: ', salesStream)
  const sales = salesStream.map((event) => event.returnValues)
  dispatch(salesLoaded(sales))
}

// TODO: load BATCH TRANSFER from ERC1155

// subscribe - listings, cancelled, sales, token contract owner change, TransferSingle from ERC1155
export const subscribeToEvents = async (token, exchange, dispatch) => {
  token.events.OwnershipTransferred({}, (error, event) => {
    dispatch(ownershipChanged(event.returnValues))
  })

  token.events.TransferSingle({}, (error, event) => {
    dispatch(tokenTransferredSingle(event.returnValues))
  })

  token.events.NewListing({}, (error, event) => {
    dispatch(listingCreated(event.returnValues))
  })

  token.events.Cancelled({}, (error, event) => {
    dispatch(listingCancelled(event.returnValues))
  })

  token.events.Sale({}, (error, event) => {
    dispatch(listingPurchased(event.returnValues))
  })
}