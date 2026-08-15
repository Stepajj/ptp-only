export type HistoryStatus =
  | "pending"
  | "completed"
  | "processing"
  | "cancelled";

export type HistoryPeriod =
  | "1d"
  | "7d"
  | "30d"
  | "all";

export type HistoryRequisiteFilter = "all" | string;

export interface HistoryItem {
  id: string;
  amount: number;
  currency: string;
  orderNumber: number;
  paymentMethod: string;
  bankName: string;
  createdAt: string;
  status: HistoryStatus;
}

export interface HistorySummary {
  receivedAmount: number;
  completedOrders: number;
  bonusAmount: number;
}

export interface HistoryFilters {
  period: HistoryPeriod;
  requisite: HistoryRequisiteFilter;
  status: HistoryStatus | "all";
}

export interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface HistoryResponse {
  summary: HistorySummary;
  items: HistoryItem[];
  pagination: HistoryPagination;
}