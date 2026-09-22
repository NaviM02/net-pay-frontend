import { AppPayment } from '../../model/app.model';
import { TypologyEnum } from '../../model/typology.enum';

/**
 * A completed payment is locked: it cannot be edited nor deleted from the UI,
 * because its allocations are already settled against the client statement.
 * Avoid using this directly in an HTML template.
 */
export function isPaymentCompleted(payment: AppPayment): boolean {
  return payment.tpPaymentStatus?.internalId === TypologyEnum.COMPLETED;
}

/**
 * Derives the payment status from the amount against the client balance:
 * the payment is `COMPLETED` when it settles everything owed, otherwise it stays
 * `PENDING`. `FAILED` is never derived here, the backend sets it when the payment
 * ages past a given amount of days.
 *
 * @param amount Amount of the payment being saved.
 * @param balance Amount the client still owes, from `GET /clients/{hashId}/account`.
 * @param isEdit On edit the balance already counts this payment's allocations,
 * so the new amount has to cover the balance plus the amount already applied.
 */
export function resolvePaymentStatusInternalId(
  amount: number | null | undefined,
  balance: number | null | undefined,
  isEdit: boolean = false,
): TypologyEnum {
  if (amount === null || amount === undefined || amount <= 0) return TypologyEnum.PENDING;

  const pending = (balance ?? 0) + (isEdit ? (amount ?? 0) : 0);

  return amount >= pending ? TypologyEnum.COMPLETED : TypologyEnum.PENDING;
}
