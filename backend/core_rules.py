"""CORE GAME RULES — Nebula Cascade by ColdLogic
═══════════════════════════════════════════════════════════════════════

This module is the SINGLE SOURCE OF TRUTH for all core game rules.
Every system (backend, frontend, database) must enforce these rules.
Do NOT scatter rule logic across files — import from here.

Any future developer: READ THIS FILE FIRST before touching game logic.
═══════════════════════════════════════════════════════════════════════
"""

# ─────────────────────────────────────────────────────────────────────
# RULE 1: PLAYER SEGMENTATION (CRITICAL — DO NOT MODIFY WITHOUT REVIEW)
# ─────────────────────────────────────────────────────────────────────
#
# WHY THIS RULE EXISTS:
#   Players who own NFT cards have a structural advantage (energy system,
#   card bonuses, marketplace access). Allowing them to also compete on
#   the No-NFT leaderboard would make it unfair for free/casual players.
#
#   This is an anti-abuse measure. Without it, a player could:
#   1. Buy a card → gain advantage
#   2. Sell/transfer the card
#   3. Compete on the "free" leaderboard with skills/knowledge gained
#      from the NFT tier
#
# HOW IT WORKS:
#   - Every player has a persistent boolean: has_ever_owned_card
#   - Once set to True, it NEVER reverts to False
#   - This flag determines which leaderboard(s) a player can appear on
#   - Enforcement happens at: match submission, leaderboard queries,
#     and frontend UI visibility
#
# HOW IT AFFECTS PLAYER SEGMENTATION:
#   ┌─────────────────────┬──────────────────┬─────────────────────┐
#   │ Player Type         │ No-NFT Board     │ NFT Board           │
#   ├─────────────────────┼──────────────────┼─────────────────────┤
#   │ Never owned card    │ ✅ YES            │ ❌ NO               │
#   │ Currently owns card │ ❌ NO (permanent) │ ✅ YES               │
#   │ Sold all cards      │ ❌ NO (permanent) │ ✅ YES               │
#   │ Anonymous player    │ ✅ YES            │ ❌ NO               │
#   └─────────────────────┴──────────────────┴─────────────────────┘
#
# DATABASE REQUIREMENT:
#   The `players` table (Supabase) MUST have:
#     has_ever_owned_card  BOOLEAN  DEFAULT FALSE  NOT NULL
#
#   SQL to add (run once in Supabase SQL editor):
#     ALTER TABLE players
#       ADD COLUMN IF NOT EXISTS has_ever_owned_card BOOLEAN DEFAULT FALSE NOT NULL;
#
#   Trigger to auto-set on card acquisition (recommended):
#     CREATE OR REPLACE FUNCTION set_has_ever_owned_card()
#     RETURNS TRIGGER AS $$
#     BEGIN
#       UPDATE players SET has_ever_owned_card = TRUE
#       WHERE id = NEW.owner_id AND has_ever_owned_card = FALSE;
#       RETURN NEW;
#     END;
#     $$ LANGUAGE plpgsql;
#
#     CREATE TRIGGER trg_card_ownership
#     AFTER INSERT ON cards
#     FOR EACH ROW EXECUTE FUNCTION set_has_ever_owned_card();
#
# ─────────────────────────────────────────────────────────────────────

from enum import Enum
from typing import Optional


class PlayerSegment(str, Enum):
    """Player segment based on card ownership history.

    CRITICAL: Once a player is NFT_PLAYER, they can NEVER go back.
    This is by design — see rule documentation above.
    """
    NON_NFT = "non_nft"      # Never owned a card
    NFT_PLAYER = "nft_player"  # Owns or has ever owned a card


class LeaderboardType(str, Enum):
    """Leaderboard types — segregated by player segment."""
    NO_NFT = "no_nft"    # Only players who have NEVER owned a card
    NFT = "nft"          # Only players who own or have owned a card
    GLOBAL = "global"    # All players (for display only, no rewards)


def get_player_segment(has_ever_owned_card: bool) -> PlayerSegment:
    """Determine player segment from ownership flag.

    This is intentionally simple — a single boolean check.
    The complexity is in SETTING the flag (which is one-way: False → True, never back).
    """
    if has_ever_owned_card:
        return PlayerSegment.NFT_PLAYER
    return PlayerSegment.NON_NFT


def get_eligible_leaderboards(has_ever_owned_card: bool) -> list:
    """Return which leaderboards a player can appear on.

    RULE: If has_ever_owned_card is True → ONLY NFT + GLOBAL leaderboards.
          If has_ever_owned_card is False → ONLY NO_NFT + GLOBAL leaderboards.

    A player can NEVER appear on both NFT and NO_NFT boards.
    """
    if has_ever_owned_card:
        return [LeaderboardType.NFT, LeaderboardType.GLOBAL]
    return [LeaderboardType.NO_NFT, LeaderboardType.GLOBAL]


def can_submit_to_leaderboard(
    has_ever_owned_card: bool,
    target_leaderboard: LeaderboardType,
) -> bool:
    """Check if a player can submit a score to a specific leaderboard.

    ENFORCEMENT POINT: Called during match submission validation.
    Prevents a card owner (current or former) from submitting to No-NFT board.
    """
    eligible = get_eligible_leaderboards(has_ever_owned_card)
    return target_leaderboard in eligible


def should_flag_on_card_acquisition(player_id: str, has_ever_owned_card: bool) -> bool:
    """Check if we need to update the player flag when they get a card.

    Returns True if the flag needs to change (False → True).
    Returns False if already flagged (True → True, no-op).

    IMPORTANT: This flag is ONE-WAY. We never set it back to False.
    Even if the player sells all their cards, the flag stays True.
    """
    return not has_ever_owned_card  # Only need to update if currently False


# ─────────────────────────────────────────────────────────────────────
# RULE 2: ENERGY SYSTEM (NFT PLAYERS ONLY)
# ─────────────────────────────────────────────────────────────────────
#
# - Each card has 2 energy per day
# - Energy resets daily
# - Non-NFT players have NO energy system (unlimited plays)
# - NFT players MUST use a card (costs 1 energy) to play
# - If all cards are out of energy, NFT player cannot play until reset
#
# ─────────────────────────────────────────────────────────────────────

ENERGY_PER_CARD_PER_DAY = 2


def can_nft_player_play(cards_with_energy: list) -> bool:
    """Check if an NFT player has any card with remaining energy.

    Non-NFT players bypass this entirely (they don't use the energy system).
    """
    return any(card.get("energy", 0) > 0 for card in cards_with_energy)


# ─────────────────────────────────────────────────────────────────────
# RULE 3: DIVISION SYSTEM
# ─────────────────────────────────────────────────────────────────────
#
# Divisions apply to ALL players (NFT and non-NFT).
# Points earned determine division tier.
# Division affects reward eligibility and leaderboard grouping.
#
# ─────────────────────────────────────────────────────────────────────

DIVISION_THRESHOLDS = {
    "gem_v":   0,
    "gem_iv":  500,
    "gem_iii": 2000,
    "gem_ii":  5000,
    "gem_i":   10000,
}


def get_division(total_points: int) -> str:
    """Get division based on cumulative points."""
    division = "gem_v"
    for div, threshold in DIVISION_THRESHOLDS.items():
        if total_points >= threshold:
            division = div
    return division


# ─────────────────────────────────────────────────────────────────────
# SUMMARY OF ALL ENFORCEMENT POINTS
# ─────────────────────────────────────────────────────────────────────
#
# 1. MATCH SUBMISSION (backend: /api/anticheat/validate-score)
#    → Check has_ever_owned_card
#    → Route score to correct leaderboard
#    → Reject if submitting to wrong board
#
# 2. LEADERBOARD QUERY (backend: /api/player/leaderboard)
#    → Filter players by segment
#    → Never mix NFT and non-NFT players on segregated boards
#
# 3. CARD ACQUISITION (backend: /api/nft/mint, marketplace purchase)
#    → Set has_ever_owned_card = True (ONE-WAY, PERMANENT)
#    → This is the ONLY place the flag changes
#
# 4. FRONTEND UI (Leaderboard.tsx, playerSegmentation.ts)
#    → Show/hide leaderboard tabs based on player segment
#    → Display correct segment badge
#    → Prevent UI from showing wrong leaderboard
#
# ─────────────────────────────────────────────────────────────────────
