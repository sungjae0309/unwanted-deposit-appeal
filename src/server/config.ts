import "server-only";

// 서버에서만 읽는 설정. NEXT_PUBLIC_ 이 붙지 않은 값은 브라우저로 나가지 않습니다.

export type DataMode = "demo" | "live";

// demo: 고정 데이터 (기본값, 발표용) / live: 실제 조회
export const DATA_MODE: DataMode = process.env.DATA_MODE === "live" ? "live" : "demo";

export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? "";
