import type { DataProvider, Transfer } from "@/types/case";

export interface TimeWindow {
  start: string; // ISO
  end: string; // ISO
}

export interface PagedTransfers {
  transfers: Transfer[];
  complete: boolean; // 상한(limit)에 걸려 잘렸으면 false
  failures: string[];
}

// 온체인 데이터를 가져오는 쪽이 지켜야 할 약속.
// 화면·분석 코드는 이 인터페이스만 보고, 어디서 가져오는지는 모릅니다.
export interface OnchainProvider {
  readonly name: DataProvider;

  // 지갑으로 들어온 전송 (최신순)
  getInboundTransfers(address: string, limit: number): Promise<PagedTransfers>;

  // 거래 해시 하나에 들어 있는 전송들 (ETH 1건 또는 토큰 여러 건)
  getTransfersByHash(txHash: string): Promise<Transfer[]>;

  // 특정 주소가 보낸 전송 (기간 안, 오래된 순)
  getOutgoingTransfers(address: string, window: TimeWindow, limit: number): Promise<PagedTransfers>;

  // 두 주소 사이의 직접 전송 (양방향, before 이전)
  getTransfersBetween(a: string, b: string, before: string, limit: number): Promise<PagedTransfers>;
}
