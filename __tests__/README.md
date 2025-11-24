# Unit Tests

This directory contains comprehensive unit tests for the PTE Academic application.

## Test Coverage

### Core Utilities (`lib/utils`)
- **utils.test.ts**: Tests for the `cn()` className merging utility
  - Tailwind CSS class merging
  - Conditional classes
  - Complex scenarios

### PTE Utilities (`lib/pte`)
- **pte-utils.test.ts**: Tests for PTE-specific utility functions
  - `countWords()`: Word counting with various edge cases
  - `mediaKindFromUrl()`: Media type detection from URLs

- **timing.test.ts**: Tests for PTE timing calculations
  - Millisecond conversion helpers (`ms.s()`, `ms.m()`)
  - Duration formatting (`format()`)
  - Section-specific timing (`timingFor()`)
  - Time calculations (`endAtFrom()`, `driftMs()`)
  - Label formatting (`formatLabel()`)
  - November 2025 PTE updates

- **scoring-normalize.test.ts**: Tests for scoring normalization functions
  - Score clamping and scaling
  - Accuracy and WER conversion
  - Weighted overall calculations
  - Subscore normalization

- **scoring-deterministic.test.ts**: Tests for deterministic scoring algorithms
  - Reading: MCQ Single/Multiple, Fill Blanks, Reorder Paragraphs
  - Listening: Write From Dictation
  - WER (Word Error Rate) calculations
  - Levenshtein distance

### AI Credit Tracking (`lib/ai`)
- **credit-tracker.test.ts**: Tests for AI cost calculations
  - OpenAI pricing (GPT-4o, GPT-4o-mini, Whisper, Realtime)
  - Gemini pricing (Pro, Flash)
  - Cost comparisons and efficiency analysis
  - Edge cases and precision

## Running Tests

### Install Dependencies

```bash
# Install test dependencies
pnpm add -D ts-jest @types/jest

# Or using npm
npm install --save-dev ts-jest @types/jest
```

### Run All Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Run Specific Tests

```bash
# Run a specific test file
pnpm test utils.test.ts

# Run tests matching a pattern
pnpm test --testNamePattern="timing"

# Run tests for a specific directory
pnpm test __tests__/lib/pte/
```

## Test Structure

Each test file follows this structure:

```typescript
describe('module name', () => {
  describe('function name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = ...
      
      // Act
      const result = functionUnderTest(input)
      
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

## Key Testing Principles

1. **Pure Functions First**: Focus on testing pure functions and business logic
2. **Comprehensive Coverage**: Test happy paths, edge cases, and failure conditions
3. **Clear Test Names**: Use descriptive test names that explain what's being tested
4. **Isolated Tests**: Each test should be independent and not rely on others
5. **Mock External Dependencies**: Database, API calls, and filesystem operations are mocked

## Mocking

### Server-Only Modules

Files with `'server-only'` import are mocked:

```typescript
jest.mock('server-only', () => ({}))
```

### Database Operations

Database operations are mocked to avoid actual DB calls:

```typescript
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    // Mock database methods
  },
}))
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Adding New Tests

When adding new tests:

1. Create a new file in the appropriate directory following the naming convention: `*.test.ts`
2. Import the functions you want to test
3. Write comprehensive test cases covering:
   - Happy path
   - Edge cases
   - Error conditions
   - Boundary values
4. Run tests locally before committing
5. Ensure tests pass in CI/CD

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Pushes to main branch
- Pre-commit hooks (optional)

## Debugging Tests

```bash
# Run tests with node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run a single test file with debugging
pnpm test --runInBand --no-cache utils.test.ts
```

## Future Test Additions

Potential areas for additional test coverage:
- API route handlers (integration tests)
- React components (with React Testing Library)
- Database queries (with test database)
- End-to-end tests (with Playwright)