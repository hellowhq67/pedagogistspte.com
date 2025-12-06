# Testing Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
pnpm install -D jest ts-jest @types/jest
```

### Step 2: Run Your First Test
```bash
pnpm test
```

### Step 3: View Coverage
```bash
pnpm test:coverage
```

## 📚 Common Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode (re-runs on file changes) |
| `pnpm test:coverage` | Generate detailed coverage report |
| `pnpm test:ci` | Run tests in CI mode (with coverage, optimized for CI/CD) |
| `pnpm test -- utils` | Run only tests matching "utils" |
| `pnpm test -- --verbose` | Run tests with verbose output |

## 🎯 What's Been Tested

### ✅ Currently Tested (180+ test cases)
- **Utility Functions**: `cn()` className merger, formatters
- **PTE Logic**: Scoring, timing, word counting, media detection
- **Subscriptions**: Tiers, credits, access control
- **Database**: Schema validation, relationships, types
- **Hooks**: Toast notifications

### 📋 Test Coverage by Module