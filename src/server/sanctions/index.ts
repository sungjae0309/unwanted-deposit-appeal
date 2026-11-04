// 제재 목록 조회 (선택 기능)
// 담당: 데이터
//
// 결과 표현 규칙
//   - 일치: "조회한 목록에서 일치하는 주소가 있습니다"
//   - 불일치: "조회한 목록에서 일치하지 않습니다" (← "제재 주소가 아니다"라고 쓰지 않기)
//
// TODO(데이터)
//   - 실제 조회 모드: OFAC가 공개한 SDN 목록에서 ETH 주소("Digital Currency Address - ETH")만 뽑아
//     파일로 저장해 두고, 그 파일과 직접 비교. 목록 날짜를 listUpdatedAt에 기록
//   - Chainalysis 무료 온체인 제재 조회는 2026-03-18 이후 업데이트가 멈췄으므로 쓰지 않기

import { DEMO_SANCTIONS_LIST } from "@/fixtures/demo-case";
import type { SanctionsCheck } from "@/types/case";

export function checkSanctions(address: string, checkedAt: string): SanctionsCheck {
  const list = DEMO_SANCTIONS_LIST;
  return {
    listName: list.listName,
    listUpdatedAt: list.listUpdatedAt,
    checkedAt,
    senderMatched: list.addresses.some((item) => item.toLowerCase() === address.toLowerCase()),
  };
}
