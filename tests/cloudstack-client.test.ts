import { CloudStackClient, CloudStackError } from '../src/cloudstack-client.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CloudStackClient', () => {
  let client: CloudStackClient;

  beforeEach(() => {
    client = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      timeout: 30000,
    });

    // Create axios mock instance
    mockedAxios.create = jest.fn().mockReturnValue({
      get: jest.fn(),
    } as any);
  });

  describe('Constructor', () => {
    it('should initialize with correct config', () => {
      const axiosInstance = {
        get: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const newClient = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        timeout: 30000,
      });

      expect(newClient).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalled();

      const callArgs = mockedAxios.create.mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      expect(callArgs?.timeout).toBe(30000);
      expect(callArgs?.headers).toEqual({
        'Content-Type': 'application/json',
      });
      expect(callArgs?.httpsAgent).toBeDefined();
    });
  });

  describe('listZones', () => {
    it('should successfully list zones', async () => {
      const mockResponse = {
        data: {
          listzonesresponse: {
            zone: [
              { id: '1', name: 'Zone1' },
              { id: '2', name: 'Zone2' },
            ],
          },
        },
      };

      const axiosInstance = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      const result = await client.listZones();

      expect(result).toEqual(mockResponse.data);
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network error');

      const axiosInstance = {
        get: jest.fn().mockRejectedValue(mockError),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await expect(client.listZones()).rejects.toThrow('Network error');
    });
  });

  describe('listVirtualMachines', () => {
    it('should successfully list virtual machines', async () => {
      const mockResponse = {
        data: {
          listvirtualmachinesresponse: {
            virtualmachine: [
              { id: 'vm1', name: 'Test VM 1' },
              { id: 'vm2', name: 'Test VM 2' },
            ],
          },
        },
      };

      const axiosInstance = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      const result = await client.listVirtualMachines();

      expect(result).toEqual(mockResponse.data);
    });

    it('should accept filter parameters', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.listVirtualMachines({ state: 'Running', zoneid: '1' });

      expect(axiosInstance.get).toHaveBeenCalled();
      const callParams = axiosInstance.get.mock.calls[0][1].params;
      expect(callParams.state).toBe('Running');
      expect(callParams.zoneid).toBe('1');
    });
  });

  describe('HMAC Signature', () => {
    it('should generate correct signature for API requests', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.listZones();

      expect(axiosInstance.get).toHaveBeenCalled();
      const callParams = axiosInstance.get.mock.calls[0][1].params;

      // Verify signature is present
      expect(callParams.signature).toBeDefined();
      expect(typeof callParams.signature).toBe('string');

      // Verify required parameters
      expect(callParams.command).toBe('listZones');
      expect(callParams.apiKey).toBe('test-api-key');
      expect(callParams.response).toBe('json');
    });
  });

  // Tests for new API methods
  describe('Template Operations', () => {
    it('should register a template', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.registerTemplate({ name: 'Ubuntu', url: 'http://example.com/template.qcow2' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('registerTemplate');
    });

    it('should delete a template', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.deleteTemplate({ id: 'template-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('deleteTemplate');
    });

    it('should update a template', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.updateTemplate({ id: 'template-123', name: 'Updated Template' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('updateTemplate');
    });

    it('should copy a template', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.copyTemplate({ id: 'template-123', destzoneid: 'zone-2' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('copyTemplate');
    });
  });

  describe('ISO Operations', () => {
    it('should list ISOs', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.listIsos();

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('listIsos');
    });

    it('should register an ISO', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.registerIso({ name: 'Ubuntu ISO', url: 'http://example.com/ubuntu.iso' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('registerIso');
    });

    it('should delete an ISO', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.deleteIso({ id: 'iso-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('deleteIso');
    });

    it('should attach an ISO', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.attachIso({ id: 'iso-123', virtualmachineid: 'vm-456' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('attachIso');
    });

    it('should detach an ISO', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.detachIso({ virtualmachineid: 'vm-456' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('detachIso');
    });
  });

  describe('Storage Operations (New)', () => {
    it('should delete a volume', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.deleteVolume({ id: 'volume-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('deleteVolume');
    });

    it('should delete a snapshot', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.deleteSnapshot({ id: 'snapshot-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('deleteSnapshot');
    });

    it('should revert to a snapshot', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.revertSnapshot({ id: 'snapshot-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('revertToVMSnapshot');
    });

    it('should list disk offerings', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.listDiskOfferings();

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('listDiskOfferings');
    });
  });

  describe('Tag Operations', () => {
    it('should create tags', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.createTags({ resourceids: ['vm-1'], resourcetype: 'UserVm', tags: [{ key: 'env', value: 'prod' }] });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('createTags');
    });

    it('should delete tags', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.deleteTags({ resourceids: ['vm-1'], resourcetype: 'UserVm' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('deleteTags');
    });

    it('should list tags', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.listTags();

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('listTags');
    });
  });

  describe('Affinity Group Operations', () => {
    it('should create an affinity group', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.createAffinityGroup({ name: 'web-servers', type: 'host anti-affinity' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('createAffinityGroup');
    });

    it('should delete an affinity group', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.deleteAffinityGroup({ id: 'ag-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('deleteAffinityGroup');
    });

    it('should list affinity groups', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.listAffinityGroups();

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('listAffinityGroups');
    });
  });

  describe('Async Job Operations', () => {
    it('should query async job result', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      };
      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.queryAsyncJobResult({ jobid: 'job-123' });

      expect(axiosInstance.get).toHaveBeenCalled();
      expect(axiosInstance.get.mock.calls[0][1].params.command).toBe('queryAsyncJobResult');
    });
  });

  describe('waitForAsyncJob', () => {
    it('should poll and return when job completes successfully', async () => {
      const axiosInstance = {
        get: jest.fn()
          .mockResolvedValueOnce({
            data: {
              queryasyncjobresultresponse: {
                jobid: 'job-123',
                jobstatus: 0 // pending
              }
            }
          })
          .mockResolvedValueOnce({
            data: {
              queryasyncjobresultresponse: {
                jobid: 'job-123',
                jobstatus: 1, // success
                jobresult: {
                  virtualmachine: { id: 'vm-123', state: 'Running' }
                }
              }
            }
          })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      const result = await client.waitForAsyncJob('job-123', { pollInterval: 100 });

      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result.queryasyncjobresultresponse).toBeDefined();
      expect((result.queryasyncjobresultresponse as any).jobstatus).toBe(1);
    });

    it('should throw error when job fails', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            queryasyncjobresultresponse: {
              jobid: 'job-fail',
              jobstatus: 2, // failed
              jobresult: {
                errortext: 'Operation failed'
              }
            }
          }
        })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await expect(client.waitForAsyncJob('job-fail'))
        .rejects.toThrow('Async job job-fail failed: Operation failed');
    });

    it('should throw error on timeout', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            queryasyncjobresultresponse: {
              jobid: 'job-timeout',
              jobstatus: 0 // always pending
            }
          }
        })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await expect(client.waitForAsyncJob('job-timeout', { timeout: 500, pollInterval: 100 }))
        .rejects.toThrow('Async job job-timeout timed out after 500ms');
    });

    it('should respect custom timeout and pollInterval options', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            queryasyncjobresultresponse: {
              jobid: 'job-123',
              jobstatus: 1 // success immediately
            }
          }
        })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await client.waitForAsyncJob('job-123', { timeout: 5000, pollInterval: 500 });

      expect(axiosInstance.get).toHaveBeenCalled();
    });

    it('should handle job failure without errortext', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            queryasyncjobresultresponse: {
              jobid: 'job-fail',
              jobstatus: 2, // failed
              jobresult: {} // no errortext
            }
          }
        })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      await expect(client.waitForAsyncJob('job-fail'))
        .rejects.toThrow('Async job job-fail failed: Unknown error');
    });
  });

  describe('CloudStackError', () => {
    it('should create error with all context fields', () => {
      const error = new CloudStackError(
        'Operation failed',
        'deployVirtualMachine',
        400,
        'req-12345',
        { zoneid: 'zone-1', templateid: 'template-1' }
      );

      expect(error.message).toBe('Operation failed');
      expect(error.command).toBe('deployVirtualMachine');
      expect(error.statusCode).toBe(400);
      expect(error.requestId).toBe('req-12345');
      expect(error.params).toEqual({ zoneid: 'zone-1', templateid: 'template-1' });
      expect(error.name).toBe('CloudStackError');
    });

    it('should format error with full context in toString', () => {
      const error = new CloudStackError(
        'Operation failed',
        'deployVirtualMachine',
        400,
        'req-12345',
        { zoneid: 'zone-1' }
      );

      const errorString = error.toString();
      expect(errorString).toContain('Operation failed');
      expect(errorString).toContain('Command: deployVirtualMachine');
      expect(errorString).toContain('Status Code: 400');
      expect(errorString).toContain('Request ID: req-12345');
      expect(errorString).toContain('Parameters: zoneid=zone-1');
    });

    it('should format error without optional fields', () => {
      const error = new CloudStackError(
        'Simple error',
        'listVirtualMachines'
      );

      const errorString = error.toString();
      expect(errorString).toContain('Simple error');
      expect(errorString).toContain('Command: listVirtualMachines');
      expect(errorString).not.toContain('Status Code:');
      expect(errorString).not.toContain('Request ID:');
      expect(errorString).not.toContain('Parameters:');
    });

    it('should throw CloudStackError on API error response', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            errortext: 'Invalid zone ID'
          },
          status: 400
        })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      try {
        await client.listVirtualMachines({ zoneid: 'invalid-zone' });
        fail('Should have thrown CloudStackError');
      } catch (error) {
        expect(error).toBeInstanceOf(CloudStackError);
        if (error instanceof CloudStackError) {
          expect(error.message).toContain('Invalid zone ID');
          expect(error.command).toBe('listVirtualMachines');
          expect(error.statusCode).toBe(400);
          expect(error.params).toHaveProperty('zoneid', 'invalid-zone');
        }
      }
    });

    it('should throw CloudStackError on network error with context', async () => {
      const networkError = Object.assign(new Error('Network timeout'), {
        isAxiosError: true,
        response: {
          status: 503,
          data: {
            errortext: 'Service unavailable'
          }
        }
      });

      const axiosInstance = {
        get: jest.fn().mockRejectedValue(networkError)
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);
      (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      try {
        await client.deployVirtualMachine({
          serviceofferingid: 'so-1',
          templateid: 'template-1',
          zoneid: 'zone-1'
        });
        fail('Should have thrown CloudStackError');
      } catch (error) {
        expect(error).toBeInstanceOf(CloudStackError);
        if (error instanceof CloudStackError) {
          expect(error.message).toContain('Service unavailable');
          expect(error.command).toBe('deployVirtualMachine');
          expect(error.statusCode).toBe(503);
          expect(error.params).toBeDefined();
        }
      }
    });

    it('should sanitize sensitive parameters in error', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            errortext: 'Authentication failed'
          },
          status: 401
        })
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
      });

      try {
        await client.request('someCommand', {
          username: 'testuser',
          password: 'secretpassword',
          apikey: 'my-secret-key'
        });
        fail('Should have thrown CloudStackError');
      } catch (error) {
        expect(error).toBeInstanceOf(CloudStackError);
        if (error instanceof CloudStackError) {
          expect(error.params).toBeDefined();
          if (error.params) {
            expect(error.params.password).toBe('[REDACTED]');
            expect(error.params.apikey).toBe('[REDACTED]');
            expect(error.params.username).toBe('testuser');
          }
        }
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors and succeed', async () => {
      let attemptCount = 0;
      const mockResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [],
        },
      };

      const axiosInstance = {
        get: jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 3) {
            // Fail first 2 attempts with network error
            const error = new Error('Network Error');
            error.name = 'AxiosError';
            return Promise.reject(error);
          }
          // Succeed on 3rd attempt
          return Promise.resolve({ data: mockResponse });
        }),
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        retryConfig: { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryableStatusCodes: [500, 502, 503] },
      });

      const result = await client.listVirtualMachines();

      expect(result).toEqual(mockResponse);
      expect(axiosInstance.get).toHaveBeenCalledTimes(3);
      expect(attemptCount).toBe(3);
    });

    it('should retry on 503 status and succeed', async () => {
      let attemptCount = 0;
      const mockResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [],
        },
      };

      const axiosInstance = {
        get: jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 2) {
            // Fail first attempt with 503
            const error: any = new Error('Service Unavailable');
            error.isAxiosError = true;
            error.response = { status: 503, data: {} };
            return Promise.reject(error);
          }
          // Succeed on 2nd attempt
          return Promise.resolve({ data: mockResponse });
        }),
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);
      (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        retryConfig: { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryableStatusCodes: [503] },
      });

      const result = await client.listVirtualMachines();

      expect(result).toEqual(mockResponse);
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(attemptCount).toBe(2);
    });

    it('should not retry on 404 status', async () => {
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          isAxiosError: true,
          response: { status: 404, data: {} },
          message: 'Not Found',
        }),
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);
      (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        retryConfig: { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryableStatusCodes: [500, 503] },
      });

      await expect(client.listVirtualMachines()).rejects.toThrow();
      expect(axiosInstance.get).toHaveBeenCalledTimes(1); // No retries
    });

    it('should exhaust retries and throw error', async () => {
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          isAxiosError: true,
          response: undefined, // Network error
          message: 'Network timeout',
        }),
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);
      (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        retryConfig: { maxRetries: 2, initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryableStatusCodes: [500] },
      });

      await expect(client.listVirtualMachines()).rejects.toThrow(/failed after 3 attempts/);
      expect(axiosInstance.get).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry CloudStack API errors', async () => {
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            errortext: 'Invalid parameter',
          },
          status: 200,
        }),
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        retryConfig: { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryableStatusCodes: [500] },
      });

      await expect(client.listVirtualMachines()).rejects.toThrow('CloudStack API Error: Invalid parameter');
      expect(axiosInstance.get).toHaveBeenCalledTimes(1); // No retries on API errors
    });

    it('should use custom retry configuration', async () => {
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          isAxiosError: true,
          response: { status: 429, data: {} },
          message: 'Too Many Requests',
        }),
      };

      mockedAxios.create = jest.fn().mockReturnValue(axiosInstance as any);
      (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

      const client = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        retryConfig: {
          maxRetries: 1, // Only 1 retry
          initialDelayMs: 10,
          maxDelayMs: 100,
          backoffMultiplier: 2,
          retryableStatusCodes: [429]
        },
      });

      await expect(client.listVirtualMachines()).rejects.toThrow();
      expect(axiosInstance.get).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });
});
