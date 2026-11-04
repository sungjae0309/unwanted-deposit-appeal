// 분석 기준값. 비밀값이 없어서 테스트에서도 그대로 불러올 수 있습니다.
// (API 키 같은 비밀값은 config.ts에)

// 분석 로직을 바꾸면 올려주세요. 보고서 하단에 찍힙니다.
export const ANALYSIS_VERSION = "0.1.0";

// 조사 범위 기본값. 기간은 "지금"이 아니라 "입금 시각" 기준입니다.
export const SCOPE = {
  windowHours: 24, // C: 입금 전후 24시간
  maxTransfers: 1000, // 한 번에 가져오는 기록 상한
  afterDepositDays: 7, // D: 입금 후 살펴볼 기간
  similarAmountRatio: 0.1, // C: 비슷한 금액 = ±10%
} as const;

export const EXPLORER_BASE = "https://etherscan.io";
