import {
  getOnlyP2PSupportMessages,
  sendOnlyP2PSupportMessage,
} from "../../integrations/only-p2p/only-p2p.client";
import { AppError } from "../../shared/errors/app-error";
import { findExternalClientByUserId } from "../auth/auth.repository";
import type { SupportMessageDto } from "./support.dto";

async function getExternalUserId(userId: string): Promise<string> {
  const client = await findExternalClientByUserId(userId);
  if (!client) {
    throw new AppError({ statusCode: 404, code: "ONLY_P2P_CLIENT_NOT_FOUND", message: "Only P2P client not found" });
  }
  return client.externalUserId;
}

export async function listSupportMessages(userId: string, afterId?: number) {
  const externalUserId = await getExternalUserId(userId);
  const data = await getOnlyP2PSupportMessages(externalUserId, afterId);
  return {
    success: true as const,
    data: data.map((message) => ({
      id: message.id,
      from_operator: message.fromOperator,
      text: message.text,
      created: message.created,
    })),
  };
}

export async function sendSupportMessage(userId: string, input: SupportMessageDto) {
  await sendOnlyP2PSupportMessage(await getExternalUserId(userId), input.text);
  return { success: true as const };
}
