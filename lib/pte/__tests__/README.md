# PTE Utils Test Suite

This directory contains comprehensive unit and integration tests for the PTE utility functions, with special focus on the `formatScoreByModule` function that was moved from `queries-enhanced.ts` to `utils.ts` to ensure client-side safety.

## Test Files

### `utils.test.ts`
Comprehensive unit tests covering:
- **countWords**: Text word counting with various edge cases
- **mediaKindFromUrl**: Media type detection from URLs
- **formatScoreByModule**: Score formatting for different PTE modules

### `utils.integration.test.ts`
Integration tests verifying:
- Client-safety (no server-only dependencies)
- Module import behavior
- Performance characteristics
- Real-world usage patterns
- TypeScript compatibility
- Error resilience

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run only PTE utils tests
pnpm test lib/pte/__tests__

# Run specific test file
pnpm test lib/pte/__tests__/utils.test.ts
```

## Test Coverage

The test suite provides comprehensive coverage for:

### formatScoreByModule Function
- ✅ All four modules (speaking, listening, reading, writing)
- ✅ Range formatting for speaking/listening (e.g., "75-80")
- ✅ Exact score formatting for reading/writing (e.g., "75")
- ✅ Null/undefined handling
- ✅ Boundary values and edge cases
- ✅ Fractional score handling
- ✅ Real-world PTE score scenarios
- ✅ Client-side safety verification

### countWords Function
- ✅ Simple and complex sentences
- ✅ Various whitespace handling
- ✅ Special characters and punctuation
- ✅ Empty strings and edge cases

### mediaKindFromUrl Function
- ✅ Audio file detection (.m4a, .mp3, .wav, .ogg)
- ✅ Video file detection (.mp4, .webm, .mov)
- ✅ Image file detection (.jpg, .jpeg, .png, .gif, .svg, .webp)
- ✅ Case-insensitive matching
- ✅ URL with query parameters and fragments
- ✅ Edge cases (empty strings, unknown extensions)

## Critical Fix Context

The `formatScoreByModule` function was moved from `lib/pte/queries-enhanced.ts` to `lib/pte/utils.ts` to fix a build error where server-only database code was being imported in client components. The comprehensive test suite ensures:

1. The function works identically after the move
2. No server-only dependencies are imported
3. All edge cases continue to work correctly
4. Performance is maintained
5. TypeScript types are preserved

## Test Philosophy

These tests follow these principles:

1. **Comprehensive Coverage**: Test happy paths, edge cases, and failure conditions
2. **Real-World Scenarios**: Include tests based on actual PTE scoring ranges
3. **Client-Safety**: Verify the function is truly client-safe
4. **Performance**: Ensure the function performs well at scale
5. **Maintainability**: Clear test names and well-organized test structure

## Future Enhancements

Potential areas for additional testing:
- Visual regression tests for score display components
- Performance benchmarks under heavy load
- Integration with actual database queries
- E2E tests with Playwright for full user flows