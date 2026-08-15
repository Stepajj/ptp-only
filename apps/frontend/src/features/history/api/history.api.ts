import type {
  HistoryFilters,
  HistoryResponse,
} from "../model/history.types";

export async function getHistory(
  _filters: HistoryFilters,
): Promise<HistoryResponse> {
  throw new Error("History API is not connected yet");
}