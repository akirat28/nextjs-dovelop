# Next.js + MySQL + Prisma Docker環境

Next.js 15 + MySQL + PrismaをDocker環境で動作させるための構成です。

## 技術スタック

- **Next.js**: 15.5.6
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.4.x
- **Prisma**: 5.20.x
- **MySQL**: 8.0
- **Docker & Docker Compose**

## 前提条件

- Docker Desktop がインストールされていること
- Make コマンドが使用可能であること（macOS/Linuxは標準搭載）

## クイックスタート

このプロジェクトは既にセットアップ済みです。すぐに開発を始められます。

### 利用可能なコマンド一覧

全てのコマンドを確認:
```bash
make help
```

## 開発環境の起動

### 1. 開発環境を起動（ホットリロード有効）

```bash
# 開発サーバーを起動（ポート3001）
make dev
```

### 2. データベースマイグレーション（初回のみ）

別のターミナルで実行:
```bash
# マイグレーションを作成・実行
make db-migrate-dev NAME=init
```

### 3. アクセス

- **アプリケーション**: http://localhost:3001
- **Prisma Studio** (データベースGUI): `make db-studio` で起動後 http://localhost:5555
- **phpMyAdmin**: `make phpmyadmin` で起動後 http://localhost:8080

### 開発環境の停止

```bash
# Ctrl+C で停止、または
make down
```

## 本番環境の起動

```bash
# 本番環境をビルド＆起動（ポート3000）
make prod

# マイグレーション実行
make db-migrate

# ログ確認
make logs-app
```

アクセス: http://localhost:3000

## よく使うMakeコマンド

### 開発環境
```bash
make dev                      # 開発環境を起動（ポート3001）
make db-migrate-dev NAME=init # マイグレーション作成・実行
make db-studio                # Prisma Studioを起動
make logs-app                 # アプリログを表示
make shell-dev                # 開発コンテナにシェル接続
```

### 本番環境
```bash
make up               # 本番環境を起動（ポート3000）
make prod             # ビルド＆起動
make build            # イメージをビルド
make rebuild          # キャッシュなしで再ビルド
make db-migrate       # マイグレーション実行
```

### データベース
```bash
make db-check         # データベース接続確認
make db-reset         # データベースリセット（開発環境のみ）
make phpmyadmin       # phpMyAdminを起動（ポート8080）
make prisma-generate  # Prismaクライアント再生成
```

### 管理・デバッグ
```bash
make down             # コンテナ停止
make restart          # コンテナ再起動
make logs             # 全ログ表示
make logs-db          # DBログ表示
make ps               # コンテナ状態確認
make clean            # コンテナ＆ボリューム削除
make clean-all        # すべて削除（イメージ含む）
```

### その他
```bash
make npm CMD='install express'  # npmコマンド実行
make help                       # 全コマンド一覧を表示
```

## docker-composeを直接使う場合

Makefileを使わない場合は、以下のコマンドも使用できます：

### 開発環境
```bash
# 開発環境起動
docker-compose --profile dev up app-dev db

# マイグレーション
docker-compose exec app-dev npx prisma migrate dev --name init

# Prisma Studio
docker-compose exec app-dev npx prisma studio
```

### 本番環境
```bash
# 本番環境起動
docker-compose up -d

# マイグレーション
docker-compose exec app npx prisma migrate deploy

# ログ確認
docker-compose logs -f app
```

### その他の操作
```bash
# コンテナ停止
docker-compose down

# コンテナ＆ボリューム削除
docker-compose down -v

# キャッシュなし再ビルド
docker-compose build --no-cache

# phpMyAdmin起動
docker-compose --profile tools up -d phpmyadmin
```

## Prismaスキーマの編集

`prisma/schema.prisma`を編集してモデルを追加・変更できます。

サンプルモデル:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

スキーマ変更後:
```bash
# 開発環境でマイグレーション作成
make db-migrate-dev NAME=add_user_model

# Prismaクライアント再生成（自動で実行されますが手動でも可能）
make prisma-generate
```

## トラブルシューティング

### データベース接続エラー

```bash
# コンテナ状態確認
make ps

# データベース接続テスト
make db-check

# データベースログ確認
make logs-db
```

手動確認:
```bash
docker-compose ps db
docker-compose logs db
docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword
```

### ビルドエラー

- `next.config.js`に`output: 'standalone'`が設定されているか確認
- Prismaスキーマが正しく配置されているか確認（`prisma/schema.prisma`）
- クリーンビルド実行:

```bash
make clean
make rebuild
make up
```

または:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### ホットリロードが効かない

- Docker設定で`WATCHPACK_POLLING=true`が設定されているか確認（`docker-compose.yml`の`app-dev`サービス）
- ボリュームマウントが正しいか確認: `.:/app`

### ポートが既に使用されている

```bash
# ポートを使用しているプロセスを確認
lsof -i :3000  # 本番環境
lsof -i :3001  # 開発環境
lsof -i :3306  # MySQL
```

## ディレクトリ構造

```
.
├── Dockerfile              # Next.jsアプリ用Dockerfile
├── Makefile               # 操作を簡単にするMakefile
├── docker-compose.yml     # Docker Compose設定
├── .dockerignore         # Dockerビルド時の除外ファイル
├── .env                  # 環境変数（gitignore対象）
├── .env.example          # 環境変数のサンプル
├── next.config.js        # Next.js設定（standalone出力）
├── prisma/
│   └── schema.prisma     # Prismaスキーマ
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       └── prisma.ts    # Prismaクライアントシングルトン
├── public/              # 静的ファイル
└── package.json         # Node.js依存関係
```

## 環境変数

`.env`ファイルで設定:

```bash
# データベース接続（Docker環境）
DATABASE_URL="mysql://nextuser:nextpassword@db:3306/nextdb"

# MySQL設定
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=nextdb
MYSQL_USER=nextuser
MYSQL_PASSWORD=nextpassword

# Next.js設定
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

ホスト名は`db`（docker-composeのサービス名）を使用する点に注意。

ローカル開発（Dockerを使わない場合）:
```bash
DATABASE_URL="mysql://nextuser:nextpassword@localhost:3306/nextdb"
```

## 本番環境へのデプロイ

本番環境では、環境変数を適切に設定してください:

```bash
DATABASE_URL=mysql://user:password@host:3306/database
NODE_ENV=production
```

## 開発Tips

### Prisma Studioでデータベースを視覚的に管理

```bash
make db-studio
```

http://localhost:5555 でデータベースの内容を確認・編集できます。

### コンテナ内でシェルを開く

```bash
# 開発環境
make shell-dev

# 本番環境
make shell
```

### npmパッケージの追加

```bash
# 開発環境コンテナでnpmコマンド実行
make npm CMD='install axios'
make npm CMD='install -D @types/node'
```

### ログのリアルタイム監視

```bash
# アプリケーションログ
make logs-app

# データベースログ
make logs-db

# 全てのログ
make logs
```

## ライセンス

MIT
