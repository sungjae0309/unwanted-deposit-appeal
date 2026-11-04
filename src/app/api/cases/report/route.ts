// POST /api/cases/report
// 요청: { walletAddress, txHash, eventIndex, statement, submission }
// 응답: { analysis: CaseAnalysis, report: CaseReport }
//
// 온체인 사실은 서버가 다시 조사합니다. 화면에서 보낸 분석 결과는 받지 않습니다.

import { runCaseAnalysis } from "@/server/analysis";
import { resolveTransfer } from "@/server/cases";
import { ApiError, readJson, toErrorResponse } from "@/server/errors";
import { getProvider } from "@/server/providers";
import { buildReport } from "@/server/report";
import type { SubmissionDetails, UserStatement } from "@/types/case";

interface ReportBody {
  walletAddress?: unknown;
  txHash?: unknown;
  eventIndex?: unknown;
  statement?: UserStatement;
  submission?: SubmissionDetails;
}

export async function POST(request: Request) {
  try {
    const body = await readJson<ReportBody>(request);
    if (!body.statement || !body.submission) {
      throw new ApiError(400, "BAD_BODY", "statement와 submission이 필요합니다.");
    }

    const provider = getProvider();
    const { walletAddress, transfer } = await resolveTransfer(provider, body);
    const analysis = await runCaseAnalysis({ provider, walletAddress, transfer });
    const report = buildReport({ analysis, statement: body.statement, submission: body.submission });
    return Response.json({ analysis, report });
  } catch (error) {
    return toErrorResponse(error);
  }
}
