import { AppAuditLog, AppPayment } from './app.model';
import { OverdueClientReport } from './report.model';

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

/** Payload of the global `GET /api/dashboard` overview. */
export class OperationsDashboard {
  public summary!: DashboardSummary;
  public recentPayments: AppPayment[] = [];
  public recentActivities: AppAuditLog[] = [];
  public clientsByPlan: DashboardClientByPlan[] = [];
  /** Always the three methods, with `total: 0` when nothing was collected. */
  public collectionsByMethod: DashboardCollectionByMethod[] = [];
  /** Always `months` entries, three methods each, in chronological order. */
  public collectionsByMethodByMonth: DashboardCollectionsByMonth[] = [];
}

export class MyDashboardSummary {
  public assignedClients!: number;
  public monthCollection!: number;
  public overdueClients!: number;
  public receiptsIssued!: number;
  public year!: number;
  public month!: number;
  public monthLabel!: string;
}

/** Payload of `GET /api/dashboard/collector`, scoped to the authenticated user. */
export class MyDashboard {
  public summary!: MyDashboardSummary;
  public recentPayments: AppPayment[] = [];
  /** Only the overdue clients assigned to the authenticated user. */
  public overdueClients: OverdueClientReport[] = [];
  public collectionsByMethod: DashboardCollectionByMethod[] = [];
  public collectionsByMethodByMonth: DashboardCollectionsByMonth[] = [];
}
