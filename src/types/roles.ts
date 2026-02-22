/**
 * Role Type Definitions
 */

export interface Role {
  id: string;
  name: string;
  type: string;
  description?: string;
  isdefault?: boolean;
}

export interface RolePermission {
  id: string;
  roleid: string;
  rolename?: string;
  rule: string;
  permission: string;
  description?: string;
}

export interface ListRolesResponse {
  listrolesresponse: {
    count?: number;
    role?: Role[];
  };
}

export interface ListRolePermissionsResponse {
  listrolepermissionsresponse: {
    count?: number;
    rolepermission?: RolePermission[];
  };
}
