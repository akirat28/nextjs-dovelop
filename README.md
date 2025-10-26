# Next.js + MySQL + Prisma Docker環境

Next.jsアプリケーションをDocker環境で動作させるための設定です。

## 前提条件

- Docker Desktop がインストールされていること
- Node.js 20以上（ローカル開発の場合）

## プロジェクトのセットアップ

### 1. Next.jsプロジェクトの初期化

```bash
# Next.jsプロジェクトを作成
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Prismaのインストール
npm install prisma @prisma/client
npm install -D prisma

# Prismaの初期化
npx prisma init
```

### 2. Prismaスキーマの設定

`prisma/schema.prisma` を以下のように編集:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// サンプルモデル
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. Next.js設定の更新

`next.config.js` を以下のように編集してスタンドアロン出力を有効化:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### 4. 環境変数の設定

```bash
# .envファイルを作成
cp .env.example .env
```

## Docker環境の起動

### 本番環境モード

```bash
# コンテナのビルドと起動
docker-compose up -d

# データベースマイグレーション
docker-compose exec app npx prisma migrate dev --name init

# ログの確認
docker-compose logs -f app

# アクセス
# http://localhost:3000
```

### 開発環境モード（ホットリロード有効）

```bash
# 開発環境で起動
docker-compose --profile dev up app-dev db

# 別のターミナルでマイグレーション
docker-compose exec app-dev npx prisma migrate dev --name init

# アクセス
# http://localhost:3001
```

### phpMyAdminの利用

```bash
# phpMyAdminを含めて起動
docker-compose --profile tools up -d

# アクセス
# http://localhost:8080
```

## よく使うコマンド

```bash
# コンテナの停止
docker-compose down

# コンテナとボリュームの削除（データベースも削除されます）
docker-compose down -v

# コンテナの再ビルド
docker-compose build --no-cache

# データベースのみ起動
docker-compose up -d db

# ログの確認
docker-compose logs -f

# Prismaスタジオの起動（開発環境）
docker-compose exec app-dev npx prisma studio

# データベースマイグレーション
docker-compose exec app npx prisma migrate dev

# Prismaクライアントの再生成
docker-compose exec app npx prisma generate
```

## トラブルシューティング

### データベース接続エラー

```bash
# データベースの状態確認
docker-compose ps db

# データベースのログ確認
docker-compose logs db

# データベースのヘルスチェック
docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword
```

### Next.jsのビルドエラー

```bash
# node_modulesをクリーンアップして再ビルド
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## ディレクトリ構造

```
.
├── Dockerfile              # Next.jsアプリ用Dockerfile
├── docker-compose.yml      # Docker Compose設定
├── .dockerignore          # Dockerビルド時の除外ファイル
├── .env                   # 環境変数（gitignore対象）
├── .env.example           # 環境変数のサンプル
├── prisma/
│   └── schema.prisma      # Prismaスキーマ
├── src/                   # Next.jsソースコード
├── public/                # 静的ファイル
└── package.json           # Node.js依存関係
```

## 本番環境へのデプロイ

本番環境では、環境変数を適切に設定してください:

```bash
# 本番用の環境変数を設定
DATABASE_URL=mysql://user:password@host:3306/database
NODE_ENV=production
```
