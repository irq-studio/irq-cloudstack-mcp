import { NetworkRouterHandlers } from '../src/handlers/network/router-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('NetworkRouterHandlers', () => {
  let handlers: NetworkRouterHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new NetworkRouterHandlers(mockClient);
  });

  describe('handleListRouters', () => {
    it('should list virtual routers successfully', async () => {
      const mockResponse = {
        listroutersresponse: {
          router: [
            {
              id: 'r-1',
              name: 'router-1',
              state: 'Running',
              zonename: 'zone-1',
              account: 'admin',
              domain: 'ROOT',
              vpcname: null,
              version: '4.18.0',
            },
            {
              id: 'r-2',
              name: 'router-2',
              state: 'Stopped',
              zonename: 'zone-1',
              account: 'user1',
              domain: 'ROOT',
              vpcname: 'vpc-prod',
              version: '4.18.0',
            },
            {
              id: 'r-3',
              name: 'router-3',
              state: 'Running',
              zonename: 'zone-2',
              account: 'admin',
              domain: 'ROOT',
              vpcname: 'vpc-dev',
              version: '4.18.0',
            },
          ],
        },
      };

      mockClient.listRouters = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListRouters({});

      expect(mockClient.listRouters).toHaveBeenCalledWith({ listall: true });
      expect(result.content[0].text).toContain('Found 3 virtual routers');
      expect(result.content[0].text).toContain('Running: 2');
      expect(result.content[0].text).toContain('Stopped: 1');
      expect(result.content[0].text).toContain('router-1');
      expect(result.content[0].text).toContain('router-2');
      expect(result.content[0].text).toContain('vpc-prod');
    });

    it('should handle empty router list', async () => {
      mockClient.listRouters = jest.fn().mockResolvedValue({
        listroutersresponse: {},
      });

      const result = await handlers.handleListRouters({});

      expect(result.content[0].text).toContain('Found 0 virtual routers');
    });

    it('should filter routers by zone', async () => {
      mockClient.listRouters = jest.fn().mockResolvedValue({
        listroutersresponse: { router: [] },
      });

      await handlers.handleListRouters({ zoneid: 'zone-1' });

      expect(mockClient.listRouters).toHaveBeenCalledWith({
        listall: true,
        zoneid: 'zone-1',
      });
    });

    it('should filter routers by state', async () => {
      mockClient.listRouters = jest.fn().mockResolvedValue({
        listroutersresponse: { router: [] },
      });

      await handlers.handleListRouters({ state: 'Running' });

      expect(mockClient.listRouters).toHaveBeenCalledWith({
        listall: true,
        state: 'Running',
      });
    });

    it('should filter routers by VPC', async () => {
      mockClient.listRouters = jest.fn().mockResolvedValue({
        listroutersresponse: { router: [] },
      });

      await handlers.handleListRouters({ vpcid: 'vpc-1' });

      expect(mockClient.listRouters).toHaveBeenCalledWith({
        listall: true,
        vpcid: 'vpc-1',
      });
    });

    it('should handle routers without VPC', async () => {
      const mockResponse = {
        listroutersresponse: {
          router: [
            {
              id: 'r-1',
              name: 'router-standalone',
              state: 'Running',
              zonename: 'zone-1',
              account: 'admin',
              domain: 'ROOT',
              vpcname: null,
              version: '4.18.0',
            },
          ],
        },
      };

      mockClient.listRouters = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListRouters({});

      expect(result.content[0].text).toContain('VPC: N/A');
    });
  });

  describe('handleStartRouter', () => {
    it('should start a router successfully', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        startrouterresponse: {
          jobid: 'job-start-123',
        },
      });

      const result = await handlers.handleStartRouter({ id: 'r-1' });

      expect(mockClient.request).toHaveBeenCalledWith('startRouter', { id: 'r-1' });
      expect(result.content[0].text).toContain('Starting router r-1');
      expect(result.content[0].text).toContain('job-start-123');
    });

    it('should validate required id field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleStartRouter({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });

    it('should handle start router API error', async () => {
      const error = new Error('Router not found');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleStartRouter({ id: 'invalid-router' })
      ).rejects.toThrow('Router not found');
    });
  });

  describe('handleStopRouter', () => {
    it('should stop a router successfully', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        stoprouterresponse: {
          jobid: 'job-stop-456',
        },
      });

      const result = await handlers.handleStopRouter({ id: 'r-1' });

      expect(mockClient.request).toHaveBeenCalledWith('stopRouter', { id: 'r-1' });
      expect(result.content[0].text).toContain('Stopping router r-1');
      expect(result.content[0].text).toContain('job-stop-456');
      expect(result.content[0].text).not.toContain('(forced)');
    });

    it('should stop a router with forced flag', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        stoprouterresponse: {
          jobid: 'job-stop-forced',
        },
      });

      const result = await handlers.handleStopRouter({ id: 'r-1', forced: true });

      expect(mockClient.request).toHaveBeenCalledWith('stopRouter', { id: 'r-1', forced: true });
      expect(result.content[0].text).toContain('(forced)');
    });

    it('should validate required id field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleStopRouter({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });

    it('should handle stop router API error', async () => {
      const error = new Error('Cannot stop router in current state');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleStopRouter({ id: 'r-1' })
      ).rejects.toThrow('Cannot stop router in current state');
    });
  });

  describe('handleRebootRouter', () => {
    it('should reboot a router successfully', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        rebootrouterresponse: {
          jobid: 'job-reboot-789',
        },
      });

      const result = await handlers.handleRebootRouter({ id: 'r-1' });

      expect(mockClient.request).toHaveBeenCalledWith('rebootRouter', { id: 'r-1' });
      expect(result.content[0].text).toContain('Rebooting router r-1');
      expect(result.content[0].text).toContain('job-reboot-789');
    });

    it('should validate required id field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleRebootRouter({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });

    it('should handle reboot router API error', async () => {
      const error = new Error('Router is not in Running state');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleRebootRouter({ id: 'r-1' })
      ).rejects.toThrow('Router is not in Running state');
    });
  });

  describe('handleDestroyRouter', () => {
    it('should destroy a router successfully', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        destroyrouterresponse: {
          jobid: 'job-destroy-999',
        },
      });

      const result = await handlers.handleDestroyRouter({ id: 'r-1' });

      expect(mockClient.request).toHaveBeenCalledWith('destroyRouter', { id: 'r-1' });
      expect(result.content[0].text).toContain('Destroying router r-1');
      expect(result.content[0].text).toContain('job-destroy-999');
    });

    it('should validate required id field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleDestroyRouter({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });

    it('should handle destroy router API error', async () => {
      const error = new Error('Cannot destroy router with active VMs');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleDestroyRouter({ id: 'r-1' })
      ).rejects.toThrow('Cannot destroy router with active VMs');
    });
  });

  describe('error handling', () => {
    it('should handle network errors for list routers', async () => {
      const error = new Error('Network timeout');
      mockClient.listRouters = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleListRouters({})
      ).rejects.toThrow('Network timeout');
    });

    it('should handle CloudStack API errors', async () => {
      const error = new Error('Insufficient privileges');
      mockClient.listRouters = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleListRouters({})
      ).rejects.toThrow('Insufficient privileges');
    });
  });
});
