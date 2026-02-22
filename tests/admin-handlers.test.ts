import { AdminHandlers } from '../src/handlers/admin-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('AdminHandlers', () => {
  let handlers: AdminHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new AdminHandlers(mockClient);
  });

  describe('handleGetServerVersion', () => {
    it('should return server version information', async () => {
      const result = await handlers.handleGetServerVersion();

      const content = JSON.parse(result.content[0].text);

      expect(content).toHaveProperty('server_name', 'irq-cloudstack-mcp');
      expect(content).toHaveProperty('server_version');
      expect(content).toHaveProperty('mcp_sdk_version');
      expect(content).toHaveProperty('description');
      expect(content).toHaveProperty('node_version');
      expect(content).toHaveProperty('platform');
      expect(content).toHaveProperty('arch');
    });

    it('should return valid version format', async () => {
      const result = await handlers.handleGetServerVersion();

      const content = JSON.parse(result.content[0].text);

      // Server version should be in semver format
      expect(content.server_version).toMatch(/^\d+\.\d+\.\d+/);
      // Node version should start with v
      expect(content.node_version).toMatch(/^v\d+/);
    });
  });

  describe('handleGetCloudStackCapabilities', () => {
    it('should return CloudStack capabilities', async () => {
      const mockResponse = {
        listcapabilitiesresponse: {
          capability: {
            cloudstackversion: '4.18.0.0',
            securitygroupsenabled: true,
            kubernetesserviceenabled: true,
            kubernetesclusterexperimentalfeaturesenabled: false,
            kvmsnapshotenabled: true,
            dynamicrolesenabled: true,
            userpublictemplateenabled: true,
            projectinviterequired: false,
            allowusercreateprojects: true,
            allowuserviewdestroyedvm: false,
            allowuserexpungerecovervm: false,
            firewallrulesuisenabled: true,
            supportELB: 'none',
            customdiskofferingminsize: 1,
            customdiskofferingmaxsize: 1024,
            apilimitinterval: 60,
            apilimitmax: 100,
          },
        },
      };

      mockClient.listCapabilities = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetCloudStackCapabilities();

      expect(mockClient.listCapabilities).toHaveBeenCalled();
      expect(result.content[0].text).toContain('CloudStack Capabilities');
      expect(result.content[0].text).toContain('4.18.0.0');
      expect(result.content[0].text).toContain('Security Groups: Enabled');
      expect(result.content[0].text).toContain('Kubernetes Service: Enabled');
    });

    it('should handle missing capability response', async () => {
      const mockResponse = {
        listcapabilitiesresponse: {},
      };

      mockClient.listCapabilities = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetCloudStackCapabilities();

      expect(result.content[0].text).toContain('Unable to retrieve CloudStack capabilities');
    });

    it('should handle empty capability object', async () => {
      const mockResponse = {
        listcapabilitiesresponse: {
          capability: {},
        },
      };

      mockClient.listCapabilities = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetCloudStackCapabilities();

      expect(result.content[0].text).toContain('Version: Unknown');
      expect(result.content[0].text).toContain('Security Groups: Disabled');
    });

    it('should display all feature flags correctly', async () => {
      const mockResponse = {
        listcapabilitiesresponse: {
          capability: {
            cloudstackversion: '4.19.0.0',
            securitygroupsenabled: false,
            kubernetesserviceenabled: false,
            kvmsnapshotenabled: false,
            dynamicrolesenabled: false,
          },
        },
      };

      mockClient.listCapabilities = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetCloudStackCapabilities();

      expect(result.content[0].text).toContain('Version: 4.19.0.0');
      expect(result.content[0].text).toContain('Security Groups: Disabled');
      expect(result.content[0].text).toContain('Kubernetes Service: Disabled');
      expect(result.content[0].text).toContain('KVM Snapshots: Disabled');
      expect(result.content[0].text).toContain('Dynamic Roles: Disabled');
    });
  });

  describe('handleListZones', () => {
    it('should list zones successfully', async () => {
      const mockResponse = {
        listzonesresponse: {
          zone: [
            {
              id: 'zone-1',
              name: 'Zone1',
              networktype: 'Advanced',
              allocationstate: 'Enabled',
              dhcpprovider: 'VirtualRouter',
            },
          ],
        },
      };

      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListZones({});

      expect(result.content[0].text).toContain('Found 1 zone');
      expect(result.content[0].text).toContain('Zone1');
      expect(result.content[0].text).toContain('Advanced');
    });

    it('should filter by availability', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listzonesresponse: { zone: [] },
      });

      await handlers.handleListZones({ available: true });

      expect(mockClient.request).toHaveBeenCalledWith('listZones', { available: true });
    });
  });

  describe('handleListTemplates', () => {
    it('should list templates successfully', async () => {
      const mockResponse = {
        listtemplatesresponse: {
          template: [
            {
              id: 'template-1',
              name: 'Ubuntu 22.04 LTS',
              displaytext: 'Ubuntu 22.04 LTS Cloud Image',
              ostypename: 'Ubuntu 22.04 LTS',
              size: 10737418240,
              created: '2024-01-01T00:00:00Z',
              isready: true,
              ispublic: true,
              isfeatured: true,
            },
            {
              id: 'template-2',
              name: 'CentOS 7',
              displaytext: 'CentOS 7 Cloud Image',
              ostypename: 'CentOS 7',
              size: 8589934592,
              created: '2024-01-02T00:00:00Z',
              isready: true,
              ispublic: false,
              isfeatured: false,
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListTemplates({ templatefilter: 'executable' });

      expect(result.content[0].text).toContain('Found 2 templates');
      expect(result.content[0].text).toContain('Ubuntu 22.04 LTS');
      expect(result.content[0].text).toContain('CentOS 7');
      expect(result.content[0].text).toContain('Ready: Yes');
    });

    it('should filter templates by zone', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtemplatesresponse: { template: [] },
      });

      await handlers.handleListTemplates({ templatefilter: 'featured', zoneid: 'zone-1' });

      // Factory handlers have default templatefilter: 'all'
      expect(mockClient.request).toHaveBeenCalledWith('listTemplates', {
        templatefilter: 'featured',
        zoneid: 'zone-1',
      });
    });

    it('should handle empty template list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtemplatesresponse: {},
      });

      const result = await handlers.handleListTemplates({ templatefilter: 'all' });

      expect(result.content[0].text).toContain('No templates found');
    });
  });

  describe('handleListServiceOfferings', () => {
    it('should list service offerings successfully', async () => {
      const mockResponse = {
        listserviceofferingsresponse: {
          serviceoffering: [
            {
              id: 'offering-1',
              name: 'Medium Instance',
              displaytext: '2 vCPU, 4GB RAM',
              cpunumber: 2,
              cpuspeed: 2000,
              memory: 4096,
              storagetype: 'local',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListServiceOfferings({});

      expect(result.content[0].text).toContain('Found 1 service offering');
      expect(result.content[0].text).toContain('Medium Instance');
      expect(result.content[0].text).toContain('CPUs: 2');
    });
  });

  describe('handleListHosts', () => {
    it('should list hosts successfully', async () => {
      const mockResponse = {
        listhostsresponse: {
          host: [
            {
              id: 'host-1',
              name: 'kvm-host-01',
              type: 'Routing',
              state: 'Up',
              hypervisor: 'KVM',
              zonename: 'Zone1',
              ipaddress: '192.168.1.10',
              cpunumber: 8,
              cpuspeed: 2400,
              memorytotal: 32000000000,
              memoryused: 16000000000,
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListHosts({});

      expect(result.content[0].text).toContain('Found 1 host');
      expect(result.content[0].text).toContain('kvm-host-01');
      expect(result.content[0].text).toContain('KVM');
    });

    it('should filter by zone and type', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listhostsresponse: { host: [] },
      });

      await handlers.handleListHosts({ zoneid: 'zone-1', type: 'Routing' });

      expect(mockClient.request).toHaveBeenCalledWith('listHosts', {
        zoneid: 'zone-1',
        type: 'Routing',
      });
    });
  });

  describe('handleListClusters', () => {
    it('should list clusters successfully', async () => {
      const mockResponse = {
        listclustersresponse: {
          cluster: [
            {
              id: 'cluster-1',
              name: 'Cluster1',
              hypervisortype: 'KVM',
              managedstate: 'Managed',
              allocationstate: 'Enabled',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListClusters({});

      expect(result.content[0].text).toContain('Found 1 cluster');
      expect(result.content[0].text).toContain('Cluster1');
      expect(result.content[0].text).toContain('KVM');
    });
  });

  describe('handleListStoragePools', () => {
    it('should list storage pools successfully', async () => {
      const mockResponse = {
        liststoragepoolsresponse: {
          storagepool: [
            {
              id: 'pool-1',
              name: 'primary-storage-1',
              type: 'NetworkFilesystem',
              state: 'Up',
              zonename: 'Zone1',
              disksizeused: 100000000000,
              disksizetotal: 1000000000000,
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListStoragePools({});

      expect(result.content[0].text).toContain('Found 1 storage pool');
      expect(result.content[0].text).toContain('primary-storage-1');
      expect(result.content[0].text).toContain('NetworkFilesystem');
    });
  });

  describe('handleListAccounts', () => {
    it('should list accounts successfully', async () => {
      const mockResponse = {
        listaccountsresponse: {
          account: [
            {
              id: 'account-1',
              name: 'admin',
              accounttype: 1,
              state: 'enabled',
              domain: 'ROOT',
              domainid: 'domain-1',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListAccounts({});

      expect(result.content[0].text).toContain('Found 1 account');
      expect(result.content[0].text).toContain('admin');
    });
  });

  describe('handleListUsers', () => {
    it('should list users successfully', async () => {
      const mockResponse = {
        listusersresponse: {
          user: [
            {
              id: 'user-1',
              username: 'admin',
              firstname: 'Admin',
              lastname: 'User',
              email: 'admin@example.com',
              account: 'admin',
              state: 'enabled',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListUsers({});

      expect(result.content[0].text).toContain('Found 1 user');
      expect(result.content[0].text).toContain('admin');
      expect(result.content[0].text).toContain('admin@example.com');
    });
  });

  describe('handleListDomains', () => {
    it('should list domains successfully', async () => {
      const mockResponse = {
        listdomainsresponse: {
          domain: [
            {
              id: 'domain-1',
              name: 'ROOT',
              level: 0,
              path: 'ROOT',
              state: 'Active',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListDomains({});

      expect(result.content[0].text).toContain('Found 1 domain');
      expect(result.content[0].text).toContain('ROOT');
    });
  });

  describe('handleListSystemVms', () => {
    it('should list system VMs successfully', async () => {
      const mockResponse = {
        listsystemvmsresponse: {
          systemvm: [
            {
              id: 'svm-1',
              name: 's-1-VM',
              systemvmtype: 'secondarystoragevm',
              state: 'Running',
              zonename: 'Zone1',
              publicip: '192.168.1.100',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListSystemVms({});

      expect(result.content[0].text).toContain('Found 1 system VM');
      expect(result.content[0].text).toContain('s-1-VM');
      expect(result.content[0].text).toContain('secondarystoragevm');
    });

    it('should filter by system VM type', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsystemvmsresponse: { systemvm: [] },
      });

      await handlers.handleListSystemVms({ systemvmtype: 'consoleproxy' });

      expect(mockClient.request).toHaveBeenCalledWith('listSystemVms', {
        systemvmtype: 'consoleproxy',
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('API connection failed');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(handlers.handleListZones({})).rejects.toThrow('API connection failed');
    });
  });

  describe('handleCreateZone', () => {
    it('should create a zone successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createzoneresponse: { id: 'zone-new' },
      });

      const result = await handlers.handleCreateZone({ name: 'NewZone', dns1: '8.8.8.8', internaldns1: '10.0.0.1', networktype: 'Advanced' });

      expect(mockClient.request).toHaveBeenCalledWith('createZone', expect.objectContaining({ name: 'NewZone' }));
      expect(result.content[0].text).toContain('Created zone');
      expect(result.content[0].text).toContain('zone-new');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleCreateZone({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('name is required');
    });
  });

  describe('handleUpdateZone', () => {
    it('should update a zone successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatezoneresponse: { success: true },
      });

      const result = await handlers.handleUpdateZone({ id: 'zone-1', name: 'UpdatedZone' });

      expect(mockClient.request).toHaveBeenCalledWith('updateZone', expect.objectContaining({ id: 'zone-1' }));
      expect(result.content[0].text).toContain('Updated zone');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateZone({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDeleteZone', () => {
    it('should delete a zone successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletezoneresponse: { success: true },
      });

      const result = await handlers.handleDeleteZone({ id: 'zone-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteZone', { id: 'zone-1' });
      expect(result.content[0].text).toContain('Deleted zone');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteZone({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleCreatePod', () => {
    it('should create a pod successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createpodresponse: { id: 'pod-1' },
      });

      const result = await handlers.handleCreatePod({ name: 'Pod1', zoneid: 'zone-1', gateway: '10.0.0.1', netmask: '255.255.255.0', startip: '10.0.0.2' });

      expect(mockClient.request).toHaveBeenCalledWith('createPod', expect.objectContaining({ name: 'Pod1' }));
      expect(result.content[0].text).toContain('Created pod');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleCreatePod({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('name is required');
    });
  });

  describe('handleUpdatePod', () => {
    it('should update a pod successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatepodresponse: { success: true },
      });

      const result = await handlers.handleUpdatePod({ id: 'pod-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updatePod', { id: 'pod-1' });
      expect(result.content[0].text).toContain('Updated pod');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdatePod({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDeletePod', () => {
    it('should delete a pod successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletepodresponse: { success: true },
      });

      const result = await handlers.handleDeletePod({ id: 'pod-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deletePod', { id: 'pod-1' });
      expect(result.content[0].text).toContain('Deleted pod');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeletePod({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleListPods', () => {
    it('should list pods successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listpodsresponse: {
          pod: [{ id: 'pod-1', name: 'Pod1', zonename: 'Zone1' }],
        },
      });

      const result = await handlers.handleListPods({});

      expect(mockClient.request).toHaveBeenCalledWith('listPods', {});
      expect(result.content[0].text).toContain('Pod1');
    });

    it('should handle empty pod list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listpodsresponse: { pod: [] },
      });

      const result = await handlers.handleListPods({});

      expect(result.content[0].text).toContain('No pods found');
    });
  });

  describe('handleAddCluster', () => {
    it('should add a cluster successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        addclusterresponse: { id: 'cluster-new' },
      });

      const result = await handlers.handleAddCluster({ clustername: 'NewCluster', clustertype: 'CloudManaged', hypervisor: 'KVM', podid: 'pod-1', zoneid: 'zone-1' });

      expect(mockClient.request).toHaveBeenCalledWith('addCluster', expect.objectContaining({ clustername: 'NewCluster' }));
      expect(result.content[0].text).toContain('Added cluster');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleAddCluster({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('clustername is required');
    });
  });

  describe('handleUpdateCluster', () => {
    it('should update a cluster successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateclusterresponse: { success: true },
      });

      const result = await handlers.handleUpdateCluster({ id: 'cluster-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateCluster', { id: 'cluster-1' });
      expect(result.content[0].text).toContain('Updated cluster');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateCluster({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDeleteCluster', () => {
    it('should delete a cluster successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteclusterresponse: { success: true },
      });

      const result = await handlers.handleDeleteCluster({ id: 'cluster-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteCluster', { id: 'cluster-1' });
      expect(result.content[0].text).toContain('Deleted cluster');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteCluster({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleAddHost', () => {
    it('should add a host successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        addhostresponse: { id: 'host-new' },
      });

      const result = await handlers.handleAddHost({ hypervisor: 'KVM', clusterid: 'cluster-1', podid: 'pod-1', url: 'http://host', zoneid: 'zone-1' });

      expect(mockClient.request).toHaveBeenCalledWith('addHost', expect.objectContaining({ hypervisor: 'KVM' }));
      expect(result.content[0].text).toContain('Added host');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleAddHost({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('zoneid is required');
    });
  });

  describe('handleUpdateHost', () => {
    it('should update a host successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatehostresponse: { success: true },
      });

      const result = await handlers.handleUpdateHost({ id: 'host-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateHost', { id: 'host-1' });
      expect(result.content[0].text).toContain('Updated host');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateHost({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDeleteHost', () => {
    it('should delete a host successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletehostresponse: { success: true },
      });

      const result = await handlers.handleDeleteHost({ id: 'host-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteHost', { id: 'host-1' });
      expect(result.content[0].text).toContain('Deleted host');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteHost({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleReconnectHost', () => {
    it('should reconnect a host successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        reconnecthostresponse: { jobid: 'job-reconnect' },
      });

      const result = await handlers.handleReconnectHost({ id: 'host-1' });

      expect(mockClient.request).toHaveBeenCalledWith('reconnectHost', { id: 'host-1' });
      expect(result.content[0].text).toContain('Reconnecting host');
      expect(result.content[0].text).toContain('job-reconnect');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleReconnectHost({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handlePrepareHostForMaintenance', () => {
    it('should prepare host for maintenance successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        preparehostformaintenanceresponse: { jobid: 'job-maint' },
      });

      const result = await handlers.handlePrepareHostForMaintenance({ id: 'host-1' });

      expect(mockClient.request).toHaveBeenCalledWith('prepareHostForMaintenance', { id: 'host-1' });
      expect(result.content[0].text).toContain('Preparing for maintenance host');
      expect(result.content[0].text).toContain('job-maint');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handlePrepareHostForMaintenance({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleCancelHostMaintenance', () => {
    it('should cancel host maintenance successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        cancelhostmaintenanceresponse: { jobid: 'job-cancel' },
      });

      const result = await handlers.handleCancelHostMaintenance({ id: 'host-1' });

      expect(mockClient.request).toHaveBeenCalledWith('cancelHostMaintenance', { id: 'host-1' });
      expect(result.content[0].text).toContain('Cancelling maintenance for host');
      expect(result.content[0].text).toContain('job-cancel');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleCancelHostMaintenance({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleCreateDomain', () => {
    it('should create a domain successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createdomainresponse: { id: 'domain-new' },
      });

      const result = await handlers.handleCreateDomain({ name: 'NewDomain' });

      expect(mockClient.request).toHaveBeenCalledWith('createDomain', { name: 'NewDomain' });
      expect(result.content[0].text).toContain('Created domain');
      expect(result.content[0].text).toContain('domain-new');
    });

    it('should return error when name is missing', async () => {
      const result = await handlers.handleCreateDomain({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('name is required');
    });
  });

  describe('handleUpdateDomain', () => {
    it('should update a domain successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatedomainresponse: { success: true },
      });

      const result = await handlers.handleUpdateDomain({ id: 'domain-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateDomain', { id: 'domain-1' });
      expect(result.content[0].text).toContain('Updated domain');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateDomain({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDeleteDomain', () => {
    it('should delete a domain successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletedomainresponse: { jobid: 'job-del-domain' },
      });

      const result = await handlers.handleDeleteDomain({ id: 'domain-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteDomain', { id: 'domain-1' });
      expect(result.content[0].text).toContain('Deleting domain');
      expect(result.content[0].text).toContain('job-del-domain');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteDomain({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleCreateUser', () => {
    it('should create a user successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createuserresponse: { id: 'user-new' },
      });

      const result = await handlers.handleCreateUser({ username: 'newuser', password: 'secret', email: 'new@test.com', firstname: 'New', lastname: 'User', account: 'admin' });

      expect(mockClient.request).toHaveBeenCalledWith('createUser', expect.objectContaining({ username: 'newuser' }));
      expect(result.content[0].text).toContain('Created user');
      expect(result.content[0].text).toContain('user-new');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleCreateUser({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('username is required');
    });
  });

  describe('handleUpdateUser', () => {
    it('should update a user successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateuserresponse: { success: true },
      });

      const result = await handlers.handleUpdateUser({ id: 'user-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateUser', { id: 'user-1' });
      expect(result.content[0].text).toContain('Updated user');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateUser({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDeleteUser', () => {
    it('should delete a user successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteuserresponse: { success: true },
      });

      const result = await handlers.handleDeleteUser({ id: 'user-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteUser', { id: 'user-1' });
      expect(result.content[0].text).toContain('Deleted user');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteUser({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDisableUser', () => {
    it('should disable a user successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        disableuserresponse: { jobid: 'job-disable' },
      });

      const result = await handlers.handleDisableUser({ id: 'user-1' });

      expect(mockClient.request).toHaveBeenCalledWith('disableUser', { id: 'user-1' });
      expect(result.content[0].text).toContain('Disabling user');
      expect(result.content[0].text).toContain('job-disable');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDisableUser({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleEnableUser', () => {
    it('should enable a user successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        enableuserresponse: { success: true },
      });

      const result = await handlers.handleEnableUser({ id: 'user-1' });

      expect(mockClient.request).toHaveBeenCalledWith('enableUser', { id: 'user-1' });
      expect(result.content[0].text).toContain('Enabled user');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleEnableUser({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleListConfigurations', () => {
    it('should list configurations successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listconfigurationsresponse: {
          configuration: [{ name: 'config.key', value: 'config.value', category: 'Advanced' }],
        },
      });

      const result = await handlers.handleListConfigurations({});

      expect(mockClient.request).toHaveBeenCalledWith('listConfigurations', {});
      expect(result.content[0].text).toContain('config.key');
    });

    it('should handle empty configuration list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listconfigurationsresponse: { configuration: [] },
      });

      const result = await handlers.handleListConfigurations({});

      expect(result.content[0].text).toContain('No configurations found');
    });
  });

  describe('handleUpdateConfiguration', () => {
    it('should update a configuration successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateconfigurationresponse: { success: true },
      });

      const result = await handlers.handleUpdateConfiguration({ name: 'config.key', value: 'new-value' });

      expect(mockClient.request).toHaveBeenCalledWith('updateConfiguration', { name: 'config.key', value: 'new-value' });
      expect(result.content[0].text).toContain('Updated configuration');
    });

    it('should return error when required fields are missing', async () => {
      const result = await handlers.handleUpdateConfiguration({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('name is required');
    });
  });

  describe('handleStartSystemVm', () => {
    it('should start a system VM successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        startsystemvmresponse: { jobid: 'job-start-svm' },
      });

      const result = await handlers.handleStartSystemVm({ id: 'svm-1' });

      expect(mockClient.request).toHaveBeenCalledWith('startSystemVm', { id: 'svm-1' });
      expect(result.content[0].text).toContain('Starting system VM');
      expect(result.content[0].text).toContain('job-start-svm');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleStartSystemVm({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleStopSystemVm', () => {
    it('should stop a system VM successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        stopsystemvmresponse: { jobid: 'job-stop-svm' },
      });

      const result = await handlers.handleStopSystemVm({ id: 'svm-1' });

      expect(mockClient.request).toHaveBeenCalledWith('stopSystemVm', { id: 'svm-1' });
      expect(result.content[0].text).toContain('Stopping system VM');
      expect(result.content[0].text).toContain('job-stop-svm');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleStopSystemVm({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleRebootSystemVm', () => {
    it('should reboot a system VM successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        rebootsystemvmresponse: { jobid: 'job-reboot-svm' },
      });

      const result = await handlers.handleRebootSystemVm({ id: 'svm-1' });

      expect(mockClient.request).toHaveBeenCalledWith('rebootSystemVm', { id: 'svm-1' });
      expect(result.content[0].text).toContain('Rebooting system VM');
      expect(result.content[0].text).toContain('job-reboot-svm');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleRebootSystemVm({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleDestroySystemVm', () => {
    it('should destroy a system VM successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        destroysystemvmresponse: { jobid: 'job-destroy-svm' },
      });

      const result = await handlers.handleDestroySystemVm({ id: 'svm-1' });

      expect(mockClient.request).toHaveBeenCalledWith('destroySystemVm', { id: 'svm-1' });
      expect(result.content[0].text).toContain('Destroying system VM');
      expect(result.content[0].text).toContain('job-destroy-svm');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDestroySystemVm({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleMigrateSystemVm', () => {
    it('should migrate a system VM successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        migratesystemvmresponse: { jobid: 'job-migrate-svm' },
      });

      const result = await handlers.handleMigrateSystemVm({ virtualmachineid: 'svm-1', hostid: 'host-2' });

      expect(mockClient.request).toHaveBeenCalledWith('migrateSystemVm', { virtualmachineid: 'svm-1', hostid: 'host-2' });
      expect(result.content[0].text).toContain('Migrating system VM');
      expect(result.content[0].text).toContain('job-migrate-svm');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleMigrateSystemVm({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('virtualmachineid is required');
    });
  });

  describe('handleCreateConsoleEndpoint', () => {
    it('should create a console endpoint successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createconsoleendpointresponse: { success: true },
      });

      const result = await handlers.handleCreateConsoleEndpoint({ virtualmachineid: 'vm-1' });

      expect(mockClient.request).toHaveBeenCalledWith('createConsoleEndpoint', { virtualmachineid: 'vm-1' });
      expect(result.content[0].text).toContain('Created console endpoint');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleCreateConsoleEndpoint({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('virtualmachineid is required');
    });
  });
});
