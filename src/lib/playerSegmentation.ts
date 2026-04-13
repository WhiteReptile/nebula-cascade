/**
 * Player Segmentation — Frontend enforcement
 * ═══════════════════════════════════════════════════════════════
 *
 * CRITICAL RULE (mirrors backend core_rules.py):
 *
 * If a player owns OR has EVER owned a card:
 *   → They are PERMANENTLY excluded from the No-NFT leaderboard.
 *
 * This applies even if:
 *   - They have no energy
 *   - They sold all their cards
 *   - They are not actively using cards
 *
 * WHY:
 *   Players who've had NFT advantages (energy system, card bonuses)
 *   should not compete against pure free players. This prevents abuse
 *   where someone buys a card, gains skill/advantage, sells it, then
 *   dominates the free leaderboard.
 *
 * ENFORCEMENT:
 *   - Backend validates on match submission (can't bypass via frontend)
 *   - Frontend hides/shows UI based on segment (UX, not security)
 *   - The flag has_ever_owned_card is ONE-WAY (True forever)
 *
 * ═══════════════════════════════════════════════════════════════
 */

export type PlayerSegment = "non_nft" | "nft_player";
export type LeaderboardType = "no_nft" | "nft" | "global";

export interface PlayerSegmentInfo {
  player_id: string;
  has_ever_owned_card: boolean;
  segment: PlayerSegment;
  eligible_leaderboards: LeaderboardType[];
  can_view_no_nft_board: boolean;
  can_view_nft_board: boolean;
}

/**
 * Determine player segment from ownership flag.
 * Simple boolean check — the complexity is in setting the flag (one-way).
 */
export function getPlayerSegment(hasEverOwnedCard: boolean): PlayerSegment {
  return hasEverOwnedCard ? "nft_player" : "non_nft";
}

/**
 * Get which leaderboards a player can see and submit to.
 *
 * RULE:
 *   has_ever_owned_card = false → ["no_nft", "global"]
 *   has_ever_owned_card = true  → ["nft", "global"]
 *
 * A player can NEVER appear on both no_nft and nft boards.
 */
export function getEligibleLeaderboards(hasEverOwnedCard: boolean): LeaderboardType[] {
  if (hasEverOwnedCard) {
    return ["nft", "global"];
  }
  return ["no_nft", "global"];
}

/**
 * Check if a player can view a specific leaderboard tab.
 * Used by Leaderboard.tsx to show/hide tabs.
 */
export function canViewLeaderboard(
  hasEverOwnedCard: boolean,
  boardType: LeaderboardType
): boolean {
  const eligible = getEligibleLeaderboards(hasEverOwnedCard);
  return eligible.includes(boardType);
}

/**
 * Get display info for the player's segment.
 * Used in UI badges and headers.
 */
export function getSegmentDisplay(hasEverOwnedCard: boolean) {
  if (hasEverOwnedCard) {
    return {
      label: "NFT Player",
      badge: "NFT",
      color: "purple",
      description: "Card owner — competes on NFT leaderboard",
    };
  }
  return {
    label: "Free Player",
    badge: "FREE",
    color: "cyan",
    description: "No cards — competes on No-NFT leaderboard",
  };
}
