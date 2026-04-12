"""Player API routes

Player segmentation, status, and profile endpoints.
Enforces core game rules from core_rules.py.

All routes prefixed with /api/player
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import uuid
from datetime import datetime

# Import core rules — the single source of truth
from core_rules import (
    PlayerSegment,
    LeaderboardType,
    get_player_segment,
    get_eligible_leaderboards,
    can_submit_to_leaderboard,
    should_flag_on_card_acquisition,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/player", tags=["player"])


# ─────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────

class PlayerSegmentInfo(BaseModel):
    """Player segmentation info returned to frontend.

    CRITICAL: has_ever_owned_card is a PERMANENT flag.
    Once True, it never reverts. See core_rules.py for full explanation.
    """
    player_id: str
    has_ever_owned_card: bool
    segment: PlayerSegment
    eligible_leaderboards: List[LeaderboardType]
    can_view_no_nft_board: bool
    can_view_nft_board: bool


class FlagCardOwnershipRequest(BaseModel):
    """Request to flag a player as having owned a card.

    WARNING: This is a ONE-WAY operation. Cannot be undone.
    Called when a player mints, buys, or receives a card.
    """
    player_id: str


class LeaderboardEntry(BaseModel):
    player_id: str
    display_name: str = "Player"
    score: int = 0
    division: str = "gem_v"
    has_ever_owned_card: bool = False


# ─────────────────────────────────────────────────────────────────────
# In-memory player store (mirrors Supabase — for API contract)
#
# In production, all reads/writes go to Supabase players table.
# This store demonstrates the API contract and enforcement logic.
# ─────────────────────────────────────────────────────────────────────
player_store: dict = {}


def _get_or_create_player(player_id: str) -> dict:
    """Get player from store or create with defaults."""
    if player_id not in player_store:
        player_store[player_id] = {
            "player_id": player_id,
            "has_ever_owned_card": False,  # DEFAULT: never owned a card
            "display_name": f"Player_{player_id[:6]}",
            "total_points": 0,
            "division": "gem_v",
        }
    return player_store[player_id]


# ─────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────

@router.get("/segment/{player_id}", response_model=PlayerSegmentInfo)
async def get_player_segmentation(player_id: str):
    """Get player's segmentation status.

    Returns:
    - Their segment (non_nft or nft_player)
    - Which leaderboards they can see/submit to
    - Whether they can view No-NFT board

    RULE: If has_ever_owned_card is True, they are PERMANENTLY
    excluded from the No-NFT leaderboard. See core_rules.py.
    """
    player = _get_or_create_player(player_id)
    has_card = player["has_ever_owned_card"]
    segment = get_player_segment(has_card)
    eligible = get_eligible_leaderboards(has_card)

    return PlayerSegmentInfo(
        player_id=player_id,
        has_ever_owned_card=has_card,
        segment=segment,
        eligible_leaderboards=eligible,
        can_view_no_nft_board=LeaderboardType.NO_NFT in eligible,
        can_view_nft_board=LeaderboardType.NFT in eligible,
    )


@router.post("/flag-card-ownership")
async def flag_card_ownership(request: FlagCardOwnershipRequest):
    """Flag a player as having owned a card.

    ⚠️ WARNING: This is a ONE-WAY, PERMANENT operation.
    Once flagged, the player can NEVER compete on the No-NFT leaderboard again.

    This endpoint is called when:
    - Player mints an NFT card
    - Player buys a card on the marketplace
    - Player receives a card via transfer

    WHY PERMANENT:
    Even if the player sells all their cards, they've had the advantage
    of the NFT tier (energy system, card bonuses). Allowing them back
    to the No-NFT board would be unfair to pure free players.
    """
    player = _get_or_create_player(request.player_id)

    was_already_flagged = player["has_ever_owned_card"]
    needs_update = should_flag_on_card_acquisition(
        request.player_id, was_already_flagged
    )

    if needs_update:
        player["has_ever_owned_card"] = True
        logger.info(
            f"SEGMENTATION: Player {request.player_id} flagged as card owner. "
            f"Permanently excluded from No-NFT leaderboard."
        )

    return {
        "player_id": request.player_id,
        "has_ever_owned_card": True,
        "was_already_flagged": was_already_flagged,
        "segment": PlayerSegment.NFT_PLAYER,
        "message": (
            "Already flagged — no change"
            if was_already_flagged
            else "Player permanently flagged as card owner"
        ),
    }


@router.get("/leaderboard/{board_type}")
async def get_segmented_leaderboard(board_type: LeaderboardType):
    """Get leaderboard filtered by player segment.

    ENFORCEMENT: Players are filtered by has_ever_owned_card.
    - no_nft board: ONLY players where has_ever_owned_card = False
    - nft board: ONLY players where has_ever_owned_card = True
    - global board: ALL players

    In production, this filters the Supabase leaderboard table.
    """
    entries = []
    for pid, player in player_store.items():
        eligible = get_eligible_leaderboards(player["has_ever_owned_card"])
        if board_type in eligible:
            entries.append({
                "player_id": pid,
                "display_name": player["display_name"],
                "total_points": player["total_points"],
                "division": player["division"],
                "segment": get_player_segment(player["has_ever_owned_card"]).value,
            })

    # Sort by score descending
    entries.sort(key=lambda x: x["total_points"], reverse=True)

    return {
        "board_type": board_type,
        "total_entries": len(entries),
        "entries": entries,
        "rule_note": (
            "Only players who have NEVER owned a card"
            if board_type == LeaderboardType.NO_NFT
            else "Only current/former card owners"
            if board_type == LeaderboardType.NFT
            else "All players"
        ),
    }


@router.get("/can-submit/{player_id}/{board_type}")
async def check_submission_eligibility(
    player_id: str,
    board_type: LeaderboardType,
):
    """Check if a player can submit a score to a specific leaderboard.

    Called before match submission to prevent invalid entries.

    RULE: A player who has_ever_owned_card = True can NEVER submit
    to the no_nft leaderboard, even if they currently own zero cards.
    """
    player = _get_or_create_player(player_id)
    can_submit = can_submit_to_leaderboard(
        player["has_ever_owned_card"], board_type
    )

    return {
        "player_id": player_id,
        "board_type": board_type,
        "can_submit": can_submit,
        "has_ever_owned_card": player["has_ever_owned_card"],
        "reason": (
            "Eligible for this leaderboard"
            if can_submit
            else "Permanently excluded — player has owned a card (see core_rules.py)"
        ),
    }
