"use client";

import { useMemo, useState } from "react";
import {
  analyzeCase,
  createReport,
  errorMessage,
  getExchangeDeposits,
  getInboundTransfers,
  lookupTransfers,
} from "@/lib/api/cases";
import { readWalletAddress } from "@/lib/wallet";
import { AnalysisScreen } from "@/features/case/screens/AnalysisScreen";
import { ReportScreen } from "@/features/case/screens/ReportScreen";
import { StatementScreen } from "@/features/case/screens/StatementScreen";
import { TransactionScreen, type IntakeSource } from "@/features/case/screens/TransactionScreen";
import type {
  CaseAnalysis,
  CaseReport,
  CaseStep,
  ExchangeDeposit,
  ExchangeSource,
  SubmissionDetails,
  Transfer,
  UserStatement,
} from "@/types/case";

const steps: Array<{ id: CaseStep; label: string }> = [
  { id: "transaction", label: "입금 찾기" },
  { id: "analysis", label: "온체인 조사" },
  { id: "statement", label: "내 설명" },
  { id: "report", label: "자료 생성" },
];

const initialSubmission: SubmissionDetails = {
  exchange: "unspecified",
  requestText: "",
};

// 모든 답은 "선택 안 함"으로 시작합니다. 도구가 답을 대신 고르지 않기 위해서입니다.
const initialStatement: UserStatement = {
  requestedTransfer: null,
  knowsSender: null,
  hadPurpose: null,
  discoveredAt: "",
  note: "",
  attachments: [],
};

// 데모 모드 고정 데이터의 지갑 주소 (src/fixtures/demo-case.ts)
export const EXAMPLE_WALLET = "0x1111111111111111111111111111111111111111";

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

export function CaseWorkspace() {
  const [step, setStep] = useState<CaseStep>("transaction");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [source, setSource] = useState<IntakeSource>("wallet");
  const [submission, setSubmission] = useState<SubmissionDetails>(initialSubmission);
  const [walletAddress, setWalletAddress] = useState("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string>();
  const [exchange, setExchange] = useState<ExchangeSource>("upbit");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [deposits, setDeposits] = useState<ExchangeDeposit[]>([]);
  const [selectedDepositId, setSelectedDepositId] = useState<string>();
  const [analysis, setAnalysis] = useState<CaseAnalysis>();
  const [statement, setStatement] = useState<UserStatement>(initialStatement);
  const [report, setReport] = useState<CaseReport>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const currentIndex = steps.findIndex((item) => item.id === step);
  const selectedTransfer = useMemo(
    () => transfers.find((transfer) => transfer.id === selectedTransferId),
    [selectedTransferId, transfers],
  );
  const isDemo = (analysis?.scope.provider ?? transfers[0]?.sourceProvider) === "demo";

  const searchTransfers = async () => {
    setError(undefined);
    if (!isAddress(walletAddress)) {
      setError("42자리 Ethereum 주소를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const result = await getInboundTransfers(walletAddress);
      setTransfers(result.transfers);
      setSelectedTransferId(undefined);
    } catch (caught) {
      setError(errorMessage(caught, "입금 내역을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  };

  const importFromMetaMask = async () => {
    setError(undefined);
    try {
      setWalletAddress(await readWalletAddress());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "주소를 가져오지 못했습니다.");
    }
  };

  const loadDeposits = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const nextDeposits = await getExchangeDeposits({ exchange, apiKey, apiSecret });
      setDeposits(nextDeposits);
      setSelectedDepositId(undefined);
      setApiSecret(""); // 시크릿은 쓰고 바로 지웁니다
    } catch (caught) {
      setError(errorMessage(caught, "거래소 입금 목록을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (wallet: string, transfer: Transfer) => {
    setError(undefined);
    setLoading(true);
    setAnalysis(undefined);
    setStep("analysis");
    try {
      setAnalysis(await analyzeCase({ walletAddress: wallet, transfer }));
    } catch (caught) {
      setError(errorMessage(caught, "조사에 실패했습니다. 다시 시도해 주세요."));
      setStep("transaction");
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    if (source === "wallet") {
      if (selectedTransfer) await runAnalysis(walletAddress, selectedTransfer);
      return;
    }

    // 거래소 입금 → 거래 해시로 온체인 전송 찾기 → 조사
    const deposit = deposits.find((item) => item.id === selectedDepositId);
    if (!deposit?.txHash) {
      setError("거래 해시가 없는 입금은 조사할 수 없습니다 (거래소 내부 이체일 수 있습니다).");
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      const found = await lookupTransfers(deposit.txHash);
      const transfer = found.find((item) => item.asset === deposit.asset) ?? found[0];
      if (!transfer) {
        setError("블록체인에서 해당 거래를 찾지 못했습니다.");
        setLoading(false);
        return;
      }
      setWalletAddress(transfer.to);
      setTransfers([transfer]);
      setSelectedTransferId(transfer.id);
      setSubmission((current) => ({ ...current, exchange: deposit.exchange }));
      await runAnalysis(transfer.to, transfer);
    } catch (caught) {
      setError(errorMessage(caught, "거래를 찾지 못했습니다."));
      setLoading(false);
    }
  };

  const buildReport = async () => {
    if (!selectedTransfer) return;
    setError(undefined);
    setLoading(true);
    try {
      const result = await createReport({ walletAddress, transfer: selectedTransfer, statement, submission });
      setAnalysis(result.analysis); // 서버가 다시 조사한 결과로 보고서를 만듭니다
      setReport(result.report);
      setStep("report");
    } catch (caught) {
      setError(errorMessage(caught, "자료를 만들지 못했습니다. 다시 시도해 주세요."));
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep("transaction");
    setSubmission(initialSubmission);
    setWalletAddress("");
    setTransfers([]);
    setSelectedTransferId(undefined);
    setApiKey("");
    setApiSecret("");
    setDeposits([]);
    setSelectedDepositId(undefined);
    setAnalysis(undefined);
    setStatement(initialStatement);
    setReport(undefined);
    setError(undefined);
  };

  const canAnalyze =
    source === "wallet" ? Boolean(selectedTransfer) : Boolean(selectedDepositId);

  return (
    <div className={sidebarOpen ? "app-shell" : "app-shell is-sidebar-collapsed"}>
      <aside className="workflow-sidebar">
        <div className="sidebar-header">
          <strong>I를가져가</strong>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((current) => !current)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="4" width="17" height="16" rx="3" />
              <path d="M9 4v16" />
              <path d={sidebarOpen ? "m15 9-3 3 3 3" : "m13 9 3 3-3 3"} />
            </svg>
          </button>
        </div>
        <nav className="step-navigation" aria-label="진행 단계">
          <ol>
            {steps.map((item, index) => {
              const isCurrent = index === currentIndex;
              const isComplete = index < currentIndex;

              return (
                <li key={item.id} className={isCurrent ? "is-current" : isComplete ? "is-complete" : ""}>
                  <button
                    type="button"
                    aria-current={isCurrent ? "step" : undefined}
                    disabled={index > currentIndex || loading}
                    onClick={() => setStep(item.id)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <b>{item.label}</b>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        {isDemo ? <p className="demo-badge">데모 데이터 · 주소와 거래는 가짜입니다</p> : null}
      </aside>

      <main className="workspace">
        {step === "transaction" ? (
          <TransactionScreen
            source={source}
            onSourceChange={(next) => {
              setSource(next);
              setError(undefined);
            }}
            walletAddress={walletAddress}
            transfers={transfers}
            selectedTransferId={selectedTransferId}
            onAddressChange={setWalletAddress}
            onUseExample={() => setWalletAddress(EXAMPLE_WALLET)}
            onImportMetaMask={importFromMetaMask}
            onSearch={searchTransfers}
            onSelectTransfer={setSelectedTransferId}
            exchange={exchange}
            apiKey={apiKey}
            apiSecret={apiSecret}
            deposits={deposits}
            selectedDepositId={selectedDepositId}
            onExchangeChange={setExchange}
            onApiKeyChange={setApiKey}
            onApiSecretChange={setApiSecret}
            onLoadDeposits={loadDeposits}
            onSelectDeposit={setSelectedDepositId}
            loading={loading}
            error={error}
            canAnalyze={canAnalyze}
            onNext={startAnalysis}
          />
        ) : null}
        {step === "analysis" ? (
          <AnalysisScreen
            analysis={analysis}
            loading={loading}
            onBack={() => setStep("transaction")}
            onNext={() => setStep("statement")}
          />
        ) : null}
        {step === "statement" ? (
          <StatementScreen
            statement={statement}
            analysis={analysis}
            submission={submission}
            onStatementChange={setStatement}
            onSubmissionChange={setSubmission}
            onBack={() => setStep("analysis")}
            onNext={buildReport}
            loading={loading}
            error={error}
          />
        ) : null}
        {step === "report" ? (
          <ReportScreen
            submission={submission}
            analysis={analysis}
            statement={statement}
            report={report}
            onBack={() => setStep("statement")}
            onRestart={restart}
          />
        ) : null}
      </main>
    </div>
  );
}
