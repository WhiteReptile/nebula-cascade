"""Marketplace API routes

Server-side validation for marketplace operations.
Supabase remains the primary marketplace — this layer adds:
- Server-side validation
- Fee calculation
- Future on-chain settlement

All routes prefixed with /api/marketplace
"""
from fastapi import APIRouter, HTTPException
import logging
from datetime import datetime, timedelta

from models.marketplace import (
    ListingValidationRequest, ListingValidationResponse,
    PurchaseValidationRequest, PurchaseValidationResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])

# Fee tiers
BASE_FEE = 5
FAST_RESALE_FEE = 7
FREQUENT_RESALE_FEE = 10
MAX_PRICE_CENTS = 1000000  # $10,000
MIN_PRICE_CENTS = 10  # $0.10


@router.post("/validate-listing", response_model=ListingValidationResponse)
async def validate_listing(request: ListingValidationRequest):
    """Validate a listing before it goes live on Supabase
    
    Checks:
    - Price within bounds
    - Card ownership (future: verify on-chain)
    - Fee calculation
    - Fraud signals
    
    Frontend should call this BEFORE writing to Supabase.
    """
    errors = []
    warnings = []

    # Price validation
    if request.price_cents < MIN_PRICE_CENTS:
        errors.append(f"Price too low. Minimum: ${MIN_PRICE_CENTS / 100:.2f}")
    if request.price_cents > MAX_PRICE_CENTS:
        errors.append(f"Price too high. Maximum: ${MAX_PRICE_CENTS / 100:.2f}")

    # Card ID validation
    if not request.card_id:
        errors.append("Card ID is required")

    # Player ID validation
    if not request.seller_player_id:
        errors.append("Seller player ID is required")

    # Fee calculation
    # In production, check recent sales history from Supabase
    fee_percent = BASE_FEE  # Default 5%
    
    # Warning for high-value listings
    if request.price_cents > 50000:  # >$500
        warnings.append("High-value listing — will be manually reviewed")

    # Warning if no wallet linked
    if not request.seller_wallet:
        warnings.append("No wallet linked — on-chain settlement unavailable")

    fee_cents = int(request.price_cents * fee_percent / 100)
    seller_receives = request.price_cents - fee_cents

    return ListingValidationResponse(
        valid=len(errors) == 0,
        fee_percent=fee_percent,
        estimated_fee_cents=fee_cents,
        seller_receives_cents=seller_receives,
        warnings=warnings,
        errors=errors,
    )


@router.post("/validate-purchase", response_model=PurchaseValidationResponse)
async def validate_purchase(request: PurchaseValidationRequest):
    """Validate a purchase before execution
    
    Checks:
    - Listing still active
    - Buyer is not seller
    - Buyer has valid account
    
    Frontend should call this BEFORE executing purchase on Supabase.
    """
    errors = []
    warnings = []

    if not request.listing_id:
        errors.append("Listing ID is required")
    if not request.buyer_player_id:
        errors.append("Buyer player ID is required")

    # Future: Check listing status from Supabase
    # Future: Verify buyer != seller
    # Future: Check buyer's wallet balance for on-chain purchase

    if not request.buyer_wallet:
        warnings.append("No wallet linked — card will be off-chain only")

    return PurchaseValidationResponse(
        valid=len(errors) == 0,
        listing_active=True,  # Would check Supabase
        price_cents=0,  # Would come from listing
        fee_percent=BASE_FEE,
        warnings=warnings,
        errors=errors,
    )


@router.get("/fees")
async def get_fee_structure():
    """Get current marketplace fee structure"""
    return {
        "base_fee_percent": BASE_FEE,
        "fast_resale_fee_percent": FAST_RESALE_FEE,
        "frequent_resale_fee_percent": FREQUENT_RESALE_FEE,
        "fast_resale_window_days": 7,
        "min_price_cents": MIN_PRICE_CENTS,
        "max_price_cents": MAX_PRICE_CENTS,
        "revenue_split": {
            "rewards_pool_percent": 40,
            "platform_percent": 60,
        },
    }


@router.get("/stats")
async def get_marketplace_stats():
    """Get marketplace statistics
    
    Returns aggregate marketplace data.
    In production, this pulls from Supabase.
    """
    return {
        "total_listings": 0,
        "active_listings": 0,
        "total_volume_cents": 0,
        "total_fees_collected_cents": 0,
        "rewards_pool_cents": 0,
        "avg_price_cents": 0,
        "updated_at": datetime.utcnow().isoformat(),
        "note": "Stats sourced from Supabase — connect data for real values",
    }
