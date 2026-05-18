/**
 * NebulaMarketplace ABI — minimal, hand-curated. Matches contracts/NebulaMarketplace.sol.
 * Used by Thirdweb v5 prepareContractCall + useReadContract.
 */
export const NEBULA_MARKETPLACE_ABI = [
  // --- writes ---
  {
    type: 'function',
    name: 'listCard',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'nftAddress', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'priceWei', type: 'uint256' },
    ],
    outputs: [{ name: 'listingId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'buyCard',
    stateMutability: 'payable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'cancelListing',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  // --- views ---
  {
    type: 'function',
    name: 'nextListingId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'feeBps',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint96' }],
  },
  {
    type: 'function',
    name: 'treasury',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'setTreasury',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_treasury', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setFeeBps',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_feeBps', type: 'uint96' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'lockedUntil',
    stateMutability: 'view',
    inputs: [
      { name: 'nftAddress', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'event',
    name: 'CardSold',
    inputs: [
      { name: 'listingId', type: 'uint256', indexed: true },
      { name: 'seller', type: 'address', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'nftAddress', type: 'address', indexed: false },
      { name: 'tokenId', type: 'uint256', indexed: false },
      { name: 'priceWei', type: 'uint256', indexed: false },
      { name: 'feePaid', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'isLocked',
    stateMutability: 'view',
    inputs: [
      { name: 'nftAddress', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getActiveListings',
    stateMutability: 'view',
    inputs: [
      { name: 'cursor', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: 'page',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'seller', type: 'address' },
          { name: 'nftAddress', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'priceWei', type: 'uint256' },
          { name: 'createdAt', type: 'uint64' },
          { name: 'active', type: 'bool' },
        ],
      },
      { name: 'nextCursor', type: 'uint256' },
    ],
  },
  // --- ERC-1155 setApprovalForAll lives on the NFT contract, declared here for reuse ---
] as const;

/** Minimal ERC-1155 ABI used for setApprovalForAll + isApprovedForAll. */
export const ERC1155_APPROVAL_ABI = [
  {
    type: 'function',
    name: 'setApprovalForAll',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;
