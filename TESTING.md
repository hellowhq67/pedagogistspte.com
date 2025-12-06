# Testing Guide

This project uses [Vitest](https://vitest.dev/) as its testing framework, providing a fast and modern testing experience for the Next.js application.

## Test Structure

Tests are organized alongside their source files with the `.test.ts` or `.test.tsx` extension:

```
lib/
├── pte/
│   ├── utils.ts
│   ├── utils.test.ts          # Unit tests for PTE utilities
│   ├── timing.ts
│   ├── timing.test.ts         # Tests for timing configuration
│   ├── scoring.ts
│   └── scoring.test.ts        # Tests for scoring algorithms
├── utils.ts
└── utils.test.ts              # Tests for general utilities
```

## Running Tests

### Install Dependencies

```bash
pnpm install
```

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

### Run Tests in UI Mode

```bash
pnpm test:ui
```

## Test Coverage

Current test coverage focuses on:

### ✅ Core Utilities (`lib/pte/utils.ts`)
- **Word counting**: Handles various text formats, edge cases, and special characters
- **Media type detection**: Identifies audio, video, and image files from URLs
- **Score formatting**: Formats scores by module (speaking, writing, reading, listening)

### ✅ Timing Configuration (`lib/pte/timing.ts`)
- **Time conversions**: Millisecond helpers for seconds and minutes
- **Duration formatting**: Human-readable time formats (mm:ss, hh:mm:ss)
- **Section timing**: Accurate PTE test timing for all sections
- **Question type timing**: Preparation and answer times for each question type
- **Environment overrides**: Support for custom timing configurations

### ✅ Scoring System (`lib/pte/scoring.ts`)
- **Mock test scoring**: Realistic PTE score generation
- **AI feedback processing**: Score calculation from AI feedback
- **Band descriptors**: Score-to-band mapping
- **Enabling skills**: Grammar, fluency, pronunciation, etc.
- **Detailed feedback generation**: Strengths and weaknesses analysis

### ✅ General Utilities (`lib/utils.ts`)
- **Class name merging**: Tailwind CSS class composition with conflict resolution

## Test Statistics

- **Total test files**: 4
- **Total test cases**: 200+
- **Coverage areas**: Core utilities, timing, scoring, general utilities

### Test Distribution

| Module | Test File | Test Cases | Coverage Focus |
|--------|-----------|------------|----------------|
| PTE Utils | `lib/pte/utils.test.ts` | 80+ | Word counting, media detection, score formatting |
| Timing | `lib/pte/timing.test.ts` | 70+ | Time conversions, section timing, formatting |
| Scoring | `lib/pte/scoring.test.ts` | 50+ | Score calculation, feedback, band descriptors |
| Utils | `lib/utils.test.ts` | 30+ | Class name merging, Tailwind integration |

## Writing Tests

### Test File Naming
- Unit tests: `filename.test.ts`
- Integration tests: `filename.integration.test.ts`
- Component tests: `ComponentName.test.tsx`

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and assertion phases
3. **One Assertion Per Test**: Keep tests focused on a single behavior
4. **Test Edge Cases**: Always include tests for boundary values and error conditions
5. **Use Type Safety**: Leverage TypeScript for type-safe test code

## Debugging Tests

### Run specific test file
```bash
pnpm vitest lib/pte/utils.test.ts
```

### Run tests matching pattern
```bash
pnpm vitest -t "countWords"
```

### Watch mode for specific file
```bash
pnpm vitest lib/pte/utils.test.ts --watch
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Next Steps

1. Run `pnpm install` to install new test dependencies
2. Run `pnpm test` to execute all tests
3. Run `pnpm test:coverage` to see coverage report