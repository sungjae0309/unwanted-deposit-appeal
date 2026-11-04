import "server-only";

import { DATA_MODE } from "@/server/config";
import { alchemyProvider } from "@/server/providers/alchemy";
import { demoProvider } from "@/server/providers/demo";
import type { OnchainProvider } from "@/server/providers/types";

// DATA_MODE=demo  → 고정 데이터 (발표·개발 기본값)
// DATA_MODE=live  → Alchemy 실제 조회
export function getProvider(): OnchainProvider {
  return DATA_MODE === "live" ? alchemyProvider : demoProvider;
}
