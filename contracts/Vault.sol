// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title DeFi Vault Pro - ERC4626 Compliant Vault
 * @dev A tokenized vault that implements the ERC4626 standard
 * @dev Supports multiple strategies for yield generation
 */
contract Vault is ERC4626, Ownable, ReentrancyGuard, Pausable {
    using Math for uint256;

    // Events
    event StrategyAdded(address indexed strategy, string name);
    event StrategyRemoved(address indexed strategy);
    event StrategyAllocated(address indexed strategy, uint256 amount);
    event StrategyDeallocated(address indexed strategy, uint256 amount);
    event YieldGenerated(uint256 amount);
    event FeeCollected(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    // Structs
    struct Strategy {
        string name;
        address strategyAddress;
        uint256 allocatedAmount;
        bool isActive;
        uint256 performanceFee; // Basis points (e.g., 200 = 2%)
        uint256 lastHarvest;
    }

    // State variables
    mapping(address => Strategy) public strategies;
    address[] public activeStrategies;
    
    uint256 public totalAllocated;
    uint256 public performanceFeeRate = 200; // 2% default
    uint256 public managementFeeRate = 100; // 1% default
    uint256 public lastFeeCollection;
    uint256 public feeCollectionPeriod = 1 days;
    
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant MAX_FEE_RATE = 1000; // 10% max

    // Modifiers
    modifier onlyStrategy() {
        require(strategies[msg.sender].isActive, "Vault: Only active strategies");
        _;
    }

    modifier onlyValidStrategy(address strategy) {
        require(strategies[strategy].isActive, "Vault: Strategy not active");
        _;
    }

    /**
     * @dev Constructor
     * @param _asset The underlying asset token
     * @param _name Vault token name
     * @param _symbol Vault token symbol
     */
    constructor(
        ERC20 _asset,
        string memory _name,
        string memory _symbol
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {}

    /**
     * @dev Deposit assets into the vault
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive vault tokens
     * @return shares Amount of vault tokens minted
     */
    function deposit(uint256 assets, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256 shares)
    {
        require(assets > 0, "Vault: Cannot deposit 0");
        require(receiver != address(0), "Vault: Invalid receiver");
        
        shares = previewDeposit(assets);
        require(shares > 0, "Vault: Zero shares");
        
        _mint(receiver, shares);
        _deposit(msg.sender, address(this), assets);
        
        // Allocate to strategies if available
        _allocateToStrategies(assets);
    }

    /**
     * @dev Mint vault tokens for assets
     * @param shares Amount of vault tokens to mint
     * @param receiver Address to receive vault tokens
     * @return assets Amount of assets deposited
     */
    function mint(uint256 shares, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256 assets)
    {
        require(shares > 0, "Vault: Cannot mint 0 shares");
        require(receiver != address(0), "Vault: Invalid receiver");
        
        assets = previewMint(shares);
        require(assets > 0, "Vault: Zero assets");
        
        _mint(receiver, shares);
        _deposit(msg.sender, address(this), assets);
        
        // Allocate to strategies if available
        _allocateToStrategies(assets);
    }

    /**
     * @dev Withdraw assets from the vault
     * @param assets Amount of assets to withdraw
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return shares Amount of vault tokens burned
     */
    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256 shares)
    {
        require(assets > 0, "Vault: Cannot withdraw 0");
        require(receiver != address(0), "Vault: Invalid receiver");
        
        shares = previewWithdraw(assets);
        require(shares > 0, "Vault: Zero shares");
        
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }
        
        _burn(owner, shares);
        _withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @dev Redeem vault tokens for assets
     * @param shares Amount of vault tokens to redeem
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return assets Amount of assets withdrawn
     */
    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256 assets)
    {
        require(shares > 0, "Vault: Cannot redeem 0 shares");
        require(receiver != address(0), "Vault: Invalid receiver");
        
        assets = previewRedeem(shares);
        require(assets > 0, "Vault: Zero assets");
        
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }
        
        _burn(owner, shares);
        _withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @dev Add a new strategy
     * @param strategyAddress Address of the strategy contract
     * @param name Name of the strategy
     * @param performanceFee Performance fee in basis points
     */
    function addStrategy(
        address strategyAddress,
        string memory name,
        uint256 performanceFee
    ) external onlyOwner {
        require(strategyAddress != address(0), "Vault: Invalid strategy address");
        require(!strategies[strategyAddress].isActive, "Vault: Strategy already exists");
        require(performanceFee <= MAX_FEE_RATE, "Vault: Fee too high");
        
        strategies[strategyAddress] = Strategy({
            name: name,
            strategyAddress: strategyAddress,
            allocatedAmount: 0,
            isActive: true,
            performanceFee: performanceFee,
            lastHarvest: block.timestamp
        });
        
        activeStrategies.push(strategyAddress);
        
        emit StrategyAdded(strategyAddress, name);
    }

    /**
     * @dev Remove a strategy
     * @param strategyAddress Address of the strategy to remove
     */
    function removeStrategy(address strategyAddress) external onlyOwner onlyValidStrategy(strategyAddress) {
        Strategy storage strategy = strategies[strategyAddress];
        
        // Deallocate all funds from strategy
        if (strategy.allocatedAmount > 0) {
            _deallocateFromStrategy(strategyAddress, strategy.allocatedAmount);
        }
        
        strategy.isActive = false;
        
        // Remove from active strategies array
        for (uint256 i = 0; i < activeStrategies.length; i++) {
            if (activeStrategies[i] == strategyAddress) {
                activeStrategies[i] = activeStrategies[activeStrategies.length - 1];
                activeStrategies.pop();
                break;
            }
        }
        
        emit StrategyRemoved(strategyAddress);
    }

    /**
     * @dev Allocate funds to strategies
     * @param amount Amount to allocate
     */
    function _allocateToStrategies(uint256 amount) internal {
        if (activeStrategies.length == 0) return;
        
        uint256 allocationPerStrategy = amount / activeStrategies.length;
        uint256 remainder = amount % activeStrategies.length;
        
        for (uint256 i = 0; i < activeStrategies.length; i++) {
            address strategyAddress = activeStrategies[i];
            uint256 allocation = allocationPerStrategy;
            
            if (i == 0) {
                allocation += remainder; // Add remainder to first strategy
            }
            
            if (allocation > 0) {
                _allocateToStrategy(strategyAddress, allocation);
            }
        }
    }

    /**
     * @dev Allocate funds to a specific strategy
     * @param strategyAddress Address of the strategy
     * @param amount Amount to allocate
     */
    function _allocateToStrategy(address strategyAddress, uint256 amount) internal {
        Strategy storage strategy = strategies[strategyAddress];
        strategy.allocatedAmount += amount;
        totalAllocated += amount;
        
        // Transfer assets to strategy
        asset().transfer(strategyAddress, amount);
        
        emit StrategyAllocated(strategyAddress, amount);
    }

    /**
     * @dev Deallocate funds from a strategy
     * @param strategyAddress Address of the strategy
     * @param amount Amount to deallocate
     */
    function _deallocateFromStrategy(address strategyAddress, uint256 amount) internal {
        Strategy storage strategy = strategies[strategyAddress];
        require(strategy.allocatedAmount >= amount, "Vault: Insufficient allocated amount");
        
        strategy.allocatedAmount -= amount;
        totalAllocated -= amount;
        
        // Request withdrawal from strategy
        IStrategy(strategyAddress).withdraw(amount);
        
        emit StrategyDeallocated(strategyAddress, amount);
    }

    /**
     * @dev Harvest yield from strategies
     */
    function harvest() external onlyOwner {
        uint256 totalYield = 0;
        
        for (uint256 i = 0; i < activeStrategies.length; i++) {
            address strategyAddress = activeStrategies[i];
            Strategy storage strategy = strategies[strategyAddress];
            
            uint256 beforeBalance = asset().balanceOf(address(this));
            IStrategy(strategyAddress).harvest();
            uint256 afterBalance = asset().balanceOf(address(this));
            
            uint256 yield = afterBalance - beforeBalance;
            if (yield > 0) {
                totalYield += yield;
                
                // Calculate and collect performance fee
                uint256 fee = (yield * strategy.performanceFee) / BASIS_POINTS;
                if (fee > 0) {
                    asset().transfer(owner(), fee);
                    totalYield -= fee;
                    emit FeeCollected(fee);
                }
            }
        }
        
        if (totalYield > 0) {
            emit YieldGenerated(totalYield);
        }
    }

    /**
     * @dev Collect management fees
     */
    function collectManagementFees() external onlyOwner {
        require(block.timestamp >= lastFeeCollection + feeCollectionPeriod, "Vault: Too early");
        
        uint256 totalValue = totalAssets();
        uint256 fee = (totalValue * managementFeeRate) / BASIS_POINTS;
        
        if (fee > 0) {
            // Mint shares to owner as fee
            _mint(owner(), fee);
            lastFeeCollection = block.timestamp;
            
            emit FeeCollected(fee);
        }
    }

    /**
     * @dev Emergency withdraw from all strategies
     */
    function emergencyWithdraw() external onlyOwner {
        for (uint256 i = 0; i < activeStrategies.length; i++) {
            address strategyAddress = activeStrategies[i];
            Strategy storage strategy = strategies[strategyAddress];
            
            if (strategy.allocatedAmount > 0) {
                IStrategy(strategyAddress).emergencyWithdraw();
                strategy.allocatedAmount = 0;
            }
        }
        
        totalAllocated = 0;
    }

    /**
     * @dev Pause the vault
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the vault
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Set performance fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function setPerformanceFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= MAX_FEE_RATE, "Vault: Fee too high");
        performanceFeeRate = newFeeRate;
    }

    /**
     * @dev Set management fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function setManagementFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= MAX_FEE_RATE, "Vault: Fee too high");
        managementFeeRate = newFeeRate;
    }

    /**
     * @dev Get total assets in the vault
     * @return Total assets including strategy allocations
     */
    function totalAssets() public view override returns (uint256) {
        return asset().balanceOf(address(this)) + totalAllocated;
    }

    /**
     * @dev Get vault information
     * @return Total assets, total allocated, active strategies count
     */
    function getVaultInfo() external view returns (
        uint256 totalAssetsValue,
        uint256 totalAllocatedValue,
        uint256 activeStrategiesCount
    ) {
        return (
            totalAssets(),
            totalAllocated,
            activeStrategies.length
        );
    }

    /**
     * @dev Get strategy information
     * @param strategyAddress Address of the strategy
     * @return Strategy information
     */
    function getStrategyInfo(address strategyAddress) external view returns (
        string memory name,
        uint256 allocatedAmount,
        bool isActive,
        uint256 performanceFee,
        uint256 lastHarvest
    ) {
        Strategy storage strategy = strategies[strategyAddress];
        return (
            strategy.name,
            strategy.allocatedAmount,
            strategy.isActive,
            strategy.performanceFee,
            strategy.lastHarvest
        );
    }

    /**
     * @dev Get all active strategies
     * @return Array of active strategy addresses
     */
    function getActiveStrategies() external view returns (address[] memory) {
        return activeStrategies;
    }
}

/**
 * @title Strategy Interface
 * @dev Interface for strategy contracts
 */
interface IStrategy {
    function withdraw(uint256 amount) external;
    function harvest() external;
    function emergencyWithdraw() external;
}
