import { NetworkRulesHandlers } from '../src/handlers/network/rules-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('NetworkRulesHandlers', () => {
  let handlers: NetworkRulesHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new NetworkRulesHandlers(mockClient);
  });

  describe('handleListFirewallRules', () => {
    it('should list firewall rules successfully', async () => {
      const mockResponse = {
        listfirewallrulesresponse: {
          firewallrule: [
            {
              id: 'rule-1',
              protocol: 'tcp',
              startport: '80',
              endport: '80',
              cidrlist: '0.0.0.0/0',
              state: 'Active',
              ipaddress: '203.0.113.1',
            },
          ],
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await handlers.handleListFirewallRules({});

      expect(result.content[0].text).toContain('Found 1 firewall rule');
      expect(result.content[0].text).toContain('rule-1');
      expect(result.content[0].text).toContain('tcp');
      expect(result.content[0].text).toContain('80');
      expect(mockClient.request).toHaveBeenCalledWith('listFirewallRules', {});
    });

    it('should handle empty firewall rule list', async () => {
      mockClient.request.mockResolvedValue({
        listfirewallrulesresponse: {},
      });

      const result = await handlers.handleListFirewallRules({});

      expect(result.content[0].text).toContain('No firewall rules found');
    });
  });

  describe('handleCreateFirewallRule', () => {
    it('should create a firewall rule successfully', async () => {
      const mockResponse = {
        createfirewallruleresponse: {
          jobid: 'job-123',
          id: 'rule-456',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        ipaddressid: 'ip-1',
        protocol: 'tcp',
        startport: 443,
        endport: 443,
        cidrlist: '0.0.0.0/0',
      };

      const result = await handlers.handleCreateFirewallRule(args);

      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('rule-456');
      expect(mockClient.request).toHaveBeenCalledWith('createFirewallRule', args);
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateFirewallRule({ protocol: 'tcp' });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('ipaddressid');
    });
  });

  describe('handleDeleteFirewallRule', () => {
    it('should delete a firewall rule successfully', async () => {
      const mockResponse = {
        deletefirewallruleresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteFirewallRule({ id: 'rule-1' });

      expect(result.content[0].text).toContain('rule-1');
      expect(mockClient.request).toHaveBeenCalledWith('deleteFirewallRule', { id: 'rule-1' });
    });

    it('should return error for missing required id field', async () => {
      const result = await handlers.handleDeleteFirewallRule({});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListLoadBalancerRules', () => {
    it('should list load balancer rules successfully', async () => {
      const mockResponse = {
        listloadbalancerrulesresponse: {
          loadbalancerrule: [
            {
              id: 'lb-1',
              name: 'web-lb',
              publicip: '203.0.113.1',
              publicport: '80',
              privateport: '8080',
              algorithm: 'roundrobin',
              state: 'Active',
            },
          ],
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await handlers.handleListLoadBalancerRules({});

      expect(result.content[0].text).toContain('Found 1 load balancer rule');
      expect(result.content[0].text).toContain('web-lb');
      expect(result.content[0].text).toContain('roundrobin');
      expect(mockClient.request).toHaveBeenCalledWith('listLoadBalancerRules', {});
    });

    it('should handle empty load balancer rule list', async () => {
      mockClient.request.mockResolvedValue({
        listloadbalancerrulesresponse: {},
      });

      const result = await handlers.handleListLoadBalancerRules({});

      expect(result.content[0].text).toContain('No load balancer rules found');
    });
  });

  describe('handleCreateLoadBalancerRule', () => {
    it('should create a load balancer rule successfully', async () => {
      const mockResponse = {
        createloadbalancerruleresponse: {
          jobid: 'job-123',
          id: 'lb-456',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        publicipid: 'ip-1',
        algorithm: 'roundrobin',
        name: 'test-lb',
        privateport: 8080,
        publicport: 80,
      };

      const result = await handlers.handleCreateLoadBalancerRule(args);

      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('lb-456');
      expect(mockClient.request).toHaveBeenCalledWith('createLoadBalancerRule', args);
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateLoadBalancerRule({ name: 'test' });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('algorithm');
    });
  });

  describe('handleDeleteLoadBalancerRule', () => {
    it('should delete a load balancer rule successfully', async () => {
      const mockResponse = {
        deleteloadbalancerruleresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await handlers.handleDeleteLoadBalancerRule({ id: 'lb-1' });

      expect(result.content[0].text).toContain('lb-1');
      expect(mockClient.request).toHaveBeenCalledWith('deleteLoadBalancerRule', { id: 'lb-1' });
    });

    it('should return error for missing required id field', async () => {
      const result = await handlers.handleDeleteLoadBalancerRule({});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleAssignToLoadBalancerRule', () => {
    it('should assign VMs to load balancer rule successfully', async () => {
      const mockResponse = {
        assigntoloadbalancerruleresponse: {
          jobid: 'job-123',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        id: 'lb-1',
        virtualmachineids: 'vm-1,vm-2',
      };

      const result = await handlers.handleAssignToLoadBalancerRule(args);

      expect(result.content[0].text).toContain('job-123');
      expect(mockClient.request).toHaveBeenCalledWith('assignToLoadBalancerRule', {
        id: 'lb-1',
        virtualmachineids: 'vm-1,vm-2',
      });
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleAssignToLoadBalancerRule({ id: 'lb-1' });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('virtualmachineids');
    });
  });

  describe('handleRemoveFromLoadBalancerRule', () => {
    it('should remove VMs from load balancer rule successfully', async () => {
      const mockResponse = {
        removefromloadbalancerruleresponse: {
          jobid: 'job-456',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        id: 'lb-1',
        virtualmachineids: 'vm-1',
      };

      const result = await handlers.handleRemoveFromLoadBalancerRule(args);

      expect(result.content[0].text).toContain('job-456');
      expect(mockClient.request).toHaveBeenCalledWith('removeFromLoadBalancerRule', {
        id: 'lb-1',
        virtualmachineids: 'vm-1',
      });
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleRemoveFromLoadBalancerRule({ id: 'lb-1' });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('virtualmachineids');
    });
  });

  describe('handleListPortForwardingRules', () => {
    it('should list port forwarding rules successfully', async () => {
      const mockResponse = {
        listportforwardingrulesresponse: {
          portforwardingrule: [
            {
              id: 'pf-1',
              ipaddress: '203.0.113.1',
              publicport: '22',
              privateport: '22',
              protocol: 'tcp',
              state: 'Active',
              virtualmachinename: 'web-server',
            },
          ],
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await handlers.handleListPortForwardingRules({});

      expect(result.content[0].text).toContain('Found 1 port forwarding rule');
      expect(result.content[0].text).toContain('pf-1');
      expect(result.content[0].text).toContain('22');
      expect(mockClient.request).toHaveBeenCalledWith('listPortForwardingRules', {});
    });

    it('should handle empty port forwarding rule list', async () => {
      mockClient.request.mockResolvedValue({
        listportforwardingrulesresponse: {},
      });

      const result = await handlers.handleListPortForwardingRules({});

      expect(result.content[0].text).toContain('No port forwarding rules found');
    });
  });

  describe('handleCreatePortForwardingRule', () => {
    it('should create a port forwarding rule successfully', async () => {
      const mockResponse = {
        createportforwardingruleresponse: {
          jobid: 'job-123',
          id: 'pf-456',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const args = {
        ipaddressid: 'ip-1',
        privateport: 22,
        protocol: 'tcp',
        publicport: 22,
        virtualmachineid: 'vm-1',
      };

      const result = await handlers.handleCreatePortForwardingRule(args);

      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('pf-456');
      expect(mockClient.request).toHaveBeenCalledWith('createPortForwardingRule', args);
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreatePortForwardingRule({ protocol: 'tcp' });

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('ipaddressid');
    });
  });

  describe('handleDeletePortForwardingRule', () => {
    it('should delete a port forwarding rule successfully', async () => {
      const mockResponse = {
        deleteportforwardingruleresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await handlers.handleDeletePortForwardingRule({ id: 'pf-1' });

      expect(result.content[0].text).toContain('pf-1');
      expect(mockClient.request).toHaveBeenCalledWith('deletePortForwardingRule', { id: 'pf-1' });
    });

    it('should return error for missing required id field', async () => {
      const result = await handlers.handleDeletePortForwardingRule({});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleCreateEgressFirewallRule', () => {
    it('should create an egress firewall rule successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createegressfirewallruleresponse: { jobid: 'job-123', id: 'rule-456' },
      });
      const args = { networkid: 'net-1', protocol: 'tcp' };
      const result = await handlers.handleCreateEgressFirewallRule(args);
      expect(mockClient.request).toHaveBeenCalledWith('createEgressFirewallRule', args);
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateEgressFirewallRule({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleListEgressFirewallRules', () => {
    it('should list egress firewall rules successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listegressfirewallrulesresponse: {
          firewallrule: [
            { id: 'rule-1', protocol: 'tcp', networkid: 'net-1' },
          ],
        },
      });
      const result = await handlers.handleListEgressFirewallRules({});
      expect(mockClient.request).toHaveBeenCalledWith('listEgressFirewallRules', {});
      expect(result.content[0].text).toContain('rule-1');
    });

    it('should handle empty egress firewall rule list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listegressfirewallrulesresponse: {},
      });
      const result = await handlers.handleListEgressFirewallRules({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleDeleteEgressFirewallRule', () => {
    it('should delete an egress firewall rule successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteegressfirewallruleresponse: { jobid: 'job-789' },
      });
      const result = await handlers.handleDeleteEgressFirewallRule({ id: 'rule-1' });
      expect(mockClient.request).toHaveBeenCalledWith('deleteEgressFirewallRule', { id: 'rule-1' });
      expect(result.content[0].text).toContain('job-789');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleDeleteEgressFirewallRule({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleUpdateLoadBalancerRule', () => {
    it('should update a load balancer rule successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateloadbalancerruleresponse: { jobid: 'job-123' },
      });
      const result = await handlers.handleUpdateLoadBalancerRule({ id: 'lb-1' });
      expect(mockClient.request).toHaveBeenCalledWith('updateLoadBalancerRule', { id: 'lb-1' });
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateLoadBalancerRule({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleListLBStickinessPolicies', () => {
    it('should list LB stickiness policies successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listlbstickinesspoliciesresponse: {
          stickinesspolicy: [
            { id: 'stick-1', name: 'session-policy', methodname: 'LbCookie' },
          ],
        },
      });
      const result = await handlers.handleListLBStickinessPolicies({});
      expect(mockClient.request).toHaveBeenCalledWith('listLBStickinessPolicies', {});
      expect(result.content[0].text).toContain('stick-1');
    });

    it('should handle empty LB stickiness policies list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listlbstickinesspoliciesresponse: {},
      });
      const result = await handlers.handleListLBStickinessPolicies({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleCreateLBStickinessPolicy', () => {
    it('should create a LB stickiness policy successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createlbstickinesspolicyresponse: { jobid: 'job-123' },
      });
      const args = { lbruleid: 'lb-1', methodname: 'LbCookie', name: 'my-policy' };
      const result = await handlers.handleCreateLBStickinessPolicy(args);
      expect(mockClient.request).toHaveBeenCalledWith('createLBStickinessPolicy', args);
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateLBStickinessPolicy({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDeleteLBStickinessPolicy', () => {
    it('should delete a LB stickiness policy successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletelbstickinesspolicyresponse: { jobid: 'job-789' },
      });
      const result = await handlers.handleDeleteLBStickinessPolicy({ id: 'stick-1' });
      expect(mockClient.request).toHaveBeenCalledWith('deleteLBStickinessPolicy', { id: 'stick-1' });
      expect(result.content[0].text).toContain('job-789');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleDeleteLBStickinessPolicy({});
      expect(result.isError).toBe(true);
    });
  });
});
