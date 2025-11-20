import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { z } from 'zod'

export async function POST(request: Request) {
  const { question, answer } = await request.json()

  try {
    const { object: analysis } = await generateObject({
      model: process.env.VERCEL_AI_OPENAI_MODEL || 'openai:gpt-4o-mini',
      schemaName: 'PTEWritingAnalysis',
      schema: z.object({
        overallScore: z.number().min(0).max(90),
        grammar: z.object({
          score: z.number().min(0).max(90),
          feedback: z.string(),
          corrections: z
            .array(
              z.object({
                original: z.string(),
                corrected: z.string(),
                explanation: z.string(),
              })
            )
            .default([]),
        }),
        vocabulary: z.object({
          score: z.number().min(0).max(90),
          feedback: z.string(),
          suggestions: z
            .array(
              z.object({
                original: z.string(),
                suggested: z.string(),
                reason: z.string(),
              })
            )
            .default([]),
        }),
        coherence: z.object({
          score: z.number().min(0).max(90),
          feedback: z.string(),
        }),
        modelAnswer: z.string(),
      }),
      prompt: [
        'You are a certified Pearson PTE Academic examiner.',
        "Analyze the candidate's response to the Summarize Written Text task.",
        `Source Text: "${question}"`,
        `Candidate Response: "${answer}"`,
        'Score each dimension on a 0–90 scale and provide concise feedback.',
        'Return strictly structured data that matches the schema provided.',
      ].join('\n'),
      temperature: 0.2,
      maxOutputTokens: 800,
    })

    return NextResponse.json(analysis)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get AI score.' },
      { status: 500 }
    )
  }
}
