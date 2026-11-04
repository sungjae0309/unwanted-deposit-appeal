import type { SourceRef, Transfer } from "@/types/case";

export const short = (value: string, left = 6, right = 4) =>
  value.length <= left + right + 1 ? value : `${value.slice(0, left)}…${value.slice(-right)}`;

export function kst(value: string) {
  const formatted = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
  return `${formatted} KST`;
}

export const amount = (transfer: Transfer) => `${transfer.displayValue} ${transfer.asset}`;

export const txSource = (transfer: Transfer, label = "거래 원문"): SourceRef => ({
  label,
  txHash: transfer.txHash,
  url: transfer.explorerUrl,
});

export const addressSource = (address: string, label: string, explorerBase: string): SourceRef => ({
  label,
  url: `${explorerBase}/address/${address}`,
});
