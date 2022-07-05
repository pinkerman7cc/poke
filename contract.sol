// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/ERC721A.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PPA is ERC721A, Ownable, ReentrancyGuard {
    string private baseURI;

    // Public Variables
    bool public started = false;
    uint256 public minted = 0;
    uint256 public freeMinted = 0;
    bool public devCliamed = false;

    // Public Constants
    uint256 public constant MAX_SUPPLY = 5000;
    uint256 public constant FREE_SUPPLY = 2000;
    uint256 public constant PRICE = 0.00777 ether;
    uint256 public constant MAX_MINT = 2;
    uint256 public constant DEV_MINT = 200;


    mapping(address => uint256) public addressClaimed;

    constructor() ERC721A("Poke Poke Ahh", "PPA") {}

    // Start tokenid at 1 instead of 0
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function mint(uint256 amount) external payable notContract nonReentrant {
        require(started, "Minting not started yet");
        require(
            addressClaimed[_msgSender()] + amount <= MAX_MINT,
            "Exceed wallet max mint: 2"
        );
        require(totalSupply() < MAX_SUPPLY, "Minting Finished");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceed max supply");
        require(msg.sender != owner(), "Dev is not allowd to use public mint");

        uint256 freeQuota = FREE_SUPPLY - freeMinted;
        uint256 freeAmount = 0;

        if (freeQuota >= MAX_MINT) {
            // all free
            freeAmount = amount;
        } else if (freeQuota > 0) {
            // partially free
            freeAmount = freeQuota;
        } else {
            freeAmount = 0;
        }

        uint256 requiredValue = (amount - freeAmount) * PRICE;
        require(requiredValue <= msg.value, "Insufficient funds");

        _safeMint(msg.sender, amount);
        addressClaimed[_msgSender()] += amount;
        freeMinted += freeAmount;
        minted += amount;
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        baseURI = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function enableMint(bool mintStarted) external onlyOwner {
        started = mintStarted;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function devMint() external onlyOwner {
        require(totalSupply() < MAX_SUPPLY, "Minting Finished");
        require(devCliamed == false, "Dev mint over");
        _safeMint(msg.sender, DEV_MINT);
        freeMinted += DEV_MINT;
        minted += DEV_MINT;
        devCliamed = true;
    }

    modifier notContract() {
        require(!_isContract(msg.sender), "Contract not allowed");
        require(msg.sender == tx.origin, "Proxy contract not allowed");
        _;
    }
}
