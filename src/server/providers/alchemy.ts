// 실제 조회 모드 공급자 (Alchemy Transfers API)
// 담당: 데이터
//
// TODO(데이터)
//   - alchemy_getAssetTransfers로 구현 (category: external, erc20)
//   - pageKey로 페이지를 넘기며 limit까지만 가져오기. 넘치면 complete: false
//   - 실패한 범위는 failures에 기록 (예: "블록 26100000~26100500 조회 실패")
//   - 결과를 Transfer 모양으로 바꾸기: rawValue·decimals는 응답의 rawContract 사용,
//     displayValue는 표시용, explorerUrl은 `${EXPLORER_BASE}/tx/${hash}`
//   - 시간 범위(TimeWindow)는 블록 번호로 바꿔서 조회 (fromBlock/toBlock)
//   - API 키는 ALCHEMY_API_KEY (서버 전용). 로그에 키를 찍지 않기

import { ALCHEMY_API_KEY } from "@/server/config";
import { ApiError, notImplemented } from "@/server/errors";
import type { OnchainProvider } from "@/server/providers/types";

function requireKey() {
  if (!ALCHEMY_API_KEY) {
    throw new ApiError(500, "NO_ALCHEMY_KEY", "ALCHEMY_API_KEY가 설정되지 않았습니다.");
  }
}

export const alchemyProvider: OnchainProvider = {
  name: "alchemy",

  async getInboundTransfers() {
    requireKey();
    throw notImplemented("Alchemy 입금 목록 조회");
  },

  async getTransfersByHash() {
    requireKey();
    throw notImplemented("Alchemy 거래 해시 조회");
  },

  async getOutgoingTransfers() {
    requireKey();
    throw notImplemented("Alchemy 보낸 기록 조회");
  },

  async getTransfersBetween() {
    requireKey();
    throw notImplemented("Alchemy 두 주소 사이 기록 조회");
  },
};
