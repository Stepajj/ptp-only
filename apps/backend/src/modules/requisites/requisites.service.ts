import {
  createOnlyP2PRequisite,
  deleteOnlyP2PRequisite,
  editOnlyP2PRequisite,
  getOnlyP2PRequisites,
} from "../../integrations/only-p2p/only-p2p.client";
import { AppError } from "../../shared/errors/app-error";
import { findExternalClientByUserId } from "../auth/auth.repository";

import type { CreateRequisiteDto, EditRequisiteDto } from "./requisites.dto";

async function getExternalUserId(userId: string): Promise<string> {
  const externalClient = await findExternalClientByUserId(userId);
  if (!externalClient) {
    throw new AppError({ statusCode: 404, code: "ONLY_P2P_CLIENT_NOT_FOUND", message: "Only P2P client not found" });
  }
  return externalClient.externalUserId;
}

export async function getRequisites(userId: string) {
  return { success: true as const, data: await getOnlyP2PRequisites(await getExternalUserId(userId)) };
}

export async function createRequisite(userId: string, input: CreateRequisiteDto) {
  const externalUserId = await getExternalUserId(userId);
  const requisiteId = await createOnlyP2PRequisite(externalUserId, input);
  const settings = {
    ...(input.minAmount !== undefined ? { minAmount: input.minAmount } : {}),
    ...(input.maxAmount !== undefined ? { maxAmount: input.maxAmount } : {}),
    ...(input.limitAmount !== undefined ? { limitAmount: input.limitAmount } : {}),
    ...(input.limitAmountMinutes !== undefined ? { limitAmountMinutes: input.limitAmountMinutes } : {}),
    ...(input.exactAmountOnly !== undefined ? { exactAmountOnly: input.exactAmountOnly } : {}),
  };
  if (Object.keys(settings).length > 0) {
    await editOnlyP2PRequisite(externalUserId, requisiteId, settings);
  }
  return { success: true as const, data: { requisiteId } };
}

export async function editRequisite(userId: string, requisiteId: number, input: EditRequisiteDto) {
  await editOnlyP2PRequisite(await getExternalUserId(userId), requisiteId, input);
  return { success: true as const };
}

export async function deleteRequisite(userId: string, requisiteId: number) {
  await deleteOnlyP2PRequisite(await getExternalUserId(userId), requisiteId);
  return { success: true as const };
}
