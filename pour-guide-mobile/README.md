# Pour Guide

휴대폰에서 칵테일을 빠르게 제조하기 위한 **모바일 우선 레시피 운영 도구**입니다. 바텐더는 재료·계량·제조 순서·타이머·완성/가니시 사진을 한 흐름으로 확인하고, 매니저는 별도 관리 화면에서 메뉴와 사진을 직접 수정할 수 있습니다.

## 현재 제공 기능

| 영역 | 기능 |
| --- | --- |
| 바텐더 화면 | 검색, 카테고리 필터, 즐겨찾기, 1~3잔 계량 전환, 인라인 타이머, 전체 제조 순서 |
| 시각 참고 | 완성 사진과 가니시 사진을 분리 표시하며 각각 확대 확인 가능 |
| 레시피 관리 | 메뉴 신규 등록·수정·판매 중단, 재료와 계량 편집, 제조 단계·타이머 편집 |
| 사진 관리 | 완성 사진과 가니시 사진을 각각 JPG/PNG/WEBP 형식으로 업로드·교체하며, 각 파일은 5MB 이하 |
| 권한·저장 | 관리자 전용 변경 API, MySQL/TiDB 데이터베이스, S3 호환 오브젝트 스토리지 |

## 매장 운영 방법

1. 소유자 계정으로 로그인한 뒤 `/manage`에서 **새 메뉴 만들기**를 선택합니다.
2. 메뉴명, 베이스, 잔, 가니시, 재료, 제조 순서를 입력하고 저장합니다.
3. 저장된 메뉴를 다시 열어 **완성 사진**과 **가니시 사진**을 각각 업로드합니다.
4. 바텐더 화면으로 돌아가면 저장한 메뉴와 사진이 자동으로 반영됩니다. 메뉴를 숨기려면 관리 화면에서 **판매 중단**을 선택합니다.

> 관리자 권한은 프로젝트 소유자에게 자동으로 부여됩니다. 다른 매장 직원에게 관리 권한을 주려면 `users.role`을 `admin`으로 변경해야 합니다.

## 로컬 실행

이 프로젝트는 React, Vite, Express, tRPC, Drizzle을 사용합니다. Node.js 20 이상과 pnpm을 권장합니다.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd pour-guide-mobile
pnpm install
pnpm dev
```

품질 확인과 프로덕션 빌드는 다음 명령으로 실행합니다.

```bash
pnpm check
pnpm test
pnpm build
```

## 다른 환경으로 이관하기

UI 코드만 계속 개발하려면 일반 Node.js 환경에서 그대로 실행할 수 있습니다. 다만 **저장형 관리 기능**은 다음 서비스를 연결해야 합니다.

| 기능 | 현재 구성 | 외부 환경 이관 시 필요한 대체 구성 |
| --- | --- | --- |
| 데이터베이스 | Drizzle + MySQL/TiDB | MySQL, PostgreSQL, Supabase 등으로 스키마·DB 접근 계층 이관 |
| 로그인·권한 | OAuth + `adminProcedure` | Auth.js, Clerk, Supabase Auth 등으로 관리자 역할 검사 구현 |
| 사진 저장 | `server/storage.ts`의 S3 호환 저장소 | AWS S3, Cloudflare R2, Supabase Storage 등으로 `storagePut` 대체 |
| API | Express + tRPC | 현재 tRPC 유지 또는 REST/GraphQL로 변환 |

데이터 모델은 `drizzle/schema.ts`, 레시피 관리 API는 `server/recipeRouter.ts`, 사진 저장 어댑터는 `server/storage.ts`, 관리 UI는 `client/src/pages/ManageRecipes.tsx`에 있습니다. 이 네 파일을 중심으로 환경별 어댑터만 교체하면 제품 로직과 화면은 계속 재사용할 수 있습니다.

## 데이터베이스 스키마 반영

새 데이터베이스에서는 `drizzle/schema.ts`를 기준으로 마이그레이션을 생성하고 적용합니다.

```bash
pnpm drizzle-kit generate
# 생성된 drizzle/*.sql 검토 후 데이터베이스에 적용
```

사진 파일의 실제 바이트는 데이터베이스가 아니라 오브젝트 스토리지에 저장하고, 데이터베이스에는 URL과 저장 키만 보관합니다.
