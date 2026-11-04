// 데모 모드 고정 데이터 (합성 데이터)
// 주소와 거래 해시는 모두 가짜입니다. 이더스캔 링크를 눌러도 결과가 없습니다.
//
// TODO(리서치·데이터): 공개된 실제 먼지 입금 사건으로 바꾸기
//   - 보낸 사람 주소는 공개 보도된 것만 사용
//   - 받은 사람 주소는 발표 화면에서 가리기
//   - 바꾼 뒤에도 아래 export 이름과 모양은 유지

import type { ExchangeDeposit, Transfer } from "@/types/case";
import { EXPLORER_BASE } from "@/server/constants";

export const DEMO_WALLET = "0x1111111111111111111111111111111111111111";
export const DEMO_SENDER = "0x9999999999999999999999999999999999999999";
const FETCHED_AT = "2026-11-03T01:30:00Z";
const FAKE_USDC = "0x0000000000000000000000000000000000000c01";

const hex = (seed: number, length: number) => seed.toString(16).padStart(length, "0").slice(-length);
const fakeHash = (seed: number) => `0x${"d".repeat(56)}${hex(seed, 8)}`;
const fakeAddress = (seed: number) => `0x${"a".repeat(32)}${hex(seed, 8)}`;

interface Draft {
  seed: number;
  from: string;
  to: string;
  timestamp: string;
  value: string; // 표시 금액
  asset?: "ETH" | "USDC";
  blockNumber: number;
}

// 표시 금액 → 정수 문자열
function toRaw(value: string, decimals: number) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole + fraction.padEnd(decimals, "0").slice(0, decimals)).toString();
}

function make({ seed, from, to, timestamp, value, asset = "ETH", blockNumber }: Draft): Transfer {
  const txHash = fakeHash(seed);
  const isEth = asset === "ETH";
  const decimals = isEth ? 18 : 6;
  return {
    id: `${txHash}:0`,
    chainId: 1,
    txHash,
    eventIndex: 0,
    blockNumber,
    timestamp,
    from,
    to,
    assetType: isEth ? "native" : "erc20",
    asset,
    contractAddress: isEth ? null : FAKE_USDC,
    rawValue: toRaw(value, decimals),
    decimals,
    displayValue: value,
    sourceProvider: "demo",
    fetchedAt: FETCHED_AT,
    explorerUrl: `${EXPLORER_BASE}/tx/${txHash}`,
  };
}

const DUST_TIME = Date.parse("2026-10-28T14:22:13Z");
const at = (offsetMinutes: number) => new Date(DUST_TIME + offsetMinutes * 60_000).toISOString();
const block = (offsetMinutes: number) => 26_100_000 + Math.round(offsetMinutes * 5);

// 문제의 먼지 입금
export const DEMO_DUST: Transfer = make({
  seed: 1,
  from: DEMO_SENDER,
  to: DEMO_WALLET,
  timestamp: at(0),
  value: "0.001",
  blockNumber: block(0),
});

// 내 지갑으로 들어온 기록
export const DEMO_WALLET_INBOUND: Transfer[] = [
  DEMO_DUST,
  make({ seed: 2, from: "0x2222222222222222222222222222222222222222", to: DEMO_WALLET, timestamp: at(-8_828), value: "0.42", blockNumber: block(-8_828) }),
  make({ seed: 3, from: "0x3333333333333333333333333333333333333333", to: DEMO_WALLET, timestamp: at(-20_794), value: "1250", asset: "USDC", blockNumber: block(-20_794) }),
];

// 내 지갑에서 나간 기록 (D: 입금 10분 뒤 다른 주소로 0.3 ETH)
export const DEMO_WALLET_OUTBOUND: Transfer[] = [
  make({ seed: 4, from: DEMO_WALLET, to: "0x4444444444444444444444444444444444444444", timestamp: at(10), value: "0.3", blockNumber: block(10) }),
  make({ seed: 5, from: DEMO_WALLET, to: "0x5555555555555555555555555555555555555555", timestamp: at(-4_000), value: "0.05", blockNumber: block(-4_000) }),
];

// 보낸 사람이 입금 전후 24시간 동안 보낸 기록 (C)
// 40개 주소: 나를 포함해 34개는 0.001 ETH 근처, 6개는 다른 금액
const similar = ["0.001", "0.00098", "0.00102", "0.00095", "0.00105", "0.001"];
const different = ["0.02", "0.005", "0.15"];

export const DEMO_SENDER_OUTBOUND: Transfer[] = [
  DEMO_DUST,
  ...Array.from({ length: 39 }, (_, index) => {
    const minutes = -600 + index * 31;
    const value = index < 33 ? similar[index % similar.length] : different[index % different.length];
    return make({
      seed: 100 + index,
      from: DEMO_SENDER,
      to: fakeAddress(index + 1),
      timestamp: at(minutes),
      value,
      blockNumber: block(minutes),
    });
  }),
];

// 데모용 가짜 제재 목록 (진짜 OFAC 목록이 아님)
export const DEMO_SANCTIONS_LIST = {
  listName: "데모용 가짜 제재 목록",
  listUpdatedAt: "2026-11-01",
  addresses: [DEMO_SENDER],
};

// 거래소 입금 목록 (업비트 모양. 업비트는 보낸 주소를 주지 않음)
export const DEMO_EXCHANGE_DEPOSITS: ExchangeDeposit[] = [
  {
    id: "upbit-demo-1",
    exchange: "upbit",
    asset: "ETH",
    network: "ETH",
    amount: "0.001",
    txHash: DEMO_DUST.txHash,
    state: "ACCEPTED",
    createdAt: DEMO_DUST.timestamp,
    sourceAddress: null,
  },
  {
    id: "upbit-demo-2",
    exchange: "upbit",
    asset: "ETH",
    network: "ETH",
    amount: "0.42",
    txHash: DEMO_WALLET_INBOUND[1].txHash,
    state: "ACCEPTED",
    createdAt: DEMO_WALLET_INBOUND[1].timestamp,
    sourceAddress: null,
  },
];

export const DEMO_ALL_TRANSFERS: Transfer[] = [
  ...DEMO_WALLET_INBOUND,
  ...DEMO_WALLET_OUTBOUND,
  ...DEMO_SENDER_OUTBOUND.filter((transfer) => transfer.id !== DEMO_DUST.id),
];
