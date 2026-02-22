import { NetworkNicHandlers } from '../src/handlers/network/nic-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';
import { ValidationError } from '../src/handler-types.js';

// Mock MCP SDK types
jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  McpError: class McpError extends Error {
    code: number;
    constructor(code: number, message: string) {
      super(message);
      this.code = code;
      this.name = 'McpError';
    }
  },
  ErrorCode: {
    InvalidRequest: -32600,
    InternalError: -32603
  }
}));

jest.mock('../src/cloudstack-client.js');

describe('NetworkNicHandlers', () => {
  let handlers: NetworkNicHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new NetworkNicHandlers(mockClient);
  });

  describe('handleListNics', () => {
    it('should list NICs for a VM successfully', async () => {
      const mockResponse = {
        listnicsresponse: {
          nic: [
            {
              id: 'nic-1',
              ipaddress: '192.168.1.10',
              netmask: '255.255.255.0',
              gateway: '192.168.1.1',
              macaddress: '00:11:22:33:44:55',
              networkid: 'net-1',
              networkname: 'default-network',
              isdefault: true,
              type: 'Shared',
              secondaryip: [],
            },
            {
              id: 'nic-2',
              ipaddress: '10.0.0.10',
              netmask: '255.255.255.0',
              gateway: '10.0.0.1',
              macaddress: '00:11:22:33:44:66',
              networkid: 'net-2',
              networkname: 'private-network',
              isdefault: false,
              type: 'Isolated',
              secondaryip: [
                { ipaddress: '10.0.0.11' },
                { ipaddress: '10.0.0.12' },
              ],
            },
          ],
        },
      };

      mockClient.listNics = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListNics({ virtualmachineid: 'vm-1' });

      expect(mockClient.listNics).toHaveBeenCalledWith({ virtualmachineid: 'vm-1' });
      expect(result.content[0].text).toContain('Found 2 network interface(s)');
      expect(result.content[0].text).toContain('nic-1');
      expect(result.content[0].text).toContain('(DEFAULT)');
      expect(result.content[0].text).toContain('192.168.1.10');
      expect(result.content[0].text).toContain('00:11:22:33:44:55');
      expect(result.content[0].text).toContain('nic-2');
      expect(result.content[0].text).toContain('10.0.0.10');
      expect(result.content[0].text).toContain('10.0.0.11, 10.0.0.12');
    });

    it('should handle empty NIC list', async () => {
      mockClient.listNics = jest.fn().mockResolvedValue({
        listnicsresponse: {},
      });

      const result = await handlers.handleListNics({ virtualmachineid: 'vm-1' });

      expect(result.content[0].text).toContain('Found 0 network interface(s)');
    });

    it('should validate required virtualmachineid field', async () => {
      await expect(
        handlers.handleListNics({} as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('handleAddNicToVirtualMachine', () => {
    it('should add NIC to VM successfully', async () => {
      const mockResponse = {
        addnictovirtualmachineresponse: {
          jobid: 'job-add-nic',
          nic: {
            id: 'nic-new',
          },
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {
            virtualmachine: {
              nic: [
                {
                  id: 'nic-new',
                  networkid: 'net-1',
                  ipaddress: '192.168.1.20',
                  macaddress: '00:11:22:33:44:77',
                },
              ],
            },
          },
        },
      };

      mockClient.addNicToVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleAddNicToVirtualMachine({
        virtualmachineid: 'vm-1',
        networkid: 'net-1',
      });

      expect(mockClient.addNicToVirtualMachine).toHaveBeenCalledWith({
        virtualmachineid: 'vm-1',
        networkid: 'net-1',
      });
      expect(result.content[0].text).toContain('Successfully added NIC');
      expect(result.content[0].text).toContain('nic-new');
      expect(result.content[0].text).toContain('192.168.1.20');
    });

    it('should handle job polling for add NIC', async () => {
      const mockResponse = {
        addnictovirtualmachineresponse: {
          jobid: 'job-123',
        },
      };

      const mockJobComplete = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {
            virtualmachine: {
              nic: [{
                id: 'nic-1',
                networkid: 'net-1',
                ipaddress: '10.0.0.5',
                macaddress: '00:11:22:33:44:88',
              }],
            },
          },
        },
      };

      mockClient.addNicToVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobComplete);

      const result = await handlers.handleAddNicToVirtualMachine({
        virtualmachineid: 'vm-1',
        networkid: 'net-1',
      });

      expect(mockClient.waitForAsyncJob).toHaveBeenCalledWith('job-123', { timeout: 300000 });
      expect(result.content[0].text).toContain('Successfully added NIC');
    });

    it('should validate required fields', async () => {
      await expect(
        handlers.handleAddNicToVirtualMachine({ virtualmachineid: 'vm-1' } as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle add NIC job failure', async () => {
      const mockResponse = {
        addnictovirtualmachineresponse: {
          jobid: 'job-fail',
        },
      };

      mockClient.addNicToVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockRejectedValue(
        new Error('Async job job-fail failed: Network not accessible from this VM')
      );

      await expect(
        handlers.handleAddNicToVirtualMachine({
          virtualmachineid: 'vm-1',
          networkid: 'net-1',
        })
      ).rejects.toThrow('Network not accessible from this VM');
    });

    it('should handle response without jobid', async () => {
      const mockResponse = {
        addnictovirtualmachineresponse: {
          nic: {
            id: 'nic-immediate',
          },
        },
      };

      mockClient.addNicToVirtualMachine = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleAddNicToVirtualMachine({
        virtualmachineid: 'vm-1',
        networkid: 'net-1',
      });

      expect(result.content[0].text).toContain('Adding NIC to VM vm-1');
      expect(result.content[0].text).toContain('NIC ID: nic-immediate');
    });
  });

  describe('handleRemoveNicFromVirtualMachine', () => {
    it('should remove NIC from VM successfully', async () => {
      const mockResponse = {
        removenicfromvirtualmachineresponse: {
          jobid: 'job-remove-nic',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {},
        },
      };

      mockClient.removeNicFromVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleRemoveNicFromVirtualMachine({
        virtualmachineid: 'vm-1',
        nicid: 'nic-1',
      });

      expect(mockClient.removeNicFromVirtualMachine).toHaveBeenCalledWith({
        virtualmachineid: 'vm-1',
        nicid: 'nic-1',
      });
      expect(result.content[0].text).toContain('Successfully removed NIC nic-1');
    });

    it('should handle remove NIC failure', async () => {
      const mockResponse = {
        removenicfromvirtualmachineresponse: {
          jobid: 'job-fail',
        },
      };

      mockClient.removeNicFromVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockRejectedValue(
        new Error('Async job job-fail failed: Cannot remove default NIC')
      );

      await expect(
        handlers.handleRemoveNicFromVirtualMachine({
          virtualmachineid: 'vm-1',
          nicid: 'nic-1',
        })
      ).rejects.toThrow('Cannot remove default NIC');
    });

    it('should validate required fields', async () => {
      await expect(
        handlers.handleRemoveNicFromVirtualMachine({ virtualmachineid: 'vm-1' } as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle response without jobid', async () => {
      const mockResponse = {
        removenicfromvirtualmachineresponse: {},
      };

      mockClient.removeNicFromVirtualMachine = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleRemoveNicFromVirtualMachine({
        virtualmachineid: 'vm-1',
        nicid: 'nic-1',
      });

      expect(result.content[0].text).toContain('Removing NIC nic-1 from VM vm-1');
    });
  });

  describe('handleUpdateDefaultNicForVirtualMachine', () => {
    it('should update default NIC successfully', async () => {
      const mockResponse = {
        updatedefaultnicforvirtualmachineresponse: {
          jobid: 'job-update-default',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {},
        },
      };

      mockClient.updateDefaultNicForVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleUpdateDefaultNicForVirtualMachine({
        virtualmachineid: 'vm-1',
        nicid: 'nic-2',
      });

      expect(mockClient.updateDefaultNicForVirtualMachine).toHaveBeenCalledWith({
        virtualmachineid: 'vm-1',
        nicid: 'nic-2',
      });
      expect(result.content[0].text).toContain('Successfully updated default NIC');
      expect(result.content[0].text).toContain('nic-2');
    });

    it('should handle update default NIC failure', async () => {
      const mockResponse = {
        updatedefaultnicforvirtualmachineresponse: {
          jobid: 'job-fail',
        },
      };

      mockClient.updateDefaultNicForVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockRejectedValue(
        new Error('Async job job-fail failed: NIC not found')
      );

      await expect(
        handlers.handleUpdateDefaultNicForVirtualMachine({
          virtualmachineid: 'vm-1',
          nicid: 'nic-invalid',
        })
      ).rejects.toThrow('NIC not found');
    });

    it('should validate required fields', async () => {
      await expect(
        handlers.handleUpdateDefaultNicForVirtualMachine({ virtualmachineid: 'vm-1' } as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle response without jobid', async () => {
      const mockResponse = {
        updatedefaultnicforvirtualmachineresponse: {},
      };

      mockClient.updateDefaultNicForVirtualMachine = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleUpdateDefaultNicForVirtualMachine({
        virtualmachineid: 'vm-1',
        nicid: 'nic-2',
      });

      expect(result.content[0].text).toContain('Updating default NIC for VM vm-1');
    });
  });

  describe('handleAddIpToNic', () => {
    it('should add secondary IP to NIC successfully', async () => {
      const mockResponse = {
        addiptonicresponse: {
          jobid: 'job-add-ip',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {
            nicsecondaryip: {
              id: 'secondaryip-1',
              ipaddress: '192.168.1.30',
              networkid: 'net-1',
            },
          },
        },
      };

      mockClient.addIpToNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleAddIpToNic({
        nicid: 'nic-1',
        ipaddress: '192.168.1.30',
      });

      expect(mockClient.addIpToNic).toHaveBeenCalledWith({
        nicid: 'nic-1',
        ipaddress: '192.168.1.30',
      });
      expect(result.content[0].text).toContain('Successfully added IP address');
      expect(result.content[0].text).toContain('192.168.1.30');
      expect(result.content[0].text).toContain('secondaryip-1');
    });

    it('should handle auto-assigned IP address', async () => {
      const mockResponse = {
        addiptonicresponse: {
          jobid: 'job-add-ip',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {
            nicsecondaryip: {
              id: 'secondaryip-2',
              ipaddress: '192.168.1.31',
              networkid: 'net-1',
            },
          },
        },
      };

      mockClient.addIpToNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleAddIpToNic({ nicid: 'nic-1' });

      expect(result.content[0].text).toContain('192.168.1.31');
    });

    it('should handle add IP failure', async () => {
      const mockResponse = {
        addiptonicresponse: {
          jobid: 'job-fail',
        },
      };

      mockClient.addIpToNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockRejectedValue(
        new Error('Async job job-fail failed: IP address already in use')
      );

      await expect(
        handlers.handleAddIpToNic({ nicid: 'nic-1' })
      ).rejects.toThrow('IP address already in use');
    });

    it('should validate required nicid field', async () => {
      await expect(
        handlers.handleAddIpToNic({} as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle response without jobid', async () => {
      const mockResponse = {
        addiptonicresponse: {},
      };

      mockClient.addIpToNic = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleAddIpToNic({
        nicid: 'nic-1',
        ipaddress: '192.168.1.50',
      });

      expect(result.content[0].text).toContain('Adding IP address 192.168.1.50 to NIC nic-1');
    });

    it('should handle response without jobid and auto-assigned IP', async () => {
      const mockResponse = {
        addiptonicresponse: {},
      };

      mockClient.addIpToNic = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleAddIpToNic({ nicid: 'nic-1' });

      expect(result.content[0].text).toContain('Adding IP address auto-assigned to NIC nic-1');
    });
  });

  describe('handleRemoveIpFromNic', () => {
    it('should remove secondary IP from NIC successfully', async () => {
      const mockResponse = {
        removeipfromnicresponse: {
          jobid: 'job-remove-ip',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {},
        },
      };

      mockClient.removeIpFromNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleRemoveIpFromNic({ id: 'secondaryip-1' });

      expect(mockClient.removeIpFromNic).toHaveBeenCalledWith({ id: 'secondaryip-1' });
      expect(result.content[0].text).toContain('Successfully removed secondary IP');
      expect(result.content[0].text).toContain('secondaryip-1');
    });

    it('should handle remove IP failure', async () => {
      const mockResponse = {
        removeipfromnicresponse: {
          jobid: 'job-fail',
        },
      };

      mockClient.removeIpFromNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockRejectedValue(
        new Error('Async job job-fail failed: Secondary IP not found')
      );

      await expect(
        handlers.handleRemoveIpFromNic({ id: 'invalid-ip' })
      ).rejects.toThrow('Secondary IP not found');
    });

    it('should validate required id field', async () => {
      await expect(
        handlers.handleRemoveIpFromNic({} as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle response without jobid', async () => {
      const mockResponse = {
        removeipfromnicresponse: {},
      };

      mockClient.removeIpFromNic = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleRemoveIpFromNic({ id: 'secondaryip-1' });

      expect(result.content[0].text).toContain('Removing secondary IP secondaryip-1');
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('Network error');
      mockClient.listNics = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleListNics({ virtualmachineid: 'vm-1' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('async job behavior', () => {
    it('should call waitForAsyncJob with correct timeout for removeNic', async () => {
      const mockResponse = {
        removenicfromvirtualmachineresponse: {
          jobid: 'job-poll',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {},
        },
      };

      mockClient.removeNicFromVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleRemoveNicFromVirtualMachine({
        virtualmachineid: 'vm-1',
        nicid: 'nic-1',
      });

      expect(mockClient.waitForAsyncJob).toHaveBeenCalledWith('job-poll', { timeout: 300000 });
      expect(result.content[0].text).toContain('Successfully removed NIC');
    });

    it('should call waitForAsyncJob with correct timeout for updateDefaultNic', async () => {
      const mockResponse = {
        updatedefaultnicforvirtualmachineresponse: {
          jobid: 'job-poll',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {},
        },
      };

      mockClient.updateDefaultNicForVirtualMachine = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleUpdateDefaultNicForVirtualMachine({
        virtualmachineid: 'vm-1',
        nicid: 'nic-2',
      });

      expect(mockClient.waitForAsyncJob).toHaveBeenCalledWith('job-poll', { timeout: 300000 });
      expect(result.content[0].text).toContain('Successfully updated default NIC');
    });

    it('should call waitForAsyncJob with correct timeout for addIpToNic', async () => {
      const mockResponse = {
        addiptonicresponse: {
          jobid: 'job-poll',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {
            nicsecondaryip: {
              id: 'secip-1',
              ipaddress: '10.0.0.50',
              networkid: 'net-1',
            },
          },
        },
      };

      mockClient.addIpToNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleAddIpToNic({ nicid: 'nic-1' });

      expect(mockClient.waitForAsyncJob).toHaveBeenCalledWith('job-poll', { timeout: 300000 });
      expect(result.content[0].text).toContain('Successfully added IP');
    });

    it('should call waitForAsyncJob with correct timeout for removeIpFromNic', async () => {
      const mockResponse = {
        removeipfromnicresponse: {
          jobid: 'job-poll',
        },
      };

      const mockJobResult = {
        queryasyncjobresultresponse: {
          jobstatus: 1,
          jobresult: {},
        },
      };

      mockClient.removeIpFromNic = jest.fn().mockResolvedValue(mockResponse);
      mockClient.waitForAsyncJob = jest.fn().mockResolvedValue(mockJobResult);

      const result = await handlers.handleRemoveIpFromNic({ id: 'secip-1' });

      expect(mockClient.waitForAsyncJob).toHaveBeenCalledWith('job-poll', { timeout: 300000 });
      expect(result.content[0].text).toContain('Successfully removed secondary IP');
    });
  });
});
