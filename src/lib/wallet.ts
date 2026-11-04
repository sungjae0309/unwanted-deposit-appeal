// 메타마스크에서 지갑 주소만 읽어옵니다.
// 서명(personal_sign)·송금(eth_sendTransaction) 요청은 절대 하지 않습니다.

interface EthereumProvider {
  request(args: { method: "eth_requestAccounts" }): Promise<string[]>;
}

export async function readWalletAddress(): Promise<string> {
  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  if (!ethereum) {
    throw new Error("메타마스크가 설치된 브라우저에서만 쓸 수 있습니다.");
  }

  const [address] = await ethereum.request({ method: "eth_requestAccounts" });
  if (!address) {
    throw new Error("주소를 받지 못했습니다.");
  }
  return address;
}
