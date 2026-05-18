/**
 * AddressLink — monospace address with copy-to-clipboard + BaseScan link.
 * Resolves ENS / Base names on the fly for `kind='address'`.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { useResolvedName } from '@/hooks/useResolvedName';

interface Props {
  address: string | null | undefined;
  /** 'address' (default) or 'tx' for transaction hashes. */
  kind?: 'address' | 'tx';
  /** Truncate middle of the string (default true for short rendering). */
  truncate?: boolean;
  /** Disable ENS / Base name resolution (default false). */
  noResolve?: boolean;
  className?: string;
}

function shorten(s: string): string {
  if (s.length <= 14) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}

export default function AddressLink({ address, kind = 'address', truncate = true, noResolve = false, className = '' }: Props) {
  const resolved = useResolvedName(kind === 'address' && !noResolve ? address : null);
  const [copied, setCopied] = useState(false);
  if (!address) return <span className={`glow-white font-mono ${className}`}>—</span>;
  const display = truncate ? shorten(address) : address;
  const href = `https://basescan.org/${kind}/${address}`;

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Copied', { duration: 1200 });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono ${className}`}>
      <span className="glow-white">{display}</span>
      <button
        onClick={copy}
        title="Copy"
        className="text-white/40 hover:text-yellow-300 transition-colors text-[10px] leading-none"
      >
        {copied ? '✓' : '⧉'}
      </button>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title="View on BaseScan"
        className="text-white/40 hover:text-blue-300 transition-colors text-[10px] leading-none"
      >
        ↗
      </a>
    </span>
  );
}
