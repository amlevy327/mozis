// TOKEN

// contract

export function tokenContractLoaded(contract) {
  return {
    type: 'TOKEN_CONTRACT_LOADED',
    contract
  }
}

// events - past

export function ownershipChangesLoaded(ownershipChanges) {
  return {
    type: 'OWNERSHIP_CHANGES_LOADED',
    ownershipChanges
  }
}

export function transferSinglesLoaded(transferSingles) {
  return {
    type: 'TRANSFER_SINGLES_LOADED',
    transferSingles
  }
}

// events - new

export function ownershipChanged(ownershipTransfers) {
  return {
    type: 'OWNERSHIP_CHANGED',
    ownershipTransfers
  }
}

export function tokenTransferredSingle(transferSingles) {
  return {
    type: 'TOKEN_TRANSERRED_SINGLE',
    transferSingles
  }
}

// EXCHANGE

// contract

export function exchangeContractLoaded(contract) {
  return {
    type: 'EXCHANGE_CONTRACT_LOADED',
    contract
  }
}

// events - past

export function listingsLoaded(listings) {
  return {
    type: 'LISTINGS_LOADED',
    listings
  }
}

export function cancelledLoaded(cancelled) {
  return {
    type: 'CANCELLED_LOADED',
    cancelled
  }
}

export function salesLoaded(sales) {
  return {
    type: 'SALES_LOADED',
    sales
  }
}

// events - new

export function listingCreating() {
  return {
    type: 'LISTING_CREATING'
  }
}

export function listingCreated(listing) {
  return {
    type: 'LISTING_CREATED',
    listing
  }
}

export function listingCancelling() {
  return {
    type: 'LISTING_CANCELLING'
  }
}

export function listingCancelled(cancelled) {
  return {
    type: 'LISTING_CANCELLED',
    cancelled
  }
}

export function listingPurchasing() {
  return {
    type: 'LISTING_PURCHASING'
  }
}

export function listingPurchased(sale) {
  return {
    type: 'LISTING_PURCHASED',
    sale
  }
}

