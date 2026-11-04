# API 계약

화면(`src/lib/api/cases.ts`)과 서버(`src/app/api/`)가 주고받는 요청·응답입니다.
데이터 모양은 `src/types/case.ts`가 기준입니다. 둘 중 하나를 바꾸면 이 문서도 같이 고쳐주세요.

모든 요청은 `POST`, 본문은 JSON입니다.

## 오류 모양

```json
{ "error": { "code": "BAD_ADDRESS", "message": "walletAddress: 42자리 Ethereum 주소가 아닙니다." } }
```

| 상태 | code 예시 | 뜻 |
|---|---|---|
| 400 | `BAD_JSON`, `BAD_ADDRESS`, `BAD_TX_HASH`, `BAD_EXCHANGE`, `NO_CREDENTIALS` | 요청이 잘못됨 |
| 404 | `TRANSFER_NOT_FOUND` | 이 지갑으로 들어온 해당 거래가 없음 |
| 500 | `INTERNAL`, `NO_ALCHEMY_KEY` | 서버 문제 |
| 501 | `NOT_IMPLEMENTED` | 실제 조회 모드에서 아직 구현 안 된 기능 |

`message`는 화면에 그대로 보여줍니다. 쉬운 말로 써주세요.

## `/api/wallets/inbound-transfers`

지갑으로 들어온 전송 목록입니다.

| | 내용 |
|---|---|
| 요청 | `{ "address": "0x…" }` |
| 응답 | `{ "transfers": Transfer[], "complete": boolean, "provider": "demo" \| "alchemy" }` |

## `/api/transfers/lookup`

거래 해시로 온체인 전송을 찾습니다. 거래소 입금 목록에서 고른 입금을 블록체인 기록과 연결할 때 씁니다.

| | 내용 |
|---|---|
| 요청 | `{ "txHash": "0x…" }` |
| 응답 | `{ "transfers": Transfer[] }` (토큰 전송이 여러 개면 여러 건) |

## `/api/exchanges/deposits`

거래소 입금 목록입니다. 키는 이 요청 안에서만 쓰고 저장하지 않습니다.

| | 내용 |
|---|---|
| 요청 | `{ "exchange": "upbit" \| "binance", "apiKey": "…", "apiSecret": "…" }` |
| 응답 | `{ "deposits": ExchangeDeposit[] }` |

데모 모드에서는 키 없이 예시 목록을 돌려줍니다.

## `/api/cases/analyze`

입금 1건을 조사합니다.

| | 내용 |
|---|---|
| 요청 | `{ "walletAddress": "0x…", "txHash": "0x…", "eventIndex": 0 }` |
| 응답 | `CaseAnalysis` |

서버는 화면이 보낸 금액·주소를 믿지 않고, `txHash`로 전송을 다시 찾습니다.

## `/api/cases/report`

보고서를 만듭니다. 온체인 조사는 서버가 다시 합니다(화면이 보낸 분석 결과는 받지 않음).

| | 내용 |
|---|---|
| 요청 | `{ "walletAddress", "txHash", "eventIndex", "statement": UserStatement, "submission": SubmissionDetails }` |
| 응답 | `{ "analysis": CaseAnalysis, "report": CaseReport }` |

## 주요 타입 요약

| 타입 | 핵심 필드 |
|---|---|
| `Transfer` | `chainId`, `txHash`, `eventIndex`, `blockNumber`, `timestamp`, `from`, `to`, `assetType`, `contractAddress`, `rawValue`, `decimals`, `displayValue`, `sourceProvider`, `fetchedAt`, `explorerUrl` |
| `EvidenceItem` | `category`(verified / derived / unverifiable), `analysis`(A~E, S), `title`, `description`, `sources` |
| `AnalysisScope` | `windowLabel`, `windowStart`, `windowEnd`, `maxTransfers`, `fetchedTransfers`, `complete`, `provider`, `fetchedAt`, `failures` |
| `UserStatement` | 답은 `"no" \| "yes" \| "unknown" \| null` (null = 미확인) |

금액 계산은 `rawValue`(정수 문자열)로 합니다. `displayValue`는 화면 표시용입니다.
