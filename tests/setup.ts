// Jest setup file
// This file runs before all tests

// Set test timeout
jest.setTimeout(10000);

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.CLOUDSTACK_API_URL = 'https://test.cloudstack.com/client/api';
process.env.CLOUDSTACK_API_KEY = 'test-api-key';
process.env.CLOUDSTACK_SECRET_KEY = 'test-secret-key';
process.env.CLOUDSTACK_TIMEOUT = '10000';
process.env.CLOUDSTACK_REJECT_UNAUTHORIZED = 'false';

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
