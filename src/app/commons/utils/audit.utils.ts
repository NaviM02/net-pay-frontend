import { AuditEntityTypeEnum } from '../../model/audit.enum';
import { AppAuditLog, AuditChangeEntry } from '../../model/app.model';

const AUDIT_LEVEL_CLASS: Record<string, string> = {
  INFO: 'np-badge-neutral',
  WARNING: 'np-badge-warning',
  ERROR: 'np-badge-error',
};

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