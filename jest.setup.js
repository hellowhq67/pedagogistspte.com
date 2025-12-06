// Jest setup file for test environment configuration

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BETTER_AUTH_URL = 'http://localhost:3000';
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/test';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (but keep log for debugging)
const originalConsole = { ...console };
global.console = {
  ...console,
  error: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      originalConsole.error(...args);
    }
  }),
  warn: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      originalConsole.warn(...args);
    }
  }),
};

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});