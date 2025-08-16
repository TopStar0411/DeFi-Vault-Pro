// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Uniswap V3 Strategy
 * @dev A strategy that provides liquidity to Uniswap V3 for yield generation
 * @dev This is a simplified example - in production you'd use the actual Uniswap V3 protocol
 */
contract UniswapStrategy is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Events
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event YieldHarvested(uint256 amount);
    event EmergencyWithdrawn(uint256 amount);
    event PositionCreated(uint256 tokenId);
    event PositionClosed(uint256 tokenId);

    // State variables
    IERC20 public immutable asset;
    address public immutable vault;
    
    uint256 public totalDeposited;
    uint256 public totalYield;
    uint256 public lastHarvest;
    
    // Mock yield rate for Uniswap V3 (in production this would come from actual fees)
    uint256 public constant YIELD_RATE = 800; // 8% APY (higher than Compound due to trading fees)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // Mock position tracking
    uint256 public nextPositionId = 1;
    mapping(uint256 => bool) public activePositions;

    // Modifiers
    modifier onlyVault() {
        require(msg.sender == vault, "Strategy: Only vault can call");
        _;
    }

    /**
     * @dev Constructor
     * @param _asset The underlying asset token
     * @param _vault The vault contract address
     */
    constructor(IERC20 _asset, address _vault) Ownable(msg.sender) {
        asset = _asset;
        vault = _vault;
        lastHarvest = block.timestamp;
    }

    /**
     * @dev Deposit assets into the strategy
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external onlyVault whenNotPaused {
        require(amount > 0, "Strategy: Cannot deposit 0");
        
        totalDeposited += amount;
        
        // Create a mock Uniswap V3 position
        uint256 positionId = nextPositionId++;
        activePositions[positionId] = true;
        
        emit Deposited(amount);
        emit PositionCreated(positionId);
        
        // In a real implementation, this would:
        // 1. Swap half the assets for the paired token
        // 2. Create a Uniswap V3 position with the liquidity
        // 3. Track the position NFT
    }

    /**
     * @dev Withdraw assets from the strategy
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyVault whenNotPaused {
        require(amount > 0, "Strategy: Cannot withdraw 0");
        require(amount <= totalDeposited, "Strategy: Insufficient balance");
        
        totalDeposited -= amount;
        
        // Close a mock position
        uint256 positionId = nextPositionId - 1;
        if (activePositions[positionId]) {
            activePositions[positionId] = false;
            emit PositionClosed(positionId);
        }
        
        // Transfer assets back to vault
        asset.safeTransfer(vault, amount);
        
        emit Withdrawn(amount);
    }

    /**
     * @dev Harvest yield from the strategy
     */
    function harvest() external onlyVault whenNotPaused {
        uint256 yield = calculateYield();
        if (yield > 0) {
            totalYield += yield;
            lastHarvest = block.timestamp;
            
            // Transfer yield to vault
            asset.safeTransfer(vault, yield);
            
            emit YieldHarvested(yield);
        }
    }

    /**
     * @dev Emergency withdraw all assets
     */
    function emergencyWithdraw() external onlyVault {
        uint256 balance = asset.balanceOf(address(this));
        if (balance > 0) {
            asset.safeTransfer(vault, balance);
            totalDeposited = 0;
            
            // Close all positions
            for (uint256 i = 1; i < nextPositionId; i++) {
                if (activePositions[i]) {
                    activePositions[i] = false;
                    emit PositionClosed(i);
                }
            }
            
            emit EmergencyWithdrawn(balance);
        }
    }

    /**
     * @dev Calculate current yield
     * @return Current yield amount
     */
    function calculateYield() public view returns (uint256) {
        if (totalDeposited == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastHarvest;
        uint256 yield = (totalDeposited * YIELD_RATE * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        
        return yield;
    }

    /**
     * @dev Get total value in the strategy
     * @return Total value including yield
     */
    function totalValue() external view returns (uint256) {
        return totalDeposited + calculateYield();
    }

    /**
     * @dev Get active positions count
     * @return Number of active positions
     */
    function getActivePositionsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextPositionId; i++) {
            if (activePositions[i]) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Pause the strategy
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the strategy
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to recover stuck tokens
     * @param token Token to recover
     * @param amount Amount to recover
     */
    function emergencyRecover(IERC20 token, uint256 amount) external onlyOwner {
        require(address(token) != address(asset), "Strategy: Cannot recover asset");
        token.safeTransfer(owner(), amount);
    }
}
