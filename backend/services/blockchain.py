"""Blockchain service — Thirdweb integration framework

This module provides the interface between our backend and
blockchain operations via Thirdweb SDK.

Current state: Framework only (no API keys yet)
When keys are added, real blockchain operations will activate.

Chain: Base (8453) primary
NFT Standard: ERC-721
"""
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Chain configurations
BASE_MAINNET = {
    "chain_id": 8453,
    "name": "Base",
    "rpc_url": "https://mainnet.base.org",
    "explorer": "https://basescan.org",
    "symbol": "ETH",
}

BASE_SEPOLIA = {
    "chain_id": 84532,
    "name": "Base Sepolia",
    "rpc_url": "https://sepolia.base.org",
    "explorer": "https://sepolia.basescan.org",
    "symbol": "ETH",
}


def get_chain_config() -> dict:
    """Get active chain config based on environment"""
    env = os.environ.get("BLOCKCHAIN_ENV", "testnet")
    if env == "mainnet":
        return BASE_MAINNET
    return BASE_SEPOLIA


def is_blockchain_configured() -> bool:
    """Check if blockchain integration is fully configured"""
    required = [
        "THIRDWEB_SECRET_KEY",
        "NFT_CONTRACT_ADDRESS",
    ]
    configured = all(os.environ.get(key) for key in required)
    if not configured:
        logger.info("Blockchain not fully configured — running in framework mode")
    return configured


def get_integration_status() -> Dict[str, Any]:
    """Report current blockchain integration status
    
    Honest reporting of what's configured and what's not.
    """
    thirdweb_key = bool(os.environ.get("THIRDWEB_SECRET_KEY"))
    contract_addr = os.environ.get("NFT_CONTRACT_ADDRESS")
    minter_key = bool(os.environ.get("MINTER_PRIVATE_KEY"))
    chain = get_chain_config()

    return {
        "blockchain_ready": thirdweb_key and bool(contract_addr) and minter_key,
        "framework_mode": not (thirdweb_key and bool(contract_addr)),
        "chain": chain["name"],
        "chain_id": chain["chain_id"],
        "thirdweb_configured": thirdweb_key,
        "contract_configured": bool(contract_addr),
        "minter_configured": minter_key,
        "contract_address": contract_addr or "not_set",
        "limitations": _get_limitations(thirdweb_key, bool(contract_addr), minter_key),
    }


def _get_limitations(thirdweb: bool, contract: bool, minter: bool) -> list:
    """Honestly report current limitations"""
    limitations = []
    if not thirdweb:
        limitations.append("Thirdweb API key not set — cannot interact with blockchain")
    if not contract:
        limitations.append("NFT contract not deployed — minting unavailable")
    if not minter:
        limitations.append("Minter wallet not configured — server-side signing unavailable")
    if not limitations:
        limitations.append("All systems configured — blockchain operations available")
    return limitations


async def mint_nft(
    recipient: str,
    metadata_uri: str,
    token_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Mint an NFT to a recipient address
    
    Returns tx hash and token ID if successful.
    Returns error info if not configured.
    """
    if not is_blockchain_configured():
        return {
            "success": False,
            "error": "blockchain_not_configured",
            "message": "Blockchain integration not yet configured. NFT recorded off-chain.",
        }

    # TODO: When Thirdweb keys are added, implement real minting here
    # from thirdweb import ThirdwebSDK
    # sdk = ThirdwebSDK.from_private_key(
    #     private_key=os.environ["MINTER_PRIVATE_KEY"],
    #     rpc_url=get_chain_config()["rpc_url"],
    # )
    # contract = sdk.get_contract(os.environ["NFT_CONTRACT_ADDRESS"])
    # tx = contract.erc721.mint_to(recipient, metadata_uri)

    logger.info(f"[Framework Mode] Would mint NFT to {recipient} with metadata {metadata_uri}")
    return {
        "success": False,
        "error": "framework_mode",
        "message": "Running in framework mode — plug in API keys to enable real minting",
    }


async def verify_wallet_signature(
    address: str,
    signature: str,
    message: str,
) -> Dict[str, Any]:
    """Verify a wallet signature to prove ownership
    
    Uses eth_account to recover signer address from signature.
    This works WITHOUT Thirdweb keys — pure cryptographic verification.
    """
    try:
        from eth_account.messages import encode_defunct
        from eth_account import Account

        msg = encode_defunct(text=message)
        recovered = Account.recover_message(msg, signature=signature)

        verified = recovered.lower() == address.lower()
        return {
            "verified": verified,
            "recovered_address": recovered.lower(),
            "expected_address": address.lower(),
        }
    except ImportError:
        logger.warning("eth_account not installed — signature verification unavailable")
        return {
            "verified": False,
            "error": "eth_account library not available",
            "message": "Install eth-account for signature verification",
        }
    except Exception as e:
        logger.error(f"Signature verification failed: {e}")
        return {
            "verified": False,
            "error": str(e),
        }
