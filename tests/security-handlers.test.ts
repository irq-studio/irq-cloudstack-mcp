import { SecurityHandlers } from '../src/handlers/security-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('SecurityHandlers', () => {
  let handlers: SecurityHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new SecurityHandlers(mockClient);
  });

  describe('handleListSecurityGroups', () => {
    it('should list security groups successfully', async () => {
      const mockResponse = {
        listsecuritygroupsresponse: {
          securitygroup: [
            {
              id: 'sg-1',
              name: 'default',
              description: 'Default Security Group',
              account: 'admin',
              domain: 'ROOT',
              ingressrule: [
                {
                  ruleid: 'rule-1',
                  protocol: 'tcp',
                  startport: 22,
                  endport: 22,
                  cidr: '0.0.0.0/0',
                },
              ],
              egressrule: [],
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListSecurityGroups({});

      expect(result.content[0].text).toContain('Found 1 security group');
      expect(result.content[0].text).toContain('default');
      expect(result.content[0].text).toContain('Ingress Rules: 1');
      expect(result.content[0].text).toContain('Egress Rules: 0');
    });

    it('should handle empty security group list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsecuritygroupsresponse: {},
      });

      const result = await handlers.handleListSecurityGroups({});

      expect(result.content[0].text).toContain('No security groups found');
    });

    it('should filter by security group name', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsecuritygroupsresponse: { securitygroup: [] },
      });

      await handlers.handleListSecurityGroups({ securitygroupname: 'web-sg' });

      expect(mockClient.request).toHaveBeenCalledWith('listSecurityGroups', {
        securitygroupname: 'web-sg',
      });
    });
  });

  describe('handleCreateSecurityGroupRule', () => {
    it('should create an ingress rule successfully', async () => {
      const mockResponse = {
        authorizesecuritygroupingressresponse: {
          jobid: 'job-123',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        securitygroupid: 'sg-1',
        protocol: 'tcp',
        startport: 80,
        endport: 80,
        cidrlist: '0.0.0.0/0',
        ruletype: 'ingress',
      };

      const result = await handlers.handleCreateSecurityGroupRule(args);

      expect(result.content[0].text).toContain('job-123');
      expect(mockClient.request).toHaveBeenCalledWith('authorizeSecurityGroupIngress', args);
    });

    it('should create an egress rule successfully', async () => {
      const mockResponse = {
        authorizesecuritygroupingressresponse: {
          jobid: 'job-456',
          id: 'rule-789',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        securitygroupid: 'sg-1',
        protocol: 'tcp',
        startport: 443,
        endport: 443,
        cidrlist: '0.0.0.0/0',
        ruletype: 'egress',
      };

      const result = await handlers.handleCreateSecurityGroupRule(args);

      expect(result.content[0].text).toContain('job-456');
    });

    it('should return error for missing required fields', async () => {
      // Factory-based action handlers return error response for validation failures
      const result = await handlers.handleCreateSecurityGroupRule({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });

    it('should handle ICMP protocol', async () => {
      const mockResponse = {
        authorizesecuritygroupingressresponse: { jobid: 'job-789' },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        securitygroupid: 'sg-1',
        protocol: 'icmp',
        icmptype: -1,
        icmpcode: -1,
        cidrlist: '0.0.0.0/0',
      };

      await handlers.handleCreateSecurityGroupRule(args);

      expect(mockClient.request).toHaveBeenCalledWith('authorizeSecurityGroupIngress', args);
    });
  });

  describe('handleListSSHKeyPairs', () => {
    it('should list SSH key pairs successfully', async () => {
      const mockResponse = {
        listsshkeypairsresponse: {
          sshkeypair: [
            {
              name: 'my-key',
              fingerprint: 'aa:bb:cc:dd:ee:ff',
              account: 'admin',
              domain: 'ROOT',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListSSHKeyPairs({});

      expect(result.content[0].text).toContain('Found 1 SSH key pair');
      expect(result.content[0].text).toContain('my-key');
      expect(result.content[0].text).toContain('aa:bb:cc:dd:ee:ff');
    });

    it('should handle empty SSH key pair list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsshkeypairsresponse: {},
      });

      const result = await handlers.handleListSSHKeyPairs({});

      expect(result.content[0].text).toContain('No SSH key pairs found');
    });

    it('should filter by key name', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsshkeypairsresponse: { sshkeypair: [] },
      });

      await handlers.handleListSSHKeyPairs({ name: 'production-key' });

      expect(mockClient.request).toHaveBeenCalledWith('listSSHKeyPairs', { name: 'production-key' });
    });
  });

  describe('handleCreateSSHKeyPair', () => {
    it('should create an SSH key pair successfully', async () => {
      const mockResponse = {
        createsshkeypairresponse: {
          keypair: {
            name: 'new-key',
            fingerprint: '11:22:33:44:55:66',
            privatekey: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
          },
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleCreateSSHKeyPair({ name: 'new-key' });

      expect(result.content[0].text).toContain('new-key');
      expect(result.content[0].text).toContain('11:22:33:44:55:66');
      expect(result.content[0].text).toContain('BEGIN RSA PRIVATE KEY');
      expect(mockClient.request).toHaveBeenCalledWith('createSSHKeyPair', { name: 'new-key' });
    });

    it('should throw error for missing name field', async () => {
      await expect(handlers.handleCreateSSHKeyPair({} as any))
        .rejects
        .toThrow('Missing required field: name');
    });

    it('should handle key creation with only name parameter', async () => {
      const mockResponse = {
        createsshkeypairresponse: {
          keypair: {
            name: 'key-123',
            fingerprint: 'aa:bb:cc:dd:ee:ff',
            privatekey: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----',
          },
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'key-123',
        account: 'user-account',
        domainid: 'domain-1',
      };

      await handlers.handleCreateSSHKeyPair(args);

      // Handler only passes name parameter
      expect(mockClient.request).toHaveBeenCalledWith('createSSHKeyPair', { name: 'key-123' });
    });
  });

  describe('handleCreateAccount', () => {
    it('should successfully create an account', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createaccountresponse: { id: 'acct-123' },
      });
      const args = { accounttype: 0, email: 'user@example.com', firstname: 'John', lastname: 'Doe', password: 'secret', username: 'johndoe' };
      const result = await handlers.handleCreateAccount(args);
      expect(mockClient.request).toHaveBeenCalledWith('createAccount', args);
      expect(result.content[0].text).toContain('Created account');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateAccount({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleUpdateAccount', () => {
    it('should successfully update an account', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateaccountresponse: { account: { id: 'acct-123' } },
      });
      const result = await handlers.handleUpdateAccount({ newname: 'updated-name' });
      expect(mockClient.request).toHaveBeenCalledWith('updateAccount', { newname: 'updated-name' });
      expect(result.content[0].text).toContain('Updated account');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateAccount({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDeleteAccount', () => {
    it('should successfully delete an account', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteaccountresponse: { success: true },
      });
      const result = await handlers.handleDeleteAccount({ id: 'acct-123' });
      expect(mockClient.request).toHaveBeenCalledWith('deleteAccount', { id: 'acct-123' });
      expect(result.content[0].text).toContain('Deleting account');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleDeleteAccount({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDisableAccount', () => {
    it('should successfully disable an account', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        disableaccountresponse: { account: { id: 'acct-123' } },
      });
      const result = await handlers.handleDisableAccount({ lock: true });
      expect(mockClient.request).toHaveBeenCalledWith('disableAccount', { lock: true });
      expect(result.content[0].text).toBeDefined();
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleDisableAccount({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleEnableAccount', () => {
    it('should successfully enable an account', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        enableaccountresponse: { account: { id: 'acct-123' } },
      });
      const result = await handlers.handleEnableAccount({});
      expect(mockClient.request).toHaveBeenCalledWith('enableAccount', {});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleLockAccount', () => {
    it('should successfully lock an account', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        lockaccountresponse: { account: { id: 'acct-123' } },
      });
      const result = await handlers.handleLockAccount({ account: 'admin', domainid: 'domain-1' });
      expect(mockClient.request).toHaveBeenCalledWith('lockAccount', { account: 'admin', domainid: 'domain-1' });
      expect(result.content[0].text).toBeDefined();
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleLockAccount({});
      expect(result.isError).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle security group API errors', async () => {
      const error = new Error('Security group not found');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(handlers.handleListSecurityGroups({})).rejects.toThrow(
        'Security group not found'
      );
    });

    it('should handle SSH key pair creation errors', async () => {
      const error = new Error('Key pair already exists');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleCreateSSHKeyPair({ name: 'existing-key' })
      ).rejects.toThrow('Key pair already exists');
    });

    it('should handle rule creation errors', async () => {
      const error = new Error('Invalid CIDR format');
      mockClient.request = jest.fn().mockRejectedValue(error);

      await expect(
        handlers.handleCreateSecurityGroupRule({
          securitygroupid: 'sg-1',
          protocol: 'tcp',
          startport: 80,
          endport: 80,
          cidrlist: 'invalid',
        })
      ).rejects.toThrow('Invalid CIDR format');
    });
  });
});
