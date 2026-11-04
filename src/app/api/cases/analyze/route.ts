// POST /api/cases/analyze
// 요청: { walletAddress, txHash, eventIndex }
// 응답: CaseAnalysis

import { runCaseAnalysis } from "@/server/analysis";
import { resolveTransfer } from "@/server/cases";
import { readJson, toErrorResponse } from "@/server/errors";
import { getProvider } from "@/server/providers";

export async function POST(request: Request) {
  try {
    const provider = getProvider();
    const { walletAddress, transfer } = await resolveTransfer(provider, await readJson(request));
    return Response.json(await runCaseAnalysis({ provider, walletAddress, transfer }));
  } catch (error) {
    return toErrorResponse(error);
  }
}
