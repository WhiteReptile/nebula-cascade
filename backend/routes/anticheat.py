"""Anti-cheat API routes

Server-side score validation and anti-cheat checks.
Structure for future external anti-cheat API integration.

ENFORCES: Player segmentation rule (see core_rules.py)
- Validates has_ever_owned_card on every score submission
- Routes scores to correct leaderboard (no_nft vs nft)
- Rejects submissions to wrong leaderboard

All routes prefixed with /api/anticheat
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

# Import core rules for segmentation enforcement
from core_rules import (
    LeaderboardType,
    get_player_segment,
    get_eligible_leaderboards,
    can_submit_to_leaderboard,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/anticheat", tags=["anticheat"])


class ScoreSubmission(BaseModel):
    """Score submission for server-side validation"""
    player_id: str
    score: int
    level_reached: int
    survival_time_seconds: int
    max_combo: int
    combo_efficiency: float = 0.0
    omni_color_count: int = 0
    lines_cleared: int = 0
    session_id: Optional[str] = None
    session_seed: Optional[str] = None
    card_id: Optional[str] = None
    client_timestamp: Optional[str] = None
    # SEGMENTATION FIELDS (see core_rules.py for full explanation)
    has_ever_owned_card: bool = False  # Player's ownership flag
    target_leaderboard: str = "auto"   # "no_nft", "nft", or "auto" (server decides)


class ValidationResult(BaseModel):
    """Result of anti-cheat validation"""
    valid: bool
    score_accepted: bool
    flags: Dict[str, bool] = {}
    risk_level: str = "low"  # low | medium | high | critical
    warnings: List[str] = []
    adjustments: Dict[str, Any] = {}
    # SEGMENTATION (see core_rules.py)
    player_segment: str = "non_nft"      # "non_nft" or "nft_player"
    routed_to_leaderboard: str = "no_nft"  # Which leaderboard this score goes to
    segmentation_valid: bool = True       # False if player tried wrong board


# Thresholds for anti-cheat checks
SCORE_PER_SECOND_MAX = 50  # Max reasonable score per second
COMBO_PER_LEVEL_MAX = 8  # Max reasonable combo per level
LINES_PER_SECOND_MAX = 2  # Max reasonable lines cleared per second
MIN_SURVIVAL_TIME = 5  # Minimum survival time in seconds
MAX_SCORE_ABSOLUTE = 999999  # Absolute max score


def compute_flags(submission: ScoreSubmission) -> Dict[str, bool]:
    """Compute anti-cheat flags for a score submission"""
    flags = {}
    survival = max(submission.survival_time_seconds, 1)  # Avoid division by zero

    # Score per second check
    score_per_sec = submission.score / survival
    flags["high_score_per_second"] = score_per_sec > SCORE_PER_SECOND_MAX

    # Combo vs level check
    flags["abnormal_combo"] = submission.max_combo > submission.level_reached * COMBO_PER_LEVEL_MAX

    # Lines per second check
    if survival > 10:
        flags["impossible_clears"] = submission.lines_cleared / survival > LINES_PER_SECOND_MAX
    else:
        flags["impossible_clears"] = False

    # Suspiciously short game with high score
    flags["speed_hack_suspect"] = (
        submission.survival_time_seconds < MIN_SURVIVAL_TIME
        and submission.score > 1000
    )

    # Impossible score
    flags["impossible_score"] = submission.score > MAX_SCORE_ABSOLUTE

    # Perfect efficiency is suspicious
    flags["perfect_efficiency"] = (
        submission.combo_efficiency > 0.95
        and submission.score > 5000
    )

    return flags


def assess_risk(flags: Dict[str, bool]) -> str:
    """Assess risk level based on flags"""
    critical_flags = ["impossible_score", "speed_hack_suspect"]
    high_flags = ["high_score_per_second", "impossible_clears"]
    medium_flags = ["abnormal_combo", "perfect_efficiency"]

    for flag in critical_flags:
        if flags.get(flag):
            return "critical"

    high_count = sum(1 for f in high_flags if flags.get(f))
    if high_count >= 2:
        return "critical"
    if high_count >= 1:
        return "high"

    medium_count = sum(1 for f in medium_flags if flags.get(f))
    if medium_count >= 2:
        return "high"
    if medium_count >= 1:
        return "medium"

    return "low"


@router.post("/validate-score", response_model=ValidationResult)
async def validate_score(submission: ScoreSubmission):
    """Validate a score submission server-side
    
    Runs multiple checks:
    1. PLAYER SEGMENTATION (core_rules.py) — route to correct leaderboard
    2. Anti-cheat flags — detect suspicious scores
    3. Risk assessment — accept or flag
    
    SEGMENTATION ENFORCEMENT (CRITICAL):
    - If has_ever_owned_card is True → score goes to NFT leaderboard ONLY
    - If has_ever_owned_card is False → score goes to No-NFT leaderboard ONLY
    - If player requests wrong board → rejected with segmentation_valid=False
    - This is a PERMANENT rule. See core_rules.py for full explanation.
    """
    # Basic validation
    if submission.score < 0:
        raise HTTPException(status_code=400, detail="Invalid score")
    if submission.survival_time_seconds < 0:
        raise HTTPException(status_code=400, detail="Invalid survival time")

    # ═══════════════════════════════════════════════════════════════
    # SEGMENTATION ENFORCEMENT (see core_rules.py RULE 1)
    # ═══════════════════════════════════════════════════════════════
    segment = get_player_segment(submission.has_ever_owned_card)
    eligible = get_eligible_leaderboards(submission.has_ever_owned_card)

    # Determine target leaderboard
    if submission.target_leaderboard == "auto":
        # Auto-route based on ownership flag
        routed_board = "nft" if submission.has_ever_owned_card else "no_nft"
    else:
        routed_board = submission.target_leaderboard

    # Validate segmentation — is the player allowed on this board?
    try:
        target_board_type = LeaderboardType(routed_board)
    except ValueError:
        target_board_type = LeaderboardType.GLOBAL

    segmentation_valid = can_submit_to_leaderboard(
        submission.has_ever_owned_card, target_board_type
    )

    if not segmentation_valid:
        # HARD REJECT — player tried to submit to wrong leaderboard
        logger.warning(
            f"SEGMENTATION VIOLATION: player={submission.player_id}, "
            f"has_ever_owned_card={submission.has_ever_owned_card}, "
            f"tried board={routed_board}. Rejected."
        )
        return ValidationResult(
            valid=False,
            score_accepted=False,
            flags={},
            risk_level="critical",
            warnings=[
                f"Player segment ({segment.value}) cannot submit to {routed_board} leaderboard. "
                f"See core_rules.py for player segmentation rules."
            ],
            player_segment=segment.value,
            routed_to_leaderboard=routed_board,
            segmentation_valid=False,
        )
    # ═══════════════════════════════════════════════════════════════

    # Compute anti-cheat flags
    flags = compute_flags(submission)
    risk_level = assess_risk(flags)
    
    # Determine if score should be accepted
    score_accepted = risk_level in ["low", "medium"]
    is_flagged = any(flags.values())

    # Build warnings
    warnings = []
    if flags.get("high_score_per_second"):
        warnings.append("Unusually high score rate detected")
    if flags.get("abnormal_combo"):
        warnings.append("Combo exceeds expected range for level")
    if flags.get("speed_hack_suspect"):
        warnings.append("Suspiciously short game duration")
    if flags.get("impossible_score"):
        warnings.append("Score exceeds maximum possible")

    # Log flagged submissions
    if is_flagged:
        logger.warning(
            f"Flagged score: player={submission.player_id}, "
            f"score={submission.score}, risk={risk_level}, "
            f"segment={segment.value}, board={routed_board}, "
            f"flags={[k for k, v in flags.items() if v]}"
        )

    return ValidationResult(
        valid=not is_flagged,
        score_accepted=score_accepted,
        flags=flags,
        risk_level=risk_level,
        warnings=warnings,
        player_segment=segment.value,
        routed_to_leaderboard=routed_board,
        segmentation_valid=True,
    )


@router.get("/thresholds")
async def get_thresholds():
    """Get current anti-cheat thresholds (for transparency)"""
    return {
        "score_per_second_max": SCORE_PER_SECOND_MAX,
        "combo_per_level_max": COMBO_PER_LEVEL_MAX,
        "lines_per_second_max": LINES_PER_SECOND_MAX,
        "min_survival_time": MIN_SURVIVAL_TIME,
        "max_score_absolute": MAX_SCORE_ABSOLUTE,
        "note": "These are advisory thresholds. Flagged scores are reviewed, not auto-rejected.",
    }


@router.get("/status")
async def anticheat_status():
    """Anti-cheat system status"""
    return {
        "active": True,
        "checks": [
            {"name": "score_rate", "type": "local", "status": "active"},
            {"name": "combo_validation", "type": "local", "status": "active"},
            {"name": "line_clear_rate", "type": "local", "status": "active"},
            {"name": "speed_hack_detection", "type": "local", "status": "active"},
            {"name": "session_replay", "type": "external", "status": "planned"},
            {"name": "input_pattern_analysis", "type": "external", "status": "planned"},
            {"name": "device_fingerprinting", "type": "external", "status": "planned"},
        ],
        "external_apis_configured": 0,
        "external_apis_planned": 3,
        "limitations": [
            "Client-side score submission — server validates but doesn't generate",
            "No session replay verification yet",
            "No input pattern analysis yet",
            "Future: 3 external anti-cheat APIs planned for integration",
        ],
    }
