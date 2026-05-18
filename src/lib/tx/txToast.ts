/**
 * txToast — unified Sonner toast for on-chain transactions with BaseScan link.
 *
 * Usage: const id = notifyTxPending('List card'); ... notifyTxSent(id, 'List card', hash);
 * Once you have the hash, call notifyTxConfirmed/notifyTxFailed after awaiting the receipt.
 *
 * Backed by thirdweb v5 waitForReceipt so the same toast id is updated in-place.
 */
import { toast } from 'sonner';
import { waitForReceipt } from 'thirdweb';
import { thirdwebClient } from '@/lib/thirdweb/client';
import { nebulaChain } from '@/lib/thirdweb/chains';

const BASESCAN_TX = 'https://basescan.org/tx/';

export type TxKind =
  | 'List card'
  | 'Purchase'
  | 'Cancel'
  | 'Approve marketplace'
  | 'Update treasury'
  | 'Update fee';

function shortHash(h: string): string {
  if (!h || h.length < 14) return h ?? '';
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

/**
 * Track a tx hash through to confirmation. Updates a single toast.
 * Returns the receipt (or null on failure) — callers can ignore.
 */
export async function trackTx(label: TxKind, hash: `0x${string}` | string) {
  const id = toast.loading(`${label}: pending`, {
    description: `Tx ${shortHash(hash)} • view on BaseScan`,
    action: {
      label: 'BaseScan',
      onClick: () => window.open(`${BASESCAN_TX}${hash}`, '_blank', 'noopener,noreferrer'),
    },
  });
  try {
    const receipt = await waitForReceipt({
      client: thirdwebClient,
      chain: nebulaChain,
      transactionHash: hash as `0x${string}`,
    });
    if (receipt.status === 'success') {
      toast.success(`${label}: confirmed`, {
        id,
        description: `Tx ${shortHash(hash)}`,
        action: {
          label: 'BaseScan',
          onClick: () => window.open(`${BASESCAN_TX}${hash}`, '_blank', 'noopener,noreferrer'),
        },
      });
    } else {
      toast.error(`${label}: reverted`, {
        id,
        description: `Tx ${shortHash(hash)}`,
        action: {
          label: 'BaseScan',
          onClick: () => window.open(`${BASESCAN_TX}${hash}`, '_blank', 'noopener,noreferrer'),
        },
      });
    }
    return receipt;
  } catch (e: any) {
    toast.error(`${label}: failed`, {
      id,
      description: String(e?.shortMessage ?? e?.message ?? e).slice(0, 140),
    });
    return null;
  }
}

export function basescanTxUrl(hash: string) { return `${BASESCAN_TX}${hash}`; }
