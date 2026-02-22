/**
 * Tests for structured logging utility
 */

import { Logger, LogLevel, createOperationLogger, logger } from '../src/utils/logger.js';

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.debug('Test debug message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.message).toBe('Test debug message');
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should log info messages', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.info('Test info message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe('Test info message');
    });

    it('should log warning messages', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.warn('Test warning message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe('Test warning message');
    });

    it('should log error messages with error details', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      const error = new Error('Test error');
      log.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.message).toBe('Error occurred');
      expect(logEntry.error).toBeDefined();
      expect(logEntry.error.name).toBe('Error');
      expect(logEntry.error.message).toBe('Test error');
      expect(logEntry.error.stack).toBeDefined();
    });
  });

  describe('Log Level Filtering', () => {
    it('should filter out debug logs when level is INFO', () => {
      const log = new Logger({}, LogLevel.INFO);
      log.debug('Should not appear');
      log.info('Should appear');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
    });

    it('should filter out info logs when level is WARN', () => {
      const log = new Logger({}, LogLevel.WARN);
      log.debug('Should not appear');
      log.info('Should not appear');
      log.warn('Should appear');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
    });

    it('should only log errors when level is ERROR', () => {
      const log = new Logger({}, LogLevel.ERROR);
      log.debug('Should not appear');
      log.info('Should not appear');
      log.warn('Should not appear');
      log.error('Should appear');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('ERROR');
    });
  });

  describe('Context Management', () => {
    it('should include context in log entries', () => {
      const log = new Logger({
        operation: 'deployVirtualMachine',
        requestId: 'req-123',
      }, LogLevel.DEBUG);

      log.info('Test with context');

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.context).toBeDefined();
      expect(logEntry.context.operation).toBe('deployVirtualMachine');
      expect(logEntry.context.requestId).toBe('req-123');
    });

    it('should create child logger with merged context', () => {
      const parentLog = new Logger({ service: 'cloudstack-mcp' }, LogLevel.DEBUG);
      const childLog = parentLog.child({ operation: 'listVMs' });

      childLog.info('Child logger message');

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.context.service).toBe('cloudstack-mcp');
      expect(logEntry.context.operation).toBe('listVMs');
    });

    it('should not include empty context', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.info('Test without context');

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.context).toBeUndefined();
    });
  });

  describe('Structured Data', () => {
    it('should include data field in log entries', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.info('Test with data', {
        vmId: 'vm-123',
        zone: 'zone-1',
        count: 5,
      });

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.data).toBeDefined();
      expect(logEntry.data.vmId).toBe('vm-123');
      expect(logEntry.data.zone).toBe('zone-1');
      expect(logEntry.data.count).toBe(5);
    });

    it('should sanitize sensitive parameters', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logApiRequest('deployVirtualMachine', {
        name: 'test-vm',
        password: 'secret123',
        apikey: 'my-api-key',
      });

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.data.params.name).toBe('test-vm');
      expect(logEntry.data.params.password).toBe('***REDACTED***');
      expect(logEntry.data.params.apikey).toBe('***REDACTED***');
    });
  });

  describe('API Logging', () => {
    it('should log API requests', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logApiRequest('listVirtualMachines', { zoneid: 'zone-1' });

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.message).toBe('CloudStack API request');
      expect(logEntry.data.command).toBe('listVirtualMachines');
      expect(logEntry.data.params.zoneid).toBe('zone-1');
    });

    it('should log successful API responses', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logApiResponse('listVirtualMachines', 250, true);

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.message).toBe('CloudStack API response');
      expect(logEntry.data.command).toBe('listVirtualMachines');
      expect(logEntry.data.duration_ms).toBe(250);
      expect(logEntry.data.success).toBe(true);
    });

    it('should log failed API responses with WARN level', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logApiResponse('deployVirtualMachine', 1500, false);

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.data.success).toBe(false);
    });
  });

  describe('Tool Logging', () => {
    it('should log tool invocations', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logToolInvocation('deploy_virtual_machine', {
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
      });

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe('MCP tool invocation');
      expect(logEntry.data.tool).toBe('deploy_virtual_machine');
      expect(logEntry.data.args).toBeDefined();
    });

    it('should log successful tool completions', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logToolCompletion('list_virtual_machines', 500, true);

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe('MCP tool completion');
      expect(logEntry.data.tool).toBe('list_virtual_machines');
      expect(logEntry.data.duration_ms).toBe(500);
      expect(logEntry.data.success).toBe(true);
    });

    it('should log failed tool completions with ERROR level', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.logToolCompletion('deploy_virtual_machine', 2000, false);

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.data.success).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should create operation logger with context', () => {
      const log = createOperationLogger('testOperation', 'req-456');
      log.info('Operation message');

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.context.operation).toBe('testOperation');
      expect(logEntry.context.requestId).toBe('req-456');
    });

    it('should generate request ID if not provided', () => {
      const log = createOperationLogger('testOperation');
      log.info('Operation message');

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.context.operation).toBe('testOperation');
      expect(logEntry.context.requestId).toBeDefined();
      expect(logEntry.context.requestId).toMatch(/^req_[0-9a-f-]+$/);
    });

    it('should have global logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('Timestamp Format', () => {
    it('should use ISO 8601 timestamp format', () => {
      const log = new Logger({}, LogLevel.DEBUG);
      log.info('Test timestamp');

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Environment-based Configuration', () => {
    it('should respect LOG_LEVEL environment variable', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'ERROR';

      const log = new Logger();
      log.debug('Should not appear');
      log.info('Should not appear');
      log.warn('Should not appear');
      log.error('Should appear');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('ERROR');

      // Restore
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });
});
