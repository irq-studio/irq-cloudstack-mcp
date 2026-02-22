import { MonitoringHandlers } from '../src/handlers/monitoring-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('MonitoringHandlers - Event and Alert Management', () => {
  let handlers: MonitoringHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new MonitoringHandlers(mockClient);
  });

  describe('handleDeleteEvents', () => {
    it('should successfully delete events by IDs', async () => {
      const mockResponse = {
        deleteeventsresponse: {
          success: true,
          displaytext: '5 events deleted',
        },
      };
      mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ids: 'event-1,event-2,event-3,event-4,event-5',
      };

      const result = await handlers.handleDeleteEvents(args);

      expect(mockClient.deleteEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted events');
      expect(result.content[0].text).toContain('5 events deleted');
    });

    it('should successfully delete events by date range', async () => {
      const mockResponse = {
        deleteeventsresponse: {
          success: 'true',
          displaytext: 'Events deleted',
        },
      };
      mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        startdate: '2025-01-01',
        enddate: '2025-01-15',
      };

      const result = await handlers.handleDeleteEvents(args);

      expect(mockClient.deleteEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted events');
    });

    it('should successfully delete events older than end date', async () => {
      const mockResponse = {
        deleteeventsresponse: {
          success: true,
          displaytext: 'Old events deleted',
        },
      };
      mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        enddate: '2025-01-15',
      };

      const result = await handlers.handleDeleteEvents(args);

      expect(mockClient.deleteEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted events');
    });

    it('should successfully delete events by type', async () => {
      const mockResponse = {
        deleteeventsresponse: {
          success: true,
          displaytext: 'VM.CREATE events deleted',
        },
      };
      mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        type: 'VM.CREATE',
      };

      const result = await handlers.handleDeleteEvents(args);

      expect(mockClient.deleteEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted events');
    });

    it('should handle event deletion errors', async () => {
      mockClient.deleteEvents = jest.fn().mockRejectedValue(new Error('Insufficient permissions'));

      const args = {
        ids: 'event-1',
      };

      await expect(handlers.handleDeleteEvents(args)).rejects.toThrow('Insufficient permissions');
    });

    it('should handle failure response from API', async () => {
      const mockResponse = {
        deleteeventsresponse: {
          success: false,
          displaytext: 'No events found to delete',
        },
      };
      mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ids: 'nonexistent-event',
      };

      await expect(handlers.handleDeleteEvents(args)).rejects.toThrow('Operation failed: No events found to delete');
    });
  });

  describe('handleArchiveEvents', () => {
    it('should successfully archive events by IDs', async () => {
      const mockResponse = {
        archiveeventsresponse: {
          success: true,
          displaytext: '3 events archived',
        },
      };
      mockClient.archiveEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ids: 'event-a,event-b,event-c',
      };

      const result = await handlers.handleArchiveEvents(args);

      expect(mockClient.archiveEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully archived events');
      expect(result.content[0].text).toContain('3 events archived');
    });

    it('should successfully archive events by date range', async () => {
      const mockResponse = {
        archiveeventsresponse: {
          success: 'true',
          displaytext: 'Events archived',
        },
      };
      mockClient.archiveEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        startdate: '2024-01-01',
        enddate: '2024-12-31',
      };

      const result = await handlers.handleArchiveEvents(args);

      expect(mockClient.archiveEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully archived events');
    });

    it('should handle archive errors', async () => {
      mockClient.archiveEvents = jest.fn().mockRejectedValue(new Error('Archive failed'));

      const args = {
        ids: 'event-1',
      };

      await expect(handlers.handleArchiveEvents(args)).rejects.toThrow('Archive failed');
    });
  });

  describe('handleDeleteAlerts', () => {
    it('should successfully delete alerts by IDs', async () => {
      const mockResponse = {
        deletealertsresponse: {
          success: true,
          displaytext: '10 alerts deleted',
        },
      };
      mockClient.deleteAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ids: 'alert-1,alert-2,alert-3',
      };

      const result = await handlers.handleDeleteAlerts(args);

      expect(mockClient.deleteAlerts).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted alerts');
      expect(result.content[0].text).toContain('10 alerts deleted');
    });

    it('should successfully delete alerts by date range', async () => {
      const mockResponse = {
        deletealertsresponse: {
          success: 'true',
          displaytext: 'Alerts deleted',
        },
      };
      mockClient.deleteAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        startdate: '2025-01-01',
        enddate: '2025-01-15',
      };

      const result = await handlers.handleDeleteAlerts(args);

      expect(mockClient.deleteAlerts).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted alerts');
    });

    it('should successfully delete alerts older than end date', async () => {
      const mockResponse = {
        deletealertsresponse: {
          success: true,
          displaytext: 'Old alerts deleted',
        },
      };
      mockClient.deleteAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        enddate: '2025-01-15',
      };

      const result = await handlers.handleDeleteAlerts(args);

      expect(mockClient.deleteAlerts).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted alerts');
    });

    it('should successfully delete alerts by type', async () => {
      const mockResponse = {
        deletealertsresponse: {
          success: true,
          displaytext: 'MEMORY_THRESHOLD alerts deleted',
        },
      };
      mockClient.deleteAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        type: 'MEMORY_THRESHOLD',
      };

      const result = await handlers.handleDeleteAlerts(args);

      expect(mockClient.deleteAlerts).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully deleted alerts');
    });

    it('should handle alert deletion errors', async () => {
      mockClient.deleteAlerts = jest.fn().mockRejectedValue(new Error('Access denied'));

      const args = {
        ids: 'alert-1',
      };

      await expect(handlers.handleDeleteAlerts(args)).rejects.toThrow('Access denied');
    });

    it('should handle failure response from API', async () => {
      const mockResponse = {
        deletealertsresponse: {
          success: false,
          displaytext: 'No alerts found to delete',
        },
      };
      mockClient.deleteAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ids: 'nonexistent-alert',
      };

      await expect(handlers.handleDeleteAlerts(args)).rejects.toThrow('Operation failed: No alerts found to delete');
    });
  });

  describe('handleArchiveAlerts', () => {
    it('should successfully archive alerts by IDs', async () => {
      const mockResponse = {
        archivealertsresponse: {
          success: true,
          displaytext: '5 alerts archived',
        },
      };
      mockClient.archiveAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ids: 'alert-x,alert-y,alert-z',
      };

      const result = await handlers.handleArchiveAlerts(args);

      expect(mockClient.archiveAlerts).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully archived alerts');
      expect(result.content[0].text).toContain('5 alerts archived');
    });

    it('should successfully archive alerts by date range', async () => {
      const mockResponse = {
        archivealertsresponse: {
          success: 'true',
          displaytext: 'Alerts archived',
        },
      };
      mockClient.archiveAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        startdate: '2024-01-01',
        enddate: '2024-12-31',
      };

      const result = await handlers.handleArchiveAlerts(args);

      expect(mockClient.archiveAlerts).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Successfully archived alerts');
    });

    it('should handle archive errors', async () => {
      mockClient.archiveAlerts = jest.fn().mockRejectedValue(new Error('Archive operation failed'));

      const args = {
        ids: 'alert-1',
      };

      await expect(handlers.handleArchiveAlerts(args)).rejects.toThrow('Archive operation failed');
    });
  });

  describe('handleListEvents', () => {
    it('should successfully list events', async () => {
      const mockResponse = {
        listeventsresponse: {
          event: [
            {
              id: 'event-1',
              type: 'VM.CREATE',
              description: 'VM created successfully',
              level: 'INFO',
              created: '2025-01-15T10:00:00-0700',
              username: 'admin',
              domain: 'ROOT',
            },
            {
              id: 'event-2',
              type: 'NETWORK.CREATE',
              description: 'Network created',
              level: 'INFO',
              created: '2025-01-15T11:00:00-0700',
              username: 'user1',
              domain: 'ROOT',
            },
          ],
        },
      };
      mockClient.listEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        level: 'INFO',
      };

      const result = await handlers.handleListEvents(args);

      expect(mockClient.listEvents).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Found 2 events');
      expect(result.content[0].text).toContain('VM.CREATE');
      expect(result.content[0].text).toContain('NETWORK.CREATE');
    });

    it('should handle empty event list', async () => {
      const mockResponse = {
        listeventsresponse: {},
      };
      mockClient.listEvents = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListEvents({});

      expect(result.content[0].text).toContain('Found 0 events');
    });
  });

  describe('handleListAlerts', () => {
    it('should successfully list alerts', async () => {
      const mockResponse = {
        listalertsresponse: {
          alert: [
            {
              id: 'alert-1',
              type: 'MEMORY',
              description: 'Memory threshold exceeded',
              sent: '2025-01-15T10:00:00-0700',
              name: 'Memory Alert',
            },
          ],
        },
      };
      mockClient.listAlerts = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListAlerts({});

      expect(mockClient.listAlerts).toHaveBeenCalledWith({});
      expect(result.content[0].text).toContain('Found 1 alerts');
      expect(result.content[0].text).toContain('Memory Alert');
    });

    it('should handle empty alert list', async () => {
      const mockResponse = {
        listalertsresponse: {},
      };
      mockClient.listAlerts = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListAlerts({});

      expect(result.content[0].text).toContain('Found 0 alerts');
    });
  });

  describe('Input Validation', () => {
    describe('Date Format Validation', () => {
      it('should reject invalid date formats in delete_events', async () => {
        const args = {
          startdate: '01/15/2025', // Invalid format
          enddate: '2025-01-15',
        };

        await expect(handlers.handleDeleteEvents(args)).rejects.toThrow('must be in YYYY-MM-DD format');
      });

      it('should reject invalid date in enddate for delete_alerts', async () => {
        const args = {
          enddate: '2025-02-30', // Invalid date (February doesn't have 30 days)
        };

        await expect(handlers.handleDeleteAlerts(args)).rejects.toThrow('not a valid date');
      });

      it('should require enddate when startdate is provided', async () => {
        const args = {
          startdate: '2025-01-01',
          enddate: '', // Empty enddate
        };

        await expect(handlers.handleDeleteEvents(args)).rejects.toThrow('startdate requires enddate');
      });

      it('should reject startdate after enddate', async () => {
        const args = {
          startdate: '2025-12-31',
          enddate: '2025-01-01',
        };

        await expect(handlers.handleArchiveEvents(args)).rejects.toThrow('must be before or equal to');
      });
    });

    describe('ID List Validation', () => {
      it('should reject empty ID lists', async () => {
        const args = { ids: '  ,  ,  ' };

        await expect(handlers.handleDeleteEvents(args)).rejects.toThrow('No valid IDs found');
      });

      it('should sanitize whitespace in ID lists', async () => {
        const mockResponse = {
          deleteeventsresponse: {
            success: true,
            displaytext: 'Events deleted',
          },
        };
        mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

        const args = { ids: ' id1 , id2 ,  id3  ' };

        await handlers.handleDeleteEvents(args);

        // Should have sanitized to 'id1,id2,id3'
        expect(mockClient.deleteEvents).toHaveBeenCalledWith(
          expect.objectContaining({ ids: 'id1,id2,id3' })
        );
      });

      it('should reject ID lists exceeding maximum count', async () => {
        const tooManyIds = Array.from({ length: 101 }, (_, i) => `id-${i}`).join(',');
        const args = { ids: tooManyIds };

        await expect(handlers.handleDeleteAlerts(args)).rejects.toThrow('Maximum 100 IDs');
      });
    });

    describe('Parameter Requirements', () => {
      it('should require at least one parameter for delete_events', async () => {
        const args = {};

        await expect(handlers.handleDeleteEvents(args)).rejects.toThrow('requires at least one parameter');
      });

      it('should require at least one parameter for archive_alerts', async () => {
        const args = {};

        await expect(handlers.handleArchiveAlerts(args)).rejects.toThrow('requires at least one parameter');
      });

      it('should accept enddate as the only parameter', async () => {
        const mockResponse = {
          deleteeventsresponse: {
            success: true,
            displaytext: 'Events deleted',
          },
        };
        mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

        const args = { enddate: '2025-01-15' };

        await expect(handlers.handleDeleteEvents(args)).resolves.toBeDefined();
      });
    });
  });

  describe('Error Response Handling', () => {
    it('should throw error when API response is malformed (missing response object)', async () => {
      mockClient.deleteEvents = jest.fn().mockResolvedValue({});

      await expect(handlers.handleDeleteEvents({ ids: 'event-1' })).rejects.toThrow('Invalid API response');
    });

    it('should throw error when API returns success=false', async () => {
      const mockResponse = {
        deletealertsresponse: {
          success: false,
          displaytext: 'Insufficient permissions',
        },
      };
      mockClient.deleteAlerts = jest.fn().mockResolvedValue(mockResponse);

      await expect(handlers.handleDeleteAlerts({ ids: 'alert-1' })).rejects.toThrow('Insufficient permissions');
    });

    it('should throw error when API returns success as string "false"', async () => {
      const mockResponse = {
        archiveeventsresponse: {
          success: 'false',
          displaytext: 'No events found',
        },
      };
      mockClient.archiveEvents = jest.fn().mockResolvedValue(mockResponse);

      await expect(handlers.handleArchiveEvents({ ids: 'event-1' })).rejects.toThrow('No events found');
    });

    it('should handle undefined success value as failure', async () => {
      const mockResponse = {
        archivealertsresponse: {
          displaytext: 'Operation failed',
        },
      };
      mockClient.archiveAlerts = jest.fn().mockResolvedValue(mockResponse);

      await expect(handlers.handleArchiveAlerts({ ids: 'alert-1' })).rejects.toThrow('Operation failed');
    });
  });

  describe('Audit Logging', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log delete_events operations to stderr', async () => {
      const mockResponse = {
        deleteeventsresponse: {
          success: true,
          displaytext: 'Events deleted',
        },
      };
      mockClient.deleteEvents = jest.fn().mockResolvedValue(mockResponse);

      const args = { ids: 'event-1,event-2', type: 'VM.CREATE' };
      await handlers.handleDeleteEvents(args);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.data.operation).toBe('delete_events');
      expect(logData.data.parameters).toEqual(expect.objectContaining({ type: 'VM.CREATE' }));
      expect(logData.timestamp).toBeDefined();
    });

    it('should log archive_alerts operations to stderr', async () => {
      const mockResponse = {
        archivealertsresponse: {
          success: true,
          displaytext: 'Alerts archived',
        },
      };
      mockClient.archiveAlerts = jest.fn().mockResolvedValue(mockResponse);

      const args = { enddate: '2025-01-15' };
      await handlers.handleArchiveAlerts(args);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.data.operation).toBe('archive_alerts');
      expect(logData.data.parameters.enddate).toBe('2025-01-15');
    });
  });

  describe('handleListCapacity', () => {
    it('should list capacity metrics successfully', async () => {
      const mockResponse = {
        listcapacityresponse: {
          capacity: [
            {
              type: 0,
              zonename: 'Zone-1',
              capacityused: 5000,
              capacitytotal: 10000,
              percentused: '50.00',
            },
            {
              type: 1,
              zonename: 'Zone-1',
              capacityused: 2000,
              capacitytotal: 8000,
              percentused: '25.00',
            },
          ],
        },
      };
      mockClient.listCapacity = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListCapacity({});

      expect(mockClient.listCapacity).toHaveBeenCalledWith({});
      expect(result.content[0].text).toContain('Found 2 capacity metrics');
      expect(result.content[0].text).toContain('Zone-1');
      expect(result.content[0].text).toContain('50.00%');
    });

    it('should handle empty capacity response', async () => {
      const mockResponse = {
        listcapacityresponse: {},
      };
      mockClient.listCapacity = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListCapacity({});

      expect(result.content[0].text).toContain('Found 0 capacity metrics');
    });

    it('should filter capacity by zone', async () => {
      const mockResponse = {
        listcapacityresponse: {
          capacity: [
            {
              type: 0,
              zonename: 'Zone-2',
              capacityused: 3000,
              capacitytotal: 6000,
              percentused: '50.00',
            },
          ],
        },
      };
      mockClient.listCapacity = jest.fn().mockResolvedValue(mockResponse);

      const args = { zoneid: 'zone-id-2' };
      const result = await handlers.handleListCapacity(args);

      expect(mockClient.listCapacity).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Zone-2');
    });
  });

  describe('handleListAsyncJobs', () => {
    it('should list async jobs successfully', async () => {
      const mockResponse = {
        listasyncjobsresponse: {
          asyncjobs: [
            {
              jobid: 'job-123',
              cmd: 'deployVirtualMachine',
              jobstatus: 0,
              created: '2025-01-15T10:00:00Z',
              userid: 'user-1',
              jobinstancetype: 'VirtualMachine',
              jobinstanceid: 'vm-456',
            },
            {
              jobid: 'job-124',
              cmd: 'createVolume',
              jobstatus: 1,
              created: '2025-01-15T10:05:00Z',
              userid: 'user-2',
              jobinstancetype: 'Volume',
              jobinstanceid: 'vol-789',
            },
          ],
        },
      };
      mockClient.listAsyncJobs = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListAsyncJobs({});

      expect(mockClient.listAsyncJobs).toHaveBeenCalledWith({});
      expect(result.content[0].text).toContain('Found 2 async jobs');
      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('deployVirtualMachine');
      expect(result.content[0].text).toContain('VirtualMachine');
    });

    it('should handle empty async jobs response', async () => {
      const mockResponse = {
        listasyncjobsresponse: {},
      };
      mockClient.listAsyncJobs = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListAsyncJobs({});

      expect(result.content[0].text).toContain('Found 0 async jobs');
    });

    it('should filter jobs by account', async () => {
      const mockResponse = {
        listasyncjobsresponse: {
          asyncjobs: [
            {
              jobid: 'job-999',
              cmd: 'startVirtualMachine',
              jobstatus: 1,
              created: '2025-01-15T11:00:00Z',
              userid: 'user-admin',
              jobinstancetype: 'VirtualMachine',
              jobinstanceid: 'vm-abc',
            },
          ],
        },
      };
      mockClient.listAsyncJobs = jest.fn().mockResolvedValue(mockResponse);

      const args = { account: 'admin' };
      const result = await handlers.handleListAsyncJobs(args);

      expect(mockClient.listAsyncJobs).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('startVirtualMachine');
    });
  });

  describe('handleListUsageRecords', () => {
    it('should list usage records successfully', async () => {
      const mockResponse = {
        listusagerecordsresponse: {
          usagerecord: [
            {
              usageid: 'usage-1',
              description: 'VM Usage',
              usagetype: 1,
              rawusage: '24',
              usage: '24 Hrs',
              startdate: '2025-01-01',
              enddate: '2025-01-02',
            },
            {
              usageid: 'usage-2',
              description: 'Storage Usage',
              usagetype: 6,
              rawusage: '100',
              usage: '100 GB',
              startdate: '2025-01-01',
              enddate: '2025-01-02',
            },
          ],
        },
      };
      mockClient.listUsageRecords = jest.fn().mockResolvedValue(mockResponse);

      const args = { startdate: '2025-01-01', enddate: '2025-01-02' };
      const result = await handlers.handleListUsageRecords(args);

      expect(mockClient.listUsageRecords).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Found 2 usage records');
      expect(result.content[0].text).toContain('VM Usage');
      expect(result.content[0].text).toContain('Storage Usage');
      expect(result.content[0].text).toContain('24 Hrs');
    });

    it('should handle empty usage records response', async () => {
      const mockResponse = {
        listusagerecordsresponse: {},
      };
      mockClient.listUsageRecords = jest.fn().mockResolvedValue(mockResponse);

      const args = { startdate: '2025-01-01', enddate: '2025-01-02' };
      const result = await handlers.handleListUsageRecords(args);

      expect(result.content[0].text).toContain('Found 0 usage records');
    });

    it('should filter usage records by account', async () => {
      const mockResponse = {
        listusagerecordsresponse: {
          usagerecord: [
            {
              usageid: 'usage-acct',
              description: 'Account Usage',
              usagetype: 1,
              rawusage: '48',
              usage: '48 Hrs',
              startdate: '2025-01-01',
              enddate: '2025-01-03',
            },
          ],
        },
      };
      mockClient.listUsageRecords = jest.fn().mockResolvedValue(mockResponse);

      const args = { startdate: '2025-01-01', enddate: '2025-01-03', account: 'test-account' };
      const result = await handlers.handleListUsageRecords(args);

      expect(mockClient.listUsageRecords).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Account Usage');
    });
  });

  describe('handleListEventTypes', () => {
    it('should list event types successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listeventtypesresponse: {
          eventtype: [
            { name: 'VM.CREATE' },
            { name: 'VM.DESTROY' },
          ],
        },
      });

      const result = await handlers.handleListEventTypes({});

      expect(mockClient.request).toHaveBeenCalledWith('listEventTypes', {});
      expect(result.content[0].text).toContain('VM.CREATE');
    });

    it('should handle empty event types list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listeventtypesresponse: { eventtype: [] },
      });

      const result = await handlers.handleListEventTypes({});

      expect(result.content[0].text).toContain('No event types found');
    });
  });

  describe('handleGenerateUsageRecords', () => {
    it('should generate usage records successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        generateusagerecordsresponse: {
          success: true,
        },
      });

      const result = await handlers.handleGenerateUsageRecords({ startdate: '2025-01-01', enddate: '2025-01-31' });

      expect(mockClient.request).toHaveBeenCalledWith('generateUsageRecords', { startdate: '2025-01-01', enddate: '2025-01-31' });
      expect(result.content[0].text).toContain('Generated usage records');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleGenerateUsageRecords({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('startdate is required');
    });
  });

  describe('handleListUsageTypes', () => {
    it('should list usage types successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listusagetypesresponse: {
          usagetype: [
            { usagetypeid: 1, description: 'Running VM Usage' },
            { usagetypeid: 2, description: 'Allocated VM Usage' },
          ],
        },
      });

      const result = await handlers.handleListUsageTypes({});

      expect(mockClient.request).toHaveBeenCalledWith('listUsageTypes', {});
      expect(result.content[0].text).toContain('Running VM Usage');
    });

    it('should handle empty usage types list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listusagetypesresponse: { usagetype: [] },
      });

      const result = await handlers.handleListUsageTypes({});

      expect(result.content[0].text).toContain('No usage types found');
    });
  });

  describe('handleAddAnnotation', () => {
    it('should add an annotation successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        addannotationresponse: {
          success: true,
        },
      });

      const result = await handlers.handleAddAnnotation({ entityid: 'vm-1', entitytype: 'VM', annotation: 'Test note' });

      expect(mockClient.request).toHaveBeenCalledWith('addAnnotation', expect.objectContaining({ entityid: 'vm-1' }));
      expect(result.content[0].text).toContain('Added annotation');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleAddAnnotation({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('entityid is required');
    });
  });

  describe('handleRemoveAnnotation', () => {
    it('should remove an annotation successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        removeannotationresponse: {
          success: true,
        },
      });

      const result = await handlers.handleRemoveAnnotation({ id: 'ann-1' });

      expect(mockClient.request).toHaveBeenCalledWith('removeAnnotation', { id: 'ann-1' });
      expect(result.content[0].text).toContain('Removed annotation');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleRemoveAnnotation({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleListAnnotations', () => {
    it('should list annotations successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listannotationsresponse: {
          annotation: [
            { id: 'ann-1', entityid: 'vm-1', entitytype: 'VM', annotation: 'Note 1' },
            { id: 'ann-2', entityid: 'vm-2', entitytype: 'VM', annotation: 'Note 2' },
          ],
        },
      });

      const result = await handlers.handleListAnnotations({});

      expect(mockClient.request).toHaveBeenCalledWith('listAnnotations', {});
      expect(result.content[0].text).toContain('ann-1');
    });

    it('should handle empty annotations list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listannotationsresponse: { annotation: [] },
      });

      const result = await handlers.handleListAnnotations({});

      expect(result.content[0].text).toContain('No annotations found');
    });
  });
});
