"""Marketplace validation models

Server-side validation for marketplace operations.
Keeps Supabase as primary, adds blockchain-ready structure.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class ListingValidationRequest(BaseModel):
    """Validate a marketplace listing before it goes live"""
    card_id: str
    seller_player_id: str
    price_cents: int
    seller_wallet: Optional[str] = None

    @field_validator('price_cents')
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        if v > 1000000:  # $10,000 max
            raise ValueError('Price exceeds maximum allowed')
        return v


class ListingValidationResponse(BaseModel):
    """Server response after validating a listing"""
    valid: bool
    fee_percent: int
    estimated_fee_cents: int
    seller_receives_cents: int
    warnings: list = []
    errors: list = []


class PurchaseValidationRequest(BaseModel):
    """Validate a marketplace purchase"""
    listing_id: str
    buyer_player_id: str
    buyer_wallet: Optional[str] = None


class PurchaseValidationResponse(BaseModel):
    """Server response after validating a purchase"""
    valid: bool
    listing_active: bool
    price_cents: int
    fee_percent: int
    warnings: list = []
    errors: list = []


class OnChainSettlement(BaseModel):
    """Future: On-chain marketplace settlement record"""
    id: str
    listing_id: str
    token_id: int
    seller_wallet: str
    buyer_wallet: str
    price_wei: str
    chain_id: int = 8453
    tx_hash: Optional[str] = None
    status: str = "pending"  # pending | confirmed | failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
