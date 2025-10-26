.PHONY: help init setup up down dev prod build rebuild logs logs-app logs-db ps clean clean-all restart db-migrate db-migrate-dev db-reset db-studio db-check phpmyadmin shell shell-dev npm prisma-generate

# デフォルトターゲット
.DEFAULT_GOAL := help

# 色付き出力用
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

## ヘルプ
help:
	@echo "$(BLUE)===== Next.js + MySQL + Prisma Docker環境 =====$(RESET)"
	@echo ""
	@echo "$(GREEN)初回セットアップ:$(RESET)"
	@echo "  $(YELLOW)make init$(RESET)          - Next.jsプロジェクトとPrismaを初期化"
	@echo "  $(YELLOW)make setup$(RESET)         - 環境変数ファイルを作成"
	@echo ""
	@echo "$(GREEN)開発環境:$(RESET)"
	@echo "  $(YELLOW)make dev$(RESET)           - 開発環境を起動（ホットリロード、ポート3001）"
	@echo "  $(YELLOW)make shell-dev$(RESET)     - 開発環境コンテナにシェル接続"
	@echo ""
	@echo "$(GREEN)本番環境:$(RESET)"
	@echo "  $(YELLOW)make up$(RESET)            - 本番環境を起動（ポート3000）"
	@echo "  $(YELLOW)make prod$(RESET)          - 本番環境をビルドして起動"
	@echo "  $(YELLOW)make down$(RESET)          - コンテナを停止"
	@echo "  $(YELLOW)make restart$(RESET)       - コンテナを再起動"
	@echo ""
	@echo "$(GREEN)ビルド:$(RESET)"
	@echo "  $(YELLOW)make build$(RESET)         - イメージをビルド"
	@echo "  $(YELLOW)make rebuild$(RESET)       - キャッシュなしで再ビルド"
	@echo ""
	@echo "$(GREEN)データベース:$(RESET)"
	@echo "  $(YELLOW)make db-migrate$(RESET)    - マイグレーション実行（本番）"
	@echo "  $(YELLOW)make db-migrate-dev$(RESET) - マイグレーション作成と実行（開発）"
	@echo "  $(YELLOW)make db-studio$(RESET)     - Prisma Studioを起動"
	@echo "  $(YELLOW)make db-reset$(RESET)      - データベースをリセット（開発環境）"
	@echo "  $(YELLOW)make db-check$(RESET)      - データベース接続確認"
	@echo "  $(YELLOW)make phpmyadmin$(RESET)    - phpMyAdminを起動（ポート8080）"
	@echo ""
	@echo "$(GREEN)ログとモニタリング:$(RESET)"
	@echo "  $(YELLOW)make logs$(RESET)          - 全てのログを表示"
	@echo "  $(YELLOW)make logs-app$(RESET)      - アプリケーションログを表示"
	@echo "  $(YELLOW)make logs-db$(RESET)       - データベースログを表示"
	@echo "  $(YELLOW)make ps$(RESET)            - コンテナ状態を確認"
	@echo ""
	@echo "$(GREEN)ユーティリティ:$(RESET)"
	@echo "  $(YELLOW)make shell$(RESET)         - 本番コンテナにシェル接続"
	@echo "  $(YELLOW)make npm CMD='...'$(RESET) - npmコマンドを実行"
	@echo "  $(YELLOW)make prisma-generate$(RESET) - Prismaクライアントを生成"
	@echo ""
	@echo "$(GREEN)クリーンアップ:$(RESET)"
	@echo "  $(YELLOW)make clean$(RESET)         - コンテナとボリュームを削除"
	@echo "  $(YELLOW)make clean-all$(RESET)     - 全てを削除（イメージ含む）"

## 初回セットアップ - Next.jsプロジェクトとPrismaを初期化
init:
	@echo "$(GREEN)Next.jsプロジェクトを初期化中...$(RESET)"
	@if [ ! -f "package.json" ]; then \
		npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"; \
	else \
		echo "$(YELLOW)package.jsonが既に存在します。スキップします。$(RESET)"; \
	fi
	@echo "$(GREEN)Prismaをインストール中...$(RESET)"
	@npm install prisma @prisma/client
	@if [ ! -f "prisma/schema.prisma" ]; then \
		npx prisma init; \
		echo "$(YELLOW)prisma/schema.prismaを編集してデータソースをmysqlに設定してください$(RESET)"; \
	else \
		echo "$(YELLOW)Prismaは既に初期化されています。$(RESET)"; \
	fi
	@echo "$(GREEN)next.config.jsにoutput: 'standalone'を追加してください$(RESET)"
	@make setup

## 環境変数ファイルを作成
setup:
	@if [ ! -f ".env" ]; then \
		cp .env.example .env; \
		echo "$(GREEN).envファイルを作成しました$(RESET)"; \
	else \
		echo "$(YELLOW).envファイルは既に存在します$(RESET)"; \
	fi

## 開発環境を起動（ホットリロード有効）
dev:
	@echo "$(GREEN)開発環境を起動中...（ポート3001）$(RESET)"
	docker-compose --profile dev up app-dev db

## 本番環境を起動
up:
	@echo "$(GREEN)本番環境を起動中...（ポート3000）$(RESET)"
	docker-compose up -d
	@echo "$(GREEN)起動完了: http://localhost:3000$(RESET)"

## 本番環境をビルドして起動
prod: build up

## コンテナを停止
down:
	@echo "$(RED)コンテナを停止中...$(RESET)"
	docker-compose down

## コンテナを再起動
restart: down up

## イメージをビルド
build:
	@echo "$(GREEN)イメージをビルド中...$(RESET)"
	docker-compose build

## キャッシュなしで再ビルド
rebuild:
	@echo "$(GREEN)キャッシュなしで再ビルド中...$(RESET)"
	docker-compose build --no-cache

## 全てのログを表示
logs:
	docker-compose logs -f

## アプリケーションログを表示
logs-app:
	docker-compose logs -f app

## データベースログを表示
logs-db:
	docker-compose logs -f db

## コンテナ状態を確認
ps:
	docker-compose ps

## コンテナとボリュームを削除
clean:
	@echo "$(RED)コンテナとボリュームを削除中...$(RESET)"
	docker-compose down -v
	@echo "$(RED)削除完了$(RESET)"

## 全てを削除（イメージ含む）
clean-all: clean
	@echo "$(RED)イメージも削除中...$(RESET)"
	docker-compose down -v --rmi all
	@echo "$(RED)全て削除完了$(RESET)"

## マイグレーション実行（本番環境）
db-migrate:
	@echo "$(GREEN)マイグレーションを実行中（本番）...$(RESET)"
	docker-compose exec app npx prisma migrate deploy

## マイグレーション作成と実行（開発環境）
db-migrate-dev:
	@if [ -z "$(NAME)" ]; then \
		echo "$(RED)エラー: マイグレーション名を指定してください$(RESET)"; \
		echo "使用例: make db-migrate-dev NAME=init"; \
		exit 1; \
	fi
	@echo "$(GREEN)マイグレーション '$(NAME)' を作成中（開発）...$(RESET)"
	docker-compose exec app-dev npx prisma migrate dev --name $(NAME)

## データベースをリセット（開発環境）
db-reset:
	@echo "$(RED)データベースをリセット中（開発環境）...$(RESET)"
	docker-compose exec app-dev npx prisma migrate reset

## Prisma Studioを起動
db-studio:
	@echo "$(GREEN)Prisma Studioを起動中...$(RESET)"
	@echo "$(YELLOW)http://localhost:5555 でアクセスできます$(RESET)"
	docker-compose exec app-dev npx prisma studio

## データベース接続確認
db-check:
	@echo "$(GREEN)データベース接続を確認中...$(RESET)"
	docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword

## phpMyAdminを起動
phpmyadmin:
	@echo "$(GREEN)phpMyAdminを起動中...$(RESET)"
	docker-compose --profile tools up -d phpmyadmin
	@echo "$(GREEN)phpMyAdmin: http://localhost:8080$(RESET)"

## 本番コンテナにシェル接続
shell:
	docker-compose exec app sh

## 開発コンテナにシェル接続
shell-dev:
	docker-compose exec app-dev sh

## npmコマンドを実行
npm:
	@if [ -z "$(CMD)" ]; then \
		echo "$(RED)エラー: コマンドを指定してください$(RESET)"; \
		echo "使用例: make npm CMD='install express'"; \
		exit 1; \
	fi
	docker-compose exec app-dev npm $(CMD)

## Prismaクライアントを生成
prisma-generate:
	@echo "$(GREEN)Prismaクライアントを生成中...$(RESET)"
	docker-compose exec app-dev npx prisma generate
