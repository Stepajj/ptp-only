import { getAuthAccessToken } from "@/features/auth/lib/getAuthAccessToken";
import { requestJson } from "@/shared/api/http";

export type IncomingRequestStatus = "waiting" | "cancelled" | "finished";

export interface IncomingRequest {
  id: string;
  amountRub: number;
  receivedRubAmount: number | null;
  requisiteId: number;
  requisite: string;
  fio: string;
  bank: string;
  method: "card" | "sbp";
  status: IncomingRequestStatus;
  awaitingProof: boolean;
  deadline: string | null;
  created: string;
  dateFinished: string | null;
}

export async function getIncomingRequests(
  status?: IncomingRequestStatus,
): Promise<IncomingRequest[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await requestJson<{ success: true; data: IncomingRequest[] }>(
    `/requests${query}`,
    {
      accessToken: getAuthAccessToken(),
    },
  );

  return response.data;
}

export async function confirmIncomingRequest(
  requestId: string,
  amount?: number,
): Promise<void> {
  await requestJson<{ success: true }>(`/requests/${encodeURIComponent(requestId)}/confirm`, {
    method: "POST",
    body: amount === undefined ? {} : { amount },
    accessToken: getAuthAccessToken(),
  });
}
