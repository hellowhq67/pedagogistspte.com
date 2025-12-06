// Learn more: https://github.com/testing-library/jest-dom
// Polyfills for Node.js test environment
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'

// Suppress console warnings in tests (optional)
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render') ||
        message.includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return
    }
    originalWarn(...args)
  }

  console.error = (...args) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})