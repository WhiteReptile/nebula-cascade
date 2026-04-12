"""NFT data models — ERC-721 compatible metadata structure

Off-chain first, ready for on-chain minting later.
Follows OpenSea metadata standard for maximum compatibility.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime


class NFTAttribute(BaseModel):
    """Single attribute/trait for NFT metadata (OpenSea standard)"""
    trait_type: str
    value: Any
    display_type: Optional[str] = None  # 'number', 'boost_percentage', 'date', etc.


class NFTMetadata(BaseModel):
    """ERC-721 compatible metadata (OpenSea standard)
    
    This is what gets served at tokenURI and displayed
    on marketplaces like OpenSea, Blur, etc.
    """
    name: str
    description: str
    image: str  # IPFS URI or HTTP URL
    external_url: Optional[str] = None
    animation_url: Optional[str] = None
    attributes: List[NFTAttribute] = []
    background_color: Optional[str] = None  # hex without #


class CardToNFTMapping(BaseModel):
    """Maps game card to NFT token"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    card_id: str  # Supabase card ID
    token_id: Optional[int] = None  # On-chain token ID (null until minted)
    contract_address: Optional[str] = None  # NFT contract address
    chain_id: int = 8453  # Base chain
    metadata_uri: Optional[str] = None  # IPFS URI for metadata
    owner_wallet: Optional[str] = None
    mint_status: str = "unminted"  # unminted | pending | minted | failed
    mint_tx_hash: Optional[str] = None
    minted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MintRequest(BaseModel):
    """Request to mint a card as NFT"""
    player_id: str
    card_id: str
    recipient_address: str


class MintResponse(BaseModel):
    """Response after minting request"""
    status: str  # pending | minted | failed
    record_id: str
    message: str
    tx_hash: Optional[str] = None


class NFTStatusResponse(BaseModel):
    """Status of an NFT minting operation"""
    card_id: str
    mint_status: str
    token_id: Optional[int] = None
    contract_address: Optional[str] = None
    chain_id: int = 8453
    tx_hash: Optional[str] = None
    metadata_uri: Optional[str] = None
    owner_wallet: Optional[str] = None
