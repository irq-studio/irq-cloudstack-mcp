import { AclHandlers } from '../src/handlers/network/acl-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('AclHandlers', () => {
  let handlers: AclHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new AclHandlers(mockClient);
  });

  // --- Network ACL Items ---

  describe('handleCreateNetworkAcl', () => {
    it('should successfully create a network ACL', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createnetworkaclresponse: { jobid: 'job-101' },
      });

      const args = { protocol: 'tcp', aclid: 'acl-1' };
      const result = await handlers.handleCreateNetworkAcl(args);

      expect(mockClient.request).toHaveBeenCalledWith('createNetworkACL', args);
      expect(result.content[0].text).toContain('tcp');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateNetworkAcl({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('protocol');
    });
  });

  describe('handleDeleteNetworkAcl', () => {
    it('should successfully delete a network ACL', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletenetworkaclresponse: { jobid: 'job-102' },
      });

      const result = await handlers.handleDeleteNetworkAcl({ id: 'acl-item-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteNetworkACL', { id: 'acl-item-1' });
      expect(result.content[0].text).toContain('acl-item-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteNetworkAcl({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleUpdateNetworkAclItem', () => {
    it('should successfully update a network ACL item', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatenetworkaclitemresponse: { jobid: 'job-103' },
      });

      const result = await handlers.handleUpdateNetworkAclItem({ id: 'acl-item-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateNetworkACLItem', { id: 'acl-item-1' });
      expect(result.content[0].text).toContain('acl-item-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleUpdateNetworkAclItem({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListNetworkAcls', () => {
    it('should list network ACLs', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkaclsresponse: {
          networkacl: [
            {
              id: 'acl-item-1',
              protocol: 'tcp',
              startport: '80',
              endport: '80',
              cidrlist: '0.0.0.0/0',
              traffictype: 'Ingress',
              state: 'Active',
              action: 'Allow',
              number: 1,
              aclid: 'acl-1',
            },
          ],
        },
      });

      const result = await handlers.handleListNetworkAcls({});

      expect(mockClient.request).toHaveBeenCalledWith('listNetworkACLs', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkaclsresponse: { networkacl: [] },
      });

      const result = await handlers.handleListNetworkAcls({});
      expect(result.content[0].text).toContain('No');
    });
  });

  // --- Network ACL Lists ---

  describe('handleCreateNetworkAclList', () => {
    it('should successfully create a network ACL list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createnetworkacllistresponse: { jobid: 'job-201' },
      });

      const args = { name: 'web-acl', vpcid: 'vpc-1' };
      const result = await handlers.handleCreateNetworkAclList(args);

      expect(mockClient.request).toHaveBeenCalledWith('createNetworkACLList', args);
      expect(result.content[0].text).toContain('web-acl');
      expect(result.content[0].text).toContain('vpc-1');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateNetworkAclList({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
    });
  });

  describe('handleDeleteNetworkAclList', () => {
    it('should successfully delete a network ACL list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletenetworkacllistresponse: { jobid: 'job-202' },
      });

      const result = await handlers.handleDeleteNetworkAclList({ id: 'acl-list-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteNetworkACLList', { id: 'acl-list-1' });
      expect(result.content[0].text).toContain('acl-list-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteNetworkAclList({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleUpdateNetworkAclList', () => {
    it('should successfully update a network ACL list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatenetworkacllistresponse: { jobid: 'job-203' },
      });

      const result = await handlers.handleUpdateNetworkAclList({ id: 'acl-list-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateNetworkACLList', { id: 'acl-list-1' });
      expect(result.content[0].text).toContain('acl-list-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleUpdateNetworkAclList({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListNetworkAclLists', () => {
    it('should list network ACL lists', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkacllistsresponse: {
          networkacllist: [
            { id: 'acl-list-1', name: 'web-acl', description: 'Web tier ACL', vpcid: 'vpc-1' },
          ],
        },
      });

      const result = await handlers.handleListNetworkAclLists({});

      expect(mockClient.request).toHaveBeenCalledWith('listNetworkACLLists', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworkacllistsresponse: { networkacllist: [] },
      });

      const result = await handlers.handleListNetworkAclLists({});
      expect(result.content[0].text).toContain('No');
    });
  });

  describe('handleReplaceNetworkAclList', () => {
    it('should successfully replace a network ACL list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        replacenetworkacllistresponse: { jobid: 'job-204' },
      });

      const result = await handlers.handleReplaceNetworkAclList({ aclid: 'acl-list-1' });

      expect(mockClient.request).toHaveBeenCalledWith('replaceNetworkACLList', { aclid: 'acl-list-1' });
      expect(result.content[0].text).toContain('acl-list-1');
    });

    it('should return error for missing aclid', async () => {
      const result = await handlers.handleReplaceNetworkAclList({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('aclid');
    });
  });
});
