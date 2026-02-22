/**
 * Simple integration tests for rate limiting in CloudStackClient
 */

import { CloudStackClient } from '../src/cloudstack-client.js';
import { RateLimitError } from '../src/utils/rate-limiter.js';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CloudStackClient Rate Limiting - Simple Tests', () => {
  let mockAxiosInstance: {
    get: jest.Mock;
    interceptors: {
      request: { use: jest.Mock };
      response: { use: jest.Mock };
    };
  };

  beforeEach(() => {
    // Create a consistent mock axios instance
    mockAxiosInstance = {
      get: jest.fn().mockResolvedValue({
        data: { listvirtualmachinesresponse: { count: 0, virtualmachine: [] } },
        status: 200,
      }),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    // Mock axios.create to return the same instance
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests within rate limit', async () => {
    const client = new CloudStackClient({
      apiUrl: 'https://cloudstack.example.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      rateLimitConfig: {
        maxRequests: 5,
        windowMs: 1000,
      },
    });

    // Make 5 requests (within limit)
    for (let i = 0; i < 5; i++) {
      await expect(
        client.request('listVirtualMachines', {})
      ).resolves.toBeDefined();
    }

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(5);
  });

  it('should throw RateLimitError when exceeding limit', async () => {
    const client = new CloudStackClient({
      apiUrl: 'https://cloudstack.example.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      rateLimitConfig: {
        maxRequests: 2,
        windowMs: 10000, // Long window to ensure we hit limit
        burstSize: 2, // Explicit burst size
      },
    });

    // Make 2 requests sequentially (fill the bucket)
    await client.request('listVirtualMachines', {});
    await client.request('listVirtualMachines', {});

    // 3rd request should be rate limited
    await expect(
      client.request('listVirtualMachines', {})
    ).rejects.toThrow(RateLimitError);

    await expect(
      client.request('listVirtualMachines', {})
    ).rejects.toThrow(/Rate limit exceeded/);
  });

  it('should include retry-after and resetAt in error', async () => {
    const client = new CloudStackClient({
      apiUrl: 'https://cloudstack.example.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      rateLimitConfig: {
        maxRequests: 1,
        windowMs: 10000,
        burstSize: 1, // Explicit burst size
      },
    });

    // Exhaust rate limit
    await client.request('listVirtualMachines', {});

    try {
      await client.request('listVirtualMachines', {});
      fail('Should have thrown RateLimitError');
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      if (error instanceof RateLimitError) {
        expect(error.retryAfterMs).toBeGreaterThan(0);
        expect(error.resetAt).toBeGreaterThan(Date.now());
        expect(error.message).toContain('Rate limit exceeded');
      }
    }
  });

  it('should use default rate limit config when not specified', async () => {
    const defaultClient = new CloudStackClient({
      apiUrl: 'https://cloudstack.example.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      // No rateLimitConfig - should use defaults (100 req/min with burst of 120)
    });

    // Should allow many requests with default config
    for (let i = 0; i < 50; i++) {
      await expect(
        defaultClient.request('listVirtualMachines', {})
      ).resolves.toBeDefined();
    }

    expect(mockAxiosInstance.get).toHaveBeenCalled();
  });

  it('should respect custom burst size', async () => {
    const burstClient = new CloudStackClient({
      apiUrl: 'https://cloudstack.example.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      rateLimitConfig: {
        maxRequests: 5,
        windowMs: 10000,
        burstSize: 10, // Allow bursts up to 10
      },
    });

    // Should allow 10 requests immediately (burst)
    for (let i = 0; i < 10; i++) {
      await expect(
        burstClient.request('listVirtualMachines', {})
      ).resolves.toBeDefined();
    }

    // 11th should be rate limited
    await expect(
      burstClient.request('listVirtualMachines', {})
    ).rejects.toThrow(RateLimitError);
  });

  it('should log rate limit information', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const client = new CloudStackClient({
      apiUrl: 'https://cloudstack.example.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      rateLimitConfig: {
        maxRequests: 1,
        windowMs: 10000,
        burstSize: 1, // Explicit burst size
      },
    });

    // First request should log allowed
    await client.request('listVirtualMachines', {});

    const allowedLogs = consoleErrorSpy.mock.calls
      .map((call: unknown[]) => JSON.parse(call[0] as string))
      .filter((log: { message: string }) => log.message.includes('allowed'));

    expect(allowedLogs.length).toBeGreaterThan(0);

    // Second request should log rate limit exceeded
    try {
      await client.request('listVirtualMachines', {});
    } catch {
      // Expected to fail
    }

    const exceededLogs = consoleErrorSpy.mock.calls
      .map((call: unknown[]) => JSON.parse(call[0] as string))
      .filter((log: { message: string; level: string }) =>
        log.message.includes('Rate limit exceeded') && log.level === 'WARN'
      );

    expect(exceededLogs.length).toBeGreaterThan(0);

    consoleErrorSpy.mockRestore();
  });
});
