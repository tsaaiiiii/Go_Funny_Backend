# Go-Funny-Backend

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
