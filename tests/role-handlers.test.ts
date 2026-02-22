import { RoleHandlers } from '../src/handlers/role-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('RoleHandlers', () => {
  let handlers: RoleHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new RoleHandlers(mockClient);
  });

  // ===== Roles =====

  describe('handleCreateRole', () => {
    it('should successfully create a role', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createroleresponse: { id: 'role-1' },
      });

      const args = { name: 'CustomAdmin', type: 'Admin' };
      const result = await handlers.handleCreateRole(args);

      expect(mockClient.request).toHaveBeenCalledWith('createRole', args);
      expect(result.content[0].text).toContain('CustomAdmin');
      expect(result.content[0].text).toContain('Admin');
    });

    it('should return error when name is missing', async () => {
      const result = await handlers.handleCreateRole({ type: 'Admin' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when type is missing', async () => {
      const result = await handlers.handleCreateRole({ name: 'CustomAdmin' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('type');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateRole', () => {
    it('should successfully update a role', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateroleresponse: { success: true },
      });

      const args = { id: 'role-1', name: 'UpdatedAdmin' };
      const result = await handlers.handleUpdateRole(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateRole', args);
      expect(result.content[0].text).toContain('role-1');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateRole({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteRole', () => {
    it('should successfully delete a role', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteroleresponse: { success: true },
      });

      const args = { id: 'role-1' };
      const result = await handlers.handleDeleteRole(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteRole', args);
      expect(result.content[0].text).toContain('role-1');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteRole({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListRoles', () => {
    it('should list roles', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listrolesresponse: {
          role: [
            { id: 'role-1', name: 'Root Admin', type: 'Admin', isdefault: true },
            { id: 'role-2', name: 'Domain Admin', type: 'DomainAdmin', isdefault: true },
            { id: 'role-3', name: 'Custom Role', type: 'User', isdefault: false },
          ],
        },
      });

      const result = await handlers.handleListRoles({});

      expect(mockClient.request).toHaveBeenCalledWith('listRoles', {});
      expect(result.content[0].text).toContain('Found 3');
      expect(result.content[0].text).toContain('Root Admin');
      expect(result.content[0].text).toContain('Domain Admin');
      expect(result.content[0].text).toContain('Custom Role');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listrolesresponse: { role: [] },
      });

      const result = await handlers.handleListRoles({});
      expect(result.content[0].text).toContain('No roles found');
    });
  });

  describe('handleImportRole', () => {
    it('should successfully import a role', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        importroleresponse: { id: 'role-imported-1' },
      });

      const args = { name: 'ImportedRole', rules: '[{"rule":"*","permission":"allow"}]' };
      const result = await handlers.handleImportRole(args);

      expect(mockClient.request).toHaveBeenCalledWith('importRole', args);
      expect(result.content[0].text).toContain('ImportedRole');
    });

    it('should return error when name is missing', async () => {
      const result = await handlers.handleImportRole({ rules: '[{"rule":"*","permission":"allow"}]' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when rules is missing', async () => {
      const result = await handlers.handleImportRole({ name: 'ImportedRole' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('rules');
      expect(result.content[0].text).toContain('required');
    });
  });

  // ===== Role Permissions =====

  describe('handleCreateRolePermission', () => {
    it('should successfully create a role permission', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createrolepermissionresponse: { id: 'perm-1' },
      });

      const args = { roleid: 'role-1', rule: 'listVirtualMachines', permission: 'allow' };
      const result = await handlers.handleCreateRolePermission(args);

      expect(mockClient.request).toHaveBeenCalledWith('createRolePermission', args);
      expect(result.content[0].text).toContain('role-1');
      expect(result.content[0].text).toContain('listVirtualMachines');
      expect(result.content[0].text).toContain('allow');
    });

    it('should return error when roleid is missing', async () => {
      const result = await handlers.handleCreateRolePermission({ rule: 'listVirtualMachines', permission: 'allow' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('roleid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when rule is missing', async () => {
      const result = await handlers.handleCreateRolePermission({ roleid: 'role-1', permission: 'allow' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('rule');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when permission is missing', async () => {
      const result = await handlers.handleCreateRolePermission({ roleid: 'role-1', rule: 'listVirtualMachines' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('permission');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateRolePermission', () => {
    it('should successfully update a role permission', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updaterolepermissionresponse: { success: true },
      });

      const args = { roleid: 'role-1', ruleorder: 'perm-1,perm-2' };
      const result = await handlers.handleUpdateRolePermission(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateRolePermission', args);
      expect(result.content[0].text).toContain('role-1');
    });

    it('should return error when roleid is missing', async () => {
      const result = await handlers.handleUpdateRolePermission({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('roleid');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteRolePermission', () => {
    it('should successfully delete a role permission', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleterolepermissionresponse: { success: true },
      });

      const args = { id: 'perm-1' };
      const result = await handlers.handleDeleteRolePermission(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteRolePermission', args);
      expect(result.content[0].text).toContain('perm-1');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteRolePermission({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListRolePermissions', () => {
    it('should list role permissions', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listrolepermissionsresponse: {
          rolepermission: [
            { id: 'perm-1', roleid: 'role-1', rolename: 'Admin', rule: 'listVirtualMachines', permission: 'allow' },
            { id: 'perm-2', roleid: 'role-1', rolename: 'Admin', rule: 'deployVirtualMachine', permission: 'deny' },
          ],
        },
      });

      const result = await handlers.handleListRolePermissions({});

      expect(mockClient.request).toHaveBeenCalledWith('listRolePermissions', {});
      expect(result.content[0].text).toContain('Found 2');
      expect(result.content[0].text).toContain('listVirtualMachines');
      expect(result.content[0].text).toContain('deployVirtualMachine');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listrolepermissionsresponse: { rolepermission: [] },
      });

      const result = await handlers.handleListRolePermissions({});
      expect(result.content[0].text).toContain('No role permissions found');
    });
  });
});
