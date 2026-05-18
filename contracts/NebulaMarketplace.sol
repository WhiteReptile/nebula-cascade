// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  NebulaMarketplace
 * @notice Minimalist ERC-1155 marketplace for the Nebula collection on Base.
 *         - Native ETH payments only
 *         - Flat 3% fee → treasury (owner-settable, capped at 10%)
 *         - 24h on-chain anti-flip lock after each sale or transfer-out
 *         - Escrow model: seller transfers NFT to this contract on list,
 *           buyer receives NFT inside buyCard() in a single atomic tx
 *
 * Deploy via Remix to Base mainnet (chain 8453):
 *   constructor args: (address payable _treasury)
 *   pass 0x0000…0000 if you want to set it later via setTreasury()
 *
 * Dependencies: only OpenZeppelin interfaces + ReentrancyGuard + Ownable.
 *   In Remix, use:
 *     import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
 *     import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
 *     import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
 *     import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
 *     import "@openzeppelin/contracts/access/Ownable.sol";
 */

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NebulaMarketplace is ERC165, IERC1155Receiver, ReentrancyGuard, Ownable {
    // ─────────────────────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────────────────────
    struct Listing {
        uint256 id;
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 priceWei;
        uint64  createdAt;
        bool    active;
    }

    // ─────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────
    address payable public treasury;
    uint96  public feeBps = 300;                  // 3%
    uint96  public constant MAX_FEE_BPS = 1000;   // 10% safety cap
    uint256 public constant LOCK_SECONDS = 86400; // 24h anti-flip

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;
    mapping(address => mapping(uint256 => uint64)) public lockedUntil; // nft → tokenId → unix

    // ─────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────
    event CardListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 priceWei
    );
    event CardSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        address nftAddress,
        uint256 tokenId,
        uint256 priceWei,
        uint256 feePaid
    );
    event CardDelisted(uint256 indexed listingId, address indexed seller);
    event TreasuryUpdated(address indexed treasury);
    event FeeUpdated(uint96 feeBps);

    // ─────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────
    constructor(address payable _treasury) Ownable(msg.sender) {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    // ─────────────────────────────────────────────────────────────
    // Owner-only config
    // ─────────────────────────────────────────────────────────────
    function setTreasury(address payable _treasury) external onlyOwner {
        require(_treasury != address(0), "treasury=0");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setFeeBps(uint96 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "fee>cap");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    // ─────────────────────────────────────────────────────────────
    // Listing
    // ─────────────────────────────────────────────────────────────
    /// @notice Escrow one copy of (nftAddress, tokenId) and create a listing.
    /// @dev    Caller must have called setApprovalForAll(thisContract, true) on the NFT first.
    function listCard(
        address nftAddress,
        uint256 tokenId,
        uint256 priceWei
    ) external nonReentrant returns (uint256 listingId) {
        require(priceWei > 0, "price=0");
        require(nftAddress != address(0), "nft=0");
        require(uint64(block.timestamp) >= lockedUntil[nftAddress][tokenId], "locked");

        // Escrow: pull 1 unit from seller into this contract
        IERC1155(nftAddress).safeTransferFrom(msg.sender, address(this), tokenId, 1, "");

        listingId = nextListingId++;
        listings[listingId] = Listing({
            id:         listingId,
            seller:     msg.sender,
            nftAddress: nftAddress,
            tokenId:    tokenId,
            priceWei:   priceWei,
            createdAt:  uint64(block.timestamp),
            active:     true
        });

        emit CardListed(listingId, msg.sender, nftAddress, tokenId, priceWei);
    }

    /// @notice Buy a listed card. Send exactly `priceWei` ETH.
    function buyCard(uint256 listingId) external payable nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        require(msg.value == l.priceWei, "bad value");

        l.active = false;
        uint256 fee = (l.priceWei * feeBps) / 10_000;
        uint256 sellerCut = l.priceWei - fee;

        // 24h lock applies to (nft, tokenId) regardless of buyer wallet
        lockedUntil[l.nftAddress][l.tokenId] = uint64(block.timestamp + LOCK_SECONDS);

        // Transfer NFT to buyer
        IERC1155(l.nftAddress).safeTransferFrom(address(this), msg.sender, l.tokenId, 1, "");

        // Pay treasury then seller (low-level call for ECF-safe forwarding)
        if (fee > 0 && treasury != address(0)) {
            (bool okFee, ) = treasury.call{value: fee}("");
            require(okFee, "fee xfer fail");
        } else if (fee > 0) {
            // No treasury set → fee accrues to seller (avoids lockup)
            sellerCut += fee;
            fee = 0;
        }
        (bool okSeller, ) = payable(l.seller).call{value: sellerCut}("");
        require(okSeller, "seller xfer fail");

        emit CardSold(listingId, l.seller, msg.sender, l.nftAddress, l.tokenId, l.priceWei, fee);
    }

    /// @notice Seller cancels their listing and gets the NFT back.
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        require(l.seller == msg.sender, "not seller");

        l.active = false;
        IERC1155(l.nftAddress).safeTransferFrom(address(this), msg.sender, l.tokenId, 1, "");
        emit CardDelisted(listingId, msg.sender);
    }

    // ─────────────────────────────────────────────────────────────
    // Views
    // ─────────────────────────────────────────────────────────────
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function isLocked(address nftAddress, uint256 tokenId) external view returns (bool) {
        return uint64(block.timestamp) < lockedUntil[nftAddress][tokenId];
    }

    /// @notice Page through active listings. Returns up to `limit` entries starting at
    ///         listing-id `cursor`. nextCursor = cursor + scanned; caller stops when
    ///         nextCursor == nextListingId.
    function getActiveListings(uint256 cursor, uint256 limit)
        external
        view
        returns (Listing[] memory page, uint256 nextCursor)
    {
        uint256 end = cursor + limit;
        if (end > nextListingId) end = nextListingId;

        // First pass: count active in window
        uint256 count;
        for (uint256 i = cursor; i < end; ++i) {
            if (listings[i].active) ++count;
        }
        page = new Listing[](count);
        uint256 j;
        for (uint256 i = cursor; i < end; ++i) {
            if (listings[i].active) {
                page[j++] = listings[i];
            }
        }
        nextCursor = end;
    }

    // ─────────────────────────────────────────────────────────────
    // ERC1155 receiver
    // ─────────────────────────────────────────────────────────────
    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external pure override returns (bytes4)
    { return this.onERC1155Received.selector; }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external pure override returns (bytes4)
    { return this.onERC1155BatchReceived.selector; }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}
