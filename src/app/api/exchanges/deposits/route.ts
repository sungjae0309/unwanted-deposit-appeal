// POST /api/exchanges/deposits
// 요청: { exchange: "upbit" | "binance", apiKey, apiSecret }
// 응답: { deposits: ExchangeDeposit[] }
//
// API 키는 이 요청 안에서만 쓰고 저장하지 않습니다. 로그에 body를 찍지 마세요.

import { ApiError, readJson, toErrorResponse } from "@/server/errors";
import { getExchangeDeposits } from "@/server/exchanges";

interface DepositsBody {
  exchange?: unknown;
  apiKey?: unknown;
  apiSecret?: unknown;
}

export async function POST(request: Request) {
  try {
    const body = await readJson<DepositsBody>(request);
    if (body.exchange !== "upbit" && body.exchange !== "binance") {
      throw new ApiError(400, "BAD_EXCHANGE", "지원하는 거래소는 upbit, binance입니다.");
    }

    const deposits = await getExchangeDeposits(body.exchange, {
      apiKey: typeof body.apiKey === "string" ? body.apiKey : "",
      apiSecret: typeof body.apiSecret === "string" ? body.apiSecret : "",
    });
    return Response.json({ deposits });
  } catch (error) {
    return toErrorResponse(error);
  }
}
