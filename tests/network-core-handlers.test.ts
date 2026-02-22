import { NetworkCoreHandlers } from '../src/handlers/network/core-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('NetworkCoreHandlers', () => {
  let handlers: NetworkCoreHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new NetworkCoreHandlers(mockClient);
  });

  describe('handleListNetworks', () => {
    it('should list networks successfully', async () => {
      const mockResponse = {
        listnetworksresponse: {
          network: [
            {
              id: 'net-1',
              name: 'default-network',
              displaytext: 'Default Network',
              type: 'Isolated',
              state: 'Implemented',
              zonename: 'Zone1',
              cidr: '10.0.0.0/24',
              gateway: '10.0.0.1',
              netmask: '255.255.255.0',
              vlan: '100',
              broadcasturi: 'vlan://100',
              traffictype: 'Guest',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListNetworks({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Found 1 network');
      expect(result.content[0].text).toContain('default-network');
      expect(mockClient.request).toHaveBeenCalledWith('listNetworks', {});
    });

    it('should handle empty network list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworksresponse: {},
      });

      const result = await handlers.handleListNetworks({});

      expect(result.content[0].text).toContain('No networks found');
    });

    it('should filter networks by zone', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworksresponse: { network: [] },
      });

      await handlers.handleListNetworks({ zoneid: 'zone-1' });

      expect(mockClient.request).toHaveBeenCalledWith('listNetworks', { zoneid: 'zone-1' });
    });
  });

  describe('handleCreateNetwork', () => {
    it('should create a network successfully', async () => {
      const mockResponse = {
        createnetworkresponse: {
          jobid: 'job-123',
          id: 'net-456',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'test-network',
        displaytext: 'Test Network',
        networkofferingid: 'offering-1',
        zoneid: 'zone-1',
      };

      const result = await handlers.handleCreateNetwork(args);

      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('net-456');
      expect(mockClient.request).toHaveBeenCalledWith('createNetwork', args);
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateNetwork({ name: 'test' } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteNetwork', () => {
    it('should delete a network successfully', async () => {
      const mockResponse = {
        deletenetworkresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteNetwork({ id: 'net-1' });

      expect(result.content[0].text).toContain('net-1');
      expect(mockClient.request).toHaveBeenCalledWith('deleteNetwork', { id: 'net-1' });
    });

    it('should return error for missing id field', async () => {
      const result = await handlers.handleDeleteNetwork({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListPublicIpAddresses', () => {
    it('should list public IP addresses successfully', async () => {
      const mockResponse = {
        listpublicipaddressesresponse: {
          publicipaddress: [
            {
              id: 'ip-1',
              ipaddress: '203.0.113.1',
              allocated: '2024-01-01T00:00:00Z',
              zonename: 'Zone1',
              state: 'Allocated',
              issourcenat: false,
              isstaticnat: false,
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListPublicIpAddresses({});

      expect(result.content[0].text).toContain('Found 1 public IP address');
      expect(result.content[0].text).toContain('203.0.113.1');
    });
  });

  describe('handleAssociateIpAddress', () => {
    it('should associate an IP address successfully', async () => {
      const mockResponse = {
        associateipaddressresponse: {
          jobid: 'job-123',
          id: 'ip-456',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleAssociateIpAddress({ zoneid: 'zone-1' });

      expect(result.content[0].text).toContain('job-123');
      expect(mockClient.request).toHaveBeenCalledWith('associateIpAddress', { zoneid: 'zone-1' });
    });
  });

  describe('handleDisassociateIpAddress', () => {
    it('should disassociate an IP address successfully', async () => {
      const mockResponse = {
        disassociateipaddressresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDisassociateIpAddress({ id: 'ip-1' });

      expect(result.content[0].text).toContain('ip-1');
      expect(mockClient.request).toHaveBeenCalledWith('disassociateIpAddress', { id: 'ip-1' });
    });
  });

  describe('handleListVPCs', () => {
    it('should list VPCs successfully', async () => {
      const mockResponse = {
        listvpcsresponse: {
          vpc: [
            {
              id: 'vpc-1',
              name: 'production-vpc',
              displaytext: 'Production VPC',
              cidr: '10.0.0.0/16',
              state: 'Enabled',
              zonename: 'Zone1',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListVPCs({});

      expect(result.content[0].text).toContain('Found 1 VPC');
      expect(result.content[0].text).toContain('production-vpc');
      expect(result.content[0].text).toContain('10.0.0.0/16');
    });
  });

  describe('handleCreateVPC', () => {
    it('should create a VPC successfully', async () => {
      const mockResponse = {
        createvpcresponse: {
          jobid: 'job-123',
          id: 'vpc-456',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'test-vpc',
        displaytext: 'Test VPC',
        cidr: '10.0.0.0/16',
        vpcofferingid: 'offering-1',
        zoneid: 'zone-1',
      };

      const result = await handlers.handleCreateVPC(args);

      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('vpc-456');
      expect(mockClient.request).toHaveBeenCalledWith('createVPC', args);
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateVPC({ name: 'test' } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteVPC', () => {
    it('should delete a VPC successfully', async () => {
      const mockResponse = {
        deletevpcresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteVPC({ id: 'vpc-1' });

      expect(result.content[0].text).toContain('vpc-1');
      expect(mockClient.request).toHaveBeenCalledWith('deleteVPC', { id: 'vpc-1' });
    });

    it('should return error for missing id field', async () => {
      const result = await handlers.handleDeleteVPC({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleEnableStaticNat', () => {
    it('should enable static NAT successfully', async () => {
      const mockResponse = {
        enablestaticnatresponse: {
          success: true,
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        ipaddressid: 'ip-123',
        virtualmachineid: 'vm-456',
      };

      const result = await handlers.handleEnableStaticNat(args);

      expect(result.content[0].text).toContain('Enabled static NAT');
      expect(result.content[0].text).toContain('ip-123');
      expect(result.content[0].text).toContain('vm-456');
      expect(result.content[0].text).toContain('true');
      expect(mockClient.request).toHaveBeenCalledWith('enableStaticNat', args);
    });

    it('should return error for missing ipaddressid field', async () => {
      const result = await handlers.handleEnableStaticNat({ virtualmachineid: 'vm-1' } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error for missing virtualmachineid field', async () => {
      const result = await handlers.handleEnableStaticNat({ ipaddressid: 'ip-1' } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDisableStaticNat', () => {
    it('should disable static NAT successfully', async () => {
      const mockResponse = {
        disablestaticnatresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDisableStaticNat({ ipaddressid: 'ip-123' });

      expect(result.content[0].text).toContain('Disabled static NAT');
      expect(result.content[0].text).toContain('ip-123');
      expect(result.content[0].text).toContain('job-789');
      expect(mockClient.request).toHaveBeenCalledWith('disableStaticNat', { ipaddressid: 'ip-123' });
    });

    it('should return error for missing ipaddressid field', async () => {
      const result = await handlers.handleDisableStaticNat({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleRestartVPC', () => {
    it('should restart a VPC successfully', async () => {
      const mockResponse = {
        restartvpcresponse: {
          jobid: 'job-restart-123',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleRestartVPC({ id: 'vpc-1' });

      expect(result.content[0].text).toContain('Restarting VPC vpc-1');
      expect(result.content[0].text).toContain('job-restart-123');
      expect(mockClient.request).toHaveBeenCalledWith('restartVPC', { id: 'vpc-1' });
    });

    it('should restart a VPC with cleanup option', async () => {
      const mockResponse = {
        restartvpcresponse: {
          jobid: 'job-restart-456',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleRestartVPC({ id: 'vpc-1', cleanup: true });

      expect(result.content[0].text).toContain('Restarting VPC vpc-1');
      expect(result.content[0].text).toContain('with cleanup');
      expect(result.content[0].text).toContain('job-restart-456');
      expect(mockClient.request).toHaveBeenCalledWith('restartVPC', { id: 'vpc-1', cleanup: true });
    });

    it('should return error for missing id field', async () => {
      const result = await handlers.handleRestartVPC({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListNetworkOfferings', () => {
    it('should list network offerings successfully', async () => {
      const mockResponse = {
        listnetworkofferingsresponse: {
          networkoffering: [
            {
              id: 'offering-1',
              name: 'DefaultIsolatedNetworkOffering',
              displaytext: 'Default Isolated Network Offering',
              state: 'Enabled',
              isdefault: true,
              traffictype: 'Guest',
            },
            {
              id: 'offering-2',
              name: 'CustomNetworkOffering',
              displaytext: 'Custom Network Offering',
              state: 'Enabled',
              isdefault: false,
              traffictype: 'Guest',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListNetworkOfferings({});

      expect(result.content[0].text).toContain('Found 2 network offerings');
      expect(result.content[0].text).toContain('DefaultIsolatedNetworkOffering');
      expect(result.content[0].text).toContain('CustomNetworkOffering');
      expect(mockClient.request).toHaveBeenCalledWith('listNetworkOfferings', {});
    });

    it('should handle empty network offerings list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkofferingsresponse: {},
      });

      const result = await handlers.handleListNetworkOfferings({});

      expect(result.content[0].text).toContain('No network offerings found');
    });

    it('should filter network offerings by state', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkofferingsresponse: { networkoffering: [] },
      });

      await handlers.handleListNetworkOfferings({ state: 'Enabled' });

      expect(mockClient.request).toHaveBeenCalledWith('listNetworkOfferings', { state: 'Enabled' });
    });
  });

  describe('handleCreateNetworkOffering', () => {
    it('should create a network offering successfully', async () => {
      const mockResponse = {
        createnetworkofferingresponse: {
          networkoffering: {
            id: 'offering-new-123',
            state: 'Enabled',
          },
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'test-offering',
        displaytext: 'Test Network Offering',
        guestiptype: 'Isolated',
        traffictype: 'Guest',
        supportedservices: 'Dhcp,Dns,SourceNat',
      };

      const result = await handlers.handleCreateNetworkOffering(args);

      expect(result.content[0].text).toContain('Created network offering');
      expect(result.content[0].text).toContain('test-offering');
      expect(result.content[0].text).toContain('offering-new-123');
      expect(result.content[0].text).toContain('Enabled');
      expect(mockClient.request).toHaveBeenCalledWith('createNetworkOffering', args);
    });

    it('should return error for missing name field', async () => {
      const result = await handlers.handleCreateNetworkOffering({
        displaytext: 'Test',
        guestiptype: 'Isolated',
        traffictype: 'Guest',
        supportedservices: 'Dhcp',
      } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error for missing displaytext field', async () => {
      const result = await handlers.handleCreateNetworkOffering({
        name: 'test',
        guestiptype: 'Isolated',
        traffictype: 'Guest',
        supportedservices: 'Dhcp',
      } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error for missing guestiptype field', async () => {
      const result = await handlers.handleCreateNetworkOffering({
        name: 'test',
        displaytext: 'Test',
        traffictype: 'Guest',
        supportedservices: 'Dhcp',
      } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error for missing traffictype field', async () => {
      const result = await handlers.handleCreateNetworkOffering({
        name: 'test',
        displaytext: 'Test',
        guestiptype: 'Isolated',
        supportedservices: 'Dhcp',
      } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error for missing supportedservices field', async () => {
      const result = await handlers.handleCreateNetworkOffering({
        name: 'test',
        displaytext: 'Test',
        guestiptype: 'Isolated',
        traffictype: 'Guest',
      } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateNetwork', () => {
    it('should successfully update a network', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatenetworkresponse: { jobid: 'job-123' },
      });
      const result = await handlers.handleUpdateNetwork({ id: 'net-1' });
      expect(mockClient.request).toHaveBeenCalledWith('updateNetwork', { id: 'net-1' });
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateNetwork({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleRestartNetwork', () => {
    it('should successfully restart a network', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        restartnetworkresponse: { jobid: 'job-123' },
      });
      const result = await handlers.handleRestartNetwork({ id: 'net-1' });
      expect(mockClient.request).toHaveBeenCalledWith('restartNetwork', { id: 'net-1' });
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleRestartNetwork({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleUpdateVpc', () => {
    it('should successfully update a VPC', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatevpcresponse: { jobid: 'job-123' },
      });
      const result = await handlers.handleUpdateVpc({ id: 'vpc-1' });
      expect(mockClient.request).toHaveBeenCalledWith('updateVPC', { id: 'vpc-1' });
      expect(result.content[0].text).toContain('Updated VPC');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateVpc({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleListVpcOfferings', () => {
    it('should list VPC offerings successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpcofferingsresponse: {
          vpcoffering: [
            { id: 'vpco-1', name: 'Default VPC Offering', state: 'Enabled' },
          ],
        },
      });
      const result = await handlers.handleListVpcOfferings({});
      expect(mockClient.request).toHaveBeenCalledWith('listVPCOfferings', {});
      expect(result.content[0].text).toContain('vpco-1');
    });

    it('should handle empty VPC offerings list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpcofferingsresponse: {},
      });
      const result = await handlers.handleListVpcOfferings({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleCreateVpcOffering', () => {
    it('should successfully create a VPC offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createvpcofferingresponse: { vpcoffering: { id: 'vpco-new' } },
      });
      const args = { name: 'test-offering', displaytext: 'Test VPC Offering', supportedservices: 'Dhcp,Dns' };
      const result = await handlers.handleCreateVpcOffering(args);
      expect(mockClient.request).toHaveBeenCalledWith('createVPCOffering', args);
      expect(result.content[0].text).toContain('Created VPC offering');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateVpcOffering({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDeleteVpcOffering', () => {
    it('should successfully delete a VPC offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletevpcofferingresponse: { success: true },
      });
      const result = await handlers.handleDeleteVpcOffering({ id: 'vpco-1' });
      expect(mockClient.request).toHaveBeenCalledWith('deleteVPCOffering', { id: 'vpco-1' });
      expect(result.content[0].text).toContain('Deleting VPC offering');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleDeleteVpcOffering({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleUpdateVpcOffering', () => {
    it('should successfully update a VPC offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatevpcofferingresponse: { vpcoffering: { id: 'vpco-1' } },
      });
      const result = await handlers.handleUpdateVpcOffering({ id: 'vpco-1' });
      expect(mockClient.request).toHaveBeenCalledWith('updateVPCOffering', { id: 'vpco-1' });
      expect(result.content[0].text).toContain('Updated VPC offering');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateVpcOffering({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleListSupportedNetworkServices', () => {
    it('should list supported network services successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsupportednetworkservicesresponse: {
          networkservice: [
            { name: 'Dhcp', provider: [{ name: 'VirtualRouter' }] },
          ],
        },
      });
      const result = await handlers.handleListSupportedNetworkServices({});
      expect(mockClient.request).toHaveBeenCalledWith('listSupportedNetworkServices', {});
      expect(result.content[0].text).toContain('Dhcp');
    });

    it('should handle empty supported network services list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsupportednetworkservicesresponse: {},
      });
      const result = await handlers.handleListSupportedNetworkServices({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleListNetworkServiceProviders', () => {
    it('should list network service providers successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkserviceprovidersresponse: {
          networkserviceprovider: [
            { id: 'nsp-1', name: 'VirtualRouter', state: 'Enabled' },
          ],
        },
      });
      const result = await handlers.handleListNetworkServiceProviders({});
      expect(mockClient.request).toHaveBeenCalledWith('listNetworkServiceProviders', {});
      expect(result.content[0].text).toContain('nsp-1');
    });

    it('should handle empty network service providers list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkserviceprovidersresponse: {},
      });
      const result = await handlers.handleListNetworkServiceProviders({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle CloudStack API errors', async () => {
      const error = new Error('CloudStack API error');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(handlers.handleListNetworks({})).rejects.toThrow('CloudStack API error');
    });
  });
});
