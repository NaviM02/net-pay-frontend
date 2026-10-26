import { AuditEntityTypeEnum } from '../../model/audit.enum';
import { AppAuditLog, AuditChangeEntry } from '../../model/app.model';

const AUDIT_LEVEL_CLASS: Record<string, string> = {
  INFO: 'np-badge-neutral',
  WARNING: 'np-badge-warning',
  ERROR: 'np-badge-error',
};

const AUDIT_LEVEL_LABEL: Record<string, string> = { INFO: 'Información', WARNING: 'Advertencia', ERROR: 'Error' };
const ENTITY_LABEL: Record<string, string> = {
  PAYMENT: 'Pago', RECEIPT: 'Recibo', CLIENT: 'Cliente', SERVICE: 'Servicio', USER: 'Usuario', ROLE: 'Perfil',
};
const AUDIT_FIELD_LABEL: Record<string, string> = {
  fullName: 'Nombre completo', businessName: 'Nombre comercial', contactName: 'Nombre de contacto',
  contactEmail: 'Correo de contacto', contactPhone: 'Teléfono de contacto', customerSince: 'Cliente desde',
  monthlyPrice: 'Precio mensual', paymentMethod: 'Método de pago', paymentStatus: 'Estado del pago',
  tpStatus: 'Estado', status: 'Estado', tpType: 'Tipo', type: 'Tipo', createdAt: 'Fecha de creación',
  updatedAt: 'Fecha de actualización', paidAt: 'Fecha de pago', amount: 'Monto', email: 'Correo electrónico',
  name: 'Nombre', address: 'Dirección', description: 'Descripción', speed: 'Velocidad',
};

export function getAuditLevelLabel(levelName: string | null | undefined): string {
  return levelName ? AUDIT_LEVEL_LABEL[levelName.toUpperCase()] ?? humanize(levelName) : '—';
}

export function getAuditEntityLabel(entityType: string | null | undefined): string {
  return entityType ? ENTITY_LABEL[entityType.toUpperCase()] ?? humanize(entityType) : '—';
}

export function getAuditActionLabel(action: string | null | undefined): string {
  if (!action) return '—';
  const key = action.toUpperCase();
  const labels: Record<string, string> = {
    CREATE: 'Creación', CREATED: 'Creación', UPDATE: 'Actualización', UPDATED: 'Actualización',
    DELETE: 'Eliminación', DELETED: 'Eliminación', LOGIN: 'Inicio de sesión', LOGOUT: 'Cierre de sesión',
    IMPORT: 'Importación', EXPORT: 'Exportación', ASSIGN: 'Asignación', CANCEL: 'Cancelación',
    PRINT: 'Impresión', PAYMENT: 'Pago registrado',
  };
  return labels[key] ?? humanize(action);
}

export function getAuditFieldLabel(field: string): string {
  return AUDIT_FIELD_LABEL[field] ?? humanize(field);
}

function humanize(value: string): string {
  return value.replace(/[-_]+/g, ' ').toLocaleLowerCase().replace(/\b\p{L}/gu, letter => letter.toLocaleUpperCase());
}

/** Only the entities that already have a detail route can be linked. */
const AUDIT_ENTITY_ROUTE_BY_TYPE: Partial<Record<AuditEntityTypeEnum, string>> = {
  [AuditEntityTypeEnum.CLIENT]: '/clients',
  [AuditEntityTypeEnum.SERVICE]: '/services',
  [AuditEntityTypeEnum.PAYMENT]: '/payments',
  [AuditEntityTypeEnum.USER]: '/users',
};

export type AuditChangeStatus = 'CREATED' | 'DELETED' | 'CHANGED' | 'UNCHANGED';

export interface AuditChangeRow {
  field: string;
  before: string | null;
  after: string | null;
  status: AuditChangeStatus;
}

/**
 * Determines the `np-badge` class for an audit level, from the `levelName`
 * sent by the backend (INFO, WARNING, ERROR).
 * Avoid using this directly in an HTML template.
 */
export function getAuditLevelClass(levelName: string | null | undefined): string {
  if (!levelName) return 'np-badge-neutral';
  return AUDIT_LEVEL_CLASS[levelName.toUpperCase()] ?? 'np-badge-neutral';
}

/**
 * Route of the record that originated the action, or `undefined` when the
 * entity type has no detail page yet (e.g. RECEIPT) or has no `hashId`.
 */
export function getAuditEntityRoute(
  entityType: string | null | undefined,
  entityHashId: string | null | undefined,
): string[] | undefined {
  const base = AUDIT_ENTITY_ROUTE_BY_TYPE[entityType as AuditEntityTypeEnum];
  return base && entityHashId ? [base, entityHashId] : undefined;
}

/** Route of the audit log detail page (`/audit/:entityType/:entityHashId/:id`). */
export function getAuditDetailRoute(log: AppAuditLog): string[] | undefined {
  return log?.entityHashId ? ['/audit', String(log.entityType), log.entityHashId, String(log.id)] : undefined;
}

/**
 * Flattens the `changes` payload (`{ before, after }`) into one row per field.
 * Create operations only carry `after`, delete operations only `before`.
 */
export function buildAuditChangeRows(changes: AuditChangeEntry | null | undefined): AuditChangeRow[] {
  if (!changes) return [];

  const before = changes.before ?? null;
  const after = changes.after ?? null;

  if (!before && !after) return [];

  const fields = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);

  return [...fields].sort().map(field => {
    const beforeValue = before ? (before[field] ?? null) : null;
    const afterValue = after ? (after[field] ?? null) : null;

    return {
      field,
      before: formatAuditValue(beforeValue),
      after: formatAuditValue(afterValue),
      status: getAuditChangeStatus(beforeValue, afterValue, before !== null, after !== null),
    };
  });
}

function getAuditChangeStatus(
  before: unknown,
  after: unknown,
  hasBefore: boolean,
  hasAfter: boolean,
): AuditChangeStatus {
  if (!hasBefore) return 'CREATED';
  if (!hasAfter) return 'DELETED';
  return formatAuditValue(before) === formatAuditValue(after) ? 'UNCHANGED' : 'CHANGED';
}

/** Renders a `changes` value for display; objects and arrays are serialized. */
function formatAuditValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'object') return JSON.stringify(value);
  const text = String(value);
  return text.length ? text : null;
}
