# Complete Railway Deployment Guide

## 🚂 Railway Project Configuration

### Project Details
- **Project ID**: `1a76c323-07fa-40d1-bac2-c563b61dbf7f`
- **Service**: `pedagogistpte.com` (`d7268544-a76d-4dbd-bc5c-892a8e526fe6`)
- **Environment**: `production` (`76887964-c3a1-4640-a686-f0f22b567ce9`)
- **Region**: Southeast Asia (Singapore) 🇸🇬

## 🌐 Networking Configuration

### Public Domains
1. **Railway Domain**: `pedagogistptecom-preview.up.railway.app`
   - Port: 3000
   - Status: ✅ Active

2. **Custom Domain**: `pedalogigstspte.com`
   - Port: 3000
   - Status: ⏳ Waiting for DNS update
   - **Action Required**: Update DNS records (see DNS Configuration below)

### Private Networking
- **Internal DNS**: `pedagogistpte.railway.internal`
- **IP**: IPv4 & IPv6 supported
- **Usage**: For service-to-service communication within Railway

## 🔧 Current Railway Settings

### Source Configuration
```
Repository: hellowhq67/pedagogistspte.com
Branch: main (PREVIEW environment)
Root Directory: /
Watch Paths: ** (all files), src/
```

### Build Configuration
```
Builder: Railpack (Railway's native builder)
Metal Build: Beta (faster builds)
Build Command: (auto-detected from railway.json)
Config File: /railway.json
```

### Deploy Configuration
```
Start Command: pnpm start
Healthcheck Path: pedalogigstspte.com/api/health ⚠️ NEEDS FIX
Restart Policy: Always
Max Restart Retries: 10
```

### Resources
```
CPU: 6 vCPU
Memory: 8 GB
Replicas: 1 (Southeast Asia - Singapore)
```

## ⚠️ Required Configuration Changes

### 1. Fix Healthcheck Path
**Current**: `pedalogigstspte.com/api/health` ❌
**Should be**: `/api/health` ✅

**How to fix**:
1. Go to Settings → Deploy
2. Find "Healthcheck Path"
3. Change to: `/api/health`
4. Click "Update"

### 2. Add Pre-Deploy Step
**Action**: Add database migration before each deployment

**How to add**:
1. Go to Settings → Deploy
2. Click "Add pre-deploy step"
3. Enter command: `pnpm db:migrate`
4. Click "Save"

This ensures database schema is updated automatically before new code runs.

## 🔐 Environment Variables Checklist

### Required Variables (Must Set)

```bash
# Database (Neon PostgreSQL)
POSTGRES_URL=postgresql://user:password@host.pooler.neon.tech/db?sslmode=require
DATABASE_URL=postgresql://user:password@host.pooler.neon.tech/db?sslmode=require

# Better Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=<generate-new-secret-key>
BETTER_AUTH_URL=https://pedalogigstspte.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://pedalogigstspte.com

# AI Services
OPENAI_API_KEY=sk-proj-...
GOOGLE_AI_API_KEY=AI...
ASSEMBLYAI_API_KEY=...

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pedalogigstspte.com
PORT=3000
```

### Optional Variables

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@pedalogigstspte.com

# Payment
POLAR_ACCESS_TOKEN=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN=...
ROLLBAR_ACCESS_TOKEN=...
```

## 🌍 DNS Configuration

To use your custom domain `pedalogigstspte.com`:

### Step 1: Get Railway DNS Target
In Railway dashboard:
1. Go to Settings → Networking
2. Click on `pedalogigstspte.com` domain
3. Click "Show instructions"
4. Copy the DNS target (looks like: `xxx.up.railway.app`)

### Step 2: Update DNS Records
In your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

**For root domain (pedalogigstspte.com):**
```
Type: CNAME or ALIAS
Name: @ (or leave blank)
Value: [Railway DNS target from Step 1]
TTL: 3600 (or Auto)
```

**For www subdomain (optional):**
```
Type: CNAME
Name: www
Value: pedalogigstspte.com
TTL: 3600
```

### Step 3: Verify DNS Propagation
```bash
# Check DNS records
nslookup pedalogigstspte.com

# Or use online tool
# https://dnschecker.org
```

DNS propagation can take 5 minutes to 48 hours.

## 📊 Database Setup

### Option 1: Use Railway PostgreSQL (Recommended)
1. In Railway dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will auto-provision a database
4. Use `${{Postgres.DATABASE_URL}}` variable reference
5. No need to set `POSTGRES_URL` manually

### Option 2: Use Neon PostgreSQL (Current Setup)
1. Keep existing `POSTGRES_URL` in environment variables
2. Ensure connection string uses pooled connection:
   ```
   postgresql://user:pass@host.pooler.neon.tech/db?sslmode=require
   ```

### Running Migrations

**After successful deployment:**

Method 1: Railway Dashboard
1. Go to service → Deployments
2. Click on successful deployment
3. Click "View Logs"
4. If pre-deploy step is configured, migrations run automatically

Method 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link 1a76c323-07fa-40d1-bac2-c563b61dbf7f

# Run migration manually
railway run pnpm db:migrate

# Seed database (optional)
railway run pnpm db:seed:all
```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)
Railway auto-deploys when you push to `main` branch:

```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Railway detects push and deploys automatically
```

### Manual Deployment via CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# Monitor logs
railway logs --follow
```

## 📝 Deployment Checklist

Before going live, ensure:

- [ ] ✅ `pnpm-lock.yaml` exists in repository
- [ ] ✅ All required environment variables are set
- [ ] ⚠️ Healthcheck path changed to `/api/health`
- [ ] ⚠️ Pre-deploy step added: `pnpm db:migrate`
- [ ] ⏳ DNS records updated for custom domain
- [ ] ⏳ OAuth redirect URIs updated to production domain
- [ ] ⏳ `BETTER_AUTH_URL` set to `https://pedalogigstspte.com`
- [ ] ⏳ Test deployment with health check: `curl https://pedalogigstspte.com/api/health`

## 🔍 Monitoring & Debugging

### View Logs
**Railway Dashboard:**
1. Go to your service
2. Click "Deployments"
3. Click on a deployment
4. View logs in real-time

**Railway CLI:**
```bash
# Stream logs
railway logs --follow

# View recent logs
railway logs --tail 100
```

### Check Deployment Status
```bash
railway status
```

### Health Check
```bash
# Check if app is running
curl https://pedagogistptecom-preview.up.railway.app/api/health

# Or custom domain (after DNS)
curl https://pedalogigstspte.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T...",
  "database": "connected"
}
```

## 🐛 Troubleshooting

### Deployment Fails: "Cannot install with frozen-lockfile"
**Solution**: Ensure `pnpm-lock.yaml` is committed
```bash
git add pnpm-lock.yaml
git commit -m "Add pnpm lockfile"
git push origin main
```

### Health Check Fails
**Possible causes**:
1. App not listening on PORT environment variable
2. Health endpoint not responding
3. Database connection failed

**Debug**:
```bash
# Check logs
railway logs --tail 50

# Verify environment variables
railway variables

# Test locally
pnpm build && pnpm start
curl http://localhost:3000/api/health
```

### Database Connection Timeout
**Solution**: Verify `POSTGRES_URL` uses pooled connection:
```
postgresql://user:pass@host.pooler.neon.tech/db?sslmode=require
                              ^^^^^^
                              Must be pooler, not direct connection
```

### Custom Domain Not Working
1. Verify DNS records are correct
2. Check DNS propagation: `nslookup pedalogigstspte.com`
3. Wait up to 48 hours for DNS to propagate
4. Check Railway dashboard shows "Active" status

### Build Takes Too Long
**Solution**: Enable Metal build environment (already enabled)
- Settings → Build → Metal Build Environment: ON ✅

## 📚 Railway Documentation

- **Railway Docs**: https://docs.railway.app
- **Railpack Builder**: https://docs.railway.app/reference/builds/railpack
- **Custom Domains**: https://docs.railway.app/guides/public-networking#custom-domains
- **Environment Variables**: https://docs.railway.app/guides/variables
- **Healthchecks**: https://docs.railway.app/deploy/healthchecks

## 🔗 Quick Links

- **Railway Dashboard**: https://railway.app/project/1a76c323-07fa-40d1-bac2-c563b61dbf7f
- **GitHub Repo**: https://github.com/hellowhq67/pedagogistspte.com
- **Preview URL**: https://pedagogistptecom-preview.up.railway.app
- **Production URL**: https://pedalogigstspte.com (pending DNS)

## 🎯 Next Steps

1. **Fix healthcheck path** to `/api/health`
2. **Add pre-deploy step** for migrations: `pnpm db:migrate`
3. **Update DNS records** for custom domain
4. **Verify all environment variables** are set
5. **Push to main branch** to trigger deployment
6. **Monitor deployment** in Railway dashboard
7. **Test features** after successful deployment:
   - User signup/login
   - Speaking practice
   - Writing practice
   - AI scoring
   - Mock tests

## ✅ Current Status

- ✅ Repository connected to Railway
- ✅ `pnpm-lock.yaml` committed and pushed
- ✅ Railway configuration files created
- ✅ Docker files created for local development
- ✅ Build and deploy settings configured
- ⏳ Waiting for configuration updates (healthcheck, pre-deploy)
- ⏳ Waiting for DNS propagation
- ⏳ Ready to deploy once configs are updated

---

**Last Updated**: December 5, 2025
**Status**: Ready for final configuration and deployment
