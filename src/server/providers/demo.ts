import { DEMO_ALL_TRANSFERS } from "@/fixtures/demo-case";
import type { OnchainProvider, PagedTransfers, TimeWindow } from "@/server/providers/types";
import type { Transfer } from "@/types/case";

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
const byTimeAsc = (a: Transfer, b: Transfer) => Date.parse(a.timestamp) - Date.parse(b.timestamp);

function page(transfers: Transfer[], limit: number): PagedTransfers {
  return { transfers: transfers.slice(0, limit), complete: transfers.length <= limit, failures: [] };
}

// 고정 데이터에서 찾아주는 가짜 공급자. 실제 공급자와 같은 인터페이스를 지킵니다.
export const demoProvider: OnchainProvider = {
  name: "demo",

  async getInboundTransfers(address, limit) {
    const found = DEMO_ALL_TRANSFERS.filter((transfer) => same(transfer.to, address))
      .sort(byTimeAsc)
      .reverse();
    return page(found, limit);
  },

  async getTransfersByHash(txHash) {
    return DEMO_ALL_TRANSFERS.filter((transfer) => same(transfer.txHash, txHash));
  },

  async getOutgoingTransfers(address, window: TimeWindow, limit) {
    const start = Date.parse(window.start);
    const end = Date.parse(window.end);
    const found = DEMO_ALL_TRANSFERS.filter((transfer) => {
      const time = Date.parse(transfer.timestamp);
      return same(transfer.from, address) && time >= start && time <= end;
    }).sort(byTimeAsc);
    return page(found, limit);
  },

  async getTransfersBetween(a, b, before, limit) {
    const cutoff = Date.parse(before);
    const found = DEMO_ALL_TRANSFERS.filter(
      (transfer) =>
        Date.parse(transfer.timestamp) < cutoff &&
        ((same(transfer.from, a) && same(transfer.to, b)) || (same(transfer.from, b) && same(transfer.to, a))),
    ).sort(byTimeAsc);
    return page(found, limit);
  },
};
