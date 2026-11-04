import "server-only";

import { ApiError, assertAddress, assertTxHash } from "@/server/errors";
import type { OnchainProvider } from "@/server/providers/types";
import type { Transfer } from "@/types/case";

// 화면이 보낸 txHash로 서버가 직접 전송을 다시 찾습니다.
// (화면이 보낸 금액·주소를 그대로 믿지 않기 위해)
export async function resolveTransfer(
  provider: OnchainProvider,
  body: { walletAddress?: unknown; txHash?: unknown; eventIndex?: unknown },
): Promise<{ walletAddress: string; transfer: Transfer }> {
  const walletAddress = assertAddress(body.walletAddress, "walletAddress");
  const txHash = assertTxHash(body.txHash);
  const eventIndex = typeof body.eventIndex === "number" ? body.eventIndex : 0;

  const transfers = await provider.getTransfersByHash(txHash);
  const transfer = transfers.find(
    (item) => item.eventIndex === eventIndex && item.to.toLowerCase() === walletAddress,
  );

  if (!transfer) {
    throw new ApiError(404, "TRANSFER_NOT_FOUND", "이 지갑으로 들어온 해당 거래를 찾지 못했습니다.");
  }

  return { walletAddress, transfer };
}
