# PTE Mock Test System - Complete Guide

## 🎯 Overview

This system provides a complete PTE Academic mock test simulation with:

- **200 Full-Length Mock Tests** (based on real PTE Academic format)
- **Subscription Tiers** (Free, Pro, Premium)
- **AI Scoring with Daily Limits** (10/day for free users)
- **Practice Section Locks** (limited practice for free users)
- **Test History & Analytics**

## 📁 Created Files

### Core System Files

```
lib/
├── subscription/
│   ├── tiers.ts                    ✅ Tier definitions & limits
│   ├── credits.ts                  ✅ AI credit management
│   └── practice-locks.ts           ✅ Practice attempt limits
├── mock-tests/
│   └── generator.ts                ✅ Mock test generator
└── db/
    └── migrations/
        └── 0007_add_mock_test_system.sql  ✅ Database schema

scripts/
└── generate-mock-tests.ts          ✅ Generator script

app/
├── pricing/
│   └── page.tsx                    ✅ Pricing page
└── api/
    └── mock-tests/                 ⏳ To be created
        ├── route.ts
        ├── [id]/
        │   ├── start/route.ts
        │   ├── submit/route.ts
        │   └── complete/route.ts

docs/
├── MOCK_TEST_IMPLEMENTATION.md     ✅ Full architecture
└── IMPLEMENTATION_SUMMARY.md       ✅ Step-by-step guide
```

## 🚀 Quick Start

### Step 1: Run Database Migration

```bash
# Option 1: Using drizzle-kit
npx drizzle-kit push

# Option 2: Manual SQL execution
psql -U your_username -d your_database -f lib/db/migrations/0007_add_mock_test_system.sql
```

### Step 2: Update Schema TypeScript Types

Add these fields to your `users` table in `lib/db/schema.ts`:

```typescript
export const users = pgTable("users", {
  // ... existing fields
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  mockTestsTaken: integer("mock_tests_taken").default(0),
  lastMockTestAt: timestamp("last_mock_test_at"),
});
```

### Step 3: Generate 200 Mock Tests

```bash
# Generate all 200 tests
npx tsx scripts/generate-mock-tests.ts

# Or generate a specific test
npx tsx scripts/generate-mock-tests.ts 1
```

This will:

- Create 200 unique mock tests
- Assign random questions from your question bank
- Follow official PTE Academic structure
- Set test #1 as free, others as paid

### Step 4: Test the System

```bash
# Check database
psql -d your_database -c "SELECT COUNT(*) FROM mock_tests;"
# Should return 200

psql -d your_database -c "SELECT test_number, title, is_free FROM mock_tests LIMIT 5;"
```

## 💡 Usage Examples

### Check User's Subscription Tier

```typescript
import { getTierConfig, canAccessMockTest } from '@/lib/subscription/tiers';

const userTier = 'free'; // or 'pro', 'premium'
const config = getTierConfig(userTier);

// Check if user can access test #50
const canAccess = canAccessMockTest(userTier, 50);
// Free: false, Pro/Premium: true
```

### Check AI Credits

```typescript
import { getCreditStatus, canUseAiScoring } from '@/lib/subscription/credits';

// Get current credit status
const status = await getCreditStatus(userId);
console.log(status);
// {
//   total: 10,
//   used: 3,
//   remaining: 7,
//   resetsAt: Date
// }

// Check if user can use AI scoring
const check = await canUseAiScoring(userId, 'speaking');
if (!check.allowed) {
  console.log(check.reason); // "Not enough AI credits..."
}
```

### Check Practice Locks

```typescript
import { checkPracticeLock } from '@/lib/subscription/practice-locks';

const lockStatus = await checkPracticeLock(
  userId,
  'speaking',
  'read_aloud',
  'free'
);

if (!lockStatus.canPractice) {
  // Show upgrade prompt
  console.log(lockStatus.reason);
  // "Daily limit reached. You can practice 3 times per day. Resets at midnight."
}
```

## 📊 Subscription Tiers

### Free Tier

- ✅ 1 Free Mock Test (#1)
- ✅ Limited Practice (3-5 per question type/day)
- ✅ 10 AI Scoring Credits/Day
- ✅ Basic Test History
- ✅ 2 Section Tests per Type

### Pro Tier ($29/month)

- ✅ All 200 Mock Tests
- ✅ Unlimited Practice
- ✅ Unlimited AI Scoring
- ✅ Full Test History
- ✅ Detailed Analytics
- ✅ Download Reports

### Premium Tier ($49/month)

- ✅ Everything in Pro
- ✅ Priority AI Scoring
- ✅ Personalized Study Plans
- ✅ Teacher Review Access
- ✅ Advanced Analytics

## 🎯 Mock Test Structure

Each test follows official PTE Academic format:

### Part 1: Speaking & Writing (54-67 min)

- Read Aloud: 6-7 questions
- Repeat Sentence: 10-12 questions
- Describe Image: 3-4 questions
- Re-tell Lecture: 1-2 questions
- Answer Short Question: 5-6 questions
- Summarize Written Text: 2-3 questions
- Essay: 1-2 questions

### Part 2: Reading (29-30 min)

- Reading & Writing Fill Blanks: 5-6 questions
- Multiple Choice (Multiple): 2-3 questions
- Re-order Paragraphs: 2-3 questions
- Fill in Blanks: 4-5 questions
- Multiple Choice (Single): 2-3 questions

### Part 3: Listening (30-43 min)

- Summarize Spoken Text: 2-3 questions
- Multiple Choice (Multiple): 2-3 questions
- Fill in Blanks: 2-3 questions
- Highlight Correct Summary: 2-3 questions
- Multiple Choice (Single): 2-3 questions
- Select Missing Word: 2-3 questions
- Highlight Incorrect Words: 2-3 questions
- Write from Dictation: 3-4 questions

**Total: 63-79 questions per test**

## 🔧 API Endpoints (To Implement)

### Mock Tests

```
GET    /api/mock-tests              # List available tests
GET    /api/mock-tests/[id]         # Get test details
POST   /api/mock-tests/[id]/start   # Start new attempt
POST   /api/mock-tests/[id]/submit  # Submit answer
POST   /api/mock-tests/[id]/pause   # Pause test
POST   /api/mock-tests/[id]/complete # Complete test
GET    /api/mock-tests/history      # Get user's history
```

### Credits & Limits

```
GET    /api/credits/status          # Get AI credit status
GET    /api/practice/limits         # Get practice limits
POST   /api/practice/record         # Record practice attempt
```

### Subscription

```
GET    /api/subscription/status     # Get subscription details
POST   /api/subscription/upgrade    # Upgrade subscription
```

## 🧪 Testing

### Test Mock Test Generation

```bash
# Generate test #1
npx tsx scripts/generate-mock-tests.ts 1

# Verify in database
psql -d your_db -c "SELECT * FROM mock_tests WHERE test_number = 1;"
psql -d your_db -c "SELECT COUNT(*) FROM mock_test_questions WHERE mock_test_id = (SELECT id FROM mock_tests WHERE test_number = 1);"
```

### Test Subscription Tiers

```typescript
// In your test file
import { canAccessMockTest } from '@/lib/subscription/tiers';

console.log(canAccessMockTest('free', 1));    // true
console.log(canAccessMockTest('free', 50));   // false
console.log(canAccessMockTest('pro', 50));    // true
```

### Test AI Credits

```typescript
import { useAiCredit, getCreditStatus } from '@/lib/subscription/credits';

// Use a credit
const success = await useAiCredit(userId);
console.log(success); // true if available

// Check status
const status = await getCreditStatus(userId);
console.log(status.remaining); // 9 (if started with 10)
```

## 📝 Next Steps

1. **Implement API Routes** (see `docs/IMPLEMENTATION_SUMMARY.md`)
2. **Create UI Components**
   - Mock test simulator
   - Timer component
   - Question renderer
   - Progress tracker

3. **Add Payment Integration**
   - Stripe or Paddle
   - Subscription management
   - Webhooks for renewals

4. **Implement AI Scoring**
   - Connect to OpenAI/Claude API
   - Score speaking responses
   - Score writing responses
   - Generate feedback

5. **Build Analytics Dashboard**
   - Score trends
   - Weak areas identification
   - Progress tracking
   - Study recommendations

## 🔐 Security Notes

- ✅ Validate subscription tier before granting access
- ✅ Rate limit API endpoints
- ✅ Sanitize all user inputs
- ✅ Secure audio file uploads
- ✅ Log all credit usage
- ✅ Encrypt sensitive data

## 📈 Monitoring

Track these metrics:

- Mock tests started vs completed
- AI credit usage patterns
- Free → Pro conversion rate
- Most popular mock tests
- Average completion time
- Practice question engagement

## 🐛 Troubleshooting

### Mock tests not generating

- Ensure your question tables have enough questions
- Check database connection
- Verify migration ran successfully

### Credits not resetting

- Check timezone settings
- Verify `lastCreditReset` field updates
- Check cron job or middleware execution

### Practice locks not working

- Verify `practice_locks` table exists
- Check date comparison logic
- Ensure proper indexing

## 📞 Support

For implementation help:

1. Check `docs/MOCK_TEST_IMPLEMENTATION.md`
2. Review `docs/IMPLEMENTATION_SUMMARY.md`
3. See API examples in summary doc

## 🎉 Success Checklist

- [ ] Migration completed
- [ ] 200 mock tests generated
- [ ] Pricing page accessible
- [ ] Free users limited correctly
- [ ] AI credits working
- [ ] Practice locks enforced
- [ ] Tests accessible by tier
- [ ] Payment integration (optional)
- [ ] Analytics tracking (optional)

---

**Built with Next.js 15, Drizzle ORM, Better Auth, and PostgreSQL**
