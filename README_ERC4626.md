# ERC-4626 Vault Implementation

This project implements a fully compliant ERC-4626 tokenized vault with multiple yield strategies for DeFi applications.

## 🏗️ Architecture

### Smart Contracts

#### 1. **Vault.sol** - Main ERC-4626 Vault
- **Standard Compliance**: Full ERC-4626 implementation
- **Multi-Strategy Support**: Can allocate funds across multiple yield strategies
- **Fee Management**: Performance and management fees
- **Security Features**: Pausable, ReentrancyGuard, Ownable
- **Key Functions**:
  - `deposit()` - Deposit assets and receive vault tokens
  - `withdraw()` - Withdraw assets by burning vault tokens
  - `mint()` - Mint vault tokens for assets
  - `redeem()` - Redeem vault tokens for assets
  - `addStrategy()` - Add new yield strategies
  - `harvest()` - Collect yield from strategies

#### 2. **CompoundStrategy.sol** - Compound Yield Strategy
- **Yield Source**: Compound protocol (mock implementation)
- **APY**: 5% simulated yield
- **Features**: Deposit, withdraw, harvest yield

#### 3. **UniswapStrategy.sol** - Uniswap V3 Yield Strategy
- **Yield Source**: Uniswap V3 liquidity provision (mock implementation)
- **APY**: 8% simulated yield (higher due to trading fees)
- **Features**: Position management, fee collection

#### 4. **MockUSDC.sol** - Test Token
- **Purpose**: Testing token with 6 decimals
- **Features**: Mintable by owner

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Deploy to Local Network
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy contracts
npm run deploy:localhost
```

### 4. Deploy to Testnet
```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your private key and RPC URL

# Deploy to Sepolia
npm run deploy:sepolia
```

## 📋 Deployment Process

### 1. Environment Setup
Create a `.env` file:
```env
# Network URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Deploy Contracts
The deployment script will:
1. Deploy MockUSDC token
2. Deploy the main Vault contract
3. Deploy Compound and Uniswap strategies
4. Add strategies to the vault
5. Mint test USDC to deployer

### 3. Verify Contracts (Optional)
```bash
npx hardhat verify --network sepolia VAULT_ADDRESS "ASSET_ADDRESS" "Vault Name" "Vault Symbol"
```

## 🎯 Usage Guide

### Frontend Integration

#### 1. Set Vault Addresses
```typescript
import { useVault } from './hooks/useVault';

const { setVaultAddresses } = useVault(wallet);

// Set the deployed contract addresses
setVaultAddresses(
  '0x...', // Vault address
  '0x...'  // Asset (USDC) address
);
```

#### 2. Deposit Assets
```typescript
const { deposit } = useVault(wallet);

// Deposit 100 USDC
await deposit('100');
```

#### 3. Withdraw Assets
```typescript
const { withdraw } = useVault(wallet);

// Withdraw 50 USDC
await withdraw('50');
```

#### 4. Redeem Vault Tokens
```typescript
const { redeem } = useVault(wallet);

// Redeem 100 vUSDC for underlying assets
await redeem('100');
```

### Smart Contract Interaction

#### 1. Deposit
```solidity
// Deposit 1000 USDC (with 6 decimals)
uint256 amount = 1000 * 10**6;
vault.deposit(amount, msg.sender);
```

#### 2. Withdraw
```solidity
// Withdraw 500 USDC
uint256 amount = 500 * 10**6;
vault.withdraw(amount, msg.sender, msg.sender);
```

#### 3. Add Strategy
```solidity
// Only vault owner can add strategies
vault.addStrategy(
    strategyAddress,
    "Strategy Name",
    200 // 2% performance fee
);
```

## 🔧 Configuration

### Fee Structure
- **Performance Fee**: 2% default (configurable)
- **Management Fee**: 1% default (configurable)
- **Max Fee Rate**: 10% (hardcoded limit)

### Strategy Allocation
- **Equal Distribution**: New deposits are split equally among active strategies
- **Dynamic Rebalancing**: Can be implemented through admin functions

### Security Features
- **Pausable**: Vault can be paused in emergencies
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Admin functions restricted to owner
- **Emergency Withdraw**: Can withdraw all funds from strategies

## 📊 Key Features

### ERC-4626 Compliance
- ✅ `deposit()` - Deposit assets for shares
- ✅ `mint()` - Mint shares for assets
- ✅ `withdraw()` - Withdraw assets for shares
- ✅ `redeem()` - Redeem shares for assets
- ✅ `totalAssets()` - Get total assets in vault
- ✅ `convertToShares()` - Convert assets to shares
- ✅ `convertToAssets()` - Convert shares to assets
- ✅ `previewDeposit()` - Preview shares for deposit
- ✅ `previewMint()` - Preview assets for mint
- ✅ `previewWithdraw()` - Preview shares for withdrawal
- ✅ `previewRedeem()` - Preview assets for redemption
- ✅ `maxDeposit()` - Maximum deposit amount
- ✅ `maxMint()` - Maximum mint amount
- ✅ `maxWithdraw()` - Maximum withdrawal amount
- ✅ `maxRedeem()` - Maximum redemption amount

### Multi-Strategy Support
- **Strategy Management**: Add/remove strategies dynamically
- **Yield Aggregation**: Collect yield from multiple sources
- **Risk Diversification**: Spread funds across different protocols
- **Performance Tracking**: Monitor individual strategy performance

### Advanced Features
- **Yield Harvesting**: Automated yield collection
- **Fee Collection**: Performance and management fees
- **Emergency Controls**: Pause and emergency withdrawal
- **Strategy Monitoring**: Real-time strategy status

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npx hardhat coverage
```

### Manual Testing
1. Deploy contracts to local network
2. Mint test USDC
3. Deposit into vault
4. Wait for yield generation
5. Harvest yield
6. Withdraw funds

## 🔒 Security Considerations

### Best Practices
- **Access Control**: Only owner can add/remove strategies
- **Fee Limits**: Maximum fee rates enforced
- **Emergency Pause**: Can pause vault in emergencies
- **Reentrancy Protection**: All external calls protected
- **Input Validation**: All inputs validated

### Audit Recommendations
- **External Audit**: Recommended for production use
- **Bug Bounty**: Consider implementing bug bounty program
- **Timelock**: Consider adding timelock for admin functions
- **Multi-sig**: Consider multi-signature wallet for admin

## 📈 Performance Optimization

### Gas Optimization
- **Batch Operations**: Combine multiple operations
- **Efficient Loops**: Optimize strategy iteration
- **Storage Packing**: Efficient storage layout
- **Function Visibility**: Minimize external calls

### Yield Optimization
- **Strategy Selection**: Choose high-yield strategies
- **Rebalancing**: Regular portfolio rebalancing
- **Fee Optimization**: Minimize protocol fees
- **Slippage Management**: Optimize swap execution

## 🚨 Emergency Procedures

### Pause Vault
```solidity
vault.pause();
```

### Emergency Withdraw
```solidity
vault.emergencyWithdraw();
```

### Remove Strategy
```solidity
vault.removeStrategy(strategyAddress);
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Join our Discord community
- Email: support@defivaultpro.com

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Always test thoroughly before using with real funds.
