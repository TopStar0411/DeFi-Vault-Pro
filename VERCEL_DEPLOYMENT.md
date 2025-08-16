# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Prerequisites

- GitHub repository with the project
- Vercel account
- Environment variables configured

### 2. Environment Variables

Set these in your Vercel project settings:

```env
# Optional: For production features
VITE_1INCH_API_KEY=your_1inch_api_key_here
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

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
   - These are optional for basic functionality

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### 4. Troubleshooting

#### Common Issues:

**1. Package Version Conflicts**

- ✅ Fixed: Updated package.json with compatible versions
- ✅ Added .npmrc for legacy peer deps

**2. Build Failures**

- Check build logs in Vercel dashboard
- Ensure all dependencies are properly installed

**3. Runtime Errors**

- Check browser console for errors
- Verify environment variables are set correctly

### 5. Post-Deployment

1. **Test Functionality**

   - Connect wallet
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

### 8. Support

If you encounter issues:

1. Check Vercel build logs
2. Verify package versions are compatible
3. Ensure environment variables are set
4. Test locally first with `npm run build`

---

**Note**: The project is configured to work with Vercel's build system. All dependencies have been updated to compatible versions.
