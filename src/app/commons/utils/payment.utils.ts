import { AppPayment } from '../../model/app.model';
import { TypologyEnum } from '../../model/typology.enum';

/**
 * Only a completed payment can still be corrected. A payment left as `PENDING`
 * ("no estamos seguros de este cobro") is locked: it generated no receipt, so
 * the right fix is to register a new payment instead of editing this one. The
 * same applies to `FAILED`, which the backend stamps when the payment ages.
 *
 * A payment with no status yet (not saved) is never locked.
 * Avoid using this directly in an HTML template.
 */
export function isPaymentLocked(payment: AppPayment): boolean {
  if (!payment.hashId) return false;

  return payment.tpPaymentStatus?.internalId !== TypologyEnum.COMPLETED;
}
