# Push to GitHub - Authentication Guide

The project is ready to push, but needs authentication. Here's how:

---

## Option 1: Use GitHub Personal Access Token (Recommended)

### Step 1: Create Personal Access Token on GitHub

1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Name: `linkagebyzunocrm`
4. Expiration: 90 days (or as needed)
5. Select scopes:
   - ✓ repo (full control)
   - ✓ workflow
6. Click: "Generate token"
7. **Copy the token** (you'll only see it once!)

### Step 2: Configure Git with Token

```bash
cd d:\web\linkage-crm

# Configure git with your credentials
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# Try pushing with token
git push -u origin main
```

When prompted for password, paste your **personal access token** (not your GitHub password)

---

## Option 2: Use SSH (Alternative)

### Step 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts
```

### Step 2: Add SSH Key to GitHub

1. Copy key:
```bash
type C:\Users\[YourUsername]\.ssh\id_ed25519.pub
```

2. Go to: https://github.com/settings/ssh/new
3. Paste the key
4. Click: Add SSH key

### Step 3: Push with SSH

```bash
cd d:\web\linkage-crm
git remote remove origin
git remote add origin git@github.com:zainabtariq5505-svg/linkagebyzunocrm.git
git push -u origin main
```

---

## Option 3: Use GitHub CLI (Easiest)

### Step 1: Install GitHub CLI

Download from: https://github.com/cli/cli/releases

Or with Winget:
```bash
winget install GitHub.cli
```

### Step 2: Authenticate

```bash
gh auth login
# Follow prompts to authenticate
```

### Step 3: Push

```bash
cd d:\web\linkage-crm
git push -u origin main
```

---

## Troubleshooting

### "Permission denied"
- Check your GitHub credentials
- Verify repository URL is correct
- Make sure token/key is properly configured

### "Remote rejected"
- Verify you have push access to the repository
- Check repository exists
- Confirm branch name is "main"

### "Could not resolve host"
- Check internet connection
- Verify GitHub is accessible
- Try later if GitHub is having issues

---

## Quick Summary

1. **Get authentication** (token, SSH, or CLI)
2. **Configure git** with your credentials
3. **Run**: `git push -u origin main`
4. **Done!** Code is on GitHub

---

## What Gets Pushed

All 51 files including:
- ✓ Source code (app, components, lib)
- ✓ Configuration (package.json, tsconfig, etc.)
- ✓ Documentation (15+ guides)
- ✓ Deployment guides
- ✓ Supabase setup files

**Total**: ~13,000+ lines of code

---

## After Push

Once pushed:

1. Go to: https://github.com/zainabtariq5505-svg/linkagebyzunocrm
2. Verify files are there
3. Deploy to Vercel (next step)

---

## Deploy to Vercel

After pushing to GitHub:

1. Go to: https://vercel.com
2. Click: "+ New Project"
3. Click: "Import Git Repository"
4. Select: linkagebyzunocrm
5. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Click: Deploy!

---

Need help? Follow the steps above for your preferred method! 🚀
