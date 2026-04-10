// Wallet system stubs — no live blockchain connections yet
import { supabase } from '@/integrations/supabase/client';

export type WalletType = 'metamask' | 'coinbase_wallet' | 'walletconnect' | 'guest';

export const WALLET_LABELS: Record<WalletType, string> = {
  metamask: 'MetaMask',
  coinbase_wallet: 'Coinbase Wallet',
  walletconnect: 'WalletConnect',
  guest: 'Guest Wallet',
};

export async function linkWallet(userId: string, address: string, _type: WalletType): Promise<boolean> {
  // Stub: updates the wallet_address field on the player record
  const { error } = await supabase
    .from('players')
    .update({ wallet_address: address })
    .eq('user_id', userId);
  return !error;
}

export async function unlinkWallet(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .update({ wallet_address: null })
    .eq('user_id', userId);
  return !error;
}

export async function getWalletForPlayer(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('players')
    .select('wallet_address')
    .eq('user_id', userId)
    .single();
  return data?.wallet_address ?? null;
}
