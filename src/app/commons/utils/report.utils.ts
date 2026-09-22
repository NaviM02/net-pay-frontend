import {
  DashboardClientByPlan,
  DashboardCollectionByMethod,
  PaymentMethodEnum,
} from '../../model/dashboard.model';
import { CollectionsReportByCollector } from '../../model/report.model';
import { TypologyEnum } from '../../model/typology.enum';
import { OverdueClientStatusEnum } from '../../model/report.enum';

const PAYMENT_METHOD_LABEL: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: 'Efectivo',
  [PaymentMethodEnum.TRANSFER]: 'Transferencia',
  [PaymentMethodEnum.CARD]: 'Tarjeta',
};

/** Chart palette, aligned with the `np-badge` colors of each method. */
const PAYMENT_METHOD_COLOR: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: '#15803D',
  [PaymentMethodEnum.TRANSFER]: '#1E5CE6',
  [PaymentMethodEnum.CARD]: '#B45309',
};

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

const PLAN_CHART_COLOR: readonly string[] = [
  '#1E5CE6',
  '#15803D',
  '#B45309',
  '#7C3AED',
  '#0E7490',
  '#BE123C',
];

/**
 * Visible label of a payment method, translated from the stable `methodName`
 * key (`CASH`, `TRANSFER`, `CARD`) because `methodDescription` comes in English.
 * Avoid using this directly in an HTML template.
 */
export function getPaymentMethodLabel(methodName: string | null | undefined): string {
  const key = methodName as PaymentMethodEnum;
  return PAYMENT_METHOD_LABEL[key] ?? methodName ?? '—';
}

/** Chart color of a payment method. Avoid using this directly in an HTML template. */
export function getPaymentMethodColor(methodName: string | null | undefined): string {
  return PAYMENT_METHOD_COLOR[methodName as PaymentMethodEnum] ?? '#94A3B8';
}

/** Ordered methods used by every chart legend, so the colors never shift. */
const PAYMENT_METHOD_ORDER: readonly PaymentMethodEnum[] = [
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.TRANSFER,
  PaymentMethodEnum.CARD,
];

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

export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

/** `2026-07` to `Jul 2026`, used by the tooltip of the overdue periods. */
export function formatOverduePeriod(period: string): string {
  const [year, month] = period.split('-');
  const label = getMonthLabel(Number(month));
  return year && label ? `${label} ${year}` : period;
}

/**
 * The three payment methods of a single month, always in the same order, so the
 * donut legend and the monthly bar series line up with each other.
 */
export function orderCollectionsByMethod(
  collections: DashboardCollectionByMethod[],
): DashboardCollectionByMethod[] {
  return PAYMENT_METHOD_ORDER.map(methodName => {
    return (
      collections.find(collection => collection.methodName === methodName) ?? {
        methodId: 0,
        methodName,
        methodDescription: '',
        total: 0,
        count: 0,
      }
    );
  });
}

export interface MonthlyCollectionSeries {
  labels: string[];
  series: { name: string; data: number[] }[];
  colors: string[];
}

/**
 * Transforms `collectionsByMethodByMonth` into the series of a stacked bar
 * chart: one serie per payment method, one point per month.
 */
export function buildMonthlyCollectionSeries(
  months: { label: string; methods: DashboardCollectionByMethod[] }[],
): MonthlyCollectionSeries {
  return {
    labels: months.map(month => month.label),
    colors: PAYMENT_METHOD_ORDER.map(methodName => getPaymentMethodColor(methodName)),
    series: PAYMENT_METHOD_ORDER.map(methodName => ({
      name: getPaymentMethodLabel(methodName),
      data: months.map(month => {
        const found = month.methods.find(method => method.methodName === methodName);
        return found?.total ?? 0;
      }),
    })),
  };
}

export interface PlanClientSeries {
  labels: string[];
  data: number[];
  colors: string[];
}

/** Turns `clientsByPlan` into a single-series horizontal bar chart. */
export function buildClientsByPlanSeries(plans: DashboardClientByPlan[]): PlanClientSeries {
  const sorted = [...plans].sort((a, b) => b.activeClients - a.activeClients);

  return {
    labels: sorted.map(plan => plan.planName),
    data: sorted.map(plan => plan.activeClients),
    colors: sorted.map((_, index) => PLAN_CHART_COLOR[index % PLAN_CHART_COLOR.length]),
  };
}

const OVERDUE_STATUS_CLASS: Partial<Record<number, string>> = {
  [TypologyEnum.ACTIVE]: 'np-badge-success',
  [TypologyEnum.INACTIVE]: 'np-badge-neutral',
  [TypologyEnum.LOCKED]: 'np-badge-primary',
  [OverdueClientStatusEnum.SUSPENDED]: 'np-badge-warning',
  [OverdueClientStatusEnum.DELETED]: 'np-badge-neutral',
};

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