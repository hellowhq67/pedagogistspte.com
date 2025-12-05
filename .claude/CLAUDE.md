# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **PTE Academic & PTE Core** test preparation SaaS platform built for **pedagogistspte.com**. The application provides AI-powered scoring, mock tests, practice sessions, and comprehensive PTE learning resources.

**Critical Context**: When working on PTE-related tasks, always follow Pearson's official test formats and implement AI scoring based on machine learning principles (not LLMs) that replicate expert human judgments, focusing on individual traits: content, grammar, vocabulary, coherence, fluency, and pronunciation.

## Tech Stack

- **Framework**: Next.js 16 (App Router) - deployed on Vercel
- **Package Manager**: pnpm (>=10.23.0)
- **Node**: >=18.18
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth 1.4+ (email/password + OAuth: Google, GitHub, Facebook, Apple)
- **AI/ML**: Vercel AI SDK, AssemblyAI, OpenAI, Google AI
- **UI**: shadcn/ui, Radix UI, Tailwind CSS 4
- **State**: Zustand
- **Data Fetching**: SWR
- **File Storage**: Vercel Blob

## Essential Commands

### Development
```bash
pnpm dev              # Start dev server with Turbopack (recommended)
pnpm dev:webpack      # Use Webpack instead (fallback)
pnpm dev:debug        # Debug mode with inspector
pnpm clean && pnpm dev  # Fresh start after issues
```

### Database Operations
```bash
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Run pending migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:studio        # Open Drizzle Studio (visual DB browser)
pnpm db:seed          # Seed database with test data
pnpm db:seed:speaking # Seed speaking questions
pnpm db:seed:all      # Seed all question types
pnpm db:drop          # Drop all tables (DANGEROUS!)
```

### Build & Deploy
```bash
pnpm build            # Build for production
pnpm build:production # Clean build for production
pnpm build:analyze    # Analyze bundle size (opens HTML reports)
pnpm start            # Start production server
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm type-check       # Run TypeScript compiler checks
```

### Cleanup (Windows-optimized)
```bash
pnpm clean            # Clear .next cache
pnpm clean:hard       # Clear .next + pnpm store
pnpm clean:all        # Full cleanup + reinstall
pnpm clean:windows    # Windows-specific PowerShell cleanup
```

## Architecture Overview

### Directory Structure

```
app/
  (home)/              # Public home page
  (login)/             # Auth pages (sign-in, sign-up)
  (pte-academic)/      # Main PTE learning app (protected routes)
  api/                 # API routes
    auth/              # Better Auth endpoints (/api/auth/[...all])
    speaking/          # Speaking question & scoring APIs
    writing/           # Writing question & scoring APIs
    reading/           # Reading question APIs
    listening/         # Listening question APIs
    pte-practice/      # Practice session management
    credits/           # AI credit management
    webhooks/          # External webhooks (e.g., Polar)

components/
  ui/                  # shadcn/ui components
  pte/                 # PTE-specific components
  practice/            # Practice session components

lib/
  auth/                # Better Auth configuration
  db/
    schema.ts          # Core tables (users, sessions, accounts, practice)
    schema-mock-tests.ts  # Mock test structure
    schema-lessons.ts  # Lesson system
    drizzle.ts         # DB connection (Neon pooled)
    queries.ts         # Database queries
    migrations/        # Generated migration files
  pte/
    scoring.ts         # Mock AI scoring (to be replaced)
    scoring-rubrics.ts # PTE scoring rubrics & prompts
    scoring-deterministic.ts  # Deterministic scoring logic
    transcribe.ts      # Audio transcription (AssemblyAI)
    queries.ts         # PTE-specific DB queries
    types.ts           # PTE TypeScript types
  ai/
    scoring.ts         # AI-powered scoring logic
    provdider.ts       # AI provider configuration
    credit-tracker.ts  # AI usage tracking
  hooks/               # Custom React hooks
  store/               # Zustand stores
  subscription/        # Subscription/payment logic
```

### Database Schema

**Core Tables** (Better Auth + Custom Extensions):
- `users` - User accounts with custom fields: `dailyAiCredits`, `aiCreditsUsed`, `lastCreditReset`, `organizationId`, `role`
- `sessions` - Active user sessions
- `accounts` - OAuth provider accounts + email/password
- `verifications` - Email verification tokens

**PTE Question Tables**:
- `speaking_questions` - Speaking task prompts
- `reading_questions` - Reading comprehension & fill-in-blanks
- `writing_questions` - Essay & summarization tasks
- `listening_questions` - Listening comprehension tasks

**Practice & Scoring Tables**:
- `practice_attempts` - User practice session attempts
- `score_history` - Historical scores per attempt
- `mock_tests` - Full mock test configurations
- `mock_test_attempts` - User mock test sessions

**Question Type Enums** (PostgreSQL):
- `speaking_type`: read_aloud, repeat_sentence, describe_image, retell_lecture, answer_short_question
- `reading_question_type`: multiple_choice_single, multiple_choice_multiple, reorder_paragraphs, fill_in_blanks
- `writing_question_type`: summarize_written_text, write_essay
- `listening_question_type`: summarize_spoken_text, fill_in_blanks, write_from_dictation, etc.

### Authentication Flow

Better Auth handles all authentication. Key files:
- `lib/auth/auth.ts` - Server-side auth config
- `lib/auth/auth-client.ts` - Client-side auth utilities
- `app/api/auth/[...all]/route.ts` - Auth API endpoint

**Session Management**: Sessions are stored in PostgreSQL with cookie caching (5min TTL).

### PTE Scoring System

**Critical**: The scoring system is based on Pearson's machine learning approach:
1. **Traits Evaluated**: Content, Pronunciation, Fluency, Grammar, Vocabulary, Coherence, Spelling
2. **Scoring Range**: 0-90 for each trait (NOT 0-100)
3. **Weighted Aggregation**: Each question type has specific trait weights (see `lib/pte/scoring-rubrics.ts`)
4. **No LLM Bias**: Scoring should replicate human expert judgments, not use generic LLM scoring

**Scoring Files**:
- `lib/ai/scoring.ts` - AI-powered scoring entry point
- `lib/pte/scoring-rubrics.ts` - PTE-specific rubrics & prompts
- `lib/pte/scoring.ts` - Mock scoring (placeholder)
- `lib/pte/scoring-deterministic.ts` - Rule-based scoring algorithms

### Audio Transcription

Speaking tasks use AssemblyAI for transcription:
- File: `lib/pte/transcribe.ts`
- Upload audio to Vercel Blob → Send to AssemblyAI → Return transcript
- Configuration in `lib/ai/speach-text.ts`

## Environment Variables

Required variables (see `.env` or `.env.local`):

```bash
# Database (Neon)
POSTGRES_URL=postgresql://user:pass@host.pooler.aws.neon.tech/db?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000  # or your production URL
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI Services
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ASSEMBLYAI_API_KEY=

# Vercel Blob (file storage)
BLOB_READ_WRITE_TOKEN=
```

## Development Workflow

### First-Time Setup
1. Install dependencies: `pnpm install --force`
2. Copy env template: `cp .env.example .env.local`
3. Generate DB schema: `pnpm db:generate`
4. Run migrations: `pnpm db:migrate`
5. (Optional) Seed data: `pnpm db:seed:all`
6. Start dev server: `pnpm dev`

### Daily Development
1. Start dev server: `pnpm dev`
2. (Optional) Open DB viewer: `pnpm db:studio` in another terminal
3. Make changes, test, commit
4. Before commit: `pnpm type-check && pnpm lint:fix`

### Database Schema Changes
1. Edit `lib/db/schema.ts` or `lib/db/schema-*.ts`
2. Generate migration: `pnpm db:generate`
3. Review migration in `lib/db/migrations/`
4. Apply migration: `pnpm db:migrate` (production) or `pnpm db:push` (dev)

### Adding New PTE Questions
1. Use appropriate seed script or API endpoint
2. Follow enum types in `lib/db/schema.ts`
3. Ensure question data includes: prompt, reference text (if applicable), difficulty level, section
4. Test with practice session flow

## Performance Optimizations

This project is optimized for Windows development:
- **Turbopack**: Fast dev server (default in Next.js 16)
- **React Compiler**: Automatic memoization (enabled in `next.config.ts`)
- **pnpm Configuration**: Hard links instead of symlinks (`.pnpmrc`)
- **Memory Allocation**: 4GB for dev, 6GB for builds
- **Bundle Optimization**: Tree shaking, code splitting, package-specific imports
- **Image Optimization**: AVIF/WebP formats, responsive sizes

See `.claude/OPTIMIZATION_GUIDE.md` for full details.

## Common Issues & Solutions

### "Module not found" errors
```bash
pnpm clean:all
```

### Port 3000 already in use
```bash
taskkill /F /IM node.exe /T
pnpm dev
```

### Database connection failed
- Check `POSTGRES_URL` in `.env.local`
- Verify no spaces around `=` in env file
- Test connection: `npx tsx test-db-connection.ts`

### Build errors after dependency changes
```bash
pnpm clean:hard
pnpm install --force
pnpm build
```

## Additional Documentation

- `.claude/OPTIMIZATION_GUIDE.md` - Performance & build optimizations
- `.claude/DATABASE_SCHEMA_DOCUMENTATION.md` - Complete DB schema reference
- `README.md` - General project overview & setup
- `.claude/BatterAuth.txt` - Better Auth integration notes
- `.claude/Next JS Context.txt` - Next.js-specific context

## Important Notes

- **Windows Environment**: This project is optimized for Windows (MINGW64). Use PowerShell or Git Bash.
- **pnpm Only**: Do not use npm or yarn. The project requires pnpm >=10.23.0.
- **Drizzle Migrations**: Always use `pnpm db:generate` before `pnpm db:migrate`. Never edit migrations manually.
- **Better Auth Tables**: Do not modify `users`, `sessions`, `accounts`, `verifications` tables directly - use Better Auth APIs.
- **PTE Scoring**: Implement scoring based on Pearson's machine learning approach, not generic LLM prompts.
- **AI Credits**: Users have daily AI credit limits (`dailyAiCredits` in users table). Track usage with `lib/ai/credit-tracker.ts`.

## Testing

Currently no automated tests are configured (`pnpm test` will echo "No tests configured yet"). E2E tests can be run with:
```bash
pnpm test:e2e        # Run Playwright tests
pnpm test:e2e:ui     # Run with UI
```

## Deployment

**Platform**: Vercel (optimized with `output: 'standalone'` in `next.config.ts`)

**Deploy Process**:
1. Push to GitHub
2. Connect repo to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

**Production Checklist**:
- Set `NODE_ENV=production`
- Use production `POSTGRES_URL` (pooled connection)
- Update OAuth redirect URIs to production domain
- Set `BETTER_AUTH_URL` to production URL
- Enable security headers (already configured in `next.config.ts`)
