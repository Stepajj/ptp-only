import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';
import { requestJson } from '@/shared/api/http';

import type {
  SupportMessagesResponse,
  SupportSendResponse,
} from '../model/support.types';

export async function getSupportMessages(
  afterId?: number,
): Promise<SupportMessagesResponse> {
  const query = afterId === undefined ? '' : `?after_id=${afterId}`;
  return requestJson<SupportMessagesResponse>(`/support/messages${query}`, {
    accessToken: getAuthAccessToken(),
  });
}

export async function sendSupportMessage(
  text: string,
): Promise<SupportSendResponse> {
  return requestJson<SupportSendResponse>('/support/messages', {
    method: 'POST',
    body: { text },
    accessToken: getAuthAccessToken(),
  });
}
