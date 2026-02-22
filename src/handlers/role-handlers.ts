/**
 * Role Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Roles (create, update, delete, list, import)
 * - Role Permissions (create, update, delete, list)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  Role,
  RolePermission,
} from '../types/index.js';

export class RoleHandlers {
  // Field definitions for Roles
  private static readonly roleFields: FieldDefinition<Role>[] = [
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'isdefault', label: 'Is Default', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
  ];

  // Field definitions for Role Permissions
  private static readonly rolePermissionFields: FieldDefinition<RolePermission>[] = [
    { key: 'roleid', label: 'Role ID' },
    { key: 'rolename', label: 'Role Name', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'rule', label: 'Rule' },
    { key: 'permission', label: 'Permission' },
    { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Handler instances - Roles
  public readonly handleListRoles;
  public readonly handleCreateRole;
  public readonly handleUpdateRole;
  public readonly handleDeleteRole;
  public readonly handleImportRole;

  // Handler instances - Role Permissions
  public readonly handleListRolePermissions;
  public readonly handleCreateRolePermission;
  public readonly handleUpdateRolePermission;
  public readonly handleDeleteRolePermission;

  constructor(cloudStackClient: CloudStackClient) {
    // --- Roles ---
    this.handleListRoles = createListHandler<Role>(cloudStackClient, {
      command: 'listRoles',
      responseKey: 'listrolesresponse',
      arrayKey: 'role',
      itemName: 'role',
      titleField: 'name',
      idField: 'id',
      fields: RoleHandlers.roleFields,
    });

    this.handleCreateRole = createActionHandler(cloudStackClient, {
      command: 'createRole',
      responseKey: 'createroleresponse',
      actionVerb: 'Creating',
      itemName: 'role',
      requiredFields: ['name', 'type'],
      successMessage: (args, result) =>
        `Created role "${args.name}" with type ${args.type}.${result?.id ? ` Role ID: ${result.id}` : ''}`,
    });

    this.handleUpdateRole = createActionHandler(cloudStackClient, {
      command: 'updateRole',
      responseKey: 'updateroleresponse',
      actionVerb: 'Updating',
      itemName: 'role',
      requiredFields: ['id'],
      successMessage: (args) =>
        `Updated role ${args.id}.${args.name ? ` New name: "${args.name}"` : ''}`,
    });

    this.handleDeleteRole = createActionHandler(cloudStackClient, {
      command: 'deleteRole',
      responseKey: 'deleteroleresponse',
      actionVerb: 'Deleting',
      itemName: 'role',
      requiredFields: ['id'],
      successMessage: (args) =>
        `Deleted role ${args.id}.`,
    });

    this.handleImportRole = createActionHandler(cloudStackClient, {
      command: 'importRole',
      responseKey: 'importroleresponse',
      actionVerb: 'Importing',
      itemName: 'role',
      requiredFields: ['name', 'rules'],
      successMessage: (args, result) =>
        `Imported role "${args.name}".${result?.id ? ` Role ID: ${result.id}` : ''}`,
    });

    // --- Role Permissions ---
    this.handleListRolePermissions = createListHandler<RolePermission>(cloudStackClient, {
      command: 'listRolePermissions',
      responseKey: 'listrolepermissionsresponse',
      arrayKey: 'rolepermission',
      itemName: 'role permission',
      titleField: 'rule',
      idField: 'id',
      fields: RoleHandlers.rolePermissionFields,
    });

    this.handleCreateRolePermission = createActionHandler(cloudStackClient, {
      command: 'createRolePermission',
      responseKey: 'createrolepermissionresponse',
      actionVerb: 'Creating',
      itemName: 'role permission',
      requiredFields: ['roleid', 'rule', 'permission'],
      successMessage: (args, result) =>
        `Created role permission for role ${args.roleid}: ${args.rule} = ${args.permission}.${result?.id ? ` Permission ID: ${result.id}` : ''}`,
    });

    this.handleUpdateRolePermission = createActionHandler(cloudStackClient, {
      command: 'updateRolePermission',
      responseKey: 'updaterolepermissionresponse',
      actionVerb: 'Updating',
      itemName: 'role permission',
      requiredFields: ['roleid'],
      successMessage: (args) =>
        `Updated role permission(s) for role ${args.roleid}.`,
    });

    this.handleDeleteRolePermission = createActionHandler(cloudStackClient, {
      command: 'deleteRolePermission',
      responseKey: 'deleterolepermissionresponse',
      actionVerb: 'Deleting',
      itemName: 'role permission',
      requiredFields: ['id'],
      successMessage: (args) =>
        `Deleted role permission ${args.id}.`,
    });
  }
}
