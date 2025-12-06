// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.BETTER_AUTH_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-purposes-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb'