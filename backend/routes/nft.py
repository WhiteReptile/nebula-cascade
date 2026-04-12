"""NFT API routes

Endpoints for NFT metadata, minting, and status.
Off-chain first — on-chain when Thirdweb keys are added.

All routes prefixed with /api/nft
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
import logging
import uuid
from datetime import datetime

from models.nft import (
    MintRequest, MintResponse, NFTStatusResponse, NFTMetadata,
    CardToNFTMapping,
)
from services.metadata import card_to_nft_metadata, validate_metadata
from services.blockchain import (
    is_blockchain_configured, get_integration_status, mint_nft,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/nft", tags=["nft"])

# In-memory store for NFT records (will move to MongoDB when needed)
# For now this provides the API contract without DB dependency
nft_records: dict = {}


@router.get("/status")
async def blockchain_status():
    """Report blockchain integration status
    
    Honestly reports what's configured and what's not.
    Use this to check if minting is available.
    """
    return get_integration_status()


@router.get("/metadata/{card_id}")
async def get_nft_metadata(
    card_id: str,
    name: str = "Nebula Card",
    division: str = "gem_v",
    color_hex: str = "#ff3344",
    flavor_text: str = "",
    image_url: Optional[str] = None,
):
    """Get ERC-721 compatible metadata for a card
    
    This endpoint serves as the tokenURI resolver.
    Returns OpenSea-standard metadata JSON.
    
    In production, metadata will be pinned to IPFS.
    This endpoint provides the preview/generation layer.
    """
    metadata = card_to_nft_metadata(
        card_id=card_id,
        name=name,
        division=division,
        color_hex=color_hex,
        flavor_text=flavor_text,
        image_url=image_url,
    )
    return metadata


@router.post("/metadata/validate")
async def validate_nft_metadata(metadata: NFTMetadata):
    """Validate NFT metadata against OpenSea standards
    
    Use before minting to catch issues early.
    """
    result = validate_metadata(metadata.dict())
    return result


@router.post("/mint", response_model=MintResponse)
async def request_mint(request: MintRequest):
    """Request to mint a card as an ERC-721 NFT
    
    Flow:
    1. Validates request
    2. Creates off-chain record
    3. If blockchain configured: queues on-chain minting
    4. If not: returns framework mode response
    
    The card stays in Supabase either way — blockchain
    is an ownership layer on top.
    """
    # Validate address format
    if not request.recipient_address.startswith("0x") or len(request.recipient_address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address format")

    # Check for duplicate mint
    for record in nft_records.values():
        if record["card_id"] == request.card_id and record["mint_status"] in ["pending", "minted"]:
            raise HTTPException(status_code=409, detail="Card already minted or pending")

    # Create off-chain record
    record_id = str(uuid.uuid4())
    nft_records[record_id] = {
        "id": record_id,
        "card_id": request.card_id,
        "player_id": request.player_id,
        "recipient_address": request.recipient_address,
        "mint_status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }

    # Attempt blockchain mint
    if is_blockchain_configured():
        metadata = card_to_nft_metadata(
            card_id=request.card_id,
            name="Nebula Card",  # Would come from Supabase
            division="gem_v",
            color_hex="#ff3344",
        )
        metadata_uri = ""  # Would be IPFS URI after uploading metadata
        
        result = await mint_nft(
            recipient=request.recipient_address,
            metadata_uri=metadata_uri,
        )
        
        if result["success"]:
            nft_records[record_id]["mint_status"] = "minted"
            nft_records[record_id]["tx_hash"] = result.get("tx_hash")
            return MintResponse(
                status="minted",
                record_id=record_id,
                message="NFT minted on-chain",
                tx_hash=result.get("tx_hash"),
            )

    # Framework mode — record is saved off-chain
    nft_records[record_id]["mint_status"] = "recorded_offchain"
    return MintResponse(
        status="recorded_offchain",
        record_id=record_id,
        message="NFT recorded off-chain. On-chain minting available when blockchain is configured.",
    )


@router.get("/mint/{record_id}")
async def get_mint_status(record_id: str):
    """Check status of a minting request"""
    record = nft_records.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Mint record not found")
    return record


@router.get("/cards/{player_id}")
async def get_player_nfts(player_id: str):
    """Get all NFT records for a player
    
    Returns both minted and unminted card records.
    """
    player_records = [
        record for record in nft_records.values()
        if record.get("player_id") == player_id
    ]
    return {
        "player_id": player_id,
        "nft_count": len(player_records),
        "records": player_records,
    }
