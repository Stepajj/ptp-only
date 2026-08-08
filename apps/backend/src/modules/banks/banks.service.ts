import { getOnlyP2PBanks } from "../../integrations/only-p2p/only-p2p.client";

import type { BanksResponseDto } from "./banks.dto";

export async function getBanks(): Promise<BanksResponseDto> {
  return {
    success: true,
    data: await getOnlyP2PBanks(),
  };
}
