# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Prerequisites

- GitHub repository with the project
- Vercel account
- Environment variables configured

### 2. Environment Variables

Set these in your Vercel project settings:

```env
# Required: For Web3Modal functionality
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Optional: For 1inch swap functionality
VITE_1INCH_API_KEY=your_1inch_api_key_here
```

**Important**: You need to get a WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/)

### 3. Deployment Steps

1. **Connect Repository**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**

   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**

   - Add the environment variables listed above
   - `VITE_WALLETCONNECT_PROJECT_ID` is required for wallet connections

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### 4. Troubleshooting

#### Common Issues:

**1. Package Version Conflicts**

- ✅ Fixed: Migrated to `@web3modal/wagmi` v4.0.0
- ✅ Removed deprecated `@web3modal/ethereum` and `@web3modal/react`
- ✅ Added .npmrc for legacy peer deps

**2. Build Failures**

- Check build logs in Vercel dashboard
- Ensure all dependencies are properly installed
- Verify environment variables are set

**3. Runtime Errors**

- Check browser console for errors
- Verify WalletConnect Project ID is set correctly
- Ensure Web3Modal is properly configured

### 5. Post-Deployment

1. **Test Functionality**

   - Connect wallet using Web3Modal
   - Test basic navigation
   - Verify components load correctly

2. **Monitor Performance**
   - Check Vercel analytics
   - Monitor build times
   - Watch for any runtime errors

### 6. Custom Domain (Optional)

1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS

### 7. Environment-Specific Configs

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run build
npm run preview
```

### 8. Web3Modal Configuration

The project now uses the latest Web3Modal v5 with Wagmi integration:

- **Package**: `@web3modal/wagmi` v5.1.11
- **Configuration**: Automatic wallet detection
- **Supported Wallets**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Features**: Multi-chain support, automatic connection management

### 9. Support

If you encounter issues:

1. Check Vercel build logs
2. Verify package versions are compatible
3. Ensure environment variables are set
4. Test locally first with `npm run build`
5. Verify WalletConnect Project ID is valid

---

**Note**: The project has been updated to use the latest Web3Modal v5 with improved wallet connection handling and better compatibility with Vercel deployment.
