import { ChargeStatusEnum } from '../../model/payment.enum';

const CHARGE_STATUS_LABEL: Record<ChargeStatusEnum, string> = {
  [ChargeStatusEnum.PENDING]: 'Pendiente',
  [ChargeStatusEnum.PARTIAL]: 'Parcial',
  [ChargeStatusEnum.PAID]: 'Pagado',
  [ChargeStatusEnum.OVERDUE]: 'Atrasado',
};

const CHARGE_STATUS_CLASS: Record<ChargeStatusEnum, string> = {
  [ChargeStatusEnum.PENDING]: 'np-badge-neutral',
  [ChargeStatusEnum.PARTIAL]: 'np-badge-warning',
  [ChargeStatusEnum.PAID]: 'np-badge-success',
  [ChargeStatusEnum.OVERDUE]: 'np-badge-error',
};

/**
 * Label shown for a derived charge status (PENDING, PARTIAL, PAID, OVERDUE).
 * Avoid using this directly in an HTML template.
 */
export function getChargeStatusLabel(status: ChargeStatusEnum | null | undefined): string {
  if (!status) return '';
  return CHARGE_STATUS_LABEL[status] ?? status;
}

/**
 * Determines the `np-badge` class for a derived charge status.
 * Avoid using this directly in an HTML template.
 */
export function getChargeStatusClass(status: ChargeStatusEnum | null | undefined): string {
  if (!status) return 'np-badge-neutral';
  return CHARGE_STATUS_CLASS[status] ?? 'np-badge-neutral';
}
