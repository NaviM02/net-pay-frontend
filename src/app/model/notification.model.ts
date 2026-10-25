export interface OverdueNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  clientHashId: string;
  clientName: string;
  overdueMonths: number;
  totalDebt: number;
  overduePeriods: string[];
}

export interface NotificationsResponse {
  generatedAt: string;
  count: number;
  notifications: OverdueNotification[];
}
