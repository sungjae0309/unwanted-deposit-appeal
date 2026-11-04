import "server-only";

// 거래소 입금 목록 가져오기
// 담당: 거래소 연결
//
// 지킬 것
//   - API 키는 요청 처리 중에만 쓰고 저장·로그·응답에 남기지 않기
//   - 사용자에게는 "입금조회" 권한만 켠 키를 받기 (주문·출금 권한 키는 거절하는 게 이상적)
//   - 업비트는 키 발급 때 허용 IP 등록이 필수 → 서버의 고정 공인 IP를 화면에 안내해야 함
//     (발표 데모는 노트북에서 실행하고 그 IP를 등록)

import { DEMO_EXCHANGE_DEPOSITS } from "@/fixtures/demo-case";
import { DATA_MODE } from "@/server/config";
import { ApiError, notImplemented } from "@/server/errors";
import type { ExchangeDeposit, ExchangeSource } from "@/types/case";

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
}

// TODO(거래소 연결): 업비트
//   GET https://api.upbit.com/v1/deposits (권한: 입금조회)
//   인증: 업비트 문서의 JWT 방식 (access_key, nonce, query_hash)
//   응답의 txid → txHash, currency → asset, net_type → network, created_at → createdAt
//   업비트는 보낸 주소를 주지 않으므로 sourceAddress는 null
async function fetchUpbitDeposits(credentials: ExchangeCredentials): Promise<ExchangeDeposit[]> {
  void credentials;
  throw notImplemented("업비트 입금 목록 조회");
}

// TODO(거래소 연결): 바이낸스 (여유 있으면)
//   GET /sapi/v1/capital/deposit/hisrec?includeSource=true (서명 필요, 한 번에 90일 이내)
//   txId → txHash, sourceAddress → sourceAddress, insertTime → createdAt
async function fetchBinanceDeposits(credentials: ExchangeCredentials): Promise<ExchangeDeposit[]> {
  void credentials;
  throw notImplemented("바이낸스 입금 목록 조회");
}

export async function getExchangeDeposits(
  exchange: ExchangeSource,
  credentials: ExchangeCredentials,
): Promise<ExchangeDeposit[]> {
  if (DATA_MODE === "demo") {
    return DEMO_EXCHANGE_DEPOSITS.map((deposit) => ({ ...deposit, exchange }));
  }

  if (!credentials.apiKey || !credentials.apiSecret) {
    throw new ApiError(400, "NO_CREDENTIALS", "API 키와 시크릿을 입력해 주세요.");
  }

  return exchange === "upbit" ? fetchUpbitDeposits(credentials) : fetchBinanceDeposits(credentials);
}
