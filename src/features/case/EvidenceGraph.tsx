import type { CaseAnalysis } from "@/types/case";

interface EvidenceGraphProps {
  analysis: CaseAnalysis;
}

export function EvidenceGraph({ analysis }: EvidenceGraphProps) {
  const nodeById = new Map(analysis.nodes.map((node) => [node.id, node]));

  return (
    <div className="graph-shell" aria-label="문제 거래 주변 주소 관계">
      <svg viewBox="0 0 660 300" role="img">
        <defs>
          <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" className="graph-arrow graph-arrow-default" />
          </marker>
          <marker id="arrow-emphasis" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" className="graph-arrow graph-arrow-emphasis" />
          </marker>
        </defs>

        {analysis.edges.map((edge) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          if (!from || !to) return null;
          const labelX = (from.x + to.x) / 2;
          const labelY = (from.y + to.y) / 2 - 8;
          return (
            <g key={edge.id}>
              <line
                x1={from.x + 62}
                y1={from.y}
                x2={to.x - 62}
                y2={to.y}
                className={edge.emphasized ? "graph-edge graph-edge-emphasis" : "graph-edge"}
                markerEnd={edge.emphasized ? "url(#arrow-emphasis)" : "url(#arrow-default)"}
              />
              <text x={labelX} y={labelY} textAnchor="middle" className="graph-edge-label">
                {edge.label}
              </text>
            </g>
          );
        })}

        {analysis.nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x - 62} ${node.y - 29})`}>
            <rect width="124" height="58" rx="8" className={`graph-node graph-node-${node.role}`} />
            <text x="62" y="24" textAnchor="middle" className="graph-node-label">
              {node.label}
            </text>
            <text x="62" y="42" textAnchor="middle" className="graph-node-detail">
              {node.detail}
            </text>
          </g>
        ))}
      </svg>
      <div className="graph-caption">
        <span><i className="legend-line legend-line-issue" />문제 입금</span>
        <span><i className="legend-line" />비슷한 금액 전송</span>
        <span>표시: 주소 {analysis.nodes.length}개 (비슷한 금액 {analysis.facts.similarAmountCount}개 중 일부)</span>
      </div>
    </div>
  );
}
