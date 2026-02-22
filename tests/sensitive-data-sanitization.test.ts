/**
 * Tests to ensure sensitive data is sanitized in all error paths
 */

import { CloudStackClient, CloudStackError, sanitizeParams } from '../src/cloudstack-client.js';
import { RateLimitError } from '../src/utils/rate-limiter.js';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Sensitive Data Sanitization', () => {
  describe('sanitizeParams function', () => {
    it('should redact password parameters', () => {
      const params = {
        name: 'test-vm',
        password: 'super-secret-password',
        count: '5',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.name).toBe('test-vm');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.count).toBe('5');
    });

    it('should redact api key parameters', () => {
      const params = {
        apikey: 'my-api-key-12345',
        command: 'listVirtualMachines',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.apikey).toBe('[REDACTED]');
      expect(sanitized.command).toBe('listVirtualMachines');
    });

    it('should redact secret key parameters', () => {
      const params = {
        secretkey: 'my-secret-key-67890',
        someparam: 'value',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.secretkey).toBe('[REDACTED]');
      expect(sanitized.someparam).toBe('value');
    });

    it('should redact access key parameters', () => {
      const params = {
        accesskey: 'AKIA1234567890',
        id: 'vm-123',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.accesskey).toBe('[REDACTED]');
      expect(sanitized.id).toBe('vm-123');
    });

    it('should redact token parameters', () => {
      const params = {
        token: 'bearer-token-xyz',
        user: 'admin',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.user).toBe('admin');
    });

    it('should redact userdata parameters', () => {
      const params = {
        userdata: 'base64-encoded-sensitive-data',
        templateid: 'template-1',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.userdata).toBe('[REDACTED]');
      expect(sanitized.templateid).toBe('template-1');
    });

    it('should handle parameters with mixed case sensitive keys', () => {
      const params = {
        Password: 'test123',
        APIKey: 'key123',
        name: 'vm',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.Password).toBe('[REDACTED]');
      expect(sanitized.APIKey).toBe('[REDACTED]');
      expect(sanitized.name).toBe('vm');
    });

    it('should handle empty params object', () => {
      const params = {};
      const sanitized = sanitizeParams(params);
      expect(sanitized).toEqual({});
    });

    it('should convert non-string values to strings', () => {
      const params = {
        count: 5,
        enabled: true,
        password: 'secret',
      };

      const sanitized = sanitizeParams(params);

      expect(sanitized.count).toBe('5');
      expect(sanitized.enabled).toBe('true');
      expect(sanitized.password).toBe('[REDACTED]');
    });
  });

  describe('CloudStackError sanitization', () => {
    it('should sanitize params when CloudStackError is thrown', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: { errortext: 'Invalid password' },
          },
          message: 'Request failed',
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance as never);

      const client = new CloudStackClient({
        apiUrl: 'https://cloudstack.example.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      try {
        await client.request('deployVirtualMachine', {
          name: 'test-vm',
          password: 'super-secret-password',
          serviceofferingid: 'offering-1',
        });
        fail('Should have thrown error');
      } catch (error: unknown) {
        // Verify error message doesn't contain password
        const errorMessage = error instanceof Error ? error.message : String(error);
        expect(errorMessage).not.toContain('super-secret-password');

        // If it's a CloudStackError, verify params are sanitized
        if (error instanceof CloudStackError) {
          expect(error.params).toBeDefined();
          expect(error.params?.password).toBe('[REDACTED]');
        }
      }
    });

    it('should include sanitized params in toString output', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 401,
            data: { errortext: 'Authentication failed' },
          },
          message: 'Auth error',
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance as never);

      const client = new CloudStackClient({
        apiUrl: 'https://cloudstack.example.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      try {
        await client.request('createUser', {
          username: 'testuser',
          password: 'secret-password-123',
          email: 'test@example.com',
        });
        fail('Should have thrown error');
      } catch (error: unknown) {
        if (error instanceof CloudStackError) {
          const errorString = error.toString();

          // Should not contain the actual password
          expect(errorString).not.toContain('secret-password-123');

          // Should contain [REDACTED] for password
          expect(errorString).toContain('[REDACTED]');

          // Should still contain other non-sensitive params
          expect(errorString).toContain('testuser');
          expect(errorString).toContain('test@example.com');
        }
      }
    });
  });

  describe('RateLimitError', () => {
    it('should not expose any request parameters', () => {
      const error = new RateLimitError(
        'Rate limit exceeded. Retry after 5000ms',
        5000,
        Date.now() + 60000
      );

      expect(error.message).not.toContain('password');
      expect(error.message).not.toContain('apikey');
      expect(error.message).not.toContain('secret');

      // Should only contain retry timing information
      expect(error.retryAfterMs).toBe(5000);
      expect(error.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Logger sanitization', () => {
    it('should sanitize API request parameters in logs', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: { deployvirtualmachineresponse: { id: 'vm-123', jobid: 'job-456' } },
          status: 200,
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance as never);

      const client = new CloudStackClient({
        apiUrl: 'https://cloudstack.example.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      // This triggers API request logging
      client.request('deployVirtualMachine', {
        name: 'test-vm',
        password: 'super-secret-password',
        serviceofferingid: 'offering-1',
      });

      // Check that logs don't contain the actual password
      const logCalls = consoleErrorSpy.mock.calls
        .map((call: unknown[]) => call[0] as string)
        .join(' ');

      expect(logCalls).not.toContain('super-secret-password');

      consoleErrorSpy.mockRestore();
    });
  });
});
