"""NFT Metadata Service

Prepares ERC-721 compatible metadata for game cards.
Handles the transformation from game card data to
OpenSea-standard NFT metadata.

Metadata is served via /api/nft/metadata/{token_id}
which acts as the tokenURI for the NFT contract.
"""
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

# Division to rarity mapping
DIVISION_RARITY = {
    "gem_v": {"rarity": "Common", "tier": 1},
    "gem_iv": {"rarity": "Uncommon", "tier": 2},
    "gem_iii": {"rarity": "Rare", "tier": 3},
    "gem_ii": {"rarity": "Epic", "tier": 4},
    "gem_i": {"rarity": "Legendary", "tier": 5},
}

# Division display names
DIVISION_LABELS = {
    "gem_v": "Division V",
    "gem_iv": "Division IV",
    "gem_iii": "Division III",
    "gem_ii": "Division II",
    "gem_i": "Division I",
}


def card_to_nft_metadata(
    card_id: str,
    name: str,
    division: str,
    color_hex: str,
    flavor_text: str = "",
    image_url: Optional[str] = None,
    token_id: Optional[int] = None,
    extra_attributes: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Transform a game card into ERC-721 metadata
    
    Follows OpenSea metadata standard:
    https://docs.opensea.io/docs/metadata-standards
    
    Args:
        card_id: Supabase card UUID
        name: Card display name
        division: gem_v through gem_i
        color_hex: Card color (e.g., '#ff3344')
        flavor_text: Card description text
        image_url: Card image URL (IPFS preferred)
        token_id: On-chain token ID
        extra_attributes: Additional game attributes
    
    Returns:
        OpenSea-compatible metadata dict
    """
    rarity_info = DIVISION_RARITY.get(division, {"rarity": "Common", "tier": 1})
    division_label = DIVISION_LABELS.get(division, "Unknown")

    # Build attributes list
    attributes = [
        {
            "trait_type": "Division",
            "value": division_label,
        },
        {
            "trait_type": "Rarity",
            "value": rarity_info["rarity"],
        },
        {
            "trait_type": "Tier",
            "value": rarity_info["tier"],
            "display_type": "number",
        },
        {
            "trait_type": "Color",
            "value": color_hex,
        },
        {
            "trait_type": "Game",
            "value": "Nebula Cascade",
        },
        {
            "trait_type": "Collection",
            "value": "ColdLogic Cards",
        },
    ]

    # Add token ID as attribute if available
    if token_id is not None:
        attributes.append({
            "trait_type": "Token ID",
            "value": token_id,
            "display_type": "number",
        })

    # Add any extra game attributes
    if extra_attributes:
        for key, value in extra_attributes.items():
            attributes.append({
                "trait_type": key,
                "value": value,
            })

    # Build metadata
    metadata = {
        "name": name,
        "description": flavor_text or f"A {rarity_info['rarity']} card from Nebula Cascade by ColdLogic. {division_label}.",
        "image": image_url or generate_placeholder_image_url(color_hex, name),
        "external_url": f"https://nebulacascade.game/cards/{card_id}",
        "background_color": color_hex.lstrip('#'),
        "attributes": attributes,
    }

    return metadata


def generate_placeholder_image_url(color_hex: str, name: str) -> str:
    """Generate a placeholder image URL until real card art is uploaded
    
    Uses a simple SVG data URI as placeholder.
    In production, cards should have IPFS-hosted artwork.
    """
    clean_color = color_hex.lstrip('#')
    # Return a simple reference — real images should be on IPFS
    return f"https://via.placeholder.com/500/{clean_color}/ffffff?text={name.replace(' ', '+')}"


def validate_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Validate metadata meets OpenSea standards
    
    Returns validation result with any issues found.
    """
    issues = []
    
    required_fields = ["name", "description", "image"]
    for field in required_fields:
        if field not in metadata or not metadata[field]:
            issues.append(f"Missing required field: {field}")

    if "attributes" in metadata:
        for i, attr in enumerate(metadata["attributes"]):
            if "trait_type" not in attr:
                issues.append(f"Attribute {i} missing trait_type")
            if "value" not in attr:
                issues.append(f"Attribute {i} missing value")

    # Check image URL format
    image = metadata.get("image", "")
    if image and not (image.startswith("ipfs://") or image.startswith("https://") or image.startswith("http://")):
        issues.append("Image URL should start with ipfs://, https://, or http://")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "metadata": metadata,
    }
