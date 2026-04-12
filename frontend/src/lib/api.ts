/**
 * API client for backend endpoints
 * 
 * All calls go through REACT_APP_BACKEND_URL.
 * Modular — each domain has its own namespace.
 */
const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ─── NFT ────────────────────────────────────────────────
export const nftApi = {
  getBlockchainStatus: () =>
    apiFetch<any>("/api/nft/status"),

  getMetadata: (cardId: string, params?: Record<string, string>) => {
    const qs = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return apiFetch<any>(`/api/nft/metadata/${cardId}${qs}`);
  },

  requestMint: (data: {
    player_id: string;
    card_id: string;
    recipient_address: string;
  }) =>
    apiFetch<any>("/api/nft/mint", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMintStatus: (recordId: string) =>
    apiFetch<any>(`/api/nft/mint/${recordId}`),

  getPlayerNFTs: (playerId: string) =>
    apiFetch<any>(`/api/nft/cards/${playerId}`),
};

// ─── Marketplace ────────────────────────────────────────
export const marketplaceApi = {
  validateListing: (data: {
    card_id: string;
    seller_player_id: string;
    price_cents: number;
    seller_wallet?: string;
  }) =>
    apiFetch<any>("/api/marketplace/validate-listing", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validatePurchase: (data: {
    listing_id: string;
    buyer_player_id: string;
    buyer_wallet?: string;
  }) =>
    apiFetch<any>("/api/marketplace/validate-purchase", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getFees: () =>
    apiFetch<any>("/api/marketplace/fees"),

  getStats: () =>
    apiFetch<any>("/api/marketplace/stats"),
};

// ─── Wallet ─────────────────────────────────────────────
export const walletApi = {
  linkWallet: (data: {
    player_id: string;
    wallet_address: string;
    wallet_type?: string;
    signature?: string;
    message?: string;
  }) =>
    apiFetch<any>("/api/wallet/link", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyWallet: (data: {
    wallet_address: string;
    signature: string;
    message: string;
  }) =>
    apiFetch<any>("/api/wallet/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getInfo: (playerId: string) =>
    apiFetch<any>(`/api/wallet/info/${playerId}`),

  generateMessage: (playerId: string) =>
    apiFetch<any>(`/api/wallet/generate-message/${playerId}`),

  unlinkWallet: (playerId: string) =>
    apiFetch<any>(`/api/wallet/unlink/${playerId}`, { method: "DELETE" }),
};

// ─── Anti-Cheat ─────────────────────────────────────────
export const anticheatApi = {
  validateScore: (data: {
    player_id: string;
    score: number;
    level_reached: number;
    survival_time_seconds: number;
    max_combo: number;
    combo_efficiency?: number;
    lines_cleared?: number;
    session_id?: string;
  }) =>
    apiFetch<any>("/api/anticheat/validate-score", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getThresholds: () =>
    apiFetch<any>("/api/anticheat/thresholds"),

  getStatus: () =>
    apiFetch<any>("/api/anticheat/status"),
};
