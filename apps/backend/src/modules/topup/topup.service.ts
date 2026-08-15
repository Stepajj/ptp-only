import { AppError } from "../../shared/errors/app-error";
import { topupOnlyP2P } from "../../integrations/only-p2p/only-p2p.client";
import { findExternalClientByUserId } from "../auth/auth.repository";
import type { TopupDto, TopupResponseDto } from "./topup.dto";

export async function topup(
  userId: string,
  input: TopupDto,
): Promise<TopupResponseDto> {
  const externalClient = await findExternalClientByUserId(userId);

  if (!externalClient) {
    throw new AppError({
      statusCode: 404,
      code: "ONLY_P2P_CLIENT_NOT_FOUND",
      message: "Only P2P client not found",
    });
  }

  const result = await topupOnlyP2P(
    externalClient.externalUserId,
    input.method,
    input.amount,
  );

  return {
    success: true,
    data: result,
  };
}
