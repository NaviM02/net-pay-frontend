export class CollectionsReportSummary {
  public totalCollected!: number;
  public completedCount!: number;
  public failedCount!: number;
  public pendingCount!: number;
  /** `completed / (completed + failed) × 100`, with two decimals. */
  public successRate!: number;
}

export class CollectionsReportByCollector {
  /** `null` means payments with no assigned collector. */
  public collectorHashId!: string | null;
  public collectorName!: string | null;
  public totalCollected!: number;
  public paymentCount!: number;
}

/** Payload of `GET /api/reports/collections`. */
export class CollectionsReport {
  public fromDate!: string;
  public toDate!: string;
  public summary!: CollectionsReportSummary;
  public byCollector: CollectionsReportByCollector[] = [];
}

/** Row of `GET /api/reports/overdue-clients`. */
export class OverdueClientReport {
  public clientHashId!: string;
  public businessName!: string;
  public contactName!: string;
  public contactEmail!: string | null;
  public contactPhone!: string | null;
  public serviceHashId!: string | null;
  public planName!: string | null;
  public statusId!: number;
  public statusCode!: string | null;
  public statusDescription!: string;
  public overdueMonths!: number;
  public totalDebt!: number;
  /** Billing periods already expired and unpaid, as `YYYY-MM`. */
  public overduePeriods: string[] = [];
}