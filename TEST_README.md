# Test Suite Documentation

## Overview

This test suite provides comprehensive unit tests for the PTE (Pearson Test of English) practice application, focusing on the utilities and components modified in the recent commit that fixed the build error by moving `formatScoreByModule` to a client-safe utils file.

## Test Coverage

### 1. `lib/pte/__tests__/utils.test.ts` (488 lines)

Tests for pure utility functions in `lib/pte/utils.ts`:

#### `countWords` Function
- **Happy Path Tests:**
  - Simple sentences with multiple words
  - Sentences with punctuation
  - Hyphenated words
  
- **Edge Cases:**
  - Empty strings
  - Single words
  - Multiple spaces between words
  - Leading/trailing whitespace
  - Newlines and tabs
  - Numbers and special characters
  
- **Failure Conditions:**
  - Very long strings (10,000+ words)
  - Unicode and emoji characters
  - Special characters only

#### `mediaKindFromUrl` Function
- **Audio Files:** `.m4a`, `.mp3`, `.wav`, `.ogg`
- **Video Files:** `.mp4`, `.webm`, `.mov`
- **Image Files:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`
- **Edge Cases:**
  - Empty/null/undefined URLs
  - Files without extensions
  - Complex URLs with query parameters
  - Multiple dots in filenames
  - Case sensitivity

#### `formatScoreByModule` Function
- **Speaking Module:** Formats scores as ranges (e.g., 75-80)
- **Listening Module:** Formats scores as ranges (e.g., 60-65)
- **Reading Module:** Formats exact scores (e.g., 75)
- **Writing Module:** Formats exact scores (e.g., 82)
- **Null/Undefined Handling:** Returns "N/A"
- **Range Calculation Logic:** Validates boundary conditions
- **Cross-Module Consistency:** Tests same score across different modules
- **Type Safety:** Validates all module types
- **Pure Function Properties:** Tests determinism

### 2. `components/pte/__tests__/universal-question-page.test.tsx` (602 lines)

Tests for the React component `components/pte/universal-question-page.tsx`:

#### Rendering Tests
- Question title, description, and prompt text
- Difficulty badges (Easy, Medium, Hard)
- Practice area children
- Instructions, tips, and scoring criteria
- Statistics display (scores and practice counts)

#### `formatScoreByModule` Integration Tests
- Speaking scores displayed as ranges (75-80, 80-85)
- Listening scores displayed as ranges (60-65, 85-90)
- Reading scores displayed as exact values (75, 82)
- Writing scores displayed as exact values (67, 79)
- N/A display for null scores
- Practice count formatting with commas

#### Audio Functionality Tests
- Play button rendering
- Audio playback on button click
- Playing state display
- Error handling for audio playback failures

#### Bookmark Functionality Tests
- Bookmark button rendering
- Filled/unfilled icon states
- Toggle callback invocation
- State transitions

#### Navigation Tests
- Back button rendering and functionality
- Question type formatting in navigation text

#### Skip Functionality Tests
- Conditional Skip button rendering
- Skip callback invocation

#### Loading State Tests
- Skeleton rendering
- Content hiding during loading

#### Error State Tests
- Error message display
- Go Back button in error state
- Content hiding on error

#### Edge Cases
- Missing or empty tips/criteria arrays
- Very long prompt text
- Zero and large practice counts
- Number formatting

#### Accessibility Tests
- ARIA labels for interactive elements
- Proper heading hierarchy

## Running Tests

### Install Dependencies

First, ensure all testing dependencies are installed:

```bash
npm install --save-dev jest ts-jest @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event identity-obj-proxy
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test -- lib/pte/__tests__/utils.test.ts
```

### Run Tests for a Specific Module

```bash
npm test -- --testPathPattern=utils
```

## Test Configuration

### `jest.config.js`

- **Test Environment:** `jsdom` for React component tests
- **Transform:** `ts-jest` for TypeScript files
- **Module Mapping:** Resolves `@/` paths to project root
- **Setup File:** `jest.setup.js` for global test configuration
- **Coverage Thresholds:** 70% for branches, functions, lines, and statements

### `jest.setup.js`

Configures the test environment:
- Imports `@testing-library/jest-dom` for custom matchers
- Mocks `window.matchMedia` for responsive design tests
- Mocks `IntersectionObserver` for lazy loading tests

## Key Testing Patterns

### Pure Function Testing

All utility functions are tested for:
1. **Determinism:** Same input always produces same output
2. **No Side Effects:** Functions don't modify external state
3. **Edge Cases:** Boundary conditions and unexpected inputs
4. **Type Safety:** Proper TypeScript type handling

### Component Testing

React components are tested for:
1. **Rendering:** Correct output for various prop combinations
2. **User Interactions:** Click, input, and navigation events
3. **State Management:** Loading, error, and success states
4. **Integration:** Proper usage of utility functions
5. **Accessibility:** ARIA labels and semantic HTML

## Critical Fix Tested

The test suite validates the fix implemented in commit `f81405d`:

### Problem
- `formatScoreByModule` was in `queries-enhanced.ts` which imports database code
- This caused "server-only cannot be imported from Client Component" error
- `universal-question-page.tsx` (client component) couldn't import it

### Solution
- Moved `formatScoreByModule` to `lib/pte/utils.ts` (no database imports)
- Updated `universal-question-page.tsx` to import from utils
- Function is now client-safe and can be used in browser

### Tests Validate
1. ✅ `formatScoreByModule` works correctly in isolation (utils.test.ts)
2. ✅ Component correctly imports and uses the function (universal-question-page.test.tsx)
3. ✅ All module types (speaking, listening, reading, writing) format correctly
4. ✅ Edge cases (null scores, boundary values) handled properly
5. ✅ Function remains pure and deterministic

## Discrepancy Note

There is a **discrepancy** between the two implementations of `formatScoreByModule`:

### `lib/pte/utils.ts` (NEW - Client-safe)
```typescript
// Speaking & Listening: 75 → "75-80"
// Reading & Writing: 75 → "75"
```

### `lib/pte/queries-enhanced.ts` (OLD - Server-only)
```typescript
// Speaking & Writing: 75 → "75/90"
// Reading & Listening: 75 → "75%"
```

**The tests are written for the NEW implementation in `utils.ts`** which is being used by the client components. The old implementation in `queries-enhanced.ts` should likely be removed or updated to use the new version.

## Coverage Goals

The test suite aims for:
- **Line Coverage:** >70%
- **Branch Coverage:** >70%
- **Function Coverage:** >70%
- **Statement Coverage:** >70%

Current coverage for tested files should be near 100% as tests cover:
- All code paths
- All edge cases
- All error conditions
- All user interactions

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- --coverage --ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Future Test Additions

Consider adding:
1. Integration tests for the entire practice flow
2. E2E tests using Playwright (already installed)
3. Visual regression tests for UI components
4. Performance tests for heavy calculations
5. Tests for the duplicate `formatScoreByModule` in `queries-enhanced.ts`

## Maintenance

When updating the code:
1. **Update tests first (TDD)** or alongside code changes
2. **Ensure all tests pass** before committing
3. **Maintain coverage thresholds** above 70%
4. **Add tests for new edge cases** discovered in production
5. **Remove tests** only when removing corresponding features

## Troubleshooting

### Common Issues

**Tests fail with module resolution errors:**
```bash
# Clear Jest cache
npm test -- --clearCache
```

**TypeScript errors in tests:**
```bash
# Ensure tsconfig.json includes test files
# Check jest.config.js transform settings
```

**Component tests fail with "not wrapped in act(...)":**
```bash
# Use waitFor from @testing-library/react
# Ensure async operations are properly awaited
```

**Coverage not generated:**
```bash
# Run with coverage flag explicitly
npm test -- --coverage --verbose
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)