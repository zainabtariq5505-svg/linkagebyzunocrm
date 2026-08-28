# Instagram API Integration Guide

## Overview
The Linkage CRM can fetch video stats (views, likes, comments) directly from Instagram links. However, Instagram requires API authentication.

## Current Setup

### Without API Token (Current Setup)
- **Behavior**: Fetch button will generate realistic mock data
- **Use Case**: Testing and development
- **Accuracy**: Not real data
- **Recommendation**: For production, users should manually enter stats from Instagram

### With API Token (Production Setup)
- **Behavior**: Fetch button retrieves actual stats from Instagram
- **Use Case**: Production deployments
- **Accuracy**: Real-time data

## How to Enable Real Instagram Fetching

### Step 1: Create Instagram App
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app → Select "Business" type
3. Add "Instagram Graph API" product
4. Complete app review process

### Step 2: Get Access Token
1. In your app dashboard, go to Tools → Graph API Explorer
2. Select your app from dropdown
3. Click "Generate Access Token"
4. Copy the token (valid for 60 days, use long-lived token for production)

### Step 3: Configure Environment Variable
1. Create `.env.local` file in project root:
```bash
NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_token_here
```

2. Restart dev server:
```bash
npm run dev
```

### Step 4: Test
1. Go to Add Video modal
2. Paste Instagram URL
3. Click "Fetch" button
4. Stats should populate with real data

## API Limitations

- **Rate Limits**: 100 requests/hour for free tier
- **Data Delay**: 24-48 hour delay on some metrics
- **Video IDs**: Only works with public accounts
- **Errors**: If URL is private or token is invalid, manual entry is required

## Manual Entry Fallback

If Instagram API is unavailable:
1. Open video on Instagram
2. Manually count views (shown at top)
3. Manually count likes (shown in feed)
4. Click on comment section and note count
5. Enter manually in the form

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Could not fetch Instagram stats" | Check token is valid and not expired |
| 401 Unauthorized | Verify token in `.env.local` |
| 404 Not Found | Ensure account is public |
| Rate limit exceeded | Wait 1 hour before next request |

## Security Notes

- Never commit `.env.local` with real tokens
- Use long-lived tokens for production (90 days)
- Regenerate tokens quarterly
- Keep `.env.local` in `.gitignore` (already configured)

## References
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Access Tokens Guide](https://developers.facebook.com/docs/facebook-login/access-tokens)
