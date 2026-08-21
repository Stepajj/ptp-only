import { getIncomingRequests } from "@/features/requests/api/requests.api";
import { getBalance } from "@/features/auth/api/auth.api";
import { getAuthAccessToken } from "@/features/auth/lib/getAuthAccessToken";
import type { HistoryResponse } from "../model/history.types";

export async function getHistory(): Promise<HistoryResponse> {
  const accessToken = getAuthAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const [requests, balance] = await Promise.all([
    getIncomingRequests("finished"),
    getBalance(accessToken),
  ]);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    summary: {
      receivedAmount: requests
        .filter((request) => new Date(request.dateFinished ?? request.created).getTime() >= sevenDaysAgo)
        .reduce((total, request) => total + (request.receivedRubAmount ?? request.amountRub), 0),
      completedOrders: requests.length,
      bonusAmount: balance.data.totalProfit,
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
