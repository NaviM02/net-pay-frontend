import { AppPayment } from '../../model/app.model';
/**
 * Every persisted payment is immutable from the UI. A correction is recorded
 * by creating a new payment, regardless of the payment's status.
 */
export function isPaymentLocked(payment: AppPayment): boolean {
  return !!payment.hashId;
}
