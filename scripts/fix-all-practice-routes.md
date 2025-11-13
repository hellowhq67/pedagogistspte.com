# Fix All Practice Routes - Complete List

## Routes to Fix

### Speaking Routes (6 types)

1. ✅ `app/pte/academic/practice/speaking/read-aloud/question/[id]/page.tsx` - FIXED
2. ⏳ `app/pte/academic/practice/speaking/repeat-sentence/question/[id]/page.tsx`
3. ⏳ `app/pte/academic/practice/speaking/describe-image/question/[id]/page.tsx`
4. ⏳ `app/pte/academic/practice/speaking/retell-lecture/question/[id]/page.tsx`
5. ⏳ `app/pte/academic/practice/speaking/answer-short-question/question/[id]/page.tsx`
6. ⏳ `app/pte/academic/practice/speaking/respond-to-situation/question/[id]/page.tsx`
7. ⏳ `app/pte/academic/practice/speaking/summarize-group-discussion/question/[id]/page.tsx`

### Writing Routes (2 types)

8. ⏳ `app/pte/academic/practice/writing/summarize-written-text/question/[id]/page.tsx`
9. ⏳ `app/pte/academic/practice/writing/write-essay/question/[id]/page.tsx`

### Reading Routes (5 types)

10. ⏳ `app/pte/academic/practice/reading/multiple-choice-single/question/[id]/page.tsx`
11. ⏳ `app/pte/academic/practice/reading/multiple-choice-multiple/question/[id]/page.tsx`
12. ⏳ `app/pte/academic/practice/reading/reorder-paragraphs/question/[id]/page.tsx`
13. ⏳ `app/pte/academic/practice/reading/fill-in-blanks/question/[id]/page.tsx`
14. ⏳ `app/pte/academic/practice/reading/reading-writing-fill-blanks/question/[id]/page.tsx`

### Listening Routes (8 types)

15. ⏳ `app/pte/academic/practice/listening/summarize-spoken-text/question/[id]/page.tsx`
16. ⏳ `app/pte/academic/practice/listening/multiple-choice-single/question/[id]/page.tsx`
17. ⏳ `app/pte/academic/practice/listening/multiple-choice-multiple/question/[id]/page.tsx`
18. ⏳ `app/pte/academic/practice/listening/fill-in-blanks/question/[id]/page.tsx`
19. ⏳ `app/pte/academic/practice/listening/highlight-correct-summary/question/[id]/page.tsx`
20. ⏳ `app/pte/academic/practice/listening/highlight-incorrect-words/question/[id]/page.tsx`
21. ⏳ `app/pte/academic/practice/listening/select-missing-word/question/[id]/page.tsx`
22. ⏳ `app/pte/academic/practice/listening/write-from-dictation/question/[id]/page.tsx`

### API Routes

23. ✅ `app/api/speaking/questions/[id]/route.ts` - FIXED
24. ⏳ `app/api/writing/questions/[id]/route.ts`
25. ⏳ `app/api/reading/questions/[id]/route.ts`
26. ⏳ `app/api/listening/questions/[id]/route.ts`

## Pattern to Apply

### For Page Components:

```typescript
// Import Suspense
import { Suspense } from 'react';

// Update params type
type Params = {
  params: Promise<{ id: string }>; // Changed from { id: string }
};

// Create async content component
async function QuestionContent({ id, section, type }: { id: string; section: string; type: string }) {
  const question = await fetchQuestion(id, section, type);
  if (!question) notFound();
  // render
}

// Main component
export default async function Page(props: Params) {
  const params = await props.params; // Await params
  const id = params.id;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <QuestionContent id={id} section="speaking" type="read_aloud" />
    </Suspense>
  );
}
```

### For API Routes:

```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await params
  const { id } = resolvedParams;
  // rest of logic
}
```

## Automation Option

Create a script to fix all at once - see implementation below.
