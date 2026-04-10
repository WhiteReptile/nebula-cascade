// Payout integration stubs — ready for future implementation

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

export const stripeProvider: PayoutProvider = {
  name: 'Stripe',
  async preparePayout(data) {
    // Future: Use Stripe Connect to create a transfer
    console.log('[Stripe stub] Prepare payout:', data);
    return { ready: false, reference: 'stripe_not_configured' };
  },
};

export const coinbaseProvider: PayoutProvider = {
  name: 'Coinbase',
  async preparePayout(data) {
    // Future: Use Coinbase Commerce API
    console.log('[Coinbase stub] Prepare payout:', data);
    return { ready: false, reference: 'coinbase_not_configured' };
  },
};

export const circleProvider: PayoutProvider = {
  name: 'Circle',
  async preparePayout(data) {
    // Future: Use Circle Payments API
    console.log('[Circle stub] Prepare payout:', data);
    return { ready: false, reference: 'circle_not_configured' };
  },
};

export const thirdwebProvider: PayoutProvider = {
  name: 'Thirdweb',
  async preparePayout(data) {
    // Future: Use Thirdweb SDK for NFT/token payouts
    console.log('[Thirdweb stub] Prepare payout:', data);
    return { ready: false, reference: 'thirdweb_not_configured' };
  },
};

export const PROVIDERS: Record<string, PayoutProvider> = {
  stripe: stripeProvider,
  coinbase: coinbaseProvider,
  circle: circleProvider,
  thirdweb: thirdwebProvider,
};

export function exportPayoutCSV(payouts: PayoutData[]): string {
  const header = 'player_id,display_name,division,rank,amount_cents\n';
  const rows = payouts.map(p =>
    `${p.playerId},${p.displayName},${p.division},${p.rank},${p.amountCents}`
  ).join('\n');
  return header + rows;
}
