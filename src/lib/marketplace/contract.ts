/**
 * NebulaMarketplace contract handle (Thirdweb v5).
 *
 * Address comes from `VITE_MARKETPLACE_CONTRACT`. If unset, `marketplaceContract`
 * is null and the UI should render an "unconfigured" state instead of trying to read.
 */
import { getContract } from 'thirdweb';
import { thirdwebClient } from '@/lib/thirdweb/client';
import { nebulaChain } from '@/lib/thirdweb/chains';
import { NEBULA_COLLECTION_ADDRESS } from '@/lib/thirdweb/contracts';
import { NEBULA_MARKETPLACE_ABI, ERC1155_APPROVAL_ABI } from './abi';

const RAW_ADDR = (import.meta.env.VITE_MARKETPLACE_CONTRACT ?? '').trim();
const ADDR_VALID = /^0x[a-fA-F0-9]{40}$/.test(RAW_ADDR);

export const MARKETPLACE_ADDRESS: string | null = ADDR_VALID ? RAW_ADDR : null;
export const MARKETPLACE_CONFIGURED = ADDR_VALID;

export const marketplaceContract = MARKETPLACE_ADDRESS
  ? getContract({
      client: thirdwebClient,
      chain: nebulaChain,
      address: MARKETPLACE_ADDRESS,
      abi: NEBULA_MARKETPLACE_ABI as any,
    })
  : null;

/** ERC-1155 collection contract typed with the approval ABI (separate from nebulaCollection). */
export const nebulaCollectionForApproval = getContract({
  client: thirdwebClient,
  chain: nebulaChain,
  address: NEBULA_COLLECTION_ADDRESS,
  abi: ERC1155_APPROVAL_ABI as any,
});

export { NEBULA_COLLECTION_ADDRESS };
