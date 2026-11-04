# 협업 규칙

## 브랜치

`main`에는 직접 올리지 않습니다. 브랜치를 만들어 작업하고 PR로 합칩니다.

| 이름 | 언제 | 예시 |
|---|---|---|
| `feat/…` | 기능 추가 | `feat/alchemy-provider` |
| `fix/…` | 고치기 | `fix/spray-window` |
| `docs/…` | 문서만 | `docs/api-contract` |

## PR 올리기 전에

```bash
npm run typecheck
npm test
npm run build
```

셋 다 통과해야 올립니다.

## PR 규칙

- PR 하나에 한 가지 일만 담습니다.
- 다른 사람 1명이 확인한 뒤 합칩니다.
- `src/types/case.ts`를 바꿨으면 PR 제목에 **[계약 변경]**을 붙이고 `docs/api.md`도 같이 고칩니다. 다른 사람 코드에 영향이 가기 때문입니다.
- 화면 문장을 바꿨으면 [docs/writing-rules.md](docs/writing-rules.md)를 지켰는지 확인합니다.

## 지킬 것

| 규칙 | 이유 |
|---|---|
| API 키는 `.env.local`에만. 커밋하지 않기 | 공개 저장소 |
| 서버 전용 값에 `NEXT_PUBLIC_`을 붙이지 않기 | 붙이면 브라우저로 나감 |
| 사용자의 거래소 키를 저장·로그에 남기지 않기 | 남의 계정 열쇠 |
| 서명, 개인 키, 시드 문구를 요청하지 않기 | 도구 원칙 |
| 데모 데이터에는 가짜 주소나 공개 보도된 주소만 | 실제 개인을 범죄자로 오해하게 만들지 않기 |
| 금액 계산은 `rawValue`로 | `displayValue`는 반올림된 표시용 |

## 할 일 찾기

각 파일 맨 위에 `TODO(역할)`로 적어뒀습니다.

```bash
grep -rn "TODO(" src
```
