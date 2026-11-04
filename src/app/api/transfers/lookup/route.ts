// POST /api/transfers/lookup
// 거래소 입금 목록에서 고른 거래 해시로 온체인 전송을 찾습니다.
// 요청: { txHash }
// 응답: { transfers: Transfer[] }

import { assertTxHash, readJson, toErrorResponse } from "@/server/errors";
import { getProvider } from "@/server/providers";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ txHash?: unknown }>(request);
    const transfers = await getProvider().getTransfersByHash(assertTxHash(body.txHash));
    return Response.json({ transfers });
  } catch (error) {
    return toErrorResponse(error);
  }
}
