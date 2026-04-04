# Go-Funny-Backend

旅行分帳後端 API 服務。幫助旅伴在旅途中輕鬆記錄花費、分攤費用，最後自動結算誰該付誰多少錢。

## 核心功能

- **旅行管理** — 建立旅行、邀請成員加入
- **費用記錄** — 記錄每筆花費，支援指定付款人與分帳方式
- **公費管理** — 成員繳納公費，費用從公費池支出
- **自動結算** — 根據花費與分攤，計算出最少轉帳次數的結算清單
- **邀請機制** — 透過邀請連結加入旅行，支援過期時間與使用次數限制

## 兩種分帳模式

| 模式 | 說明 | 範例 |
|------|------|------|
| **expense**（分帳） | 有人先付錢，再拆帳給其他人 | A 付了午餐 300 元，三人平分 |
| **pool**（公費） | 每人先繳公費進池子，費用從池子出 | 每人先繳 1000 元，旅途花費從中扣除 |

## 技術棧

- **Runtime** — Node.js + TypeScript
- **Framework** — Express 5
- **ORM** — Prisma 7
- **Database** — PostgreSQL
- **Package Manager** — pnpm

## 專案結構

```
src/
├── routes/        # 路由定義
├── controllers/   # 請求處理、參數驗證
├── services/      # 商業邏輯、資料庫操作
└── lib/           # 共用工具（Prisma client）
```

## 環境設定

`.env.example` 是環境變數範本檔。啟動專案前，請先複製一份成 `.env`，並填入你自己的值。

```bash
cp .env.example .env
```

## 專案啟動

### 方式一：使用整合指令 `setup`

這個方式適合第一次把專案跑起來時使用，會依序執行：

- 啟動 PostgreSQL
- 安裝套件
- 套用既有 Prisma migrations
- 產生 Prisma Client

```bash
pnpm setup
```

### 方式二：手動逐步執行

如果你想理解每一步在做什麼，可以手動執行以下指令。

#### 1. 使用 Docker 啟動 PostgreSQL

執行以下指令，啟動 `docker-compose.yml` 中定義的 PostgreSQL 服務：

```bash
docker compose up -d
```

#### 2. 安裝套件

```bash
pnpm install
```

#### 3. 套用既有 migrations

如果專案已經有既有 migrations，只是要把這些變更同步到你的本地資料庫，使用：

```bash
pnpm exec prisma migrate dev
```

#### 4. 產生 Prisma Client

```bash
pnpm exec prisma generate
```

## Prisma 指令用途

- `migration`：用來管理資料庫結構變更，例如建立 table、新增 column、修改欄位型別或關聯。
- 第一次建立 migration，或你剛修改完 `schema.prisma` 並要新增一筆資料庫結構變更紀錄時，使用：

```bash
pnpm exec prisma migrate dev --name init
```

- `studio`：開啟網頁介面，可以直接瀏覽和編輯資料庫資料。

```bash
pnpm exec prisma studio
```

- `seed`：用來寫入初始資料或假資料，例如測試用帳號、預設分類、基本設定資料。

```bash
pnpm exec prisma db seed
```
