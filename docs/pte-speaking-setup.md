# PTE Speaking Practice: Setup & Verification

This guide finalizes the environment and provides quick steps to run, verify, and deploy the Speaking practice system.

## Overview

Feature set:

- Question list and detail pages for PTE Speaking types (e.g., Read Aloud).
- In-browser recording via MediaRecorder and upload to Vercel Blob.
- AI scoring pipeline and optional server-side transcription.
- Attempts history per question for signed-in users.

Key endpoints and components:

- API: [`app/api/speaking/questions/route.ts`](app/api/speaking/questions/route.ts:1), [`app/api/speaking/questions/[id]/route.ts`](app/api/speaking/questions/[id]/route.ts:1), [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:1), [`app/api/speaking/attempts/route.ts`](app/api/speaking/attempts/route.ts:1)
- Client: [`components/pte/speaking/SpeakingQuestionClient.tsx`](components/pte/speaking/SpeakingQuestionClient.tsx:1), [`components/pte/speaking/SpeakingRecorder.tsx`](components/pte/speaking/SpeakingRecorder.tsx:1), [`components/pte/speaking/AttemptsList.tsx`](components/pte/speaking/AttemptsList.tsx:1), [`components/pte/speaking/ScoreDetailsDialog.tsx`](components/pte/speaking/ScoreDetailsDialog.tsx:1)
- Helpers: [`lib/pte/blob-upload.ts`](lib/pte/blob-upload.ts:1), [`lib/pte/transcribe.ts`](lib/pte/transcribe.ts:1)

## Environment variables

The Speaking system needs the following variables:

| Name                         | Required                         | Default | Purpose                                                  | Used in                                                                                 |
| ---------------------------- | -------------------------------- | ------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| VERCEL_BLOB_READ_WRITE_TOKEN | Yes (for uploads)                | —       | Enables presigned and server-side uploads to Vercel Blob | [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:58)                   |
| AI_TRANSCRIBE_PROVIDER       | No                               | none    | Transcription provider: "openai" or "none"               | [`lib/pte/transcribe.ts`](lib/pte/transcribe.ts:54)                                     |
| OPENAI_API_KEY               | If AI_TRANSCRIBE_PROVIDER=openai | —       | OpenAI API key for Whisper transcription                 | [`lib/pte/transcribe.ts`](lib/pte/transcribe.ts:56)                                     |
| DATABASE_URL                 | Existing project DB URL          | —       | PostgreSQL connection for Drizzle and API                | [`drizzle.config.ts`](drizzle.config.ts:8), [`lib/db/drizzle.ts`](lib/db/drizzle.ts:11) |

Notes:

- DATABASE_URL (or POSTGRES_URL) is already used by the project; this guide does not create the database.
- If AI_TRANSCRIBE_PROVIDER !== "openai", transcription is disabled and scoring proceeds without a transcript.

## Local setup

1. Copy envs

```bash
cp .env.example .env.local
```

2. Install dependencies

```bash
pnpm install
```

3. Generate and run migrations, then seed

Option A (drizzle-kit directly):

```bash
pnpm exec drizzle-kit generate   # if you changed schema
pnpm exec drizzle-kit migrate
pnpm run db:seed:all
```

Option B (package scripts used in this repo):

```bash
pnpm db:generate     # drizzle-kit generate
pnpm db:migrate      # runs migrations
pnpm db:seed:all     # seeds questions incl. speaking
```

4. Start dev server

```bash
pnpm dev
```

## Verification

API checks with curl:

- GET speaking list (no auth required)

```bash
curl -sS "http://localhost:3000/api/speaking/questions?type=read_aloud&page=1&pageSize=5" | jq .
```

Endpoint: [`app/api/speaking/questions/route.ts`](app/api/speaking/questions/route.ts:1)

- POST uploads presign (requires sign-in)

```bash
curl -i -X POST "http://localhost:3000/api/uploads/audio" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  --data '{ "type": "read_aloud", "questionId": "Q1", "ext": "webm" }'
```

Endpoint: [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:265) · If you see 401 Unauthorized, sign in at /sign-in (page file: [`app/(login)/sign-in/page.tsx`](app/%28login%29/sign-in/page.tsx:1)) and retry with your session cookie.

UI checks:

- Visit /pte/academic/practice/speaking/read-aloud → page file: [`app/pte/academic/practice/speaking/read-aloud/page.tsx`](app/pte/academic/practice/speaking/read-aloud/page.tsx:1)
- Open a question detail, record 3–5s, submit, then review Score Details and Attempts history:
  - Detail client: [`components/pte/speaking/SpeakingQuestionClient.tsx`](components/pte/speaking/SpeakingQuestionClient.tsx:1)
  - Recorder UI: [`components/pte/speaking/SpeakingRecorder.tsx`](components/pte/speaking/SpeakingRecorder.tsx:1)
  - Score dialog: [`components/pte/speaking/ScoreDetailsDialog.tsx`](components/pte/speaking/ScoreDetailsDialog.tsx:1)
  - Attempts list: [`components/pte/speaking/AttemptsList.tsx`](components/pte/speaking/AttemptsList.tsx:1)
  - Attempts API: [`app/api/speaking/attempts/route.ts`](app/api/speaking/attempts/route.ts:1)

## Deployment (Vercel)

1. Add env vars in your Vercel project:

- VERCEL_BLOB_READ_WRITE_TOKEN
- AI_TRANSCRIBE_PROVIDER
- OPENAI_API_KEY (only if using OpenAI transcription)
- DATABASE_URL (or POSTGRES_URL)

2. Run database migrations and seed for production environment:

- Use your production DATABASE_URL and run migrations (via CI step or one-off run).
- Seed data with your preferred method (e.g., repo script or admin endpoint).

3. Runtime/region:

- Works on default Node.js runtime in Vercel. No special region required.

## Troubleshooting

- 401 on attempts or uploads → Sign in at /sign-in (page file: [`app/(login)/sign-in/page.tsx`](app/%28login%29/sign-in/page.tsx:1))
- Missing VERCEL_BLOB_READ_WRITE_TOKEN → 500 from uploads: [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:58)
- MediaRecorder unsupported → try Chromium-based browser; a fallback message appears in [`components/pte/speaking/SpeakingRecorder.tsx`](components/pte/speaking/SpeakingRecorder.tsx:1)
- OpenAI transcription disabled when AI_TRANSCRIBE_PROVIDER !== "openai" → transcriber falls back to "none": [`lib/pte/transcribe.ts`](lib/pte/transcribe.ts:54)

## Reference links

- APIs: [`app/api/speaking/questions/route.ts`](app/api/speaking/questions/route.ts:1), [`app/api/speaking/questions/[id]/route.ts`](app/api/speaking/questions/[id]/route.ts:1), [`app/api/speaking/attempts/route.ts`](app/api/speaking/attempts/route.ts:1), [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:1)
- Components: [`components/pte/speaking/SpeakingQuestionClient.tsx`](components/pte/speaking/SpeakingQuestionClient.tsx:1), [`components/pte/speaking/SpeakingRecorder.tsx`](components/pte/speaking/SpeakingRecorder.tsx:1), [`components/pte/speaking/AttemptsList.tsx`](components/pte/speaking/AttemptsList.tsx:1), [`components/pte/speaking/ScoreDetailsDialog.tsx`](components/pte/speaking/ScoreDetailsDialog.tsx:1)
- Helpers: [`lib/pte/blob-upload.ts`](lib/pte/blob-upload.ts:1), [`lib/pte/transcribe.ts`](lib/pte/transcribe.ts:1)

## Vercel Deployment Notes

- Static assets: build script runs [`scripts.prepare:assets`](package.json:1) to mirror repo `asset/` into `public/asset/` before Next build. This keeps seeded prompt URLs like `/asset/...` working in production.
- Required envs: `VERCEL_BLOB_READ_WRITE_TOKEN`, `AI_TRANSCRIBE_PROVIDER`, `OPENAI_API_KEY` (if using OpenAI), `DATABASE_URL`. See [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:58) and [`drizzle.config.ts`](drizzle.config.ts:1).
- Heavy routes runtime caps: [`app/api/speaking/attempts/route.ts`](app/api/speaking/attempts/route.ts:1), [`app/api/uploads/audio/route.ts`](app/api/uploads/audio/route.ts:1), [`app/api/pte-practice/seed/route.ts`](app/api/pte-practice/seed/route.ts:1) export `runtime = 'nodejs'`, `preferredRegion = 'auto'`, and `maxDuration = 60`.
- Caching: read-only speaking question GETs set `Cache-Control: public, s-maxage=60, stale-while-revalidate=600` in [`app/api/speaking/questions/route.ts`](app/api/speaking/questions/route.ts:1) and [`app/api/speaking/questions/[id]/route.ts`](app/api/speaking/questions/%5Bid%5D/route.ts:1).
- Images: common remote providers allowed in [`next.config.ts`](next.config.ts:1).
