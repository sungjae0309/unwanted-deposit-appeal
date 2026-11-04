import { EvidenceGraph } from "@/features/case/EvidenceGraph";
import { SourceLinks } from "@/features/case/SourceLinks";
import { categoryLabels, formatKoreanDateTime, providerLabels, shortAddress } from "@/features/case/utils";
import type { CaseAnalysis } from "@/types/case";

interface AnalysisScreenProps {
  analysis?: CaseAnalysis;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function AnalysisScreen({ analysis, loading, onBack, onNext }: AnalysisScreenProps) {
  if (loading || !analysis) {
    return (
      <section className="analysis-loading" aria-live="polite">
        <div className="analysis-pulse" />
        <h1>온체인 기록 조사 중</h1>
        <p>이전 거래와 비슷한 금액의 전송 기록을 확인합니다.</p>
      </section>
    );
  }

  const { transfer, facts, scope, sanctions } = analysis;

  return (
    <section className="screen-section analysis-screen" aria-labelledby="analysis-title">
      <div className="section-heading compact-heading">
        <h1 id="analysis-title">온체인 조사</h1>
        <p>확인된 기록, 분석한 정황, 확인할 수 없는 것을 나눠 보여줍니다. 이 화면의 내용은 고칠 수 없습니다.</p>
      </div>

      <div className="case-strip">
        <span>
          <small>문제 입금</small>
          <b>{transfer.displayValue} {transfer.asset}</b>
        </span>
        <span>
          <small>보낸 주소</small>
          <b>{shortAddress(transfer.from, 9, 7)}</b>
        </span>
        <span>
          <small>조사 기간</small>
          <b>{scope.windowLabel}</b>
        </span>
        <a className="source-button" href={transfer.explorerUrl} target="_blank" rel="noreferrer">
          거래 원문 보기
        </a>
      </div>

      <div className="analysis-layout">
        <div className="analysis-primary">
          <div className="panel-heading simple-panel-heading">
            <div>
              <h2>거래 관계</h2>
              <p>문제 입금과 비슷한 금액을 받은 주소 일부만 표시합니다.</p>
            </div>
          </div>
          <EvidenceGraph analysis={analysis} />

          <div className="fact-table" aria-label="분석 요약">
            <div><span>입금 전 직접 거래</span><b>{facts.priorDirectTransactions}건</b></div>
            <div><span>보낸 주소가 보낸 고유 주소</span><b>{facts.senderRecipientCount}개</b></div>
            <div><span>그중 비슷한 금액</span><b>{facts.similarAmountCount}개</b></div>
            <div><span>보낸 주소로 다시 보냄</span><b>{facts.returnedToSender ? "있음" : "확인되지 않음"}</b></div>
          </div>

          <dl className="scope-box" aria-label="조사 범위">
            <div><dt>조사 기간</dt><dd>{formatKoreanDateTime(scope.windowStart)} ~ {formatKoreanDateTime(scope.windowEnd)}</dd></div>
            <div>
              <dt>조회 건수</dt>
              <dd>
                {scope.fetchedTransfers.toLocaleString("en-US")}건 (상한 {scope.maxTransfers.toLocaleString("en-US")}건)
                {scope.complete ? "" : " · 상한에 걸려 일부만 조회"}
              </dd>
            </div>
            <div><dt>제재 목록</dt><dd>{sanctions.listName} · {sanctions.senderMatched ? "일치" : "일치하지 않음"}</dd></div>
            <div><dt>데이터</dt><dd>{providerLabels[scope.provider]} · {formatKoreanDateTime(scope.fetchedAt)} 조회</dd></div>
          </dl>
        </div>

        <aside className="evidence-panel">
          <div className="panel-heading simple-panel-heading">
            <div>
              <h2>조사 결과</h2>
              <p>{analysis.evidence.length}개 항목 · 모두 자료에 들어갑니다</p>
            </div>
          </div>
          <div className="evidence-list">
            {analysis.evidence.map((item) => (
              <article key={item.id} className={`evidence-item evidence-${item.category}`}>
                <span>{categoryLabels[item.category]}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <SourceLinks sources={item.sources} />
              </article>
            ))}
          </div>
        </aside>
      </div>

      <div className="screen-actions">
        <button className="secondary-button" type="button" onClick={onBack}>이전</button>
        <button className="primary-button" type="button" onClick={onNext}>내 설명</button>
      </div>
    </section>
  );
}
