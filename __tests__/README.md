# Test Suite

This directory contains comprehensive tests for the PTE practice application.

## Quick Start

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## Test Organization

Tests are organized by module and co-located with source files:
- `lib/pte/__tests__/` - Core PTE utilities and scoring
- `lib/subscription/__tests__/` - Subscription and practice limits
- `lib/ai/__tests__/` - AI credit tracking
- `app/api/**/__tests__/` - API schemas and validation

## Coverage Report

After running tests with coverage, open `coverage/lcov-report/index.html` in a browser to view the detailed coverage report.

## Documentation

See [TEST_SUITE_DOCUMENTATION.md](../TEST_SUITE_DOCUMENTATION.md) for comprehensive documentation.