/**
 * walletSystem.ts — Wallet linking stubs
 *
 * Manages the wallet_address field on the player record.
 * Currently stub implementations — no live blockchain connections.
 * Supported wallet types: Thirdweb (Google/email), Guest.
 *
 * Future: Will integrate with Thirdweb SDK for wallet creation
 * * and on-chain card ownership on Base blockchain.
 *
 * Database field: `players.wallet_address`
 */
import { supabase } from '@/integrations/supabase/client';

export type WalletType = 'thirdweb' | 'guest';

export const WALLET_LABELS: Record<WalletType, string> = {
  thirdweb: 'Thirdweb Wallet',
  guest: 'Guest Wallet',
};

export async function linkWallet(userId: string, address: string, _type: WalletType): Promise<boolean> {
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
