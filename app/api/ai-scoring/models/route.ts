import 'server-only'
import { NextResponse } from 'next/server'
import { redactEnv } from '@/app/api/ai-scoring/schemas'
import { GeminiProvider } from '@/lib/ai/providers/gemini'
import { OpenAIProvider } from '@/lib/ai/providers/openai'
import type { HealthStatus } from '@/lib/ai/providers/types'
import { VercelAIProvider } from '@/lib/ai/providers/vercel'

type ModelsHealthResponse = {
  providers: Array<HealthStatus & { name: string }>
  env: {
    OPENAI_API_KEY?: string
    GOOGLE_GENERATIVE_AI_API_KEY?: string
    VERCEL_AI_API_KEY?: string
    AI_GATEWAY_API_KEY?: string
    PTE_SCORING_PROVIDER_PRIORITY?: string
    PTE_SCORING_TIMEOUT_MS?: string
    VERCEL_AI_OPENAI_MODEL?: string
    VERCEL_AI_GEMINI_MODEL?: string
  }
  meta: {
    timestamp: string
    note: string
  }
}

// Optional: rate limiting placeholder
// export const runtime = 'edge';

export async function GET() {
  const t0 = Date.now()

  const providers = [
    { name: 'openai', impl: new OpenAIProvider() },
    { name: 'gemini', impl: new GeminiProvider() },
    { name: 'vercel', impl: new VercelAIProvider() },
  ] as const

  const results: Array<HealthStatus & { name: string }> = []

  for (const p of providers) {
    try {
      const h = await p.impl.health()
      results.push({ name: p.name, ...h })
    } catch (e: any) {
      results.push({
        name: p.name,
        provider: p.name as any,
        ok: false,
        error: e?.message ?? 'health_check_failed',
      })
    }
  }

  const body: ModelsHealthResponse = {
    providers: results,
    env: {
      OPENAI_API_KEY: redactEnv(process.env.OPENAI_API_KEY),
      GOOGLE_GENERATIVE_AI_API_KEY: redactEnv(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ),
      VERCEL_AI_API_KEY: redactEnv(process.env.VERCEL_AI_API_KEY),
      AI_GATEWAY_API_KEY: redactEnv(process.env.AI_GATEWAY_API_KEY),
      PTE_SCORING_PROVIDER_PRIORITY: process.env.PTE_SCORING_PROVIDER_PRIORITY,
      PTE_SCORING_TIMEOUT_MS: process.env.PTE_SCORING_TIMEOUT_MS,
      VERCEL_AI_OPENAI_MODEL: process.env.VERCEL_AI_OPENAI_MODEL,
      VERCEL_AI_GEMINI_MODEL: process.env.VERCEL_AI_GEMINI_MODEL,
    },
    meta: {
      timestamp: new Date().toISOString(),
      note: 'Keys are redacted; use /api/ai-scoring/score to run scoring.',
    },
  }

  const res = NextResponse.json(body, { status: 200 })
  res.headers.set('x-duration-ms', String(Date.now() - t0))
  return res
}
