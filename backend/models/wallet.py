"""Wallet models for verification and linking

Handles wallet address validation, signature verification,
and wallet-to-player linking.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


def validate_eth_address(address: str) -> bool:
    """Validate Ethereum address format"""
    return bool(re.match(r'^0x[a-fA-F0-9]{40}$', address))


class WalletLinkRequest(BaseModel):
    """Request to link a wallet to a player account"""
    player_id: str
    wallet_address: str
    wallet_type: str = "thirdweb"  # thirdweb | metamask | walletconnect | coinbase
    signature: Optional[str] = None  # Signed message for verification
    message: Optional[str] = None  # Original message that was signed

    @field_validator('wallet_address')
    @classmethod
    def address_must_be_valid(cls, v):
        if not validate_eth_address(v):
            raise ValueError('Invalid Ethereum address format')
        return v.lower()  # Normalize to lowercase


class WalletLinkResponse(BaseModel):
    """Response after wallet linking attempt"""
    success: bool
    wallet_address: Optional[str] = None
    message: str
    verified: bool = False  # True if signature was verified


class WalletVerifyRequest(BaseModel):
    """Verify wallet ownership via signed message"""
    wallet_address: str
    signature: str
    message: str

    @field_validator('wallet_address')
    @classmethod
    def address_must_be_valid(cls, v):
        if not validate_eth_address(v):
            raise ValueError('Invalid Ethereum address format')
        return v.lower()


class WalletVerifyResponse(BaseModel):
    """Response after wallet verification"""
    verified: bool
    recovered_address: Optional[str] = None
    message: str


class WalletInfo(BaseModel):
    """Wallet information for a player"""
    player_id: str
    wallet_address: Optional[str] = None
    wallet_type: Optional[str] = None
    linked_at: Optional[datetime] = None
    chain_id: int = 8453
    is_verified: bool = False
