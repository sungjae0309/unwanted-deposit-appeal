import { categoryLabels } from "@/features/case/utils";
import type {
  Answer,
  CaseAnalysis,
  EvidenceCategory,
  SubmissionDetails,
  UserStatement,
} from "@/types/case";

interface StatementScreenProps {
  statement: UserStatement;
  analysis?: CaseAnalysis;
  submission: SubmissionDetails;
  onStatementChange: (statement: UserStatement) => void;
  onSubmissionChange: (submission: SubmissionDetails) => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  error?: string;
}

const answerOptions = [
  { id: "no", label: "아니요" },
  { id: "yes", label: "예" },
  { id: "unknown", label: "모르겠어요" },
] as const;

const exchanges = [
  { id: "unspecified", label: "선택하지 않음" },
  { id: "upbit", label: "업비트" },
  { id: "binance", label: "바이낸스" },
  { id: "coinbase", label: "Coinbase" },
  { id: "kraken", label: "Kraken" },
  { id: "other", label: "기타" },
] as const;

interface QuestionProps {
  number: string;
  label: string;
  name: string;
  value: Answer;
  onChange: (value: Answer) => void;
}

function Question({ number, label, name, value, onChange }: QuestionProps) {
  return (
    <fieldset className="statement-question">
      <legend><span>{number}</span>{label}</legend>
      <div className="answer-options">
        {answerOptions.map((option) => (
          <label key={option.id} className={value === option.id ? "answer-option is-selected" : "answer-option"}>
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const categoryOrder: EvidenceCategory[] = ["verified", "derived", "unverifiable"];

export function StatementScreen({
  statement,
  analysis,
  submission,
  onStatementChange,
  onSubmissionChange,
  onBack,
  onNext,
  loading,
  error,
}: StatementScreenProps) {
  const addAttachments = (files: FileList | null) => {
    if (!files) return;

    const nextAttachments = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    }));

    onStatementChange({
      ...statement,
      attachments: [
        ...statement.attachments,
        ...nextAttachments.filter(
          (next) => !statement.attachments.some((current) => current.id === next.id),
        ),
      ],
    });
  };

  const removeAttachment = (id: string) => {
    onStatementChange({
      ...statement,
      attachments: statement.attachments.filter((attachment) => attachment.id !== id),
    });
  };

  return (
    <section className="screen-section" aria-labelledby="statement-title">
      <div className="section-heading compact-heading">
        <h1 id="statement-title">내 설명</h1>
        <p>답하지 않은 질문은 자료에 &ldquo;미확인&rdquo;으로 표시됩니다.</p>
      </div>

      <div className="statement-layout">
        <div className="statement-form">
          <Question
            number="01"
            label="이 입금을 요청하셨나요?"
            name="requested"
            value={statement.requestedTransfer}
            onChange={(value) => onStatementChange({ ...statement, requestedTransfer: value })}
          />
          <Question
            number="02"
            label="보낸 사람을 알고 계신가요?"
            name="sender"
            value={statement.knowsSender}
            onChange={(value) => onStatementChange({ ...statement, knowsSender: value })}
          />
          <Question
            number="03"
            label="이 입금과 관련된 거래 목적이 있었나요?"
            name="purpose"
            value={statement.hadPurpose}
            onChange={(value) => onStatementChange({ ...statement, hadPurpose: value })}
          />

          <label className="text-field compact-field statement-date-field">
            <span>입금을 처음 알게 된 날 <small>선택</small></span>
            <input
              type="date"
              value={statement.discoveredAt}
              onChange={(event) => onStatementChange({ ...statement, discoveredAt: event.target.value })}
            />
          </label>

          <label className="text-field compact-field">
            <span>추가 설명 <small>선택</small></span>
            <textarea
              rows={5}
              placeholder="거래소 담당자가 알아야 할 사실만 직접 적어주세요."
              value={statement.note}
              onChange={(event) => onStatementChange({ ...statement, note: event.target.value })}
            />
          </label>

          <div className="attachment-field">
            <div>
              <b>관련 자료</b>
              <small>선택 · PDF, JPG, PNG</small>
            </div>
            <label className="attachment-button">
              파일 선택
              <input
                type="file"
                multiple
                accept=".pdf,image/jpeg,image/png"
                onChange={(event) => {
                  addAttachments(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            {statement.attachments.length > 0 ? (
              <ul className="attachment-list">
                {statement.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <span>
                      <b>{attachment.name}</b>
                      <small>{Math.max(1, Math.round(attachment.size / 1024))} KB</small>
                    </span>
                    <button type="button" onClick={() => removeAttachment(attachment.id)}>
                      빼기
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>거래소 요청 원문이나 본인 확인 자료가 있을 때만 추가하세요.</p>
            )}
          </div>

          <div className="submission-details">
            <label className="select-field">
              <span>제출 대상 <small>선택</small></span>
              <select
                value={submission.exchange}
                onChange={(event) =>
                  onSubmissionChange({
                    ...submission,
                    exchange: event.target.value as SubmissionDetails["exchange"],
                  })
                }
              >
                {exchanges.map((exchange) => (
                  <option key={exchange.id} value={exchange.id}>
                    {exchange.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-field compact-field submission-request-field">
              <span>거래소 요청 내용 <small>선택</small></span>
              <textarea
                rows={3}
                placeholder="받은 문구가 있다면 붙여넣으세요."
                value={submission.requestText}
                onChange={(event) =>
                  onSubmissionChange({ ...submission, requestText: event.target.value })
                }
              />
            </label>
          </div>
        </div>

        <aside className="report-selection">
          <div className="panel-heading simple-panel-heading">
            <div>
              <h2>자료에 들어가는 근거</h2>
              <p>온체인 조사 결과는 전부 들어갑니다.</p>
            </div>
          </div>
          <div className="evidence-summary">
            {categoryOrder.map((category) => {
              const items = analysis?.evidence.filter((item) => item.category === category) ?? [];
              return (
                <div key={category}>
                  <b>{categoryLabels[category]} {items.length}개</b>
                  <ul>
                    {items.map((item) => <li key={item.id}>{item.title}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="selection-note">
            불리한 기록도 빼거나 고칠 수 없습니다. 담당자가 원본 링크로 직접 확인할 수 있어야 자료를 믿을 수 있기 때문입니다.
          </p>
        </aside>
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="screen-actions">
        <button className="secondary-button" type="button" onClick={onBack}>이전</button>
        <button className="primary-button" type="button" onClick={onNext} disabled={loading}>
          {loading ? "자료 만드는 중" : "소명 자료 만들기"}
        </button>
      </div>
    </section>
  );
}
