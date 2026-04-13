/**
 * payoutIntegrations.ts — Reward payout provider stubs
 *
 * Defines the PayoutProvider interface and stub implementations for:
 *   - Thirdweb (NFT/token payouts via Thirdweb SDK on Sui)
 *
 * Reward distribution uses Merkle proof verification on-chain.
 * The RewardsVault smart contract on Sui verifies proofs and releases funds.
 * Payout amounts are calculated off-chain by the team each season.
 *
 * Also includes a CSV export utility for manual payout processing.
 *
 * None of these are live yet — all return { ready: false }.
 */

export interface PayoutData {
  playerId: string;
  displayName: string;
  division: string;
  rank: number;
  amountCents: number;
}

export interface PayoutProvider {
  name: string;
  preparePayout(data: PayoutData): Promise<{ ready: boolean; reference?: string }>;
}

export const thirdwebProvider: PayoutProvider = {
  name: 'Thirdweb (Sui)',
  async preparePayout(data) {
    // Future: Use Thirdweb SDK on Sui for Merkle proof reward claims
    console.log('[Thirdweb/Sui stub] Prepare payout:', data);
    return { ready: false, reference: 'thirdweb_sui_not_configured' };
  },
};

// Sui chain configuration
export const suiChainConfig = {
  name: 'Sui',
  rpcUrl: '', // placeholder — set when deploying
  rewardsVaultAddress: '', // placeholder — RewardsVault contract
};

export const PROVIDERS: Record<string, PayoutProvider> = {
  thirdweb: thirdwebProvider,
};

export function exportPayoutCSV(payouts: PayoutData[]): string {
  const header = 'player_id,display_name,division,rank,amount_cents\n';
  const rows = payouts.map(p =>
    `${p.playerId},${p.displayName},${p.division},${p.rank},${p.amountCents}`
  ).join('\n');
  return header + rows;
}
