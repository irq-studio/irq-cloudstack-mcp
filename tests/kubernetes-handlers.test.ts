import { KubernetesHandlers } from '../src/handlers/kubernetes-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('KubernetesHandlers', () => {
  let handlers: KubernetesHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new KubernetesHandlers(mockClient);
  });

  describe('handleListKubernetesClusters', () => {
    it('should list Kubernetes clusters successfully', async () => {
      const mockResponse = {
        listkubernetesclustersresponse: {
          kubernetescluster: [
            {
              id: 'k8s-1',
              name: 'production-cluster',
              description: 'Production Kubernetes Cluster',
              zonename: 'Zone1',
              kubernetesversionname: '1.27.0',
              size: 3,
              state: 'Running',
              controlnodes: 1,
              masternodes: 1,
              cpunumber: '2',
              memory: '4096',
            },
          ],
        },
      };

      mockClient.listKubernetesClusters = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListKubernetesClusters({});

      expect(result.content[0].text).toContain('Found 1 Kubernetes cluster(s)');
      expect(result.content[0].text).toContain('production-cluster');
      expect(result.content[0].text).toContain('1.27.0');
      expect(result.content[0].text).toContain('Running');
    });

    it('should handle empty cluster list', async () => {
      mockClient.listKubernetesClusters = jest.fn().mockResolvedValue({
        listkubernetesclustersresponse: {},
      });

      const result = await handlers.handleListKubernetesClusters({});

      expect(result.content[0].text).toContain('No Kubernetes clusters found');
    });

    it('should filter clusters by zone', async () => {
      mockClient.listKubernetesClusters = jest.fn().mockResolvedValue({
        listkubernetesclustersresponse: { kubernetescluster: [] },
      });

      await handlers.handleListKubernetesClusters({ zoneid: 'zone-1' });

      expect(mockClient.listKubernetesClusters).toHaveBeenCalledWith({ zoneid: 'zone-1' });
    });
  });

  describe('handleCreateKubernetesCluster', () => {
    it('should create a Kubernetes cluster successfully', async () => {
      const mockResponse = {
        createkubernetesclusterresponse: {
          jobid: 'job-123',
          id: 'k8s-456',
        },
      };

      mockClient.createKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'test-cluster',
        description: 'Test Cluster',
        kubernetesversionid: 'version-1',
        serviceofferingid: 'offering-1',
        zoneid: 'zone-1',
        size: 3,
      };

      const result = await handlers.handleCreateKubernetesCluster(args);

      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('k8s-456');
      expect(mockClient.createKubernetesCluster).toHaveBeenCalledWith(args);
    });

    it('should validate required fields', async () => {
      await expect(
        handlers.handleCreateKubernetesCluster({ name: 'test' } as any)
      ).rejects.toThrow();
    });

    it('should create cluster with optional network settings', async () => {
      const mockResponse = {
        createkubernetesclusterresponse: { jobid: 'job-789', id: 'k8s-789' },
      };

      mockClient.createKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'advanced-cluster',
        description: 'Advanced Cluster',
        kubernetesversionid: 'version-1',
        serviceofferingid: 'offering-1',
        zoneid: 'zone-1',
        size: 5,
        networkid: 'network-1',
        externalloadbalanceripaddress: '203.0.113.10',
      };

      await handlers.handleCreateKubernetesCluster(args);

      expect(mockClient.createKubernetesCluster).toHaveBeenCalledWith(args);
    });
  });

  describe('handleGetKubernetesCluster', () => {
    it('should get Kubernetes cluster details successfully', async () => {
      const mockResponse = {
        listkubernetesclustersresponse: {
          kubernetescluster: [
            {
              id: 'k8s-1',
              name: 'test-cluster',
              description: 'Test Description',
              state: 'Running',
              zonename: 'Zone1',
              kubernetesversionname: '1.27.0',
              controlnodes: 3,
              size: 5,
              serviceofferingname: 'medium-offering',
              networkname: 'test-network',
              endpoint: 'https://k8s.example.com:6443',
              consoleendpoint: 'https://console.example.com',
              created: '2024-01-01T00:00:00Z',
              account: 'admin',
              domain: 'ROOT',
              virtualmachines: [
                { name: 'master-1', state: 'Running' },
                { name: 'worker-1', state: 'Running' },
                { name: 'worker-2', state: 'Running' },
              ],
            },
          ],
        },
      };

      mockClient.listKubernetesClusters = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetKubernetesCluster({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('Kubernetes Cluster Details');
      expect(result.content[0].text).toContain('test-cluster');
      expect(result.content[0].text).toContain('Running');
      expect(result.content[0].text).toContain('master-1');
      expect(result.content[0].text).toContain('worker-1');
      expect(mockClient.listKubernetesClusters).toHaveBeenCalledWith({ id: 'k8s-1' });
    });

    it('should handle cluster not found', async () => {
      mockClient.listKubernetesClusters = jest.fn().mockResolvedValue({
        listkubernetesclustersresponse: {},
      });

      const result = await handlers.handleGetKubernetesCluster({ id: 'nonexistent-k8s' });

      expect(result.content[0].text).toContain('not found');
      expect(result.content[0].text).toContain('nonexistent-k8s');
    });

    it('should handle cluster with no VMs', async () => {
      const mockResponse = {
        listkubernetesclustersresponse: {
          kubernetescluster: [
            {
              id: 'k8s-1',
              name: 'empty-cluster',
              state: 'Stopped',
              zonename: 'Zone1',
              kubernetesversionname: '1.27.0',
              size: 0,
              serviceofferingname: 'small-offering',
              created: '2024-01-01T00:00:00Z',
              account: 'admin',
              domain: 'ROOT',
            },
          ],
        },
      };

      mockClient.listKubernetesClusters = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetKubernetesCluster({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('Virtual Machines (0)');
      expect(result.content[0].text).toContain('None');
    });
  });

  describe('handleDeleteKubernetesCluster', () => {
    it('should delete a Kubernetes cluster successfully', async () => {
      const mockResponse = {
        deletekubernetesclusterresponse: {
          jobid: 'job-999',
        },
      };

      mockClient.deleteKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteKubernetesCluster({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('job-999');
      expect(mockClient.deleteKubernetesCluster).toHaveBeenCalledWith({ id: 'k8s-1' });
    });

    it('should delete with cleanup option', async () => {
      const mockResponse = {
        deletekubernetesclusterresponse: {
          jobid: 'job-cleanup',
        },
      };

      mockClient.deleteKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteKubernetesCluster({ id: 'k8s-1', cleanup: true });

      expect(result.content[0].text).toContain('Cleanup enabled');
      expect(result.content[0].text).toContain('all associated resources will be deleted');
    });

    it('should delete without cleanup option', async () => {
      const mockResponse = {
        deletekubernetesclusterresponse: {
          jobid: 'job-no-cleanup',
        },
      };

      mockClient.deleteKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteKubernetesCluster({ id: 'k8s-1', cleanup: false });

      expect(result.content[0].text).toContain('Cleanup disabled');
      expect(result.content[0].text).toContain('some resources may remain');
    });

    it('should validate required id field', async () => {
      await expect(handlers.handleDeleteKubernetesCluster({} as any)).rejects.toThrow();
    });
  });

  describe('handleStartKubernetesCluster', () => {
    it('should start a Kubernetes cluster successfully', async () => {
      const mockResponse = {
        startkubernetesclusterresponse: {
          jobid: 'job-111',
        },
      };

      mockClient.startKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleStartKubernetesCluster({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('job-111');
      expect(mockClient.startKubernetesCluster).toHaveBeenCalledWith({ id: 'k8s-1' });
    });

    it('should validate required id field', async () => {
      await expect(handlers.handleStartKubernetesCluster({} as any)).rejects.toThrow();
    });
  });

  describe('handleStopKubernetesCluster', () => {
    it('should stop a Kubernetes cluster successfully', async () => {
      const mockResponse = {
        stopkubernetesclusterresponse: {
          jobid: 'job-222',
        },
      };

      mockClient.stopKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleStopKubernetesCluster({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('job-222');
      expect(mockClient.stopKubernetesCluster).toHaveBeenCalledWith({ id: 'k8s-1' });
    });

    it('should validate required id field', async () => {
      await expect(handlers.handleStopKubernetesCluster({} as any)).rejects.toThrow();
    });
  });

  describe('handleScaleKubernetesCluster', () => {
    it('should scale a Kubernetes cluster successfully', async () => {
      const mockResponse = {
        scalekubernetesclusterresponse: {
          jobid: 'job-333',
        },
      };

      mockClient.scaleKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleScaleKubernetesCluster({
        id: 'k8s-1',
        size: 5,
      });

      expect(result.content[0].text).toContain('job-333');
      expect(mockClient.scaleKubernetesCluster).toHaveBeenCalledWith({
        id: 'k8s-1',
        size: 5,
      });
    });

    it('should validate required fields', async () => {
      await expect(handlers.handleScaleKubernetesCluster({ id: 'k8s-1' } as any)).rejects.toThrow();
    });

    it('should handle node pool scaling', async () => {
      const mockResponse = {
        scalekubernetesclusterresponse: { jobid: 'job-444' },
      };

      mockClient.scaleKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      await handlers.handleScaleKubernetesCluster({
        id: 'k8s-1',
        size: 10,
        nodeid: 'node-pool-1',
      });

      expect(mockClient.scaleKubernetesCluster).toHaveBeenCalledWith({
        id: 'k8s-1',
        size: 10,
        nodeid: 'node-pool-1',
      });
    });

    it('should scale without specifying size (using other params)', async () => {
      const mockResponse = {
        scalekubernetesclusterresponse: { jobid: 'job-555' },
      };

      mockClient.scaleKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleScaleKubernetesCluster({
        id: 'k8s-1',
        serviceofferingid: 'new-offering',
      } as any);

      expect(result.content[0].text).toContain('Scaling Kubernetes cluster k8s-1 cluster');
      expect(result.content[0].text).not.toContain('worker nodes');
    });
  });

  describe('handleUpgradeKubernetesCluster', () => {
    it('should upgrade a Kubernetes cluster successfully', async () => {
      const mockResponse = {
        upgradekubernetesclusterresponse: {
          jobid: 'job-upgrade-123',
        },
      };

      mockClient.upgradeKubernetesCluster = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleUpgradeKubernetesCluster({
        id: 'k8s-1',
        kubernetesversionid: 'version-2',
      });

      expect(result.content[0].text).toContain('Upgrading Kubernetes cluster k8s-1');
      expect(result.content[0].text).toContain('version-2');
      expect(result.content[0].text).toContain('job-upgrade-123');
      expect(mockClient.upgradeKubernetesCluster).toHaveBeenCalledWith({
        id: 'k8s-1',
        kubernetesversionid: 'version-2',
      });
    });

    it('should validate required fields', async () => {
      await expect(
        handlers.handleUpgradeKubernetesCluster({ id: 'k8s-1' } as any)
      ).rejects.toThrow();
    });
  });

  describe('handleGetKubernetesClusterConfig', () => {
    it('should get Kubernetes cluster config successfully', async () => {
      const mockResponse = {
        getkubernetesclusterconfigresponse: {
          clusterconfig: {
            id: 'k8s-1',
            name: 'test-cluster',
            configdata: 'YXBpVmVyc2lvbjogdjEKa2luZDogQ29uZmlnCg==', // Base64 encoded kubeconfig
          },
        },
      };

      mockClient.getKubernetesClusterConfig = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetKubernetesClusterConfig({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('Kubeconfig');
      expect(result.content[0].text).toContain('YXBpVmVyc2lvbjogdjEKa2luZDogQ29uZmlnCg==');
      expect(mockClient.getKubernetesClusterConfig).toHaveBeenCalledWith({ id: 'k8s-1' });
    });

    it('should handle missing config data', async () => {
      const mockResponse = {
        getkubernetesclusterconfigresponse: {},
      };

      mockClient.getKubernetesClusterConfig = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleGetKubernetesClusterConfig({ id: 'k8s-1' });

      expect(result.content[0].text).toContain('Unable to retrieve kubeconfig');
      expect(result.content[0].text).toContain('may not be in Running state');
    });

    it('should validate required id field', async () => {
      await expect(handlers.handleGetKubernetesClusterConfig({} as any)).rejects.toThrow();
    });
  });

  describe('handleListKubernetesSupportedVersions', () => {
    it('should list supported Kubernetes versions successfully', async () => {
      const mockResponse = {
        listkubernetessupportedversionsresponse: {
          kubernetessupportedversion: [
            {
              id: 'version-1',
              name: '1.27.0',
              semanticversion: '1.27.0',
              isostate: 'Ready',
              mincpunumber: 2,
              minmemory: 2048,
            },
            {
              id: 'version-2',
              name: '1.26.5',
              semanticversion: '1.26.5',
              isostate: 'Ready',
              mincpunumber: 2,
              minmemory: 2048,
            },
          ],
        },
      };

      mockClient.listKubernetesSupportedVersions = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListKubernetesSupportedVersions({});

      expect(result.content[0].text).toContain('Found 2 Kubernetes version(s)');
      expect(result.content[0].text).toContain('1.27.0');
      expect(result.content[0].text).toContain('1.26.5');
    });

    it('should filter versions by zone', async () => {
      mockClient.listKubernetesSupportedVersions = jest.fn().mockResolvedValue({
        listkubernetessupportedversionsresponse: { kubernetessupportedversion: [] },
      });

      await handlers.handleListKubernetesSupportedVersions({ zoneid: 'zone-1' });

      expect(mockClient.listKubernetesSupportedVersions).toHaveBeenCalledWith({
        zoneid: 'zone-1',
      });
    });

    it('should handle empty versions list', async () => {
      mockClient.listKubernetesSupportedVersions = jest.fn().mockResolvedValue({
        listkubernetessupportedversionsresponse: {},
      });

      const result = await handlers.handleListKubernetesSupportedVersions({});

      expect(result.content[0].text).toContain('No Kubernetes versions found');
    });
  });

  describe('error handling', () => {
    it('should handle cluster creation errors', async () => {
      const error = new Error('Insufficient resources');
      mockClient.createKubernetesCluster = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleCreateKubernetesCluster({
          name: 'test',
          description: 'test',
          kubernetesversionid: 'v1',
          serviceofferingid: 'offer-1',
          zoneid: 'zone-1',
          size: 3,
        })
      ).rejects.toThrow('Insufficient resources');
    });

    it('should handle cluster deletion errors', async () => {
      const error = new Error('Cluster has active workloads');
      mockClient.deleteKubernetesCluster = jest.fn().mockRejectedValue(error);

      await expect(handlers.handleDeleteKubernetesCluster({ id: 'k8s-1' })).rejects.toThrow(
        'Cluster has active workloads'
      );
    });
  });
});
