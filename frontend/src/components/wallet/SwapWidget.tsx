/**
 * SwapWidget — LI.FI cross-chain swap integration
 * 
 * Uses LI.FI's iframe widget for zero-dependency integration.
 * When LI.FI API key is configured, loads the full widget.
 * Otherwise shows framework-ready placeholder.
 * 
 * Default chain: Base (8453)
 */
import React from "react";

interface SwapWidgetProps {
  className?: string;
}

const LIFI_WIDGET_URL = "https://transferto.xyz/swap";

const SwapWidget: React.FC<SwapWidgetProps> = ({ className = "" }) => {
  const isConfigured = !!import.meta.env.VITE_LIFI_API_KEY;

  return (
    <div className={`rounded-xl border border-purple-500/30 bg-[#0d1130]/80 overflow-hidden ${className}`}>
      {isConfigured ? (
        /* Live LI.FI widget via iframe */
        <iframe
          src={`${LIFI_WIDGET_URL}?fromChain=8453&toChain=8453&theme=dark`}
          width="100%"
          height="500"
          style={{ border: "none", borderRadius: "12px" }}
          title="LI.FI Token Swap"
          allow="clipboard-read; clipboard-write"
        />
      ) : (
        /* Framework-ready placeholder */
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-purple-200">Token Swap & Bridge</h3>
              <p className="mt-1 text-xs text-gray-500">Powered by LI.FI</p>
            </div>
            <div className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400 border border-purple-500/20">
              Framework Ready
            </div>
          </div>

          {/* Mock swap interface */}
          <div className="space-y-3">
            {/* From */}
            <div className="rounded-lg border border-white/8 bg-[#0a0e27]/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">From</span>
                <span className="text-[10px] text-gray-600">Balance: —</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="0.0"
                  disabled
                  className="bg-transparent text-2xl font-bold text-white/30 outline-none w-2/3"
                />
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px]">Ξ</div>
                  <span className="text-sm text-gray-400">ETH</span>
                  <span className="text-[10px] text-gray-600">Base</span>
                </div>
              </div>
            </div>

            {/* Swap arrow */}
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400">
                ↕
              </div>
            </div>

            {/* To */}
            <div className="rounded-lg border border-white/8 bg-[#0a0e27]/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">To</span>
                <span className="text-[10px] text-gray-600">Balance: —</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="0.0"
                  disabled
                  className="bg-transparent text-2xl font-bold text-white/30 outline-none w-2/3"
                />
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-blue-400/30 flex items-center justify-center text-[10px] font-bold">$</div>
                  <span className="text-sm text-gray-400">USDC</span>
                  <span className="text-[10px] text-gray-600">Base</span>
                </div>
              </div>
            </div>
          </div>

          {/* Swap button (disabled) */}
          <button
            disabled
            className="w-full rounded-lg border border-purple-500/20 bg-purple-500/10 py-3 text-sm font-bold tracking-wider text-purple-400/50"
          >
            CONNECT WALLET TO SWAP
          </button>

          {/* Setup instructions */}
          <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-4 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400">Setup Instructions</h4>
            <div className="text-[10px] text-gray-500 space-y-1 font-mono">
              <p>1. Get a LI.FI API key from <span className="text-cyan-400/70">li.fi</span></p>
              <p>2. Add <span className="text-cyan-400/70">VITE_LIFI_API_KEY</span> to frontend .env</p>
              <p>3. Restart the app — swap widget will activate</p>
            </div>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Multi-chain", desc: "Swap across 20+ chains" },
              { label: "Best Rates", desc: "Aggregated from DEXs" },
              { label: "Base Native", desc: "Low gas, fast txns" },
              { label: "Bridge", desc: "Move assets cross-chain" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
              >
                <div className="text-xs font-bold text-white/60">{feature.label}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapWidget;
