import { get, reject } from 'lodash'
import { createSelector } from 'reselect'

// TOKEN

const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, t => t)

const tokenLoaded = state => get(state, 'token.loaded')
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

// EXCHANGE

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

const exchangeLoaded = state => get(state, 'exchange.loaded',)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const allListingsLoaded = state => get(state, 'exchange.allListings.loaded', false)
export const allListingsLoadedSelector = createSelector(allListingsLoaded, status => status)

const allCancelledLoaded = state => get(state, 'exchange.allCancelled.loaded', false)
export const allCancelledLoadedSelector = createSelector(allCancelledLoaded, status => status)

const allSalesLoaded = state => get(state, 'exchange.allSales.loaded', false)
export const allSalesLoadedSelector = createSelector(allSalesLoaded, status => status)

export const allListingTypesLoadedSelector = createSelector(
  allListingsLoaded,
  allCancelledLoaded,
  allSalesLoaded,
  (ll, cl, sl) => (ll, cl, sl)
)

const listingCancelling = state => get(state, 'exchange.listingCancelling', false)
export const listingCancellingSelector = createSelector(listingCancelling, status => status)

const listingPurchasing = state => get(state, 'exchange.listingPurchasing', false)
export const listingPurchasingSelector = createSelector(listingPurchasing, status => status)

const allListings = state => get(state, 'exchange.allListings.data', [])
const allCancelled = state => get(state, 'exchange.allCancelleddata', [])
const allSales = state => get(state, 'exchange.allSales.data', [])

const allOpenListings = state => {
  const listings = allListings
  const cancelled = allCancelled
  const sales = allSales

  let allOpenListings = reject(listings, (listing) => {
    const listingCancelled = cancelled.some((l) => l.listingId === listing.listingId)
    const listingSold = sales.some((l) => l.listingId === listing.listingId)
    return (listingCancelled || listingSold)
  })

  return allOpenListings
}

export const allOpenListingsSelector = createSelector(allOpenListings, aol => aol)

// decorate orders