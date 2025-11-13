# PTE Mock Test System - Implementation Summary

## ✅ Completed Components

### 1. Database Schema

**File**: `lib/db/migrations/0007_add_mock_test_system.sql`

- Mock tests table (200 tests)
- Mock test questions (polymorphic links)
- Mock test attempts with scoring
- Mock test answers
- AI credit logs
- Practice locks table
- User subscription fields

### 2. Subscription Tier System

**File**: `lib/subscription/tiers.ts`

- Free tier: 1 mock test, limited practice, 10 AI credits/day
- Pro tier: All 200 tests, unlimited practice & AI
- Premium tier: Pro + priority scoring + study plans

### 3. AI Credit Management

**File**: `lib/subscription/credits.ts`

- Daily credit tracking and reset
- Auto-scored vs AI-scored questions
- Credit usage enforcement
- Status checking and reporting

### 4. Practice Locks System

**File**: `lib/subscription/practice-locks.ts`

- Daily attempt tracking per question type
- Lock enforcement for free users
- Stats and analytics

### 5. Mock Test Generator

**File**: `lib/mock-tests/generator.ts`

- Generate 200 unique mock tests
- Official PTE question distribution
- Difficulty-based test organization
- Random question selection

### 6. Documentation

**Files**:

- `docs/MOCK_TEST_IMPLEMENTATION.md` - Complete system architecture
- `docs/IMPLEMENTATION_SUMMARY.md` - This file

## 🔧 Next Steps to Complete

### Step 1: Run Migration

```bash
# Run the migration to create new tables
npm run db:migrate

# OR using custom script
npx tsx scripts/migrate.ts
```

### Step 2: Generate Mock Tests

Create file: `scripts/generate-mock-tests.ts`

```typescript
import { generateAllMockTests } from '@/lib/mock-tests/generator';

async function main() {
  try {
    await generateAllMockTests();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```

Run:

```bash
npx tsx scripts/generate-mock-tests.ts
```

### Step 3: Update User Schema in Code

Add to `lib/db/schema.ts`:

```typescript
export const users = pgTable("users", {
  // ... existing fields
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  mockTestsTaken: integer("mock_tests_taken").default(0),
  lastMockTestAt: timestamp("last_mock_test_at"),
});
```

### Step 4: Create Mock Test API Routes

#### `/app/api/mock-tests/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { auth } from '@/lib/auth/server';
import { sql } from 'drizzle-orm';
import { canAccessMockTest } from '@/lib/subscription/tiers';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's subscription tier
  const userResult = await db.execute(sql`
    SELECT subscription_tier FROM users WHERE id = ${session.user.id}
  `);

  const subscriptionTier = (userResult.rows[0] as any)?.subscription_tier || 'free';

  // Get available mock tests
  const tests = await db.execute(sql`
    SELECT
      id,
      test_number,
      title,
      description,
      difficulty,
      duration,
      total_questions,
      is_free
    FROM mock_tests
    WHERE status = 'published'
    ORDER BY test_number ASC
  `);

  // Filter tests based on subscription
  const availableTests = (tests.rows as any[]).filter((test) =>
    canAccessMockTest(subscriptionTier, test.test_number)
  );

  return NextResponse.json(availableTests);
}
```

#### `/app/api/mock-tests/[id]/start/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { auth } from '@/lib/auth/server';
import { sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mockTestId = params.id;

  // Check if user has access
  // ... (add access check logic)

  // Create new attempt
  const attempt = await db.execute(sql`
    INSERT INTO mock_test_attempts (
      user_id,
      mock_test_id,
      status,
      current_question_index
    ) VALUES (
      ${session.user.id},
      ${mockTestId},
      'in_progress',
      0
    )
    RETURNING id
  `);

  const attemptId = (attempt.rows[0] as any).id;

  // Get test questions
  const questions = await db.execute(sql`
    SELECT
      id,
      question_id,
      question_type,
      section,
      order_index,
      time_limit
    FROM mock_test_questions
    WHERE mock_test_id = ${mockTestId}
    ORDER BY order_index ASC
  `);

  return NextResponse.json({
    attemptId,
    questions: questions.rows,
  });
}
```

#### `/app/api/mock-tests/[id]/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { auth } from '@/lib/auth/server';
import { withCreditCheck } from '@/lib/subscription/credits';
import { sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { attemptId, questionId, questionType, userResponse, audioUrl } =
    await request.json();

  // Save answer
  const answer = await db.execute(sql`
    INSERT INTO mock_test_answers (
      attempt_id,
      question_id,
      question_type,
      user_response,
      audio_url
    ) VALUES (
      ${attemptId},
      ${questionId},
      ${questionType},
      ${JSON.stringify(userResponse)},
      ${audioUrl}
    )
    RETURNING id
  `);

  // Check if AI scoring is needed
  const needsAiScoring = ['speaking', 'writing'].includes(questionType);

  let scores = null;
  if (needsAiScoring) {
    try {
      scores = await withCreditCheck(
        session.user.id,
        questionType,
        async () => {
          // Call AI scoring service
          return await scoreResponse(questionId, userResponse, audioUrl);
        }
      );

      // Update answer with scores
      await db.execute(sql`
        UPDATE mock_test_answers
        SET scores = ${JSON.stringify(scores)}, is_scored = TRUE
        WHERE id = ${(answer.rows[0] as any).id}
      `);
    } catch (error) {
      // No AI credits - answer saved but not scored
      console.log('No AI credits available');
    }
  } else {
    // Auto-score reading/listening
    scores = await autoScore(questionId, userResponse);
    await db.execute(sql`
      UPDATE mock_test_answers
      SET scores = ${JSON.stringify(scores)}, is_scored = TRUE
      WHERE id = ${(answer.rows[0] as any).id}
    `);
  }

  return NextResponse.json({ success: true, scores });
}

async function scoreResponse(questionId: string, response: any, audioUrl?: string) {
  // TODO: Implement AI scoring
  return { score: 0 };
}

async function autoScore(questionId: string, response: any) {
  // TODO: Implement auto-scoring
  return { score: 0 };
}
```

### Step 5: Create Mock Test UI Components

#### `/components/mock-test/test-simulator.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Timer } from './timer';
import { QuestionRenderer } from './question-renderer';
import { TestNavigation } from './navigation';

export function MockTestSimulator({ attemptId, questions }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(7200); // 120 minutes

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = async (answer: any) => {
    // Save answer to DB
    await fetch(`/api/mock-tests/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        attemptId,
        questionId: currentQuestion.question_id,
        questionType: currentQuestion.question_type,
        userResponse: answer,
      }),
    });

    setAnswers({ ...answers, [currentIndex]: answer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Timer timeRemaining={timeRemaining} />

      <QuestionRenderer
        question={currentQuestion}
        onSubmit={handleSubmitAnswer}
        savedAnswer={answers[currentIndex]}
      />

      <TestNavigation
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        answeredQuestions={Object.keys(answers).map(Number)}
      />
    </div>
  );
}
```

### Step 6: Create Subscription Comparison Page

#### `/app/pricing/page.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { TIER_PRICING, TIER_FEATURES_DISPLAY } from '@/lib/subscription/tiers';

export default function PricingPage() {
  const tiers = ['free', 'pro', 'premium'];

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => {
          const pricing = TIER_PRICING[tier as keyof typeof TIER_PRICING];
          const features = TIER_FEATURES_DISPLAY[tier as keyof typeof TIER_FEATURES_DISPLAY];

          return (
            <Card key={tier} className="p-8">
              <h3 className="text-2xl font-bold capitalize mb-2">{tier}</h3>
              <div className="text-3xl font-bold mb-6">
                {pricing.displayPrice}
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full" variant={tier === 'pro' ? 'default' : 'outline'}>
                {tier === 'free' ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 7: Add Practice Locks to Existing Practice Pages

Add this to your practice page components:

```typescript
import { checkPracticeLock } from '@/lib/subscription/practice-locks';

// In your component:
const lockStatus = await checkPracticeLock(
  userId,
  'speaking',
  'read_aloud',
  userTier
);

if (!lockStatus.canPractice) {
  // Show upgrade prompt
  return <UpgradePrompt message={lockStatus.reason} />;
}
```

## 📊 Admin Commands

### Generate all 200 mock tests:

```bash
npx tsx scripts/generate-mock-tests.ts
```

### Regenerate specific test:

```typescript
import { regenerateMockTest } from '@/lib/mock-tests/generator';
await regenerateMockTest(50); // Regenerate test #50
```

### Reset user practice locks:

```typescript
import { resetUserPracticeLocks } from '@/lib/subscription/practice-locks';
await resetUserPracticeLocks(userId);
```

## 🧪 Testing Checklist

- [ ] Migration runs successfully
- [ ] 200 mock tests generated
- [ ] Free users can access test #1 only
- [ ] Free users limited to 10 AI credits/day
- [ ] Practice locks work correctly
- [ ] AI credit reset at midnight
- [ ] Pro users have unlimited access
- [ ] Test timer works correctly
- [ ] Scores calculated properly
- [ ] Test history displays correctly

## 🚀 Deployment

1. Run migration in production DB
2. Generate 200 mock tests
3. Update environment variables
4. Deploy API routes
5. Test subscription tiers
6. Monitor AI credit usage

## 📈 Analytics to Track

- Mock tests completed per tier
- AI credit usage patterns
- Conversion rate (free → pro)
- Most accessed mock tests
- Average completion time
- Practice question popularity

## 🔐 Security Considerations

- Validate user tier before granting access
- Rate limit API endpoints
- Secure audio file uploads
- Sanitize user responses
- Log credit usage for audit

## 💡 Future Enhancements

- Payment integration (Stripe)
- Study plan generator
- Teacher review system
- Mobile app
- Offline mode
- Social features (compare scores)
- Certificates for completion
- Referral system
