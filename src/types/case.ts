// 화면과 서버가 주고받는 데이터 모양 (API 계약)
// 바꿀 때는 docs/api.md도 같이 고치고, PR에 "계약 변경"이라고 적어주세요.

export type ChainId = 1; // MVP: Ethereum Mainnet만
export type AssetType = "native" | "erc20";
export type DataProvider = "demo" | "alchemy" | "upbit" | "binance";
export type CaseStep = "transaction" | "analysis" | "statement" | "report";

// ── 온체인 전송 1건 ─────────────────────────────────────────
// 같은 거래 안에 토큰 전송이 여러 개일 수 있어서 id는 txHash:eventIndex
export interface Transfer {
  id: string;
  chainId: ChainId;
  txHash: string;
  eventIndex: number; // ETH 직접 전송은 0, ERC-20은 로그 번호
  blockNumber: number;
  timestamp: string; // ISO 8601 (UTC)
  from: string;
  to: string;
  assetType: AssetType;
  asset: string; // 화면 표시용 심볼 (ETH, USDC …)
  contractAddress: string | null; // ETH면 null
  rawValue: string; // 소수점 없는 정수 문자열 (계산은 이 값으로)
  decimals: number;
  displayValue: string; // 화면 표시용 (계산에 쓰지 않기)
  sourceProvider: DataProvider;
  fetchedAt: string;
  explorerUrl: string;
}

// ── 거래소 입금 목록 1건 ────────────────────────────────────
export type ExchangeSource = "upbit" | "binance";

export interface ExchangeDeposit {
  id: string;
  exchange: ExchangeSource;
  asset: string;
  network: string;
  amount: string;
  txHash: string | null; // 거래소 내부 이체면 없음
  state: string;
  createdAt: string;
  sourceAddress: string | null; // 바이낸스만 제공. 업비트는 null
}

// ── 조사 결과 ──────────────────────────────────────────────
// verified     = 확인된 기록 (온체인에 그대로 있는 사실)
// derived      = 분석한 정황 (기록을 세거나 비교해서 나온 것)
// unverifiable = 확인할 수 없음 (온체인으로 원래 알 수 없거나, 조회 범위 밖)
// 사용자 설명은 UserStatement로 따로 받습니다.
export type EvidenceCategory = "verified" | "derived" | "unverifiable";

// 어느 분석에서 나온 항목인지 (노션 A~E + 제재 목록)
export type AnalysisCode = "A" | "B" | "C" | "D" | "E" | "S";

export interface SourceRef {
  label: string;
  txHash?: string;
  url?: string;
}

export interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  analysis: AnalysisCode;
  title: string; // 문장 규칙: docs/writing-rules.md
  description: string;
  sources: SourceRef[]; // verified·derived는 최소 1개 필수
}

export interface AnalysisScope {
  windowLabel: string; // 예: "입금 전후 24시간"
  windowStart: string;
  windowEnd: string;
  maxTransfers: number; // 조회 상한
  fetchedTransfers: number; // 실제로 가져온 건수
  complete: boolean; // 상한에 걸리면 false → 화면·보고서에 "일부만 조회" 표시
  provider: DataProvider;
  fetchedAt: string;
  failures: string[]; // 조회에 실패한 범위 (없으면 빈 배열)
}

export interface SanctionsCheck {
  listName: string;
  listUpdatedAt: string;
  checkedAt: string;
  senderMatched: boolean; // false여도 "제재 주소가 아님"이라고 쓰지 않기
}

export interface CaseFacts {
  priorDirectTransactions: number; // B: 입금 전 두 주소 사이 직접 거래 수
  senderRecipientCount: number; // C: 조사 범위에서 보낸 사람이 보낸 고유 주소 수
  similarAmountCount: number; // C: 그중 비슷한 금액(±10%) 건수
  returnedToSender: boolean; // D: 입금 후 보낸 사람에게 다시 보낸 기록
  firstOutgoingAfter: Transfer | null; // D: 입금 후 처음 나간 전송 (순서만 말할 수 있음)
}

export interface GraphNode {
  id: string;
  label: string;
  detail: string;
  role: "subject" | "sender" | "recipient";
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  emphasized?: boolean;
}

export interface CaseAnalysis {
  caseId: string;
  version: string;
  walletAddress: string;
  transfer: Transfer;
  scope: AnalysisScope;
  facts: CaseFacts;
  sanctions: SanctionsCheck;
  evidence: EvidenceItem[]; // 사용자가 빼거나 고칠 수 없음
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── 사용자 설명 ────────────────────────────────────────────
// null = 아직 답하지 않음 → 보고서에 "미확인"
export type Answer = "no" | "yes" | "unknown" | null;

export interface StatementAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface UserStatement {
  requestedTransfer: Answer;
  knowsSender: Answer;
  hadPurpose: Answer;
  discoveredAt: string; // 비어 있으면 "미확인"
  note: string;
  attachments: StatementAttachment[]; // 사용자가 고를 수 있는 건 첨부뿐
}

export type ExchangeId = "unspecified" | ExchangeSource | "coinbase" | "kraken" | "other";

export interface SubmissionDetails {
  exchange: ExchangeId;
  requestText: string; // 거래소에서 받은 요청 문구 (선택)
}

// ── 보고서 ────────────────────────────────────────────────
export interface CaseReport {
  generatedAt: string;
  analysisVersion: string;
  summary: string;
  request: string;
  additionalDocuments: string[];
}
