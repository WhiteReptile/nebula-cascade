/**
 * Swap Page — Token swap & bridging via LI.FI
 * 
 * Accessible from /swap route.
 * Cosmic theme matching the rest of the app.
 */
import React from "react";
import { Link } from "react-router-dom";
import SwapWidget from "../components/wallet/SwapWidget";
import ThirdwebWalletConnect from "../components/wallet/ThirdwebWalletConnect";

const Swap: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#151a3f] to-[#0a0e27] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 px-6 py-4">
        <Link
          to="/"
          className="text-sm text-purple-400 transition hover:text-purple-300"
        >
          &larr; Back to Menu
        </Link>
        <h1 className="text-lg font-bold tracking-wider text-purple-200">
          TOKEN SWAP
        </h1>
        <div className="w-20" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Swap Widget — Main Area */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">Swap & Bridge</h2>
              <p className="mt-1 text-sm text-gray-400">
                Swap tokens or bridge between chains. Powered by LI.FI.
              </p>
            </div>
            <SwapWidget className="min-h-[500px]" />
          </div>

          {/* Sidebar — Wallet & Info */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Your Wallet
              </h3>
              <ThirdwebWalletConnect />
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-[#151a3f]/60 p-4">
              <h3 className="mb-2 text-sm font-semibold text-purple-300">
                About Swaps
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-cyan-400">&bull;</span>
                  Swap between any supported tokens on Base
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-cyan-400">&bull;</span>
                  Bridge from Ethereum, Arbitrum, Polygon & more
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-cyan-400">&bull;</span>
                  Best rates aggregated automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-cyan-400">&bull;</span>
                  Base chain = very low gas fees
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-xs text-cyan-400">
                Chain: Base &bull; ERC-721 NFTs &bull; Powered by LI.FI + Thirdweb
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
