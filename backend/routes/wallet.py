"""Wallet API routes

Wallet verification, linking, and info endpoints.
Handles the bridge between game accounts and blockchain wallets.

All routes prefixed with /api/wallet
"""
from fastapi import APIRouter, HTTPException
import logging
import time
import uuid

from models.wallet import (
    WalletLinkRequest, WalletLinkResponse,
    WalletVerifyRequest, WalletVerifyResponse,
    WalletInfo, validate_eth_address,
)
from services.blockchain import verify_wallet_signature

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/wallet", tags=["wallet"])

# In-memory wallet store (would be Supabase in production)
wallet_links: dict = {}


@router.post("/link", response_model=WalletLinkResponse)
async def link_wallet(request: WalletLinkRequest):
    """Link a wallet address to a player account
    
    If signature is provided, verifies wallet ownership.
    If not, links without verification (less secure).
    
    In production, this also updates Supabase players.wallet_address
    """
    verified = False

    # Verify signature if provided
    if request.signature and request.message:
        result = await verify_wallet_signature(
            address=request.wallet_address,
            signature=request.signature,
            message=request.message,
        )
        verified = result.get("verified", False)
        
        if not verified:
            return WalletLinkResponse(
                success=False,
                message="Wallet signature verification failed",
                verified=False,
            )

    # Store wallet link
    wallet_links[request.player_id] = {
        "player_id": request.player_id,
        "wallet_address": request.wallet_address,
        "wallet_type": request.wallet_type,
        "verified": verified,
        "linked_at": time.time(),
    }

    logger.info(f"Wallet linked: player={request.player_id}, wallet={request.wallet_address}, verified={verified}")

    return WalletLinkResponse(
        success=True,
        wallet_address=request.wallet_address,
        message="Wallet linked successfully" + (" (verified)" if verified else " (unverified)"),
        verified=verified,
    )


@router.post("/verify", response_model=WalletVerifyResponse)
async def verify_wallet(request: WalletVerifyRequest):
    """Verify wallet ownership via signed message
    
    The frontend asks the user to sign a message,
    then sends the signature here for verification.
    
    This works WITHOUT Thirdweb keys — pure crypto.
    """
    result = await verify_wallet_signature(
        address=request.wallet_address,
        signature=request.signature,
        message=request.message,
    )

    if result.get("error"):
        return WalletVerifyResponse(
            verified=False,
            message=f"Verification error: {result['error']}",
        )

    return WalletVerifyResponse(
        verified=result["verified"],
        recovered_address=result.get("recovered_address"),
        message="Wallet ownership verified" if result["verified"] else "Signature does not match wallet address",
    )


@router.get("/info/{player_id}", response_model=WalletInfo)
async def get_wallet_info(player_id: str):
    """Get wallet info for a player"""
    link = wallet_links.get(player_id)
    
    if not link:
        return WalletInfo(
            player_id=player_id,
            wallet_address=None,
            is_verified=False,
        )

    return WalletInfo(
        player_id=player_id,
        wallet_address=link["wallet_address"],
        wallet_type=link["wallet_type"],
        is_verified=link["verified"],
        chain_id=8453,
    )


@router.delete("/unlink/{player_id}")
async def unlink_wallet(player_id: str):
    """Unlink wallet from player account"""
    if player_id in wallet_links:
        del wallet_links[player_id]
        return {"success": True, "message": "Wallet unlinked"}
    return {"success": False, "message": "No wallet linked for this player"}


@router.get("/generate-message/{player_id}")
async def generate_sign_message(player_id: str):
    """Generate a message for the user to sign
    
    This creates a unique, time-limited message that
    the user signs with their wallet to prove ownership.
    """
    nonce = str(uuid.uuid4())[:8]
    timestamp = int(time.time())
    
    message = (
        f"Nebula Cascade Wallet Verification\n\n"
        f"Player: {player_id}\n"
        f"Nonce: {nonce}\n"
        f"Timestamp: {timestamp}\n\n"
        f"Sign this message to verify wallet ownership.\n"
        f"This does not cost any gas."
    )

    return {
        "message": message,
        "nonce": nonce,
        "timestamp": timestamp,
        "expires_in": 300,  # 5 minutes
    }
