# Copilot Instructions: PTE Learning LMS

## Overview
**PTE Learning LMS** is a Next.js 16 SaaS for Pearson Test of English preparation. It integrates AI-driven scoring (Google Gemini), real-time voice practice (OpenAI Realtime API), and multi-section practice (Speaking, Reading, Writing, Listening) with a Drizzle ORM + PostgreSQL backend. Key architectural drivers: server-only AI keys, timing-secure sessions, and modular scoring.

## Stack & Deployment
- **Framework**: Next.js 16 (App Router) with React 19.2 Canary, Turbopack (default)
- **Database**: PostgreSQL (Neon) + Drizzle ORM with migrations in `lib/db/migrations/`
- **Auth**: Better Auth 1.3+ (email/password + OAuth)
- **Styling**: Tailwind CSS 4 + shadcn/ui + Radix UI
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/groq`)
- **Deployment**: Vercel (primary) or Railway; env checks via `pnpm deploy:check`

## Architecture Patterns

### 1. Server Actions for Scoring (Not Traditional APIs)
**Pattern**: `app/actions/score-*.ts` with `'use server'` directive and Zod schema validation.

**Example** (`app/actions/score-reading.ts`):
- Input: `{ type, userResponse, promptText, options, answerKey }`
- Output: `{ overall: number, subscores: {...}, mistakes: string[], rationale, suggestions }`
- AI Model: `gemini-1.5-flash-latest` (fast text tasks)
- Never expose `GOOGLE_GENERATIVE_AI_API_KEY` to client; call from server action only
- Return structured `generateObject` schema for type safety

**Other Scoring Actions**:
- `score-speaking.ts`: `gemini-1.5-pro-latest` for audio/transcript; subscores: `{content, pronunciation, fluency}`
- `score-writing.ts`: `gemini-1.5-flash-latest`; subscores: `{content, grammar, vocabulary, spelling}`
- `score-listening.ts`: `gemini-1.5-pro-latest` for audio tasks; subscores depend on question type

### 2. Session Tokens & Timing Validation
**Pattern**: Anti-tamper mechanism for timed practice (Read Aloud, Writing, etc.).

**Flow**:
1. Client requests session: `POST /api/attempts/session` with `{ section, questionId, durationMs }`
2. Server creates HMAC-signed token (`SessionClaims`) with `startAt`, `endAt`, `userId`
3. Token returned to client, embedded in `x-session-token` header on submit
4. On attempt POST: `validateTimingFromRequest()` verifies signature + timing window
5. Grace period (default 1s) allows small clock skew; configurable via `graceMs` option

**Key File**: `app/api/attempts/session/utils.ts` exports `validateTimingFromRequest()` for reuse.

### 3. API Routes Organization
**Pattern**: Routes are org by section (speaking, reading, writing, listening) with shared validation.

**Standard Shape**:
```typescript
// Auth: getSession() from @/lib/auth/session
// Validate: Zod schema via SafeParse
// Rate-limit: Soft limit via DB query (count attempts in last hour)
// Response: { error, code } for errors; typed JSON payload for success
```

**Key Routes**:
- `app/api/[section]/attempts/route.ts`: POST submits attempt, GET lists user attempts
- `app/api/[section]/questions/route.ts`: GET with filtering (difficulty, type, search, pagination)
- `app/api/attempts/session/route.ts`: Creates signed session tokens
- `app/api/user/profile/route.ts`: GET/PATCH user profile + target score/exam date

### 4. Authentication & Authorization
**Session Access**:
- Use `getSession()` from `lib/auth/session.ts` (cached per request)
- Returns `{ user: { id, email, name, ... }, expires }`
- Handles Better Auth cookies + fallback; works with Next.js 16 async APIs

**Server Actions vs. API Routes**:
- Server actions prefer session (automatic cookie handling)
- API routes: check `getSession()` at start; return 401 if missing

### 5. Database Schema & Queries
**Key Tables** (see `lib/db/schema.ts`):
- `users`: Better Auth managed; custom fields: `dailyAiCredits`, `aiCreditsUsed`, `organizationId`
- `[section]_questions`: Polymorphic by `question_type` enum; `isActive`, `difficulty`
- `[section]_attempts`: User submissions; `audioUrl` (Vercel Blob), `score`, `transcript`
- `userProfiles`: Target score, exam date; upserted on profile updates

**Query Helpers** (`lib/db/queries.ts`):
- `getUserProfile()`: Authenticated user's profile + progress
- `getSpeakingQuestionById()`, `listSpeakingAttemptsByUser()`: Section-specific
- Pattern: Always filter by `userId` for authorization

### 6. File Uploads & Blob Storage
**Pattern**: Use Vercel Blob for audio/media; server-side only via `upload()` from `@vercel/blob`.

**Example** (`app/actions/speaking.ts`):
```typescript
const uploaded = await upload(`speaking-${userId}-${questionId}`, formData.get('audio'), {
  access: 'public',
});
```
- Store URL in `audioUrl` column
- Prefix with `speaking-`, `writing-`, etc. for organization
- Public access; no authentication on reads (intended for playback in UI)

### 7. Component & Hook Patterns
**Server Components** (default):
- Fetch data directly via queries or `getSession()`
- Pass data to client components as props
- Example: `AttemptsListServer` (RSC) fetches data, renders `AttemptsListClient`

**Client Components** (`'use client'`):
- Use `useActionState()` for form submission via server actions
- Use `useTransition()` for async tasks without forms
- Avoid `fetch()` to API routes; prefer server actions

**Custom Hooks**:
- `useServerAction<T, R>()`: Wraps server action in `useTransition()` + state
- `useSession()` from `lib/auth/auth-client`: React client hook for auth UI

### 8. Testing & Build
**Commands**:
```bash
pnpm dev               # Start dev server (Turbopack default)
pnpm build             # Build with Turbopack (use --webpack if needed)
pnpm test              # Run Jest (coverage + watch mode)
pnpm test:ci           # CI mode (no watch, max 2 workers)
pnpm db:generate       # Create migration from schema changes
pnpm deploy:check      # Pre-deploy validation (env, API connectivity)
```

**Test Structure** (`__tests__/` and `**/*.test.ts`):
- Unit tests for actions & queries: mock Drizzle, validate schema shapes
- E2E tests (Playwright): recording → submit → score dialog flow
- Jest setup: `jest.config.js` includes `setupFilesAfterEnv` + JSDOM

### 9. Error Handling & Logging
**Pattern**: Structured error responses with optional error codes.

**API Routes**:
```typescript
function error(status: number, message: string, code?: string) {
  return NextResponse.json({ error: message, ...(code ? { code } : {}) }, { status })
}
```

**Server Actions**:
- Throw errors; Next.js serializes and returns to client
- Catch in `useActionState` or `useServerAction` for UI feedback

**Logging**:
- Use `console.error()` with context (e.g., `requestId`, section)
- Rollbar integration via `@rollbar/react`; configured in `components/providers/rollbar-provider.tsx`

### 10. Environment & Configuration
**Required Env Vars**:
- `POSTGRES_URL` or `DATABASE_URL`: Neon connection string
- `BETTER_AUTH_SECRET`: OpenSSL-generated 32-byte base64 string
- `GOOGLE_GENERATIVE_AI_API_KEY`: For Gemini scoring (server-only)
- `OPENAI_API_KEY`: For Realtime API (Speaking Coach)
- `VERCEL_BLOB_READ_WRITE_TOKEN`: Audio/media uploads

**Setup**:
```bash
pnpm env:setup        # Copy .env.example → .env.local
pnpm env:check        # Validate required vars
```

## Common Workflows

### Adding a New Scoring Action
1. Create `app/actions/score-[section].ts` with `'use server'`
2. Define Zod schema for input & output
3. Call `generateObject()` with appropriate Gemini model
4. Export typed function
5. Wire into component via `useActionState()` or direct call
6. Add unit test in `__tests__/actions/score-[section].test.ts`

### Adding an API Route
1. Create `app/api/[section]/[resource]/route.ts`
2. Validate auth via `getSession()`
3. Parse & validate request body (Zod)
4. Check rate limit if applicable
5. Call database queries
6. Return typed response or error

### Seeding & Migrations
```bash
pnpm db:generate              # After schema edits
pnpm db:migrate               # Deploy migrations
pnpm db:seed --speaking       # Seed Speaking questions
pnpm db:seed --all --reset    # Full reset + seed all sections
```

### Recording & Scoring Flow (Example: Speaking Read Aloud)
1. **UI**: `SpeakingAttempt` client component starts timer + recorder
2. **Session**: Request `POST /api/attempts/session` → get signed token
3. **Record**: Audio blob collected; auto-stop at timer expiry
4. **Submit**: Call `submitSpeakingAttempt(formData)` server action
   - Validates timing token
   - Uploads audio to Vercel Blob
   - Transcribes (e.g., via Groq Whisper)
   - Calls `scoreReadAloud()` server action → Gemini scores
   - Saves attempt + score to DB
5. **Display**: Open `ScoreDetailsModal` with subscores + transcript

## Key Files Reference
| Path | Purpose |
|------|---------|
| `lib/db/schema.ts` | Drizzle schema + enums |
| `lib/db/drizzle.ts` | DB connection singleton |
| `lib/auth/auth.ts` | Better Auth config |
| `lib/auth/session.ts` | `getSession()` helper |
| `app/api/attempts/session/utils.ts` | Timing validation + token signing |
| `components/pte/attempt/AttemptController.tsx` | Base timer + phase logic |
| `app/actions/score-*.ts` | AI scoring server actions |
| `lib/pte/speaking-score.ts` | Speaking-specific scoring logic |
| `jest.config.js` | Test configuration |

## Conventions
- **Naming**: Sections (speaking, reading, writing, listening); question types match PTE taxonomy
- **Enums**: Defined as PostgreSQL enums in schema for type safety
- **Timestamps**: Always UTC; Drizzle defaults to `now()`
- **Errors**: Use structured `{ error, code }` shape for consistency
- **Imports**: Use `@/` path alias; avoid relative imports across directories
- **Async/Await**: Use `await` for `getSession()`, migrations, and DB queries in components (Next.js 16+)

## Pitfalls & Tips
1. **API Key Exposure**: Always keep AI keys in server actions or env; never expose to client
2. **Timing Bypass**: Always validate `x-session-token` on submission; don't trust client timestamps
3. **Session Caching**: `getSession()` is cached per request; safe to call multiple times
4. **Migrations**: Run `db:generate` after schema edits, then `db:migrate` before deploying
5. **Rate Limiting**: Soft DB-based limit; consider hard limits (Redis) for production scale-up

---
**Last Updated**: November 2025 | **Next.js**: 16.0.3 | **Drizzle**: 0.43+
