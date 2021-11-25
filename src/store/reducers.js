import { combineReducers } from "redux"

// TOKEN
function token(state = {}, action) {
  switch(action.type) {
    case 'TOKEN_CONTRACT_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    case 'OWNERSHIP_CHANGES_LOADED':
      return { ...state, ownershipTransferred: { loaded: true, data: action.ownershipTransfers } }
    case 'TOKEN_TRANSERRED_SINGLE':
      return { ...state, transferSingle: { loaded: true, data: action.transferSingles } }
    default:
      return state
  }
}

// EXCHANGE

function exchange(state = {}, action) {
  switch(action.type) {
    case 'EXCHANGE_CONTRACT_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    
    case 'LISTINGS_LOADED':
      return { ...state, allListings: { loaded: true, data: action.listings } }
    case 'LISTING_CREATING':
      return { ...state, listingCreating: true }
    case 'LISTING_CREATED':
      return {
        ...state,
        listingCreating: false,
        allListings: {
          ...state.allListings,
          data: [
            ...state.allListings.data,
            action.listing
          ]
        }
      }
    
    case 'CANCELLED_LOADED':
      return { ...state, allCancelled: { loaded: true, data: action.cancelled } }
    case 'LISTING_CANCELLING':
      return { ...state, listingCancelling: true }
    case 'LISTING_CANCELLED':
      return {
        ...state,
        listingCancelling: false,
        allCancelled: {
          ...state.allCancelled,
          data: [
            ...state.allCancelled.data,
            action.cancelled
          ]
        }
      }
    
    case 'SALES_LOADED':
      return { ...state, allSales: { loaded: true, data: action.sale } }
    case 'LISTING_PURCHASING':
        return { ...state, listingPurchasing: true }
    case 'LISTING_PURCHASED':
      return {
        ...state,
        listingPurchasing: false,
        allSales: {
          ...state.allSales,
          data: [
            ...state.allSales.data,
            action.sale
          ]
        }
      }
    
    default:
      return state
  }
}

// TODO: add contract reducer

const rootReducer = combineReducers({
  token,
  exchange
})

export default rootReducer