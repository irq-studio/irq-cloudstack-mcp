import { VpnHandlers } from '../src/handlers/vpn-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('VpnHandlers', () => {
  let handlers: VpnHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new VpnHandlers(mockClient);
  });

  // --- VPN Gateways ---

  describe('handleCreateVpnGateway', () => {
    it('should successfully create a VPN gateway', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createvpngatewayresponse: { jobid: 'job-101' },
      });

      const result = await handlers.handleCreateVpnGateway({ vpcid: 'vpc-1' });

      expect(mockClient.request).toHaveBeenCalledWith('createVpnGateway', { vpcid: 'vpc-1' });
      expect(result.content[0].text).toContain('vpc-1');
      expect(result.content[0].text).toContain('job-101');
    });

    it('should return error for missing vpcid', async () => {
      const result = await handlers.handleCreateVpnGateway({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('vpcid');
    });
  });

  describe('handleDeleteVpnGateway', () => {
    it('should successfully delete a VPN gateway', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletevpngatewayresponse: { jobid: 'job-102' },
      });

      const result = await handlers.handleDeleteVpnGateway({ id: 'gw-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteVpnGateway', { id: 'gw-1' });
      expect(result.content[0].text).toContain('gw-1');
      expect(result.content[0].text).toContain('job-102');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteVpnGateway({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListVpnGateways', () => {
    it('should list VPN gateways', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpngatewaysresponse: {
          vpngateway: [
            { id: 'gw-1', publicip: '10.0.0.1', vpcid: 'vpc-1' },
          ],
        },
      });

      const result = await handlers.handleListVpnGateways({});

      expect(mockClient.request).toHaveBeenCalledWith('listVpnGateways', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpngatewaysresponse: { vpngateway: [] },
      });

      const result = await handlers.handleListVpnGateways({});
      expect(result.content[0].text).toContain('No');
    });
  });

  // --- VPN Connections ---

  describe('handleCreateVpnConnection', () => {
    it('should successfully create a VPN connection', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createvpnconnectionresponse: { jobid: 'job-201' },
      });

      const args = { s2scustomergatewayid: 'cg-1', s2svpngatewayid: 'gw-1' };
      const result = await handlers.handleCreateVpnConnection(args);

      expect(mockClient.request).toHaveBeenCalledWith('createVpnConnection', args);
      expect(result.content[0].text).toContain('gw-1');
      expect(result.content[0].text).toContain('cg-1');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateVpnConnection({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('s2scustomergatewayid');
    });
  });

  describe('handleDeleteVpnConnection', () => {
    it('should successfully delete a VPN connection', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletevpnconnectionresponse: { jobid: 'job-202' },
      });

      const result = await handlers.handleDeleteVpnConnection({ id: 'conn-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteVpnConnection', { id: 'conn-1' });
      expect(result.content[0].text).toContain('conn-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteVpnConnection({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListVpnConnections', () => {
    it('should list VPN connections', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpnconnectionsresponse: {
          vpnconnection: [
            { id: 'conn-1', state: 'Connected', s2scustomergatewayid: 'cg-1', s2svpngatewayid: 'gw-1' },
          ],
        },
      });

      const result = await handlers.handleListVpnConnections({});

      expect(mockClient.request).toHaveBeenCalledWith('listVpnConnections', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpnconnectionsresponse: { vpnconnection: [] },
      });

      const result = await handlers.handleListVpnConnections({});
      expect(result.content[0].text).toContain('No');
    });
  });

  describe('handleResetVpnConnection', () => {
    it('should successfully reset a VPN connection', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        resetvpnconnectionresponse: { jobid: 'job-203' },
      });

      const result = await handlers.handleResetVpnConnection({ id: 'conn-1' });

      expect(mockClient.request).toHaveBeenCalledWith('resetVpnConnection', { id: 'conn-1' });
      expect(result.content[0].text).toContain('conn-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleResetVpnConnection({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  // --- VPN Customer Gateways ---

  describe('handleCreateVpnCustomerGateway', () => {
    it('should successfully create a VPN customer gateway', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createvpncustomergatewayresponse: { jobid: 'job-301' },
      });

      const args = {
        gateway: '192.168.1.1',
        cidrlist: '10.0.0.0/24',
        ipsecpsk: 'secret123',
        ikepolicy: 'aes128-sha1',
        esppolicy: 'aes128-sha1',
      };
      const result = await handlers.handleCreateVpnCustomerGateway(args);

      expect(mockClient.request).toHaveBeenCalledWith('createVpnCustomerGateway', args);
      expect(result.content[0].text).toContain('192.168.1.1');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateVpnCustomerGateway({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('gateway');
    });
  });

  describe('handleUpdateVpnCustomerGateway', () => {
    it('should successfully update a VPN customer gateway', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatevpncustomergatewayresponse: { jobid: 'job-302' },
      });

      const result = await handlers.handleUpdateVpnCustomerGateway({ id: 'cg-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateVpnCustomerGateway', { id: 'cg-1' });
      expect(result.content[0].text).toContain('cg-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleUpdateVpnCustomerGateway({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleDeleteVpnCustomerGateway', () => {
    it('should successfully delete a VPN customer gateway', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletevpncustomergatewayresponse: { jobid: 'job-303' },
      });

      const result = await handlers.handleDeleteVpnCustomerGateway({ id: 'cg-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteVpnCustomerGateway', { id: 'cg-1' });
      expect(result.content[0].text).toContain('cg-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteVpnCustomerGateway({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListVpnCustomerGateways', () => {
    it('should list VPN customer gateways', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpncustomergatewaysresponse: {
          vpncustomergateway: [
            { id: 'cg-1', name: 'office-gw', gateway: '192.168.1.1', cidrlist: '10.0.0.0/24' },
          ],
        },
      });

      const result = await handlers.handleListVpnCustomerGateways({});

      expect(mockClient.request).toHaveBeenCalledWith('listVpnCustomerGateways', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpncustomergatewaysresponse: { vpncustomergateway: [] },
      });

      const result = await handlers.handleListVpnCustomerGateways({});
      expect(result.content[0].text).toContain('No');
    });
  });

  // --- Remote Access VPNs ---

  describe('handleCreateRemoteAccessVpn', () => {
    it('should successfully create a remote access VPN', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createremoteaccessvpnresponse: { jobid: 'job-401' },
      });

      const result = await handlers.handleCreateRemoteAccessVpn({ publicipid: 'ip-1' });

      expect(mockClient.request).toHaveBeenCalledWith('createRemoteAccessVpn', { publicipid: 'ip-1' });
      expect(result.content[0].text).toContain('ip-1');
    });

    it('should return error for missing publicipid', async () => {
      const result = await handlers.handleCreateRemoteAccessVpn({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('publicipid');
    });
  });

  describe('handleDeleteRemoteAccessVpn', () => {
    it('should successfully delete a remote access VPN', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteremoteaccessvpnresponse: { jobid: 'job-402' },
      });

      const result = await handlers.handleDeleteRemoteAccessVpn({ publicipid: 'ip-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteRemoteAccessVpn', { publicipid: 'ip-1' });
      expect(result.content[0].text).toContain('ip-1');
    });

    it('should return error for missing publicipid', async () => {
      const result = await handlers.handleDeleteRemoteAccessVpn({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('publicipid');
    });
  });

  describe('handleListRemoteAccessVpns', () => {
    it('should list remote access VPNs', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listremoteaccessvpnsresponse: {
          remoteaccessvpn: [
            { id: 'vpn-1', state: 'Running', publicip: '203.0.113.1', publicipid: 'ip-1', iprange: '10.1.1.1-10.1.1.10' },
          ],
        },
      });

      const result = await handlers.handleListRemoteAccessVpns({});

      expect(mockClient.request).toHaveBeenCalledWith('listRemoteAccessVpns', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listremoteaccessvpnsresponse: { remoteaccessvpn: [] },
      });

      const result = await handlers.handleListRemoteAccessVpns({});
      expect(result.content[0].text).toContain('No');
    });
  });

  // --- VPN Users ---

  describe('handleAddVpnUser', () => {
    it('should successfully add a VPN user', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        addvpnuserresponse: { jobid: 'job-501' },
      });

      const result = await handlers.handleAddVpnUser({ username: 'john', password: 'pass123' });

      expect(mockClient.request).toHaveBeenCalledWith('addVpnUser', { username: 'john', password: 'pass123' });
      expect(result.content[0].text).toContain('john');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleAddVpnUser({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('username');
    });
  });

  describe('handleRemoveVpnUser', () => {
    it('should successfully remove a VPN user', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        removevpnuserresponse: { jobid: 'job-502' },
      });

      const result = await handlers.handleRemoveVpnUser({ username: 'john' });

      expect(mockClient.request).toHaveBeenCalledWith('removeVpnUser', { username: 'john' });
      expect(result.content[0].text).toContain('john');
    });

    it('should return error for missing username', async () => {
      const result = await handlers.handleRemoveVpnUser({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('username');
    });
  });

  describe('handleListVpnUsers', () => {
    it('should list VPN users', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpnusersresponse: {
          vpnuser: [
            { id: 'user-1', username: 'john', state: 'Active', account: 'admin', domain: 'ROOT' },
          ],
        },
      });

      const result = await handlers.handleListVpnUsers({});

      expect(mockClient.request).toHaveBeenCalledWith('listVpnUsers', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvpnusersresponse: { vpnuser: [] },
      });

      const result = await handlers.handleListVpnUsers({});
      expect(result.content[0].text).toContain('No');
    });
  });
});
