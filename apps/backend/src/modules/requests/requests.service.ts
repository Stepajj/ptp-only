import {
  confirmOnlyP2PRequest,
  getOnlyP2PRequests,
  sendOnlyP2PRequestProof,
} from "../../integrations/only-p2p/only-p2p.client";
import { prisma } from "../../db/prisma";
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
  const requests = await getOnlyP2PRequests(await getExternalUserId(userId), status);
  const proofRequests = requests.filter((request) => request.deadlineSource === "proof_stage");
  const proofStages = new Map<string, Date>();

  for (const request of proofRequests) {
    const stage = await prisma.requestProofStage.upsert({
      where: { userId_requestId: { userId, requestId: request.id } },
      create: { userId, requestId: request.id, proofStartedAt: new Date() },
      update: {},
      select: { proofStartedAt: true },
    });
    proofStages.set(request.id, stage.proofStartedAt);
  }

  return {
    success: true as const,
    data: requests.map(({ deadlineSource, ...request }) => ({
      ...request,
      deadline: deadlineSource === "proof_stage"
        ? new Date((proofStages.get(request.id)?.getTime() ?? Date.now()) + 25 * 60 * 1000).toISOString()
        : request.deadline,
    })),
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
