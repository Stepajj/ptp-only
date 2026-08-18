import { getIncomingRequests } from "@/features/requests/api/requests.api";
import type { HistoryResponse } from "../model/history.types";

export async function getHistory(): Promise<HistoryResponse> {
  const requests = await getIncomingRequests("finished");
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    summary: {
      receivedAmount: requests
        .filter((request) => new Date(request.dateFinished ?? request.created).getTime() >= sevenDaysAgo)
        .reduce((total, request) => total + (request.receivedRubAmount ?? request.amountRub), 0),
      completedOrders: requests.length,
      bonusAmount: null,
    },
    items: requests.map((request) => ({
      id: request.id,
      amount: request.receivedRubAmount ?? request.amountRub,
      currency: "RUB",
      orderNumber: request.id,
      paymentMethod: request.method === "sbp" ? "СБП" : "Карта",
      bankName: request.bank,
      createdAt: request.dateFinished ?? request.created,
      status: "completed",
    })),
    pagination: {
      page: 1,
      limit: requests.length,
      total: requests.length,
      hasNext: false,
    },
  };
}
