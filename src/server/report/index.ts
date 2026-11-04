import "server-only";

// 보고서 문안 만들기
// 담당: 성재 (리포트·통합)
//
// 원칙
//   - 온체인 사실은 화면에서 받은 값을 쓰지 않고, 서버가 다시 조사한 결과(analysis)로만 씁니다.
//   - 사용자 설명과 온체인 기록을 섞어 한 문장으로 쓰지 않습니다.
//   - "결백", "무관", "깨끗한" 같은 판단하는 말을 쓰지 않습니다. (docs/writing-rules.md)

import { amount } from "@/server/format";
import type { CaseAnalysis, CaseReport, SubmissionDetails, UserStatement } from "@/types/case";

export function buildReport(input: {
  analysis: CaseAnalysis;
  statement: UserStatement;
  submission: SubmissionDetails;
}): CaseReport {
  const { analysis, statement, submission } = input;
  const { facts, transfer, scope } = analysis;

  const summary = [
    `선택한 지갑은 보낸 주소로부터 ${amount(transfer)}를 받았습니다.`,
    facts.priorDirectTransactions === 0
      ? "조회한 기록에서 두 주소 사이의 이전 직접 거래는 확인되지 않았습니다."
      : `두 주소 사이에는 이전 직접 거래가 ${facts.priorDirectTransactions}건 있습니다.`,
    `같은 보낸 주소는 ${scope.windowLabel} 동안 ${facts.similarAmountCount}개 주소에 비슷한 금액을 보냈습니다.`,
    facts.returnedToSender
      ? "입금 후 보낸 주소로 다시 보낸 기록이 있습니다."
      : "입금 후 보낸 주소로 다시 보낸 기록은 확인되지 않았습니다.",
  ].join(" ");

  const additionalDocuments = [
    ...(submission.requestText.trim() ? ["거래소에서 받은 소명 요청 원문"] : []),
    ...(submission.exchange !== "unspecified" ? ["제출 계정 정보가 확인되는 화면"] : []),
    statement.attachments.length > 0
      ? `사용자가 첨부한 관련 자료 ${statement.attachments.length}개`
      : "관련 자료가 있다면 추가 첨부",
    "자금 출처를 추가로 요구받은 경우: 해당 자산의 출처 자료 (이 도구의 범위 밖)",
  ];

  return {
    generatedAt: new Date().toISOString(),
    analysisVersion: analysis.version,
    summary,
    request:
      "위 온체인 기록과 사용자 설명을 구분해 정리했습니다. 각 항목의 원본 링크로 기록을 직접 확인하신 뒤 해당 입금의 경위를 검토해 주시기 바랍니다.",
    additionalDocuments,
  };
}
