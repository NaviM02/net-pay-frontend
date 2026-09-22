import { AppAuditLog, AppPayment } from './app.model';

/**
 * Stable keys of the payment methods the backend sends as `methodName` in the
 * dashboard and report aggregates. The visible label is always translated from
 * this key, never from `methodDescription` (those come in English).
 */
export enum PaymentMethodEnum {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
}

export class DashboardSummary {
  public activeClients!: number;
  public monthCollection!: number;
  public overdueClients!: number;
  public receiptsIssued!: number;
  public year!: number;
  public month!: number;
  public monthLabel!: string;
}

export class DashboardCollectionByMethod {
  public methodId!: number;
  public methodName!: string;
  public methodDescription!: string;
  public total!: number;
  public count!: number;
}

export class DashboardCollectionsByMonth {
  public year!: number;
  public month!: number;
  public label!: string;
  public methods: DashboardCollectionByMethod[] = [];
}

export class DashboardClientByPlan {
  public planHashId!: string;
  public planName!: string;
  public activeClients!: number;
}

/** Payload of `GET /api/dashboard`. */
export class AdminDashboard {
  public summary!: DashboardSummary;
  public recentPayments: AppPayment[] = [];
  public recentActivities: AppAuditLog[] = [];
  public clientsByPlan: DashboardClientByPlan[] = [];
  /** Always the three methods, with `total: 0` when nothing was collected. */
  public collectionsByMethod: DashboardCollectionByMethod[] = [];
  /** Always `months` entries, three methods each, in chronological order. */
  public collectionsByMethodByMonth: DashboardCollectionsByMonth[] = [];
}