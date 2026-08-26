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

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export async function getRequisites(userId: string) {
  return { success: true as const, data: await getOnlyP2PRequisites(await getExternalUserId(userId)) };
}

export async function createRequisite(userId: string, input: CreateRequisiteDto) {
  const externalUserId = await getExternalUserId(userId);
  const existing = await getOnlyP2PRequisites(externalUserId);
  const duplicate = existing.some((requisite) => {
    const sameOwner = requisite.bankId === input.bankId && normalize(requisite.fio) === normalize(input.fio);
    const sameCard = Boolean(input.card) && requisite.card !== "-" && normalizeDigits(requisite.card) === normalizeDigits(input.card);
    const samePhone = Boolean(input.phone) && requisite.phone !== "-" && normalizeDigits(requisite.phone) === normalizeDigits(input.phone);
    return sameOwner && (sameCard || samePhone);
  });

  if (duplicate) {
    throw new AppError({
      statusCode: 409,
      code: "REQUISITE_ALREADY_EXISTS",
      message: "Такой реквизит уже добавлен",
    });
  }

  const requisiteId = await createOnlyP2PRequisite(externalUserId, input);
  const settings = {
    ...(input.minAmount !== undefined ? { minAmount: input.minAmount } : {}),
    ...(input.maxAmount !== undefined ? { maxAmount: input.maxAmount } : {}),
    ...(input.limitAmount !== undefined ? { limitAmount: input.limitAmount } : {}),
    ...(input.limitAmountMinutes !== undefined ? { limitAmountMinutes: input.limitAmountMinutes } : {}),
    ...(input.exactAmountOnly !== undefined ? { exactAmountOnly: input.exactAmountOnly } : {}),
  };
  if (Object.keys(settings).length > 0) {
    try {
      await editOnlyP2PRequisite(externalUserId, requisiteId, settings);
    } catch (error) {
      // The partner creates the requisite before applying optional settings.
      // Remove it on failure so the frontend cannot report a failed create while
      // leaving an unconfigured external requisite behind.
      try {
        await deleteOnlyP2PRequisite(externalUserId, requisiteId);
      } catch {
        // Preserve the original, actionable partner validation error.
      }
      throw error;
    }
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
