# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js + MySQL + PrismaのDocker環境構成。このプロジェクトは完全にDocker化されており、本番環境と開発環境の両方をサポートしています。

## 前提条件

- Next.jsプロジェクトは`next.config.js`に`output: 'standalone'`を設定する必要がある（Docker本番環境用）
- Prismaスキーマは`prisma/schema.prisma`に配置し、データソースプロバイダーはMySQLを使用
- 環境変数は`.env.example`をコピーして`.env`を作成

## Makefileを使った簡単操作

**推奨**: すべての操作はMakefileで簡単に実行できます。

```bash
# ヘルプを表示
make help

# 初回セットアップ（Next.js + Prisma初期化）
make init

# 開発環境を起動
make dev

# 本番環境を起動
make up

# マイグレーション（開発環境）
make db-migrate-dev NAME=init

# Prisma Studio起動
make db-studio

# ログ確認
make logs-app
```

## 開発環境のセットアップ

### 初回セットアップ（Makefileを使用）
```bash
# 全自動セットアップ
make init
```

### 初回セットアップ（手動）
```bash
# Next.jsプロジェクトの初期化（まだの場合）
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Prismaのインストール
npm install prisma @prisma/client
npx prisma init

# 環境変数の設定
cp .env.example .env
```

### 開発環境の起動（ホットリロード有効）

**Makefile使用:**
```bash
make dev                           # 開発環境起動
make db-migrate-dev NAME=init      # マイグレーション
make db-studio                     # Prisma Studio
```

**手動:**
```bash
# 開発環境で起動（ポート3001）
docker-compose --profile dev up app-dev db

# 別ターミナルでマイグレーション
docker-compose exec app-dev npx prisma migrate dev --name <migration_name>

# Prismaスタジオの起動（データベースGUI）
docker-compose exec app-dev npx prisma studio
```

### 本番環境ビルドとテスト

**Makefile使用:**
```bash
make prod          # ビルド & 起動
make db-migrate    # マイグレーション
make logs-app      # ログ確認
```

**手動:**
```bash
# 本番環境モードで起動（ポート3000）
docker-compose up -d

# マイグレーション実行
docker-compose exec app npx prisma migrate deploy

# ログ確認
docker-compose logs -f app
```

## Docker環境の構成

### サービス構成
- **app**: 本番環境用Next.jsコンテナ（マルチステージビルド、ポート3000）
- **app-dev**: 開発環境用（ホットリロード、ポート3001、profile: dev）
- **db**: MySQL 8.0（ポート3306、ヘルスチェック有効）
- **phpmyadmin**: データベース管理ツール（ポート8080、profile: tools）

### 重要な設定
- 本番環境のDockerfileはマルチステージビルド（deps → builder → runner）
- Prismaクライアントはビルド時に生成（`npx prisma generate`）
- データベース接続はヘルスチェックで確認後に起動（`depends_on.condition: service_healthy`）
- 開発環境はボリュームマウントで`node_modules`と`.next`を除外

## Prisma関連のコマンド

**Makefile使用:**
```bash
make db-migrate-dev NAME=init      # マイグレーション作成（開発）
make db-migrate                    # マイグレーション適用（本番）
make prisma-generate               # クライアント再生成
make db-reset                      # データベースリセット（開発のみ）
make db-studio                     # Prisma Studio起動
make db-check                      # データベース接続確認
```

**手動:**
```bash
# スキーマ変更後のマイグレーション作成
docker-compose exec app-dev npx prisma migrate dev --name <migration_name>

# 本番環境でのマイグレーション適用
docker-compose exec app npx prisma migrate deploy

# Prismaクライアントの再生成
docker-compose exec app-dev npx prisma generate

# データベースリセット（開発環境のみ）
docker-compose exec app-dev npx prisma migrate reset
```

## よく使うDockerコマンド

**Makefile使用:**
```bash
make clean         # コンテナとボリューム削除
make clean-all     # 全て削除（イメージ含む）
make rebuild       # キャッシュなし再ビルド
make phpmyadmin    # phpMyAdmin起動
make logs          # 全ログ表示
make logs-app      # アプリログ
make logs-db       # DBログ
make ps            # コンテナ状態確認
make shell-dev     # 開発コンテナにシェル接続
```

**手動:**
```bash
# コンテナの完全クリーンアップ（DB含む）
docker-compose down -v

# キャッシュなしで再ビルド
docker-compose build --no-cache

# phpMyAdminを含めて起動
docker-compose --profile tools up -d

# データベースのみ起動
docker-compose up -d db

# 特定のサービスのログ確認
docker-compose logs -f app
docker-compose logs -f db
```

## トラブルシューティング

### データベース接続エラー
**Makefile使用:**
```bash
make ps           # コンテナ状態確認
make db-check     # 接続テスト
make logs-db      # DBログ確認
```

**手動:**
1. DBコンテナのヘルスチェック: `docker-compose ps db`
2. DBログ確認: `docker-compose logs db`
3. 接続テスト: `docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword`

### ビルドエラー
- `next.config.js`に`output: 'standalone'`が設定されているか確認
- Prismaスキーマが正しく配置されているか確認（`prisma/schema.prisma`）
- クリーンビルド: `make clean && make rebuild` または `docker-compose down && docker-compose build --no-cache`

### 開発環境でホットリロードが効かない
- `docker-compose.yml`の`app-dev`サービスに`WATCHPACK_POLLING=true`が設定されているか確認
- ボリュームマウントが正しいか確認: `.:/app`

## 環境変数

Docker内では以下の形式でDATABASE_URLを指定:
```
DATABASE_URL="mysql://nextuser:nextpassword@db:3306/nextdb"
```

ホスト名は`db`（docker-composeのサービス名）を使用する点に注意。
