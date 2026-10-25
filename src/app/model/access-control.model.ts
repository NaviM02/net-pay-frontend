export interface AppPermission {
  hashId: string;
  resource: string;
  action: string;
  authority: string;
}

export interface AppRole {
  hashId: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  statusInternalId: number;
  permissions: AppPermission[];
}

export interface RoleRequest {
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  permissionHashIds: string[];
}

export interface UserRoleAssignment {
  hashId: string;
  role: AppRole;
  startsAt: string;
  endsAt: string | null;
  cancelledAt: string | null;
  effective: boolean;
}

export interface UserRoleRequest {
  roleHashId: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface UserAccess {
  roles: UserRoleAssignment[];
  permissions: string[];
}
