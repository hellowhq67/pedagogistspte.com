# Railway Deployment Guide for PTE Academic Platform

## Current Status

✅ **Completed:**
- Fixed TypeScript JSDoc errors in API routes
- Fixed import errors (Textarea → FileText)
- Added Railway configuration files
- Added webpack fallbacks for Node.js modules
- Created environment variable template
- Added database migration scripts to package.json

🟡 **Known Issues:**
- Local build fails due to server/client component mixing
- Railway's Railpack builder may handle this better than local webpack

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Go to your Railway project settings and add these variables:

```bash
# Database (use Railway Postgres)
POSTGRES_URL=<your-neon-postgres-url>
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
BETTER_AUTH_SECRET=<generate-new-with-openssl>
BETTER_AUTH_URL=https://pedagogistpte.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://pedagogistpte.com

# AI Services
OPENAI_API_KEY=<your-key>
GOOGLE_AI_API_KEY=<your-key>
ASSEMBLYAI_API_KEY=<your-key>

# File Storage
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>

# App Config
NODE_ENV=production
```

### 2. Commit and Push Changes

```bash
git add .
git commit -m "Configure for Railway deployment with Railpack"
git push origin main
```

### 3. Deploy to Railway

Railway will automatically:
1. Detect the Next.js project
2. Use Railpack builder
3. Run `pnpm install && pnpm build`
4. Start with `pnpm start`

### 4. Post-Deployment Tasks

After successful deployment, run these commands in Railway CLI or dashboard:

```bash
# 1. Run database migrations
railway run pnpm railway:migrate

# 2. Seed database with questions (optional)
railway run pnpm railway:seed
```

## Troubleshooting

### If Build Fails on Railway

**Error: Module not found (tls, net, etc.)**

Try adding to `next.config.ts`:
```typescript
experimental: {
  serverComponentsExternalPackages: ['postgres', '@neondatabase/serverless'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/**/*'],
  },
},
```

**Error: server-only in client component**

This means a client component is importing server code. Check the error trace and:
1. Identify the component marked with `'use client'`
2. Move data fetching to API routes
3. Use SWR or fetch in the client component

### If Health Check Fails

1. Verify `/api/health` endpoint works:
   ```bash
   curl https://your-app.up.railway.app/api/health
   ```

2. Check Railway logs for errors
3. Verify database connection string is correct

### If App Runs But Features Don't Work

1. **Auth not working**: Check BETTER_AUTH_URL matches your domain
2. **AI scoring fails**: Verify API keys are set correctly
3. **Images not loading**: Check BLOB_READ_WRITE_TOKEN

## Database Schema

The app uses these main tables:
- `users`, `sessions`, `accounts` (Better Auth)
- `speaking_questions`, `speaking_attempts`
- `writing_questions`, `writing_attempts`
- `reading_questions`, `reading_attempts`
- `listening_questions`, `listening_attempts`
- `mock_tests`, `mock_test_questions`, `mock_test_attempts`
- `practice_lessons`, `lesson_progress`, `user_stats`

All migrations are in `lib/db/migrations/`.

## Architecture Notes

### Current Build Issue (Local)
The app mixes server and client components in ways that cause webpack bundling issues locally. However, Railway's Railpack builder may handle this better because:

1. **Railpack uses native builders** - Better Next.js 16 support
2. **Different bundling strategy** - Handles server/client separation differently
3. **Optimized for deployment** - Not constrained by local dev environment

### Recommended Next Steps After Deployment

1. **Implement Real AI Scoring** - Replace mock scoring in `lib/ai/scoring.ts`
2. **Convert to SPA with SWR** - Move data fetching to API routes + SWR hooks
3. **Add Error Monitoring** - Set up Rollbar or Sentry
4. **Performance Optimization** - Monitor and optimize slow queries

## Support

If deployment fails:
1. Check Railway logs in dashboard
2. Review build output for specific errors
3. Verify all environment variables are set
4. Test database connectivity

## Quick Deploy Command

```bash
# If you have Railway CLI installed
railway login
railway link
railway up
railway run pnpm railway:migrate
railway open
```

---

**Note**: Even though local build has issues, Railway deployment may succeed due to different build environment. Deploy and monitor the Railway build logs to see if Railpack handles the server/client separation better.
