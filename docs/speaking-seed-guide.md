# Speaking Questions Seeding Guide

## Overview

This guide documents the speaking questions seeding infrastructure for the PTE Academic practice system.

## Question Counts by Type

All speaking seed files are located in `lib/db/seeds/` and contain properly formatted JSON data.

| Question Type              | File                                       | Questions | Status          |
| -------------------------- | ------------------------------------------ | --------- | --------------- |
| Read Aloud                 | `speaking.read_aloud.json`                 | 10        | ✅ Verified     |
| Repeat Sentence            | `speaking.repeat_sentence.json`            | 10        | ✅ Verified     |
| Describe Image             | `speaking.describe_image.json`             | 10        | ✅ Verified     |
| Retell Lecture             | `speaking.retell_lecture.json`             | 10        | ✅ Verified     |
| Answer Short Question      | `speaking.answer_short_question.json`      | 10        | ✅ Verified     |
| Summarize Group Discussion | `speaking.summarize_group_discussion.json` | 10        | ✅ Verified     |
| Respond to a Situation     | `speaking.respond_to_a_situation.json`     | 10        | ✅ Verified     |
| **TOTAL**                  | **7 files**                                | **70**    | ✅ **Complete** |

## Seeding Methods

### Method 1: CLI Command

Direct database seeding using the seed script:

```bash
# Seed speaking questions only
npx tsx lib/db/seed.ts --speaking

# Seed speaking with reset (clear existing first)
npx tsx lib/db/seed.ts --speaking --reset

# Seed all sections
npx tsx lib/db/seed.ts --all

# Seed with limit per type
npx tsx lib/db/seed.ts --speaking --limit=5
```

### Method 2: API Endpoint - Speaking Only

**Endpoint:** `POST /api/speaking/seed`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "reset": false,
  "limitPerType": null
}
```

**Response:**

```json
{
  "success": true,
  "result": {
    "inserted": 70,
    "insertedByType": {
      "read_aloud": 10,
      "repeat_sentence": 10,
      "describe_image": 10,
      "retell_lecture": 10,
      "answer_short_question": 10,
      "summarize_group_discussion": 10,
      "respond_to_a_situation": 10
    }
  },
  "message": "Seeded 70 speaking questions"
}
```

### Method 3: Unified API Endpoint - All Sections

**Endpoint:** `POST /api/seed-all`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "sections": ["speaking", "reading", "writing", "listening"],
  "reset": false,
  "limitPerType": null
}
```

**Parameters:**

- `sections` (optional): Array of sections to seed. Default: all sections
- `reset` (optional): Boolean to clear existing data first. Default: false
- `limitPerType` (optional): Number to limit questions per type. Default: no limit

**Response:**

```json
{
  "success": true,
  "results": {
    "speaking": {
      "inserted": 70,
      "insertedByType": { ... }
    },
    "reading": {
      "inserted": 25,
      "insertedByType": { ... }
    },
    "writing": {
      "inserted": 15,
      "insertedByType": { ... }
    },
    "listening": {
      "inserted": 30,
      "insertedByType": { ... }
    }
  },
  "message": "Seeded 140 total questions across 4 section(s)",
  "sectionsProcessed": ["speaking", "reading", "writing", "listening"]
}
```

## Implementation Details

### Seed Function

The `seedSpeakingQuestions()` function in [`lib/db/seed.ts`](../lib/db/seed.ts):

- Loads all 7 speaking question type files
- Handles duplicates gracefully using title + type matching
- Normalizes media URLs and difficulty levels
- Returns detailed statistics per question type
- Supports limiting questions per type

### Duplicate Handling

Questions are considered duplicates if they have the same:

- `type` field
- `title` field

Existing questions are skipped without error.

### Media URL Normalization

The seed function automatically:

- Converts backslashes to forward slashes
- Ensures local assets start with `/asset/`
- Preserves external URLs (http/https)

### Error Handling

- Individual file failures don't stop the entire seeding process
- Missing or invalid JSON files are logged as warnings
- The function continues processing remaining files

## Testing Results

Successfully tested with CLI:

```bash
npx tsx lib/db/seed.ts --speaking --reset
```

**Result:**

```
[seed] Reset completed.
[seed] Completed with summaries: {
  "speaking": {
    "inserted": 70,
    "insertedByType": {
      "read_aloud": 10,
      "repeat_sentence": 10,
      "describe_image": 10,
      "retell_lecture": 10,
      "answer_short_question": 10,
      "summarize_group_discussion": 10,
      "respond_to_a_situation": 10
    }
  }
}
```

## Question Data Structure

Each speaking question follows this structure:

```typescript
{
  "title": string,           // Unique identifier with type
  "type": SpeakingType,      // One of 7 types
  "promptText": string?,     // Text prompt (optional)
  "promptMediaUrl": string?, // Audio/image URL (optional)
  "difficulty": string,      // "Easy" | "Medium" | "Hard"
  "tags": string[]          // For filtering/categorization
}
```

## Files Created/Modified

### Created Files:

1. ✅ [`app/api/speaking/seed/route.ts`](../app/api/speaking/seed/route.ts) - Speaking seed API endpoint
2. ✅ [`app/api/seed-all/route.ts`](../app/api/seed-all/route.ts) - Unified seeding endpoint
3. ✅ [`docs/speaking-seed-guide.md`](speaking-seed-guide.md) - This documentation
4. ✅ [`scripts/test-seed.ts`](../scripts/test-seed.ts) - Test script for seed endpoints

### Verified Files:

1. ✅ [`lib/db/seed.ts`](../lib/db/seed.ts) - Core seed functions (already complete)
2. ✅ All 7 speaking seed JSON files - Properly formatted

## Next Steps

To use the seeding system:

1. **For Development:** Use CLI commands for quick local seeding
2. **For Production:** Use API endpoints for controlled, authenticated seeding
3. **For Testing:** Run individual section seeds to verify specific types

## Notes

- The seed function is idempotent - running it multiple times won't create duplicates
- All speaking question types are consistently loaded from their respective JSON files
- The system follows the same pattern as reading, writing, and listening sections
- Media files referenced must exist in the `/asset` directory for local files
