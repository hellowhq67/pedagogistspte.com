# PTE Academic Platform - Implementation Plan

**Date**: November 13, 2025 | **Status**: Architecture Complete | **Scope**: 3-Track Parallel Development

---

## Executive Summary

Comprehensive architectural plan for enhancing the PTE Academic platform with:

1. **Responsive Navigation**: Mobile-friendly sidebar with collapsible sections
2. **Multi-Provider AI Scoring**: OpenAI (primary) → Gemini (backup) → Vercel SDK (fallback)
3. **Authentic Exam Timing**: PTE-spec timers for all question types

---

## Current Architecture Assessment

### Existing Strengths

- ✅ Better Auth integration with user profiles
- ✅ Comprehensive Drizzle ORM schema (7 speaking types, reading/writing/listening attempts)
- ✅ Speaking system mature (audio, transcription, scoring)
- ✅ API structure established for all sections
- ✅ Subscription tier system (Free/Pro/Premium)

### Critical Gaps

- ❌ Sidebar not mobile-responsive
- ❌ Dashboard lacks target score/exam date integration
- ❌ Writing/Reading/Listening UI incomplete
- ❌ No question-level PTE timers
- ❌ Single AI provider (OpenAI only)
- ❌ Attempt submission incomplete for Writing/Reading/Listening
- ❌ No unified review pages with AI feedback

---

## Architecture: Three Parallel Development Tracks

### Track 1: Database & Multi-Provider AI System (Weeks 1-2)

#### Database Enhancements

```sql
-- Add to pte_user_exam_settings or create new config
ALTER TABLE user_profiles ADD COLUMN study_phase TEXT DEFAULT 'intermediate';
CREATE TABLE pte_ai_scoring_config (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_type TEXT,
  preferred_provider TEXT DEFAULT 'openai',
  temperature DECIMAL(3,2) DEFAULT 0.3
);
```

#### Multi-Provider Architecture

**Provider Selection Logic**:

- **Speaking/Writing**: OpenAI GPT-4o → Gemini → Vercel
- **Reading/Listening**: Gemini → OpenAI → Vercel
- **Fallback**: Heuristic scoring (existing system)

**Files to Create**:

- `lib/pte/ai-scoring/provider-abstraction.ts` - Base interface
- `lib/pte/ai-scoring/openai-provider.ts` - OpenAI implementation
- `lib/pte/ai-scoring/gemini-provider.ts` - Gemini implementation
- `lib/pte/ai-scoring/vercel-provider.ts` - Vercel SDK wrapper
- `lib/pte/ai-scoring/scoring-orchestrator.ts` - Fallback orchestrator
- `lib/pte/ai-scoring/scoring-criteria.ts` - PTE rubrics

**Orchestrator Flow**:

```
Request → Try Primary Provider
         ├─ Success? Return ✓
         └─ Failure? Try Secondary
            ├─ Success? Return ✓
            └─ Failure? Try Tertiary
               ├─ Success? Return ✓
               └─ Failure? Use Heuristic
```

#### Scoring Criteria (0-90 Point Scale)

**Speaking**:

- Pronunciation (30%): native-like → clear → understandable → unclear
- Fluency (30%): smooth → mostly smooth → hesitant → broken
- Content (40%): comprehensive → good → adequate → limited

**Writing**:

- Task Response (25%)
- Grammar & Accuracy (25%)
- Vocabulary Range (25%)
- Coherence & Discourse (25%)

**Reading/Listening**:

- Comprehension (60%)
- Accuracy (40%)

---

### Track 2: Responsive UI & Dashboard (Weeks 1-2)

#### Sidebar Component (`components/pte/sidebar/`)

**Structure**:

```typescript
// Mobile: Slide-out drawer (Radix UI Sheet)
// Tablet: Collapsible sidebar
// Desktop: Always visible with collapsible sections

SidebarItem: {
  title: 'Dashboard' | 'Practice' | 'Community' | etc.
  href: string
  icon: ReactNode
  collapsible?: boolean
  items?: SidebarItem[]
}
```

**Files**:

- `academic-sidebar-responsive.tsx` - Main component
- `sidebar-section-group.tsx` - Collapsible groups
- `sidebar-mobile-drawer.tsx` - Mobile drawer
- `sidebar-item.tsx` - Individual items

#### Dashboard Enhancements (`components/pte/dashboard/`)

**New Widgets**:

- `target-score-editor.tsx` - Inline edit with validation (10-90)
- `exam-date-editor.tsx` - Date picker with countdown
- `progress-gap-chart.tsx` - Visual gap to target (gauge/bar)
- `practice-recommendations.tsx` - Adaptive suggestions
- `study-statistics.tsx` - Real-time stats based on exam date

**Integration**:

- Load from `user_profiles` table
- Save updates to profile
- Use `examDate` for adaptive filtering

---

### Track 3: Question Implementation & Timing (Weeks 2-5)

#### Writing Questions

**Components** (`components/pte/writing/`):

- `essay-editor.tsx` - Rich text editor (Lexical/TipTap)
- `summarize-text-editor.tsx` - Summary text box
- `writing-timer.tsx` - Question-specific countdown
- `WritingQuestionClient.tsx` - Enhanced main component
- `WritingFeedbackDisplay.tsx` - AI feedback renderer

**Features**:

- Real-time word count (display only, no hard limit)
- Auto-save drafts
- Timer: 20 min essay / 10 min summary
- Submission validation

**API** (`app/api/writing/attempts/route.ts`):

```typescript
POST /api/writing/attempts
Body: {
  questionId: string,
  essayText: string,
  wordCount: number,
  timeTaken: number,
  questionType: 'write_essay' | 'summarize_written_text'
}
Response: { attemptId, score, feedback, ... }
```

#### Reading Questions

**Components** (`components/pte/reading/`):

- `reading-text-with-selection.tsx` - Interactive text box
- `reading-question-handler.tsx` - Question type router
- `reading-timer.tsx` - Section-wide timer
- `ReadingQuestionClient.tsx` - Enhanced
- `ReadingFeedbackDisplay.tsx` - Feedback display

**Features**:

- Text highlighting (multiple colors)
- Fill-in-the-blank inputs
- Multiple choice (single/multiple)
- Reorder paragraphs drag-drop
- Shared section timer (29 min total)
- Read-only transcripts

**API** (`app/api/reading/attempts/route.ts`):

```typescript
POST /api/reading/attempts
Body: {
  questionId: string,
  selectedAnswers: string[],
  highlightedText?: string,
  timeTaken: number,
  questionType: string
}
```

#### Listening Questions

**Components** (`components/pte/listening/`):

- `audio-player-enhanced.tsx` - Play/pause/speed controls
- `listening-timer.tsx` - Audio-synced countdown
- `ListeningQuestionClient.tsx` - Enhanced
- `ListeningFeedbackDisplay.tsx` - Feedback

**Features**:

- Play/pause/replay/fast-forward controls
- Playback speed (0.75x, 1x, 1.25x)
- Optional transcript display
- Auto-advance after timer expires
- Audio-synced timer

**API** (`app/api/listening/attempts/route.ts`):

```typescript
POST /api/listening/attempts
Body: {
  questionId: string,
  userTranscript?: string,
  selectedAnswers: string[],
  timeTaken: number
}
```

#### Timer System (`lib/pte/timing/`)

**PTE Timing Constants**:

```typescript
read_aloud: { prep: 35s, record: 40s }
repeat_sentence: { record: 15s }
describe_image: { prep: 25s, record: 40s }
retell_lecture: { prep: 10s, record: 40s }
answer_short_question: { record: 10s }
summarize_group_discussion: { prep: 20s, record: 60s }
respond_to_situation: { prep: 20s, record: 40s }
summarize_written_text: { 10 min total }
write_essay: { 20 min total }
reading_section: { 29 min total }
listening_section: { 30 min total }
```

**Files**:

- `timer-manager.ts` - Start/pause/resume logic
- `pte-timers.ts` - Timing constants
- `timer-state.ts` - Persistence layer
- `question-timer.tsx` - Countdown component
- `section-timer.tsx` - Section progress

**Features**:

- Server-authoritative timing (anti-cheat)
- Client-side countdown display
- Persistent state on interruption
- Auto-advance when time expires
- Audio warnings at 10s, 5s, 1s

---

## Implementation Sequence

### Phase 1: Foundation (Weeks 1-2)

- [ ] Database migrations for config tables
- [ ] Provider abstraction layer
- [ ] OpenAI/Gemini/Vercel adapters
- [ ] Scoring orchestrator with fallback
- [ ] Responsive sidebar component
- [ ] Dashboard widget components

### Phase 2: AI Integration (Weeks 2-3)

- [ ] Integrate orchestrator into Speaking
- [ ] Test with all question types
- [ ] Provider performance metrics
- [ ] Error handling & recovery
- [ ] Update API routes for multi-provider

### Phase 3: Question UI (Weeks 3-5)

- [ ] Writing: rich editor + timer
- [ ] Reading: text selection + timer
- [ ] Listening: audio player + timer
- [ ] All feedback displays
- [ ] Unified submission handler

### Phase 4: Polish (Week 5-6)

- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Final integration testing

---

## API Routes Summary

**Scoring**:

- `POST /api/ai-scoring/score` - Multi-provider scoring
- `POST /api/ai-scoring/provider-config` - Set preference
- `GET /api/ai-scoring/credits` - Check status

**Writing**:

- `POST /api/writing/attempts` - Submit essay
- `GET /api/writing/attempts` - List with filtering

**Reading**:

- `POST /api/reading/attempts` - Submit answers
- `GET /api/reading/attempts` - List attempts

**Listening**:

- `POST /api/listening/attempts` - Submit answers
- `GET /api/listening/playback-config` - Audio settings

**Dashboard**:

- `GET /api/dashboard/summary` - Stats & settings
- `PATCH /api/dashboard/settings` - Update profile
- `GET /api/dashboard/recommendations` - Adaptive suggestions

**Timing**:

- `POST /api/timing/start-question` - Initialize timer
- `POST /api/timing/update-state` - Persist state

---

## File Creation Summary

### New Components (15)

```
components/pte/sidebar/[4 files]
components/pte/dashboard/[5 files]
components/pte/timing/[2 files]
components/pte/scoring/[2 files]
components/pte/attempt/[2 files]
```

### New Libraries (14)

```
lib/pte/ai-scoring/[6 files]
lib/pte/timing/[3 files]
lib/pte/exam-date/[3 files]
lib/db/migrations/[2 files]
```

### New API Routes (8)

```
app/api/ai-scoring/[3 routes]
app/api/dashboard/[3 routes]
app/api/timing/[2 routes]
```

### Enhanced Files (8)

```
lib/pte/ai-feedback.ts
lib/pte/speaking-score.ts
lib/pte/scoring.ts
lib/subscription/credits.ts
components/pte/academic-sidebar.tsx
app/pte/dashboard/page.tsx
app/api/writing/attempts/route.ts
app/api/reading/attempts/route.ts
```

---

## Success Metrics

**Technical**:

- AI scoring latency < 5 seconds (p95)
- Provider fallback success > 99%
- Timer accuracy ±100ms
- Mobile sidebar responsive all viewports

**UX**:

- Mobile practice completion +40%
- Users find features in < 3s
- 90% rate AI feedback as helpful
- Question completion +25%

**Operational**:

- Track provider success rates
- Monitor fallback frequency
- Measure AI credit efficiency

---

## Critical Dependencies & Risks

| Risk                | Mitigation                      |
| ------------------- | ------------------------------- |
| AI provider latency | Queue-based async scoring       |
| Timer sync issues   | Server-authoritative validation |
| Mobile performance  | Progressive enhancement         |
| Database migration  | Backup + test script            |

---

## Technology Stack

**Frontend**: Next.js 15, React 19, shadcn/ui, Tailwind  
**Backend**: Node.js, PostgreSQL, Drizzle ORM  
**AI**: OpenAI, Google Gemini, Vercel AI SDK  
**Audio**: OpenAI Whisper, Web Audio API  
**Deployment**: Vercel

---

## Next Steps

1. ✅ Architecture analysis complete
2. ⏳ Database migration design
3. ⏳ Provider implementation (OpenAI → Gemini → Vercel)
4. ⏳ Component development (sidebar → dashboard → questions)
5. ⏳ Integration testing & optimization

**Estimated Timeline**: 6-8 weeks for full rollout
