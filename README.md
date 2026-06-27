# Go-Funny-Backend

旅行分帳後端 API 服務。幫助旅伴在旅途中輕鬆記錄花費、分攤費用，最後自動結算誰該付誰多少錢。

## 核心功能

- **旅行管理** — 建立旅行、邀請成員加入
- **費用記錄** — 記錄每筆花費，支援指定付款人與分帳方式
- **公費管理** — 成員繳納公費，費用從公費池支出
- **自動結算** — 根據花費與分攤，計算出最少轉帳次數的結算清單
- **邀請機制** — 透過邀請連結加入旅行，支援過期時間與使用次數限制

## 兩種分帳模式

| 模式                | 說明                             | 範例                               |
| ------------------- | -------------------------------- | ---------------------------------- |
| **expense**（分帳） | 有人先付錢，再拆帳給其他人       | A 付了午餐 300 元，三人平分        |
| **pool**（公費）    | 每人先繳公費進池子，費用從池子出 | 每人先繳 1000 元，旅途花費從中扣除 |

## 技術棧

- **Runtime** — Cloudflare Workers + TypeScript
- **Framework** — Hono
- **ORM** — Drizzle ORM
- **Database** — Cloudflare D1
- **Deployment** — Cloudflare Workers
- **Package Manager** — pnpm

## 專案結構

```
src/
├── app.ts              # Hono 應用程式進入點
├── worker.ts           # Cloudflare Workers entry
├── db/                 # Drizzle schema 與 D1 client
├── routes/             # 路由定義
│   ├── index.ts        #   路由總入口
│   ├── trip.ts         #   旅程 CRUD
│   ├── expense.ts      #   費用記錄
│   ├── contribution.ts #   公費繳納
│   ├── member.ts       #   成員管理
│   ├── settlement.ts   #   結算
│   ├── invitation.ts   #   邀請（需登入）
│   └── invitationPublic.ts # 邀請（公開）
├── controllers/        # 請求處理、參數驗證
├── services/           # 商業邏輯、資料庫操作
│   └── access.ts       #   旅程權限驗證
├── middleware/          # Hono middleware
│   └── auth.ts         #   使用者認證
├── lib/                # 共用工具
│   ├── auth.ts         #   better-auth 設定
│   ├── auth-types.ts   #   認證相關型別
│   └── http-error.ts   #   HTTP 錯誤處理
└── types/              # Cloudflare/Hono 型別定義
```

## 環境設定

`.env.example` 是環境變數範本檔。啟動專案前，請先複製一份成 `.env`，並填入你自己的值。

```bash
cp .env.example .env
```

## 專案啟動

### 1. 安裝套件

```bash
pnpm install
```

### 2. 建立 Cloudflare D1 database

```bash
pnpm exec wrangler d1 create go-funny-db
```

把輸出的 `database_id` 填回 `wrangler.toml`。

### 3. 套用 D1 migrations

本地開發：

```bash
pnpm run db:apply:local
```

遠端環境：

```bash
pnpm run db:apply
```

### 4. 啟動本地 Workers

```bash
pnpm run dev
```

## Drizzle / D1 指令用途

- `pnpm run db:generate`：根據 `src/db/schema.ts` 產生新的 Drizzle migration。
- `pnpm run db:apply:local`：套用 migration 到本地 D1。
- `pnpm run db:apply`：套用 migration 到 Cloudflare 遠端 D1。
- `pnpm run deploy`：部署 Worker 到 Cloudflare。

## 部署前檢查

```bash
pnpm exec tsc --noEmit
pnpm run build
```
