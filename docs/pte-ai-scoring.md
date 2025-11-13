# Production-Grade AI Scoring System

## Overview

This document describes the AI-powered scoring system for PTE Academic practice responses. The system provides:

- **Provider Orchestration**: Intelligent selection and fallback between OpenAI, Gemini, and Vercel AI SDK
- **Hybrid Scoring**: Deterministic objective scoring + LLM-driven subjective feedback
- **Pearson-Aligned Rubrics**: Score dimensions matching official PTE criteria (0–90 scale per dimension)
- **Robust Error Handling**: Timeouts, failures, and graceful degradation across providers

## Architecture

### Key Components

1. **Providers** (`lib/ai/providers/`)
   - [`openai.ts`](../lib/ai/providers/openai.ts): Wraps OpenAI SDK for Speaking, Writing scoring
   - [`gemini.ts`](../lib/ai/providers/gemini.ts): Wraps Google Generative AI for fast extraction and explanation
   - [`vercel.ts`](../lib/ai/providers/vercel.ts): Optional Vercel AI SDK abstraction layer

2. **Orchestrator** ([`lib/ai/orchestrator.ts`](../lib/ai/orchestrator.ts))
   - Central dispatcher that selects providers based on section and task type
   - Implements deterministic-first logic for objective tasks
   - Handles timeouts, fallbacks, and result merging

3. **Rubrics & Normalization**
   - [`scoring-rubrics.ts`](../lib/pte/scoring-rubrics.ts): Prompt builders and weight mappings
   - [`scoring-normalize.ts`](../lib/pte/scoring-normalize.ts): Normalization to 0–90 scale
   - [`scoring-deterministic.ts`](../lib/pte/scoring-deterministic.ts): Objective task scorers

4. **APIs** (`app/api/ai-scoring/`)
   - `/models` – Provider health check and configuration status
   - `/score` – Unified scoring endpoint
   - `/speaking`, `/writing`, `/reading`, `/listening` – Convenience endpoints

## Provider Priority & Fallback

### Default Strategy

**Speaking / Writing** (Subjective):

1. **OpenAI** (gpt-4o-mini) – Primary for nuanced scoring
2. **Gemini** (1.5-flash, fallback to 1.5-pro) – Fast backup
3. **Vercel** (mapped via `ai` SDK) – Tertiary option
4. **Heuristic** – Last resort (not yet fully implemented)

**Reading / Listening** (Mostly Objective):

1. **Deterministic** (first choice) – Exact match, WER, pairwise order
2. **Gemini** (1.5-flash) – Fast extraction/classification
3. **OpenAI** (gpt-4o-mini) – Fallback explanation
4. **Vercel** – Tertiary

### Override via Environment

```bash
# Comma-separated priority list: openai,gemini,vercel,heuristic
PTE_SCORING_PROVIDER_PRIORITY=openai,gemini

# Per-provider timeout (milliseconds, default 8000)
PTE_SCORING_TIMEOUT_MS=10000
```

## Environment Variables

### Required

```bash
# OpenAI for Speaking/Writing scoring and Whisper transcription
OPENAI_API_KEY=sk-...

# Gemini for Reading/Listening explanations
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### Optional

```bash
# Vercel AI SDK (if using ai package; reuses keys above if not provided)
VERCEL_AI_API_KEY=

# Override Vercel AI model strings
VERCEL_AI_OPENAI_MODEL=openai:gpt-4o-mini
VERCEL_AI_GEMINI_MODEL=google:gemini-1.5-flash

# Orchestrator configuration
PTE_SCORING_PROVIDER_PRIORITY=openai,gemini
PTE_SCORING_TIMEOUT_MS=8000
```

## Supported Models

| Provider  | Speaking/Writing | Reading/Listening            | Notes                              |
| --------- | ---------------- | ---------------------------- | ---------------------------------- |
| OpenAI    | gpt-4o-mini      | gpt-4o-mini                  | Production-ready, 0.15 max tokens  |
| Gemini    | 1.5-flash        | 1.5-flash (1.5-pro fallback) | Cost-efficient, supports JSON mode |
| Vercel AI | Mapped via `ai`  | Mapped via `ai`              | Abstraction layer, optional        |

## Request/Response Schemas

### Unified Score Endpoint

**POST** `/api/ai-scoring/score`

#### Request

```typescript
{
  section: 'SPEAKING' | 'WRITING' | 'READING' | 'LISTENING',
  questionType: string, // e.g., "repeat_sentence", "write_essay", "multiple_choice_single"
  attemptId?: string,  // optional, for tracing
  userId?: string,     // optional, for tracing
  includeRationale?: boolean, // default: false (adds LLM explanation for objective tasks)
  payload: {...},      // task-specific payload (see below)
  providerPriority?: ['openai', 'gemini'], // override global priority
  timeoutMs?: number,  // override default timeout
}
```

#### Response

```typescript
{
  result: {
    overall: number,                    // 0–90 PTE score
    subscores: Record<string, number>,  // dimension scores (0–90)
    rationale?: string,                 // brief explanation if requested
    metadata?: Record<string, any>      // e.g., { providers: [...] }
  },
  trace: {
    section: string,
    questionType: string,
    attemptId?: string,
    userId?: string,
    providerPriority?: string[],
    durationMs: number,
    timestamp: string
  }
}
```

### Task-Specific Payloads

#### Speaking

```typescript
{
  payload: {
    transcript?: string,        // transcribed text (if audio already transcribed)
    audioUrl?: string,         // URL to audio (auto-transcribed if available)
    referenceText?: string,    // reference text for tasks like "Read Aloud"
  }
}
```

**Subscores**: `content`, `pronunciation`, `fluency`, `grammar`, `vocabulary`

#### Writing

```typescript
{
  payload: {
    text: string,      // essay or summary text
    prompt?: string,   // prompt or source material
  }
}
```

**Subscores**: `content`, `structure`, `coherence`, `grammar`, `vocabulary`, `spelling`

#### Reading (Deterministic + Optional LLM)

```typescript
{
  payload: {
    // For deterministic scoring:
    selectedOption?: string,         // MCQ single
    selectedOptions?: string[],      // MCQ multiple
    correctOption?: string,
    correctOptions?: string[],
    answers?: Record<string, string>, // fill in blanks
    correct?: Record<string, string>,
    order?: number[],                 // reorder paragraphs
    userOrder?: number[],
    correctOrder?: number[],
    // For explanation (if includeRationale):
    question?: string,
    options?: string[],
  }
}
```

**Subscores**: `correctness` (for objective tasks)

#### Listening (Deterministic WFD + Optional LLM)

```typescript
{
  payload: {
    // For Write from Dictation (deterministic):
    targetText?: string,   // ground truth sentence
    userText?: string,     // user's typed sentence
    // For explanation:
    transcript?: string,   // reference transcript
  }
}
```

**Subscores**: `correctness`, `wer` (word-error rate as score 0–90)

### Error Response

```typescript
{
  error: {
    code: string,        // e.g., "invalid_request", "provider_timeout", "internal_error"
    message: string
  },
  meta?: {
    durationMs: number
  }
}
```

## Deterministic Scoring Coverage

Objective tasks are scored via exact match or algorithmic logic:

| Task Type                      | Coverage | Method                                    |
| ------------------------------ | -------- | ----------------------------------------- |
| Reading MCQ Single             | 100%     | Exact match (case/punctuation normalized) |
| Reading MCQ Multiple           | 100%     | Partial credit: `(TP - FP) / Correct`     |
| Reading Fill in Blanks         | 100%     | Per-blank exact match; fraction accuracy  |
| Reading & Writing FIB          | 100%     | Per-blank exact match                     |
| Reading Reorder Paragraphs     | 100%     | Pairwise order agreement ratio            |
| Listening Write from Dictation | 100%     | Levenshtein WER → 0–90 score              |

Subjective tasks use LLM scoring:

| Task Type            | Provider       | Model       |
| -------------------- | -------------- | ----------- |
| Speaking (all types) | OpenAI primary | gpt-4o-mini |
| Writing (all types)  | OpenAI primary | gpt-4o-mini |

Optional LLM explanations for objective tasks via `includeRationale: true`.

## Subscores & Weights

### Speaking (0–90 each dimension)

- **Content** (40%) – Relevance, completeness, clarity
- **Pronunciation** (30%) – Clarity of articulation
- **Fluency** (20%) – Smoothness, pacing, natural rhythm
- **Grammar** (5%) – Correctness of sentence structure
- **Vocabulary** (5%) – Word choice and variety

### Writing (0–90 each dimension)

- **Content** (35%) – Relevance, development, completeness
- **Structure** (15%) – Organization, paragraph logic
- **Coherence** (15%) – Flow, transitions, linking
- **Grammar** (15%) – Sentence accuracy, subject–verb agreement
- **Vocabulary** (10%) – Word choice, appropriacy
- **Spelling** (10%) – Orthographic accuracy

### Reading & Listening

- **Correctness** (100% for Reading, 70% for Listening) – Accuracy ratio
- **WER** (0% for Reading, 30% for Listening) – Word error rate (Listening WFD only)

## Example Curl Requests

### Health Check

```bash
curl https://example.com/api/ai-scoring/models \
  -H "Content-Type: application/json"
```

Response:

```json
{
  "providers": [
    { "name": "openai", "ok": true, "model": "gpt-4o-mini", "latencyMs": 234 },
    {
      "name": "gemini",
      "ok": true,
      "model": "gemini-1.5-flash",
      "latencyMs": 456
    },
    { "name": "vercel", "ok": false, "error": "sdk_or_api_key_missing" }
  ],
  "env": {
    "OPENAI_API_KEY": "sk-***",
    "GOOGLE_GENERATIVE_AI_API_KEY": "AIza***"
  },
  "meta": {
    "timestamp": "2025-11-13T14:17:00Z",
    "note": "Keys are redacted..."
  }
}
```

### Score Speaking Attempt

```bash
curl -X POST https://example.com/api/ai-scoring/score \
  -H "Content-Type: application/json" \
  -d '{
    "section": "SPEAKING",
    "questionType": "repeat_sentence",
    "attemptId": "attempt_123",
    "userId": "user_456",
    "includeRationale": true,
    "payload": {
      "transcript": "The quick brown fox jumps over the lazy dog.",
      "referenceText": "The quick brown fox jumps over the lazy dog."
    }
  }'
```

Response:

```json
{
  "result": {
    "overall": 78,
    "subscores": {
      "content": 80,
      "pronunciation": 75,
      "fluency": 78,
      "grammar": 76,
      "vocabulary": 77
    },
    "rationale": "Clear delivery with good rhythm. Minor pronunciation variations on 'fox' and light hesitation mid-response.",
    "metadata": {
      "providers": [
        {
          "provider": "openai",
          "model": "gpt-4o-mini",
          "latencyMs": 1234,
          "timestamp": "2025-11-13T14:17:10Z",
          "requestId": "chatcmpl-..."
        }
      ]
    }
  },
  "trace": {
    "section": "SPEAKING",
    "questionType": "repeat_sentence",
    "attemptId": "attempt_123",
    "userId": "user_456",
    "durationMs": 1250,
    "timestamp": "2025-11-13T14:17:10Z"
  }
}
```

### Score Reading MCQ (Deterministic)

```bash
curl -X POST https://example.com/api/ai-scoring/reading \
  -H "Content-Type: application/json" \
  -d '{
    "section": "READING",
    "questionType": "multiple_choice_multiple",
    "attemptId": "att_789",
    "includeRationale": true,
    "payload": {
      "selectedOptions": ["A", "B"],
      "correctOptions": ["A", "B"],
      "question": "Which statements are true?",
      "options": ["A", "B", "C", "D"]
    }
  }'
```

Response:

```json
{
  "result": {
    "overall": 90,
    "subscores": {
      "correctness": 90
    },
    "rationale": "All correct answers were selected with no false positives.",
    "metadata": {
      "providers": [
        {
          "provider": "deterministic",
          "task": "READING_MCQ_MULTIPLE",
          "tp": 2,
          "fp": 0,
          "correctCount": 2
        }
      ]
    }
  },
  "trace": {
    "section": "READING",
    "questionType": "multiple_choice_multiple",
    "attemptId": "att_789",
    "durationMs": 5,
    "timestamp": "2025-11-13T14:17:11Z"
  }
}
```

### Score Listening WFD (Deterministic)

```bash
curl -X POST https://example.com/api/ai-scoring/listening \
  -H "Content-Type: application/json" \
  -d '{
    "section": "LISTENING",
    "questionType": "write_from_dictation",
    "attemptId": "att_321",
    "payload": {
      "targetText": "The meeting is scheduled for tomorrow afternoon.",
      "userText": "The meeting is schedule for tomorrow afternoon."
    }
  }'
```

Response:

```json
{
  "result": {
    "overall": 86,
    "subscores": {
      "correctness": 86,
      "wer": 86
    },
    "rationale": "WER=0.143; accuracy≈0.857 (1 word-level edit: 'is scheduled' vs 'is schedule').",
    "metadata": {
      "providers": [
        {
          "provider": "deterministic",
          "task": "LISTENING_WFD",
          "refLen": 7,
          "edits": 1
        }
      ]
    }
  },
  "trace": {
    "section": "LISTENING",
    "questionType": "write_from_dictation",
    "attemptId": "att_321",
    "durationMs": 8,
    "timestamp": "2025-11-13T14:17:12Z"
  }
}
```

### Score Writing Essay

```bash
curl -X POST https://example.com/api/ai-scoring/writing \
  -H "Content-Type: application/json" \
  -d '{
    "section": "WRITING",
    "questionType": "write_essay",
    "includeRationale": true,
    "payload": {
      "text": "Education is fundamental to societal progress. When individuals gain knowledge and skills, they contribute more meaningfully to their communities. Furthermore, educated populations are better equipped to address challenges such as climate change and healthcare...",
      "prompt": "Do you agree that education is the most important factor in a country'"'"'s development?"
    }
  }'
```

Response:

```json
{
  "result": {
    "overall": 72,
    "subscores": {
      "content": 74,
      "structure": 70,
      "coherence": 71,
      "grammar": 72,
      "vocabulary": 73,
      "spelling": 72
    },
    "rationale": "Well-developed ideas with clear topic sentences. Good use of transitional phrases. Minor inconsistency in tense usage; otherwise strong grammar.",
    "metadata": {
      "providers": [
        {
          "provider": "openai",
          "model": "gpt-4o-mini",
          "latencyMs": 2100,
          "timestamp": "2025-11-13T14:17:15Z"
        }
      ]
    }
  },
  "trace": {
    "section": "WRITING",
    "questionType": "write_essay",
    "durationMs": 2150,
    "timestamp": "2025-11-13T14:17:15Z"
  }
}
```

## Integration with Attempt APIs

After an attempt is saved to the database, you can trigger scoring:

```typescript
// Example integration point in attempt submission flow
import { scoreWithOrchestrator } from '@/lib/ai/orchestrator';
import { TestSection } from '@/lib/pte/types';

const scoreResult = await scoreWithOrchestrator({
  section: TestSection.SPEAKING,
  questionType: 'repeat_sentence',
  payload: {
    transcript: userTranscript,
    referenceText: question.referenceText,
  },
  includeRationale: true,
});

// Store normalized score in database
await db.insert(scoring_results).values({
  attempt_id: attemptId,
  overall: scoreResult.overall,
  subscores: scoreResult.subscores,
  rationale: scoreResult.rationale,
  metadata: scoreResult.metadata,
});
```

## Security & Observability

### Input Validation

- All requests validated via Zod schemas (`app/api/ai-scoring/schemas.ts`)
- Payload sizes bounded; text fields capped at reasonable limits
- API keys redacted in health endpoint responses

### Error Handling

- Timeout enforcement (default 8s per provider call)
- Graceful fallback to next provider on failure
- No credential leakage in error messages
- Structured JSON error responses with codes

### Logging & Tracing

- Minimal logs; no PII in logs
- Trace metadata includes provider, model, latency, request ID
- Timestamps in ISO 8601 format

## Backward Compatibility

- No breaking changes to existing attempt submission APIs
- Scoring is opt-in via separate endpoints
- Attempt system continues to work without AI scoring enabled

## Future Enhancements

- Batch scoring endpoint for efficiency
- Streaming transcription for real-time feedback
- Custom rubric overrides per organization
- Caching of LLM responses (with PII sanitization)
- Analytics dashboard for scoring patterns
