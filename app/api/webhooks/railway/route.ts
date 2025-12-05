/**
 * Railway Webhook Handler
 *
 * Receives deployment events from Railway and processes them.
 * Events: deployment.started, deployment.success, deployment.failed, deployment.crashed
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Railway webhook event types
type RailwayEventType =
  | 'deployment.started'
  | 'deployment.success'
  | 'deployment.failed'
  | 'deployment.crashed'
  | 'deployment.removed'
  | 'service.created'
  | 'service.updated'
  | 'service.deleted';

interface RailwayWebhookPayload {
  type: RailwayEventType;
  timestamp: string;
  project: {
    id: string;
    name: string;
  };
  environment: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  };
  deployment?: {
    id: string;
    status: string;
    meta: {
      repo: string;
      branch: string;
      commitMessage: string;
      commitAuthor: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers (if Railway provides one)
    const headersList = await headers();
    const signature = headersList.get('x-railway-signature');

    // Parse webhook payload
    const payload: RailwayWebhookPayload = await request.json();

    console.log('Railway Webhook Received:', {
      type: payload.type,
      timestamp: payload.timestamp,
      project: payload.project.name,
      environment: payload.environment.name,
      service: payload.service.name,
    });

    // Handle different event types
    switch (payload.type) {
      case 'deployment.started':
        await handleDeploymentStarted(payload);
        break;

      case 'deployment.success':
        await handleDeploymentSuccess(payload);
        break;

      case 'deployment.failed':
        await handleDeploymentFailed(payload);
        break;

      case 'deployment.crashed':
        await handleDeploymentCrashed(payload);
        break;

      case 'service.created':
      case 'service.updated':
      case 'service.deleted':
        await handleServiceEvent(payload);
        break;

      default:
        console.log(`Unhandled event type: ${payload.type}`);
    }

    return NextResponse.json({
      received: true,
      type: payload.type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Railway webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleDeploymentStarted(payload: RailwayWebhookPayload) {
  console.log('🚀 Deployment started:', {
    id: payload.deployment?.id,
    branch: payload.deployment?.meta.branch,
    commit: payload.deployment?.meta.commitMessage,
  });

  // Optional: Send notification to team (Slack, Discord, email, etc.)
  // await sendNotification({
  //   type: 'info',
  //   title: 'Deployment Started',
  //   message: `Deployment started for ${payload.service.name}`,
  // });
}

async function handleDeploymentSuccess(payload: RailwayWebhookPayload) {
  console.log('✅ Deployment succeeded:', {
    id: payload.deployment?.id,
    branch: payload.deployment?.meta.branch,
  });

  // Optional: Run post-deployment tasks
  // - Clear CDN cache
  // - Send success notification
  // - Update status page
  // - Log deployment metrics
}

async function handleDeploymentFailed(payload: RailwayWebhookPayload) {
  console.error('❌ Deployment failed:', {
    id: payload.deployment?.id,
    branch: payload.deployment?.meta.branch,
    commit: payload.deployment?.meta.commitMessage,
  });

  // Optional: Send alert to team
  // await sendAlert({
  //   type: 'error',
  //   title: 'Deployment Failed',
  //   message: `Deployment failed for ${payload.service.name}`,
  //   details: payload.deployment?.meta,
  // });
}

async function handleDeploymentCrashed(payload: RailwayWebhookPayload) {
  console.error('💥 Deployment crashed:', {
    id: payload.deployment?.id,
    service: payload.service.name,
  });

  // Optional: Send critical alert
  // - Page on-call engineer
  // - Auto-rollback to previous version
  // - Create incident ticket
}

async function handleServiceEvent(payload: RailwayWebhookPayload) {
  console.log('🔧 Service event:', {
    type: payload.type,
    service: payload.service.name,
  });
}

// GET endpoint to verify webhook is active
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/railway',
    timestamp: new Date().toISOString(),
  });
}
