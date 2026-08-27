# Deployment Guide

Deploy your Linkage Creator CRM to production.

---

## Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ Made by Next.js creators
- ✅ One-click deployment
- ✅ Automatic HTTPS
- ✅ Free tier available
- ✅ Fast CDN
- ✅ Environment variables management

### Steps

#### 1. Prepare Your Project

```bash
cd d:\web\linkage-crm
git init
git add .
git commit -m "Initial commit"
```

#### 2. Push to GitHub

1. Create GitHub account (if needed)
2. Create new repository on GitHub
3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/linkage-crm.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (if using Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if using Supabase)
6. Click "Deploy"

**Done!** Your app is live at `yourdomain.vercel.app`

---

## Option 2: Deploy to Netlify

### Steps

1. Push code to GitHub (see above)
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect GitHub
5. Select repository
6. Set build command: `npm run build`
7. Set publish directory: `.next`
8. Add environment variables (if using Supabase)
9. Deploy

---

## Option 3: Self-Hosted (Docker)

### Build Production Image

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t linkage-crm .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=xxx linkage-crm
```

---

## Option 4: Traditional Server (Linux/Ubuntu)

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- A server (AWS, DigitalOcean, Linode, etc.)

### Deploy Steps

```bash
# SSH into server
ssh user@your-server

# Clone repository
git clone https://github.com/YOUR_USERNAME/linkage-crm.git
cd linkage-crm

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "linkage-crm" -- start
pm2 startup
pm2 save
```

### Setup Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Environment Variables for Production

### Required (if using Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Optional
```env
# Node environment
NODE_ENV=production
```

---

## Pre-Deployment Checklist

- [ ] Run `npm run build` locally - no errors?
- [ ] Test on http://localhost:3000 - works?
- [ ] All environment variables configured?
- [ ] Supabase tables created (if using cloud)?
- [ ] RLS policies set properly (if using Supabase)?
- [ ] `.env.local` NOT committed to git?
- [ ] Latest code committed to main branch?

---

## Post-Deployment Testing

### Test Locally First
```bash
npm run build
npm start  # Production mode
# Visit http://localhost:3000
```

### Test on Live Site
1. Add a creator
2. Add a video
3. Check calendar
4. View analytics
5. Change settings
6. Verify dark mode works

---

## Performance Optimization

### Already Included ✓
- Next.js static optimization
- Code splitting
- Image optimization
- CSS minification
- JavaScript minification

### Monitor Performance
- Use Vercel Analytics (if deployed to Vercel)
- Check Google PageSpeed Insights
- Monitor Core Web Vitals

---

## Scaling with Supabase

### For Growing Usage

1. **Enable Row Level Security (RLS)**
   - Restrict data access
   - Improve security
   - Better performance

2. **Add Database Indexes**
   ```sql
   CREATE INDEX ON creators(status);
   CREATE INDEX ON videos(date);
   CREATE INDEX ON videos(creatorId);
   ```

3. **Monitor Supabase Usage**
   - Check project stats
   - Monitor database size
   - Watch query performance

4. **Enable Backups**
   - Supabase dashboard → Backups
   - Set daily backups

---

## Monitoring & Maintenance

### Health Checks
- Visit your deployed URL regularly
- Verify data persists
- Test Supabase sync (if configured)

### Update Dependencies
```bash
npm update
npm audit
npm audit fix
```

### Monitor Logs
- Vercel: Deploy logs in dashboard
- Self-hosted: `pm2 logs`
- Docker: `docker logs container_id`

---

## Rollback Plan

### If Deployment Fails

#### On Vercel
- Go to Deployments
- Click "Redeploy" on last working version

#### On GitHub/Git
```bash
git log --oneline
git revert COMMIT_HASH
git push origin main
```

#### On Self-Hosted
```bash
git checkout PREVIOUS_COMMIT
npm run build
pm2 restart linkage-crm
```

---

## SSL/HTTPS

### Vercel
- ✅ Automatic SSL certificate
- ✅ Free
- ✅ Auto-renewal

### Netlify
- ✅ Automatic SSL certificate
- ✅ Free
- ✅ Auto-renewal

### Self-Hosted with Let's Encrypt
```bash
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot install --nginx
```

---

## Custom Domain

### Vercel
1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. Update DNS records

### Self-Hosted
1. Update DNS A record to server IP
2. Configure Nginx/Apache
3. Get SSL certificate

---

## Backup Strategy

### Data Backup

**Option 1: Supabase Backups**
- Enabled in Supabase dashboard
- Daily automatic backups
- 30-day retention

**Option 2: Manual Export**
```bash
# Export from Supabase
supabase db dump --db-url postgresql://... > backup.sql

# Restore
psql -U postgres < backup.sql
```

### Code Backup
- GitHub is your backup
- All code versions preserved
- Easy rollback

---

## Cost Estimation

### Vercel (Recommended)
- Free tier: Included
- Pro tier: $20/month
- Usage costs: Per GB transferred

### Supabase
- Free tier: 500MB database
- Pro tier: $25/month starting
- Overage: Per GB additional

### Total: $25-50/month for small-medium usage

---

## Troubleshooting Deployment

### Build Fails
- Check Node.js version: `node --version` (need 18+)
- Check for TypeScript errors: `npm run build` locally
- Review build logs in deployment dashboard

### App Won't Start
- Check environment variables are set
- Verify dependencies installed: `npm install`
- Check for runtime errors in logs

### Data Not Persisting
- If localStorage only: Check browser storage
- If Supabase: Verify tables created
- Check for console errors (F12)

---

## Production Best Practices

### Security
1. ✅ Use environment variables for secrets
2. ✅ Enable RLS on Supabase (for multi-user)
3. ✅ Keep dependencies updated
4. ✅ Use HTTPS (automatic on most platforms)
5. ✅ Regular backups enabled

### Performance
1. ✅ Monitor Core Web Vitals
2. ✅ Use CDN (automatic with Vercel/Netlify)
3. ✅ Cache static content
4. ✅ Optimize database queries

### Reliability
1. ✅ Set up monitoring
2. ✅ Enable auto-restarts (PM2)
3. ✅ Plan for disasters
4. ✅ Test backups regularly

---

## Getting Help

### For Deployment Issues
- Check deployment platform docs (Vercel, Netlify)
- Review your code on GitHub
- Check console errors (F12 in browser)

### For Supabase Issues
- Check Supabase docs: docs.supabase.com
- Verify tables created
- Check RLS policies

---

## Next Steps After Deployment

1. ✅ Share the URL with your team
2. ✅ Add real data (creators, videos)
3. ✅ Monitor for issues
4. ✅ Set up automatic backups
5. ✅ Plan updates and maintenance

---

**Your CRM is ready for production!** 🚀
