import { TypologyEnum } from '../../model/typology.enum';

/**
 * Roles handled by the navigation permissions. They are the entries of the
 * `USER_ROLES` typology, so `AppUser.tpRole.internalId` maps directly onto them.
 */
export type UserRole = TypologyEnum.ADMIN | TypologyEnum.COLLECTOR;

/** Home of the administrator area. */
export const ADMIN_HOME_ROUTE = '/dashboard';

/** Home of the collector area. */
export const COLLECTOR_HOME_ROUTE = '/collector/dashboard';

/**
 * Answer for any URL the user may not know about. A role that asks for a page
 * of another role is sent here instead of its own home, so the request is
 * indistinguishable from a URL that simply does not exist.
 */
export const NOT_FOUND_ROUTE = '/404';

const ROLE_LABEL: Record<UserRole, string> = {
  [TypologyEnum.ADMIN]: 'Administrador',
  [TypologyEnum.COLLECTOR]: 'Cobrador',
};

const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  [TypologyEnum.ADMIN]: ADMIN_HOME_ROUTE,
  [TypologyEnum.COLLECTOR]: COLLECTOR_HOME_ROUTE,
};

/** Label shown for a role, e.g. in the header badge. */
export function getRoleLabel(role: number | null | undefined): string {
  const key = role as UserRole;
  return ROLE_LABEL[key] ?? '—';
}

/**
 * First page of a role, used after login and after leaving the app. Roles
 * without a home fall back to the not-found route.
 */
export function getHomeRouteForRole(role: number | null | undefined): string {
  const key = role as UserRole;
  return ROLE_HOME_ROUTE[key] ?? NOT_FOUND_ROUTE;
}