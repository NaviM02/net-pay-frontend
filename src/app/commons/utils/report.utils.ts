import { TypologyEnum } from '../../model/typology.enum';
import { CollectionsReportByCollector } from '../../model/report.model';
import { OverdueClientStatusEnum } from '../../model/report.enum';

const MONTHS: string[] = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const OVERDUE_STATUS_CLASS: Partial<Record<number, string>> = {
  [TypologyEnum.ACTIVE]: 'np-badge-success',
  [TypologyEnum.INACTIVE]: 'np-badge-neutral',
  [TypologyEnum.LOCKED]: 'np-badge-primary',
  [OverdueClientStatusEnum.SUSPENDED]: 'np-badge-warning',
  [OverdueClientStatusEnum.DELETED]: 'np-badge-neutral',
};

export function getMonthLabel(month: number): string {
  return MONTHS[month - 1] ?? `${month}`;
}

export function getMonthNames(): string[] {
  return [...MONTHS];
}

/** Last years available in the period picker, newest first. */
export function getYearOptions(yearsBack: number = 4): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: yearsBack + 1 }, (_, index) => current - index);
}

/** `2026-07` to `Jul 2026`, used by the tooltip of the overdue periods. */
export function formatOverduePeriod(period: string): string {
  const [year, month] = period.split('-');
  const label = getMonthLabel(Number(month));
  return year && label ? `${label} ${year}` : period;
}

/**
 * `np-badge` class of the client status inside the overdue report, from the
 * `statusId` sent by the backend. Avoid using this directly in an HTML template.
 */
export function getOverdueStatusClass(statusId: number | null | undefined): string {
  if (statusId === null || statusId === undefined) return 'np-badge-neutral';
  return OVERDUE_STATUS_CLASS[statusId] ?? 'np-badge-neutral';
}

/** Display name of a collector; payments with no collector are grouped apart. */
export function getCollectorName(
  collector: CollectionsReportByCollector | null | undefined,
): string {
  return collector?.collectorName ?? 'Sin asignar';
}