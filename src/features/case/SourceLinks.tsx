import { shortAddress } from "@/features/case/utils";
import type { SourceRef } from "@/types/case";

// 모든 사실에 원본 링크를 붙입니다. 인쇄(PDF)에서도 보이도록 해시를 글자로 함께 적습니다.
export function SourceLinks({ sources }: { sources: SourceRef[] }) {
  if (sources.length === 0) return null;

  return (
    <ul className="source-links">
      {sources.map((source, index) => (
        <li key={`${source.label}-${index}`}>
          {source.url ? (
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ) : (
            <span>{source.label}</span>
          )}
          {source.txHash ? <code>{shortAddress(source.txHash, 10, 8)}</code> : null}
        </li>
      ))}
    </ul>
  );
}
