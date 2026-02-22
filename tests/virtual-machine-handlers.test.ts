import { VirtualMachineHandlers } from '../src/handlers/virtual-machine-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock MCP SDK types since Jest has issues with ES modules
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
    MethodNotFound: -32601,
    InternalError: -32603
  }
}));

// Mock the CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('VirtualMachineHandlers', () => {
  let vmHandlers: VirtualMachineHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.local/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret'
    }) as jest.Mocked<CloudStackClient>;

    // Setup request mock for factory handlers
    mockClient.request = jest.fn();

    vmHandlers = new VirtualMachineHandlers(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleListVirtualMachines', () => {
    it('should list all virtual machines', async () => {
      const mockResponse = {
        listvirtualmachinesresponse: {
          count: 2,
          virtualmachine: [
            { id: 'vm-1', name: 'test-vm-1', state: 'Running' },
            { id: 'vm-2', name: 'test-vm-2', state: 'Stopped' }
          ]
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleListVirtualMachines({});

      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith({});
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('vm-2');
    });

    it('should list virtual machines with filters', async () => {
      const mockResponse = {
        listvirtualmachinesresponse: {
          count: 1,
          virtualmachine: [
            { id: 'vm-1', name: 'filtered-vm', state: 'Running' }
          ]
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        zoneid: 'zone-1',
        state: 'Running',
        keyword: 'filtered'
      };

      const result = await vmHandlers.handleListVirtualMachines(args);

      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('filtered-vm');
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        listvirtualmachinesresponse: {
          count: 50,
          virtualmachine: [
            { id: 'vm-1', name: 'vm-1', state: 'Running' }
          ]
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        page: 2,
        pagesize: 25
      };

      await vmHandlers.handleListVirtualMachines(args);

      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith(args);
    });

    it('should handle empty result', async () => {
      const mockResponse = {
        listvirtualmachinesresponse: {
          count: 0,
          virtualmachine: []
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleListVirtualMachines({});

      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleGetVirtualMachine', () => {
    it('should get specific virtual machine by ID', async () => {
      const mockResponse = {
        listvirtualmachinesresponse: {
          count: 1,
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'specific-vm',
              state: 'Running',
              cpunumber: 2,
              memory: 2048
            }
          ]
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleGetVirtualMachine({ id: 'vm-123' });

      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith({ id: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('specific-vm');
      expect(result.content[0].text).toContain('SecurityGroups: None');
    });

    it('should display security groups when present', async () => {
      const mockResponse = {
        listvirtualmachinesresponse: {
          count: 1,
          virtualmachine: [
            {
              id: 'vm-456',
              name: 'vm-with-sg',
              state: 'Running',
              cpunumber: 2,
              memory: 4096,
              displayname: 'VM With Security Groups',
              zonename: 'Zone1',
              templatename: 'Ubuntu-22.04',
              serviceofferingname: 'Medium',
              nic: [{ ipaddress: '192.168.1.100' }],
              hostname: 'host-1',
              created: '2024-01-01T00:00:00Z',
              hypervisor: 'KVM',
              rootdevicetype: 'ROOT',
              securitygroup: [
                { name: 'default' },
                { name: 'web-servers' }
              ]
            }
          ]
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleGetVirtualMachine({ id: 'vm-456' });

      expect(result.content[0].text).toContain('SecurityGroups: default, web-servers');
    });

    it('should throw error when id is missing', async () => {
      await expect(vmHandlers.handleGetVirtualMachine({}))
        .rejects
        .toThrow('Missing required field: id');
    });

    it('should throw error when VM is not found', async () => {
      mockClient.listVirtualMachines = jest.fn().mockResolvedValue({
        listvirtualmachinesresponse: {}
      });

      await expect(vmHandlers.handleGetVirtualMachine({ id: 'nonexistent-vm' }))
        .rejects
        .toThrow('Virtual machine with ID nonexistent-vm not found');
    });
  });

  describe('handleStartVirtualMachine', () => {
    it('should start virtual machine successfully', async () => {
      const mockResponse = {
        startvirtualmachineresponse: {
          jobid: 'job-123',
          id: 'vm-123'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleStartVirtualMachine({ id: 'vm-123' });

      expect(mockClient.request).toHaveBeenCalledWith('startVirtualMachine', { id: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error when id is missing', async () => {
      const result = await vmHandlers.handleStartVirtualMachine({});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleStopVirtualMachine', () => {
    it('should stop virtual machine successfully', async () => {
      const mockResponse = {
        stopvirtualmachineresponse: {
          jobid: 'job-456',
          id: 'vm-123'
        }
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleStopVirtualMachine({ id: 'vm-123' });

      expect(mockClient.request).toHaveBeenCalledWith('stopVirtualMachine', { id: 'vm-123', forced: false });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-456');
    });

    it('should support forced stop', async () => {
      const mockResponse = {
        stopvirtualmachineresponse: {
          jobid: 'job-789',
          id: 'vm-123'
        }
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      await vmHandlers.handleStopVirtualMachine({
        id: 'vm-123',
        forced: true
      });

      expect(mockClient.request).toHaveBeenCalledWith('stopVirtualMachine', {
        id: 'vm-123',
        forced: true
      });
    });

    it('should throw error when id is missing', async () => {
      await expect(vmHandlers.handleStopVirtualMachine({}))
        .rejects
        .toThrow('Missing required field: id');
    });
  });

  describe('handleRebootVirtualMachine', () => {
    it('should reboot virtual machine successfully', async () => {
      const mockResponse = {
        rebootvirtualmachineresponse: {
          jobid: 'job-reboot-1',
          id: 'vm-123'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleRebootVirtualMachine({ id: 'vm-123' });

      expect(mockClient.request).toHaveBeenCalledWith('rebootVirtualMachine', { id: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-reboot-1');
    });

    it('should return error when id is missing', async () => {
      const result = await vmHandlers.handleRebootVirtualMachine({});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleDestroyVirtualMachine', () => {
    it('should destroy virtual machine successfully', async () => {
      const mockListResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'test-vm',
              state: 'Stopped'
            }
          ]
        }
      };

      const mockDestroyResponse = {
        destroyvirtualmachineresponse: {
          jobid: 'job-destroy-1',
          id: 'vm-123'
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockListResponse);
      mockClient.destroyVirtualMachine = jest.fn().mockResolvedValue(mockDestroyResponse);

      const result = await vmHandlers.handleDestroyVirtualMachine({ id: 'vm-123' });

      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith({ id: 'vm-123' });
      expect(mockClient.destroyVirtualMachine).toHaveBeenCalledWith({ id: 'vm-123', expunge: false });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-destroy-1');
    });

    it('should support expunge flag', async () => {
      const mockListResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'test-vm',
              state: 'Stopped'
            }
          ]
        }
      };

      const mockDestroyResponse = {
        destroyvirtualmachineresponse: {
          jobid: 'job-destroy-2',
          id: 'vm-123'
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockListResponse);
      mockClient.destroyVirtualMachine = jest.fn().mockResolvedValue(mockDestroyResponse);

      const result = await vmHandlers.handleDestroyVirtualMachine({
        id: 'vm-123',
        expunge: true
      });

      expect(mockClient.destroyVirtualMachine).toHaveBeenCalledWith({
        id: 'vm-123',
        expunge: true
      });
      expect(result.content[0].text).toContain('expunged');
    });

    it('should throw error when id is missing', async () => {
      await expect(vmHandlers.handleDestroyVirtualMachine({}))
        .rejects
        .toThrow('Missing required field: id');
    });

    it('should throw error when VM is not found', async () => {
      mockClient.listVirtualMachines = jest.fn().mockResolvedValue({
        listvirtualmachinesresponse: {}
      });

      await expect(vmHandlers.handleDestroyVirtualMachine({ id: 'nonexistent-vm' }))
        .rejects
        .toThrow('Virtual machine with ID nonexistent-vm not found');
    });

    it('should stop VM first if it is in Running state', async () => {
      const mockListResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'running-vm',
              state: 'Running'
            }
          ]
        }
      };

      const mockStopResponse = {
        stopvirtualmachineresponse: {
          jobid: 'job-stop-1'
        }
      };

      const mockDestroyResponse = {
        destroyvirtualmachineresponse: {
          jobid: 'job-destroy-1',
          id: 'vm-123'
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockListResponse);
      mockClient.stopVirtualMachine = jest.fn().mockResolvedValue(mockStopResponse);
      mockClient.destroyVirtualMachine = jest.fn().mockResolvedValue(mockDestroyResponse);

      const result = await vmHandlers.handleDestroyVirtualMachine({ id: 'vm-123' });

      // Verify stop was called first
      expect(mockClient.stopVirtualMachine).toHaveBeenCalledWith({
        id: 'vm-123',
        forced: true
      });
      // Verify destroy was called after
      expect(mockClient.destroyVirtualMachine).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Stopping VM');
      expect(result.content[0].text).toContain('job-stop-1');
    });

    it('should handle VM in Starting state', async () => {
      const mockListResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'starting-vm',
              state: 'Starting'
            }
          ]
        }
      };

      const mockDestroyResponse = {
        destroyvirtualmachineresponse: {
          jobid: 'job-destroy-1',
          id: 'vm-123'
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockListResponse);
      mockClient.destroyVirtualMachine = jest.fn().mockResolvedValue(mockDestroyResponse);

      const result = await vmHandlers.handleDestroyVirtualMachine({ id: 'vm-123' });

      // Stop should not be called for VMs in Starting state
      expect(mockClient.stopVirtualMachine).not.toHaveBeenCalled();
      expect(mockClient.destroyVirtualMachine).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Starting state');
      expect(result.content[0].text).toContain('attempting to destroy');
    });

    it('should handle VM in Error state', async () => {
      const mockListResponse = {
        listvirtualmachinesresponse: {
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'error-vm',
              state: 'Error'
            }
          ]
        }
      };

      const mockDestroyResponse = {
        destroyvirtualmachineresponse: {
          jobid: 'job-destroy-1',
          id: 'vm-123'
        }
      };

      mockClient.listVirtualMachines = jest.fn().mockResolvedValue(mockListResponse);
      mockClient.destroyVirtualMachine = jest.fn().mockResolvedValue(mockDestroyResponse);

      const result = await vmHandlers.handleDestroyVirtualMachine({ id: 'vm-123' });

      // Stop should not be called for VMs in Error state
      expect(mockClient.stopVirtualMachine).not.toHaveBeenCalled();
      expect(mockClient.destroyVirtualMachine).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Error state');
      expect(result.content[0].text).toContain('proceeding to destroy');
    });
  });

  describe('handleDeployVirtualMachine', () => {
    it('should deploy virtual machine successfully', async () => {
      const mockResponse = {
        deployvirtualmachineresponse: {
          jobid: 'job-deploy-1',
          id: 'vm-new-1'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: 'zone-1',
        name: 'new-vm'
      };

      const result = await vmHandlers.handleDeployVirtualMachine(args);

      expect(mockClient.request).toHaveBeenCalledWith('deployVirtualMachine', args);
      expect(result.content[0].text).toContain('vm-new-1');
      expect(result.content[0].text).toContain('job-deploy-1');
    });

    it('should return error when required fields missing', async () => {
      const result = await vmHandlers.handleDeployVirtualMachine({
        serviceofferingid: 'offering-1',
        templateid: 'template-1'
        // Missing zoneid
      });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('zoneid');
    });

    it('should include optional parameters', async () => {
      const mockResponse = {
        deployvirtualmachineresponse: {
          jobid: 'job-deploy-2',
          id: 'vm-new-2'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: 'zone-1',
        name: 'custom-vm',
        displayname: 'Custom VM',
        networkids: 'net-1,net-2',
        keypair: 'my-key',
        userdata: 'base64data'
      };

      await vmHandlers.handleDeployVirtualMachine(args);

      expect(mockClient.request).toHaveBeenCalledWith('deployVirtualMachine', args);
    });
  });

  describe('handleScaleVirtualMachine', () => {
    it('should scale virtual machine successfully', async () => {
      const mockResponse = {
        scalevirtualmachineresponse: {
          jobid: 'job-scale-1'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleScaleVirtualMachine({
        id: 'vm-123',
        serviceofferingid: 'offering-2'
      });

      expect(mockClient.request).toHaveBeenCalledWith('scaleVirtualMachine', {
        id: 'vm-123',
        serviceofferingid: 'offering-2'
      });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-scale-1');
    });

    it('should return error when id is missing', async () => {
      const result = await vmHandlers.handleScaleVirtualMachine({
        serviceofferingid: 'offering-2'
      });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });

    it('should return error when serviceofferingid is missing', async () => {
      const result = await vmHandlers.handleScaleVirtualMachine({
        id: 'vm-123'
      });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('serviceofferingid');
    });
  });

  describe('handleMigrateVirtualMachine', () => {
    it('should migrate virtual machine successfully', async () => {
      const mockResponse = {
        migratevirtualmachineresponse: {
          jobid: 'job-migrate-1'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleMigrateVirtualMachine({
        virtualmachineid: 'vm-123',
        hostid: 'host-456'
      });

      expect(mockClient.request).toHaveBeenCalledWith('migrateVirtualMachine', {
        virtualmachineid: 'vm-123',
        hostid: 'host-456'
      });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-migrate-1');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await vmHandlers.handleMigrateVirtualMachine({
        hostid: 'host-456'
      });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('virtualmachineid');
    });
  });

  describe('handleResetPasswordVirtualMachine', () => {
    it('should reset virtual machine password successfully', async () => {
      const mockResponse = {
        resetpasswordforvirtualmachineresponse: {
          jobid: 'job-reset-1'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleResetPasswordVirtualMachine({ id: 'vm-123' });

      expect(mockClient.request).toHaveBeenCalledWith('resetPasswordForVirtualMachine', { id: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-reset-1');
    });

    it('should return error when id is missing', async () => {
      const result = await vmHandlers.handleResetPasswordVirtualMachine({});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleChangeServiceOfferingVirtualMachine', () => {
    it('should change service offering successfully', async () => {
      const mockResponse = {
        changeserviceforvirtualmachineresponse: {
          id: 'vm-123',
          jobid: 'job-change-1'
        }
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleChangeServiceOfferingVirtualMachine({
        id: 'vm-123',
        serviceofferingid: 'offering-new'
      });

      expect(mockClient.request).toHaveBeenCalledWith('changeServiceForVirtualMachine', {
        id: 'vm-123',
        serviceofferingid: 'offering-new'
      });
      expect(result.content[0].text).toContain('vm-123');
      expect(result.content[0].text).toContain('job-change-1');
    });

    it('should return error when id is missing', async () => {
      const result = await vmHandlers.handleChangeServiceOfferingVirtualMachine({
        serviceofferingid: 'offering-new'
      });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });

    it('should return error when serviceofferingid is missing', async () => {
      const result = await vmHandlers.handleChangeServiceOfferingVirtualMachine({
        id: 'vm-123'
      });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('serviceofferingid');
    });
  });

  describe('handleListVirtualMachineMetrics', () => {
    it('should list virtual machine metrics successfully', async () => {
      const mockResponse = {
        listvirtualmachinesmetricsresponse: {
          count: 1,
          virtualmachine: [
            {
              id: 'vm-123',
              name: 'test-vm',
              state: 'Running',
              cpuused: '10%',
              memory: 2048,
              cpunumber: 2,
              networkkbsread: 1000,
              networkkbswrite: 500,
              diskioread: 100,
              diskiowrite: 50,
              disksize: 100
            }
          ]
        }
      };

      mockClient.listVirtualMachineMetrics = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleListVirtualMachineMetrics({ id: 'vm-123' });

      expect(mockClient.listVirtualMachineMetrics).toHaveBeenCalledWith({ id: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
    });

    it('should list metrics for all VMs', async () => {
      const mockResponse = {
        listvirtualmachinesmetricsresponse: {
          count: 3,
          virtualmachine: [
            { id: 'vm-1', name: 'vm1', state: 'Running', cpuused: '10%', memory: 1024, cpunumber: 1 },
            { id: 'vm-2', name: 'vm2', state: 'Running', cpuused: '20%', memory: 2048, cpunumber: 2 },
            { id: 'vm-3', name: 'vm3', state: 'Running', cpuused: '30%', memory: 4096, cpunumber: 4 }
          ]
        }
      };

      mockClient.listVirtualMachineMetrics = jest.fn().mockResolvedValue(mockResponse);

      const result = await vmHandlers.handleListVirtualMachineMetrics({});

      expect(mockClient.listVirtualMachineMetrics).toHaveBeenCalledWith({});
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('vm-2');
      expect(result.content[0].text).toContain('vm-3');
    });
  });

  describe('handleRecoverVirtualMachine', () => {
    it('should successfully recover a virtual machine', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        recovervirtualmachineresponse: { virtualmachine: { id: 'vm-123' } },
      });
      const result = await vmHandlers.handleRecoverVirtualMachine({ id: 'vm-123' });
      expect(mockClient.request).toHaveBeenCalledWith('recoverVirtualMachine', { id: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
    });

    it('should return error for missing required field', async () => {
      const result = await vmHandlers.handleRecoverVirtualMachine({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleUpdateVirtualMachine', () => {
    it('should successfully update a virtual machine', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatevirtualmachineresponse: { virtualmachine: { id: 'vm-123' } },
      });
      const result = await vmHandlers.handleUpdateVirtualMachine({ id: 'vm-123', displayname: 'new-name' });
      expect(mockClient.request).toHaveBeenCalledWith('updateVirtualMachine', { id: 'vm-123', displayname: 'new-name' });
      expect(result.content[0].text).toContain('vm-123');
    });

    it('should return error for missing required field', async () => {
      const result = await vmHandlers.handleUpdateVirtualMachine({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleAssignVirtualMachine', () => {
    it('should successfully assign a virtual machine', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        assignvirtualmachineresponse: { virtualmachine: { id: 'vm-123' } },
      });
      const result = await vmHandlers.handleAssignVirtualMachine({ virtualmachineid: 'vm-123', account: 'admin', domainid: 'domain-1' });
      expect(mockClient.request).toHaveBeenCalledWith('assignVirtualMachine', { virtualmachineid: 'vm-123', account: 'admin', domainid: 'domain-1' });
      expect(result.content[0].text).toContain('vm-123');
    });

    it('should return error for missing required fields', async () => {
      const result = await vmHandlers.handleAssignVirtualMachine({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleRestoreVirtualMachine', () => {
    it('should successfully restore a virtual machine', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        restorevirtualmachineresponse: { jobid: 'job-123' },
      });
      const result = await vmHandlers.handleRestoreVirtualMachine({ virtualmachineid: 'vm-123' });
      expect(mockClient.request).toHaveBeenCalledWith('restoreVirtualMachine', { virtualmachineid: 'vm-123' });
      expect(result.content[0].text).toContain('vm-123');
    });

    it('should return error for missing required field', async () => {
      const result = await vmHandlers.handleRestoreVirtualMachine({});
      expect(result.isError).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle CloudStack API errors', async () => {
      mockClient.listVirtualMachines = jest.fn().mockRejectedValue(
        new Error('CloudStack API error: Invalid zone ID')
      );

      await expect(vmHandlers.handleListVirtualMachines({ zoneid: 'invalid-zone' }))
        .rejects
        .toThrow('CloudStack API error: Invalid zone ID');
    });

    it('should handle network errors', async () => {
      mockClient.request.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(vmHandlers.handleStartVirtualMachine({ id: 'vm-123' }))
        .rejects
        .toThrow('Network timeout');
    });

    it('should preserve error context', async () => {
      const originalError = new Error('Insufficient capacity');
      mockClient.request.mockRejectedValue(originalError);

      await expect(vmHandlers.handleDeployVirtualMachine({
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: 'zone-1'
      })).rejects.toThrow('Insufficient capacity');
    });
  });
});
