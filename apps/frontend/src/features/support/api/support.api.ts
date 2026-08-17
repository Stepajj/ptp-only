import { supportMessagesMock } from '../mocks/support.mock';

import type {
  SupportMessage,
  SupportMessagesResponse,
  SupportSendResponse,
} from '../model/support.types';

export async function getSupportMessages(
  afterId?: number,
): Promise<SupportMessagesResponse> {
  const data =
    afterId === undefined
      ? supportMessagesMock
      : supportMessagesMock.filter((message) => message.id > afterId);

  return {
    success: true,
    data,
  };
}

export async function sendSupportMessage(
  text: string,
): Promise<SupportSendResponse> {
  if (!text.trim()) {
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}