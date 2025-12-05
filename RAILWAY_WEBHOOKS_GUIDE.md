# Railway Webhooks Configuration Guide

## 🎣 Webhook Endpoints Overview

I've created webhook handlers for your Railway project to monitor deployments and system events.

### Available Webhook Endpoints

1. **Railway Deployment Webhook**
   - **URL**: `https://pedalogigstspte.com/api/webhooks/railway`
   - **Purpose**: Monitor Railway deployments and service events
   - **Events**: deployment.started, deployment.success, deployment.failed, deployment.crashed

2. **Polar Payment Webhook** (Already exists)
   - **URL**: `https://pedalogigstspte.com/api/webhooks/polar`
   - **Purpose**: Handle subscription and payment events
   - **Events**: Payment success, subscription created, etc.

## 🔧 Railway Webhook Configuration

### Step 1: Add Railway Webhook

In your Railway dashboard:

1. Go to **Project Settings** → **Webhooks**
2. Click **"New Webhook"**
3. Configure as follows:

```
Webhook URL: https://pedalogigstspte.com/api/webhooks/railway

Event Types (Select these):
☑️ deployment.started
☑️ deployment.success
☑️ deployment.failed
☑️ deployment.crashed
☑️ service.created
☑️ service.updated
```

4. Click **"Create Webhook"**

### Step 2: Test Webhook (Optional)

Use preview URL while DNS is pending:
```
Webhook URL: https://pedagogistptecom-preview.up.railway.app/api/webhooks/railway
```

### Step 3: Verify Webhook is Active

```bash
# Test webhook endpoint
curl https://pedalogigstspte.com/api/webhooks/railway

# Expected response:
# {
#   "status": "active",
#   "endpoint": "/api/webhooks/railway",
#   "timestamp": "2025-12-05T..."
# }
```

## 📋 Railway Webhook Events

### Critical Events (Recommended)

**deployment.started**
- Triggered when a new deployment begins
- Use case: Send team notification, update status page

**deployment.success**
- Triggered when deployment completes successfully
- Use case: Clear CDN cache, send success notification, log metrics

**deployment.failed**
- Triggered when deployment fails during build or start
- Use case: Send alert to team, create incident ticket

**deployment.crashed**
- Triggered when deployed app crashes
- Use case: Page on-call engineer, auto-rollback, critical alert

### Optional Events

**service.created**
- New service added to project

**service.updated**
- Service configuration changed

**service.deleted**
- Service removed from project

## 🔔 Notification Integrations

### Discord Webhook

**Easy Setup** (Railway auto-formats):

1. Create Discord webhook in your server:
   - Server Settings → Integrations → Webhooks → New Webhook
   - Copy webhook URL

2. In Railway webhooks:
   ```
   Webhook URL: https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN
   ```

3. Railway automatically formats messages for Discord ✅

**Example Discord message:**
```
🚀 Deployment Started
Project: pedagogistpte.com
Environment: production
Commit: "Add Docker configuration"
Branch: main
```

### Slack Webhook

**Easy Setup** (Railway auto-formats):

1. Create Slack incoming webhook:
   - Slack Apps → Incoming Webhooks → Add to Slack
   - Choose channel → Copy webhook URL

2. In Railway webhooks:
   ```
   Webhook URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Railway automatically formats messages for Slack ✅

**Example Slack message:**
```
✅ Deployment Success
Project: pedagogistpte.com
Environment: production
Duration: 2m 34s
Deployed by: @username
```

## 🛠️ Custom Webhook Handler

The webhook handler at `app/api/webhooks/railway/route.ts` provides:

### Features
- ✅ Event type handling
- ✅ Logging for all events
- ✅ Error handling
- ✅ Type-safe payload parsing
- ✅ Extensible for custom actions

### Extend with Custom Actions

```typescript
// In app/api/webhooks/railway/route.ts

async function handleDeploymentSuccess(payload: RailwayWebhookPayload) {
  console.log('✅ Deployment succeeded');

  // 1. Clear CDN cache
  await fetch('https://api.cloudflare.com/client/v4/zones/YOUR_ZONE/purge_cache', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
    body: JSON.stringify({ purge_everything: true })
  });

  // 2. Send Slack notification
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({
      text: `✅ Deployment successful: ${payload.deployment?.meta.commitMessage}`
    })
  });

  // 3. Update status page
  await fetch('https://status.yoursite.com/api/update', {
    method: 'POST',
    body: JSON.stringify({
      status: 'operational',
      message: 'Deployment completed successfully'
    })
  });

  // 4. Log to analytics
  await logDeployment({
    id: payload.deployment?.id,
    duration: calculateDuration(payload),
    success: true
  });
}
```

## 📊 Webhook Payload Structure

### Deployment Event Payload

```json
{
  "type": "deployment.success",
  "timestamp": "2025-12-05T14:30:00Z",
  "project": {
    "id": "1a76c323-07fa-40d1-bac2-c563b61dbf7f",
    "name": "pedagogistpte.com"
  },
  "environment": {
    "id": "76887964-c3a1-4640-a686-f0f22b567ce9",
    "name": "production"
  },
  "service": {
    "id": "d7268544-a76d-4dbd-bc5c-892a8e526fe6",
    "name": "pedagogistpte.com"
  },
  "deployment": {
    "id": "dep_abc123",
    "status": "SUCCESS",
    "meta": {
      "repo": "hellowhq67/pedagogistspte.com",
      "branch": "main",
      "commitMessage": "Add Docker configuration",
      "commitAuthor": "Your Name"
    }
  }
}
```

## 🔐 Security Best Practices

### 1. Validate Webhook Source
```typescript
// Add signature verification
const signature = request.headers.get('x-railway-signature');
if (!verifySignature(payload, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 2. Use HTTPS Only
- ✅ Railway webhooks require HTTPS
- ✅ Never use HTTP endpoints

### 3. Rate Limiting
```typescript
// Add rate limiting to prevent abuse
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});

const { success } = await ratelimit.limit('railway-webhook');
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

## 🧪 Testing Webhooks

### Test with cURL

```bash
# Test Railway webhook endpoint
curl -X POST https://pedalogigstspte.com/api/webhooks/railway \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment.success",
    "timestamp": "2025-12-05T14:30:00Z",
    "project": {"id": "test", "name": "test"},
    "environment": {"id": "test", "name": "production"},
    "service": {"id": "test", "name": "test"},
    "deployment": {
      "id": "test",
      "status": "SUCCESS",
      "meta": {
        "repo": "test/test",
        "branch": "main",
        "commitMessage": "Test deployment",
        "commitAuthor": "Test User"
      }
    }
  }'
```

### Test with Railway CLI

```bash
# Trigger a deployment to test webhook
railway up

# Watch webhook logs
railway logs --filter "Railway Webhook"
```

## 📱 Recommended Webhook Setup

### Minimum Setup (Essential)
```
✅ Webhook URL: https://pedalogigstspte.com/api/webhooks/railway
✅ Events: deployment.failed, deployment.crashed
✅ Purpose: Get alerts for critical failures
```

### Standard Setup (Recommended)
```
✅ Webhook URL: Discord/Slack webhook
✅ Events: All deployment events
✅ Purpose: Team notifications and monitoring
```

### Advanced Setup (Full Monitoring)
```
✅ Primary: Custom app webhook (Railway handler)
✅ Secondary: Discord webhook (team notifications)
✅ Tertiary: PagerDuty/Opsgenie (on-call alerts)
✅ Events: All events
✅ Purpose: Complete deployment pipeline automation
```

## 🎯 Quick Setup Checklist

- [ ] Create Railway webhook endpoint (already done ✅)
- [ ] Add webhook in Railway dashboard
- [ ] Select critical events (deployment.failed, deployment.crashed)
- [ ] Test webhook with curl or deployment
- [ ] Optional: Add Discord/Slack webhook
- [ ] Optional: Add PagerDuty for critical alerts
- [ ] Monitor webhook logs in Railway

## 📚 Additional Resources

- **Railway Webhooks Docs**: https://docs.railway.app/reference/webhooks
- **Discord Webhooks**: https://support.discord.com/hc/en-us/articles/228383668
- **Slack Webhooks**: https://api.slack.com/messaging/webhooks
- **PagerDuty Integration**: https://support.pagerduty.com/docs/webhooks

## 🆘 Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct and accessible
2. Verify HTTPS (not HTTP)
3. Check Railway logs for webhook delivery attempts
4. Test endpoint manually with curl

### Events Not Being Processed
1. Check app logs: `railway logs --filter "webhook"`
2. Verify webhook handler is deployed
3. Test endpoint: `curl https://your-app/api/webhooks/railway`

### Discord/Slack Messages Not Formatted
1. Ensure using official webhook URL format
2. Railway auto-formats only for Discord/Slack domains
3. Custom domains require manual formatting

---

**Created**: December 5, 2025
**Status**: ✅ Webhook handler ready, awaiting Railway configuration
