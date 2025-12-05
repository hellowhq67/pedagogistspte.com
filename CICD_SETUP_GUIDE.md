# CI/CD Setup Guide

## 🚀 Complete GitHub Actions CI/CD Pipeline

This guide covers the automated CI/CD pipeline for the PTE Academic Platform using GitHub Actions and Railway.

## 📋 Workflows Overview

### 1. **CI Workflow** (`ci.yml`)
**Trigger:** On every push and pull request to `main` and `develop`

**Jobs:**
- ✅ Lint & Type Check
- ✅ Build Application
- ✅ Security Audit
- ✅ Notify Status

**Purpose:** Ensures code quality before merging

### 2. **Production Deployment** (`deploy-production.yml`)
**Trigger:** On push to `main` branch

**Jobs:**
- ✅ Type check and lint
- ✅ Build application
- ✅ Railway auto-deploys
- ✅ Health check verification
- ✅ Deployment notifications

**Purpose:** Automated production deployment

### 3. **Preview Deployment** (`deploy-preview.yml`)
**Trigger:** On pull requests to `main`

**Jobs:**
- ✅ Build preview
- ✅ Comment on PR with preview URL
- ✅ Railway preview deployment

**Purpose:** Preview changes before merging

### 4. **Database Migration** (`database-migrate.yml`)
**Trigger:** Manual workflow dispatch

**Jobs:**
- ✅ Run database migrations
- ✅ Verify migration success

**Purpose:** Manual database schema updates

## 🔧 Setup Instructions

### Step 1: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
POSTGRES_URL=postgresql://user:pass@host.pooler.neon.tech/db?sslmode=require
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### Step 2: Enable GitHub Actions

1. Go to your repository → Actions tab
2. Click "I understand my workflows, go ahead and enable them"
3. Workflows will now run automatically

### Step 3: Configure Railway Auto-Deploy

Railway is already configured to auto-deploy from `main` branch:
- ✅ Connected to GitHub repo
- ✅ Branch: `main`
- ✅ Auto-deploy enabled

### Step 4: Test the Pipeline

```bash
# Create a test commit
git commit --allow-empty -m "Test CI/CD pipeline"
git push origin main
```

## 📊 Workflow Diagram

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
    ┌────▼────┐    ┌────▼────────┐
    │   CI    │    │   Railway   │
    │ Checks  │    │ Auto-Deploy │
    └────┬────┘    └────┬────────┘
         │              │
         ▼              ▼
    ┌────────────────────┐
    │  Deploy Success    │
    │   Health Check     │
    └────────────────────┘
```

## 🔄 CI/CD Flow

### For Pull Requests:
1. **Developer creates PR** → `ci.yml` runs
2. **CI checks pass** → `deploy-preview.yml` runs
3. **Preview deployed** → PR comment with preview URL
4. **Review & approve** → Merge to main
5. **Merged to main** → Production deployment

### For Main Branch:
1. **Push to main** → `ci.yml` runs in parallel with Railway
2. **CI validates** → Lint, type-check, build
3. **Railway deploys** → Automatic deployment
4. **Health check** → Verify deployment
5. **Success** → Deployment complete ✅

## 🎯 Workflow Details

### CI Workflow (ci.yml)

**What it does:**
- Runs ESLint to check code quality
- Runs TypeScript type checking
- Builds the application
- Runs security audit

**When it runs:**
- Every push to `main` or `develop`
- Every pull request

**Time:** ~3-5 minutes

### Production Deployment (deploy-production.yml)

**What it does:**
- Validates code (lint + type check)
- Builds application
- Waits for Railway deployment
- Runs health check (10 attempts)
- Notifies success/failure

**When it runs:**
- Automatically on push to `main`
- Can be triggered manually

**Time:** ~5-7 minutes

### Preview Deployment (deploy-preview.yml)

**What it does:**
- Builds PR changes
- Comments on PR with preview URL
- Links to Railway dashboard
- Shows deployment info

**When it runs:**
- When PR is opened
- When PR is updated (new commits)

**Time:** ~3-5 minutes

### Database Migration (database-migrate.yml)

**What it does:**
- Runs Drizzle migrations
- Verifies migration success
- Provides detailed logs

**When it runs:**
- Manual trigger only (workflow_dispatch)

**How to run:**
1. Go to Actions tab
2. Select "Database Migration"
3. Click "Run workflow"
4. Choose environment (production/preview)
5. Click "Run workflow"

## 🔐 Required Secrets

| Secret | Description | How to Generate |
|--------|-------------|-----------------|
| `POSTGRES_URL` | Database connection string | From Neon dashboard |
| `BETTER_AUTH_SECRET` | Auth secret key | `openssl rand -base64 32` |

## 📝 Environment Variables

GitHub Actions uses these environments:

### Production
- URL: https://pedalogigstspte.com
- Railway project: 1a76c323-07fa-40d1-bac2-c563b61dbf7f
- Branch: `main`

### Preview
- URL: https://pedagogistptecom-preview.up.railway.app
- Same Railway project, preview environment
- Branch: Pull request branches

## 🛠️ Customization

### Add More Checks

Edit `.github/workflows/ci.yml`:

```yaml
- name: Run tests
  run: pnpm test

- name: Check formatting
  run: pnpm format:check

- name: Bundle analysis
  run: pnpm build:analyze
```

### Add Slack Notifications

Add to any workflow:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Deployment ${{ job.status }}"
      }
```

### Add Database Seeding

Edit `.github/workflows/deploy-production.yml`:

```yaml
- name: Seed database
  run: pnpm db:seed:all
  env:
    POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
```

## 🐛 Troubleshooting

### CI Fails on Type Check

**Problem:** TypeScript errors
**Solution:**
```bash
pnpm type-check
# Fix errors locally, then commit
```

### Build Fails

**Problem:** Missing environment variables
**Solution:** Check GitHub Secrets are set correctly

### Health Check Fails

**Problem:** Deployment not ready
**Solution:** Increase timeout in workflow:
```yaml
sleep 60  # Instead of sleep 30
```

### Migration Fails

**Problem:** Database connection timeout
**Solution:** Check `POSTGRES_URL` in GitHub Secrets

## 📊 Monitoring

### View Workflow Runs
1. Go to GitHub repository
2. Click "Actions" tab
3. See all workflow runs and logs

### Railway Deployments
1. Go to Railway dashboard
2. Click on service
3. View "Deployments" tab

### Health Check
- Production: https://pedalogigstspte.com/api/health
- Preview: https://pedagogistptecom-preview.up.railway.app/api/health

## ✅ Best Practices

1. **Always create PR** - Don't push directly to main
2. **Wait for CI** - Ensure CI passes before merging
3. **Review preview** - Test changes in preview environment
4. **Monitor deployments** - Check Railway logs after merge
5. **Run migrations manually** - Don't auto-migrate on deploy

## 🔗 Quick Links

- **GitHub Actions**: https://github.com/hellowhq67/pedagogistspte.com/actions
- **Railway Dashboard**: https://railway.app/project/1a76c323-07fa-40d1-bac2-c563b61dbf7f
- **Production**: https://pedalogigstspte.com
- **Preview**: https://pedagogistptecom-preview.up.railway.app
- **Status Page**: https://pedagogistptecom-preview.up.railway.app/status.html

## 📈 Workflow Status Badges

Add to your README.md:

```markdown
![CI](https://github.com/hellowhq67/pedagogistspte.com/workflows/CI%20-%20Lint,%20Type%20Check%20&%20Test/badge.svg)
![Deploy](https://github.com/hellowhq67/pedagogistspte.com/workflows/CD%20-%20Deploy%20to%20Railway%20Production/badge.svg)
```

## 🎯 Next Steps

1. ✅ Workflows are created and committed
2. ⏳ Push to GitHub to trigger first run
3. ⏳ Add GitHub Secrets (POSTGRES_URL, BETTER_AUTH_SECRET)
4. ⏳ Monitor first deployment
5. ⏳ Test preview deployments with PR

---

**Created**: December 5, 2025
**Status**: ✅ Ready to use - Push to GitHub to activate
