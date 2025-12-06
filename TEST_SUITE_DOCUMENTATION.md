# Test Suite Documentation

## Overview

This document describes the comprehensive test suite for the PTE (Pearson Test of English) practice application. The test suite covers critical utility functions, business logic, schemas, and scoring algorithms.

## Test Framework

- **Framework**: Jest (with Next.js integration)
- **Test Runner**: Jest
- **Coverage Tool**: Jest built-in coverage
- **Location**: Tests are co-located with source files in `__tests__` directories

## Running Tests

```bash
# Install dependencies (if not already installed)
pnpm install

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test/file.test.ts

# Run tests matching a pattern
pnpm test --testNamePattern="pattern"
```

## Test Structure

### Directory Organization