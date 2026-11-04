// 분석 함수 테스트 예시. 고정 데이터만 쓰므로 API 키 없이 돌아갑니다.
// 실행: npm test
//
// TODO(분석): 경계 사례 추가
//   - 같은 주소에 여러 번 보낸 경우 (고유 주소 수는 1)
//   - 다른 토큰이 섞인 경우 (비슷한 금액에서 제외)
//   - 조회가 잘린 경우 (complete=false → 문장에 "최대 N건")

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeAfterDeposit } from "@/server/analysis/d-after-deposit";
import { analyzePriorRelation } from "@/server/analysis/b-prior-relation";
import { analyzeSprayPattern, isSimilarAmount } from "@/server/analysis/c-spray-pattern";
import { listUnknowns } from "@/server/analysis/e-unknowns";
import {
  DEMO_DUST,
  DEMO_SENDER_OUTBOUND,
  DEMO_WALLET_INBOUND,
  DEMO_WALLET_OUTBOUND,
} from "@/fixtures/demo-case";

const page = (transfers: typeof DEMO_SENDER_OUTBOUND, complete = true) => ({ transfers, complete, failures: [] });

describe("B. 이전 관계", () => {
  it("직접 거래가 없으면 0건", () => {
    const result = analyzePriorRelation(page([]), DEMO_DUST);
    assert.equal(result.count, 0);
    assert.equal(result.evidence.category, "verified");
  });
});

describe("C. 뿌리기 패턴", () => {
  it("±10% 안의 금액만 비슷한 금액으로 센다", () => {
    const [, ...others] = DEMO_SENDER_OUTBOUND;
    const similar = others.filter((transfer) => isSimilarAmount(DEMO_DUST, transfer));
    assert.equal(similar.length, 33);
  });

  it("ETH와 토큰은 비교하지 않는다", () => {
    const usdc = DEMO_WALLET_INBOUND.find((transfer) => transfer.asset === "USDC")!;
    assert.equal(isSimilarAmount(DEMO_DUST, usdc), false);
  });

  it("고유 받은 주소와 비슷한 금액 주소를 센다", () => {
    const result = analyzeSprayPattern(page(DEMO_SENDER_OUTBOUND), DEMO_DUST, "입금 전후 24시간");
    assert.equal(result.recipientCount, 40);
    assert.equal(result.similarCount, 34);
    assert.equal(result.evidence.category, "derived");
    assert.ok(result.evidence.sources.length > 0);
  });
});

describe("D. 입금 이후", () => {
  it("보낸 사람에게 다시 보낸 기록이 없고, 순서만 말한다", () => {
    const result = analyzeAfterDeposit(page(DEMO_WALLET_OUTBOUND), DEMO_DUST, "7일");
    assert.equal(result.returnedToSender, false);
    assert.equal(result.firstOutgoingAfter?.displayValue, "0.3");
    for (const item of result.evidence) {
      assert.doesNotMatch(item.title, /쓰지 않았|사용하지 않았|깨끗/);
    }
  });
});

describe("E. 확인할 수 없음", () => {
  it("조회가 잘리면 범위 밖 항목이 추가된다", () => {
    const scope = {
      windowLabel: "입금 전후 24시간",
      windowStart: "",
      windowEnd: "",
      maxTransfers: 1000,
      fetchedTransfers: 1000,
      complete: false,
      provider: "demo" as const,
      fetchedAt: "",
      failures: [],
    };
    assert.ok(listUnknowns(scope).some((item) => item.id === "E-scope"));
  });
});
