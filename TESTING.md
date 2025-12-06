# Testing Guide

This document provides comprehensive information about the testing infrastructure and practices for the PTE Learning SaaS Platform.

## Overview

The project uses **Jest** as the primary testing framework with the following setup:

- **Framework**: Jest 29.x
- **Environment**: Node.js (for server-side code)
- **Configuration**: `jest.config.js`
- **Setup**: `jest.setup.js`

### Test Coverage

Current test coverage includes:

- ✅ **Utility Functions** (`lib/utils.ts`, `lib/pte/utils.ts`)
- ✅ **Business Logic** (`lib/subscription/credits.ts`)
- ✅ **Cache Management** (`lib/cache.ts`)
- ✅ **Parsers** (`lib/parsers.ts`)
- ✅ **Mock Test Generator** (`lib/mock-tests/generator.ts`)

## Getting Started

### Prerequisites

```bash
# Install dependencies
pnpm install
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

Tests are organized using the `__tests__` directory pattern co-located with source files.

## Available Scripts

- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:ci` - Run tests in CI mode

## Writing Tests

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive names
2. **Arrange-Act-Assert**: Structure tests with clear phases
3. **Test Edge Cases**: Include tests for null, undefined, empty values
4. **Avoid Test Interdependence**: Tests should not depend on each other

## Contributing

When adding new features:

1. Write tests before or alongside implementation
2. Ensure all tests pass: `pnpm test`
3. Check coverage: `pnpm test:coverage`

---

**Last Updated**: December 2024