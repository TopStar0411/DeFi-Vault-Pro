# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Environment File

Create a `.env` file in the root directory with your API keys:

```env
# Get your 1inch API key from: https://portal.1inch.dev/
VITE_1INCH_API_KEY=your_1inch_api_key_here

# Get your WalletConnect project ID from: https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

## 3. Start Development Server

```bash
npm run dev
```

## 4. Test the Application

### Wallet Connection

1. Click "Connect Wallet" in the header
2. Choose your preferred wallet
3. Approve the connection

### Token Swapping

1. Click "Swap" button
2. Select tokens and enter amounts
3. Review quote and execute swap

## API Key Setup

### 1inch API (Required for real swaps)

1. Visit [1inch Developer Portal](https://portal.1inch.dev/)
2. Sign up and create a new project
3. Copy your API key
4. Add it to your `.env` file

### WalletConnect (Optional)

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your project ID
4. Add it to your `.env` file

## Troubleshooting

- **Wallet Connection Issues**: Ensure your wallet extension is installed and unlocked
- **Swap Failures**: Check your balance and ensure you're on a supported network
- **API Errors**: Verify your API keys are correctly configured

## Supported Networks

- Ethereum Mainnet
- Polygon
- BSC (Binance Smart Chain)
- Arbitrum

## Supported Wallets

- MetaMask
- WalletConnect (any wallet)
- Coinbase Wallet
