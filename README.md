# Go-Funny-Backend

## 環境設定

`.env.example` 是環境變數範本檔。啟動專案前，請先複製一份成 `.env`，並填入你自己的值。

```bash
cp .env.example .env
```

## 使用 Docker 啟動 PostgreSQL

執行以下指令，啟動 `docker-compose.yml` 中定義的 PostgreSQL 服務：

```bash
docker compose up -d
```

## Prisma 指令用途

- `migration`：用來管理資料庫結構變更，例如建立 table、新增 column、修改欄位型別或關聯。

```bash
npx prisma migrate dev --name init
```

- `seed`：用來寫入初始資料或假資料，例如測試用帳號、預設分類、基本設定資料。

```bash
npx prisma db seed
```
