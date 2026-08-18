import {
  confirmOnlyP2PRequest,
  getOnlyP2PRequests,
  sendOnlyP2PRequestProof,
} from "../../integrations/only-p2p/only-p2p.client";
import { AppError } from "../../shared/errors/app-error";
import { findExternalClientByUserId } from "../auth/auth.repository";

import type { ConfirmRequestDto, RequestStatusDto } from "./requests.dto";

async function getExternalUserId(userId: string): Promise<string> {
  const externalClient = await findExternalClientByUserId(userId);

  if (!externalClient) {
    throw new AppError({
      statusCode: 404,
      code: "ONLY_P2P_CLIENT_NOT_FOUND",
      message: "Only P2P client not found",
    });
  }

  return externalClient.externalUserId;
}

export async function listRequests(userId: string, status?: RequestStatusDto) {
  return {
    success: true as const,
    data: await getOnlyP2PRequests(await getExternalUserId(userId), status),
  };
}

export async function confirmRequest(
  userId: string,
  requestId: string,
  input: ConfirmRequestDto,
) {
  await confirmOnlyP2PRequest(
    await getExternalUserId(userId),
    requestId,
    input.amount,
  );

  return { success: true as const };
}

export async function submitRequestProof(userId: string, requestId: string, file: { buffer: Buffer; mimetype: string; originalname: string }) {
  await sendOnlyP2PRequestProof(await getExternalUserId(userId), requestId, file);
  return { success: true as const };
}
