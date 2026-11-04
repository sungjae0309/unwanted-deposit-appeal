// POST /api/wallets/inbound-transfers
// 요청: { address }
// 응답: { transfers: Transfer[], complete, provider }

import { SCOPE } from "@/server/constants";
import { assertAddress, readJson, toErrorResponse } from "@/server/errors";
import { getProvider } from "@/server/providers";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ address?: unknown }>(request);
    const address = assertAddress(body.address);
    const provider = getProvider();
    const result = await provider.getInboundTransfers(address, SCOPE.maxTransfers);
    return Response.json({ transfers: result.transfers, complete: result.complete, provider: provider.name });
  } catch (error) {
    return toErrorResponse(error);
  }
}
