# LA Central Church - 성도 교제

교회 모임에서 쓰는 성경퀴즈, 사다리타기(간증 순서), 성도/그룹 관리 등을 한 대시보드에서 실행하는 내부 도구입니다.

## 시작하기

```bash
npm install
npx prisma migrate dev   # 로컬 SQLite DB 생성
npm run db:seed          # 샘플 그룹/성도 시드 (선택)
npm run dev
```

`http://localhost:3000` 접속.

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma + SQLite (로컬 개발) / PostgreSQL (배포 예정)

## 설계 문서

전체 아키텍처와 설계 배경은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 참고.

## 참고

- 로컬 개발 DB(`prisma/dev.db`)는 실제 성도 정보(이름, 사진 등)를 담을 수 있어 저장소에 포함되지 않습니다 (`.gitignore` 처리). 스키마(`prisma/schema.prisma`)와 시드 스크립트(`prisma/seed.ts`)만 버전 관리됩니다.
