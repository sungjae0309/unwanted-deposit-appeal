// API 오류를 한 모양으로 돌려주기 위한 도구

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notImplemented = (what: string) =>
  new ApiError(501, "NOT_IMPLEMENTED", `${what}은(는) 아직 구현되지 않았습니다. DATA_MODE=demo로 실행하세요.`);

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error(error);
  return Response.json(
    { error: { code: "INTERNAL", message: "처리 중 오류가 발생했습니다." } },
    { status: 500 },
  );
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "BAD_JSON", "요청 형식이 올바르지 않습니다.");
  }
}

export function assertAddress(value: unknown, field = "address"): string {
  if (typeof value !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new ApiError(400, "BAD_ADDRESS", `${field}: 42자리 Ethereum 주소가 아닙니다.`);
  }
  return value.toLowerCase();
}

export function assertTxHash(value: unknown): string {
  if (typeof value !== "string" || !/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new ApiError(400, "BAD_TX_HASH", "거래 해시 형식이 올바르지 않습니다.");
  }
  return value.toLowerCase();
}
