export interface AccessMenuItem {
  name: string;
  icon: string;
  path: string;
  permissions: string[];
  fallback?: { permission: string; path: string };
}

export const NOT_FOUND_ROUTE = '/404';

export const ACCESS_MENU_ITEMS: AccessMenuItem[] = [
  { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', permissions: ['dashboard:read'] },
  { name: 'Mi dashboard', icon: 'dashboard', path: '/my-dashboard', permissions: ['my-dashboard:read'] },
  { name: 'Clientes', icon: 'people', path: '/clients', permissions: ['clients:read'] },
  { name: 'Mis clientes', icon: 'people', path: '/my-clients', permissions: ['my-clients:read'] },
  { name: 'Servicios', icon: 'business_center', path: '/services', permissions: ['services:read'] },
  { name: 'Pagos', icon: 'payments', path: '/payments', permissions: ['payments:read'] },
  {
    name: 'Mis pagos', icon: 'payments', path: '/my-payments', permissions: ['my-payments:read'],
    fallback: { permission: 'my-payments:create', path: '/my-payments/new' },
  },
  { name: 'Recibos', icon: 'receipt_long', path: '/receipts', permissions: ['receipts:read'] },
  { name: 'Mis recibos', icon: 'receipt_long', path: '/my-receipts', permissions: ['my-receipts:read'] },
  { name: 'Reportes', icon: 'description', path: '/reports', permissions: ['reports:read'] },
  { name: 'Auditoría', icon: 'fact_check', path: '/audit', permissions: ['audit-logs:read'] },
  { name: 'Usuarios', icon: 'group', path: '/users', permissions: ['users:read'] },
  { name: 'Roles y permisos', icon: 'admin_panel_settings', path: '/roles', permissions: ['roles:read'] },
];

/** Actions are independent: update never implies read, for example. */
export function hasPermission(permissions: readonly string[], required: string): boolean {
  return permissions.includes(required);
}

export function getHomeRoute(permissions: readonly string[]): string {
  return ACCESS_MENU_ITEMS.map(item => menuPathForPermissions(item, permissions)).find(path => path !== undefined)
    ?? NOT_FOUND_ROUTE;
}

export function menuPathForPermissions(item: AccessMenuItem, permissions: readonly string[]): string | undefined {
  if (item.permissions.some(permission => hasPermission(permissions, permission))) return item.path;
  if (item.fallback && hasPermission(permissions, item.fallback.permission)) return item.fallback.path;
  return undefined;
}

/** Permission of a page/action URL, translating generic personal routes to dedicated grants. */
export function permissionForUrl(url: string, action: string): string {
  const segments = url.split(/[/?#]/).filter(Boolean);
  const resource = segments[0];
  if (resource === 'my-payments' && action === 'create') return 'my-payments:create';
  // Personal payment edits and receipt document operations have no my-* grants.
  if (resource === 'my-payments' && action === 'update') return 'payments:update';
  if (resource === 'my-receipts' && action === 'export') return 'receipts:export';
  if (resource?.startsWith('my-')) return `${resource}:${action}`;
  return `${resource === 'audit' ? 'audit-logs' : resource}:${action}`;
}
