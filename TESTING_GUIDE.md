# Testing Guide

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm test            # Run tests
pnpm test:coverage   # Coverage report
```

## Test Files

- `lib/pte/__tests__/utils.test.ts` - Core PTE utility tests
- `lib/pte/__tests__/utils.integration.test.ts` - Integration tests
- `lib/__tests__/utils.test.ts` - General utility tests
- `lib/pte/__tests__/format-score-migration.test.ts` - Migration tests

## Key Functions Tested

### formatScoreByModule
```typescript
formatScoreByModule(75, 'speaking')   // "75-80"
formatScoreByModule(75, 'reading')    // "75"
formatScoreByModule(null, 'writing')  // "N/A"
```

### countWords
```typescript
countWords("Hello world")  // 2
```

### mediaKindFromUrl
```typescript
mediaKindFromUrl("audio.mp3")  // "audio"
```

### cn (className merger)
```typescript
cn('px-4', 'px-8')  // "px-8"
```

## Coverage Target

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Documentation

- `lib/pte/__tests__/README.md` - Detailed test docs
- `TEST_IMPLEMENTATION_SUMMARY.md` - Implementation summary

---

**Total Tests**: 164+  
**Coverage**: 70%+  
**Status**: ✅ Ready