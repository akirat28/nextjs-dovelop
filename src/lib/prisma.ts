/**
 * Prisma Client シングルトンインスタンス
 *
 * このファイルの目的:
 * Next.js開発環境でのホットリロード時に複数のPrisma Clientインスタンスが
 * 作成されることを防ぎ、データベース接続の上限に達するのを回避する
 *
 * 背景:
 * - Next.jsの開発モードでは、ファイル変更時にモジュールがリロードされる
 * - 通常の実装だと、リロード毎に新しいPrismaClientが作成される
 * - PrismaClientは内部でデータベース接続プールを持つため、
 *   インスタンスが増えると接続数が枯渇する可能性がある
 *
 * 解決方法:
 * - グローバルオブジェクト（globalThis）にPrismaClientを保存
 * - 既にインスタンスが存在する場合は再利用
 * - 本番環境では不要なため、開発環境のみこの仕組みを適用
 *
 * 使用方法:
 * import { prisma } from '@/lib/prisma'
 * const todos = await prisma.todo.findMany()
 */
import { PrismaClient } from '@prisma/client'

/**
 * グローバルスコープの型定義
 * globalThisオブジェクトにprismaプロパティを追加するための型キャスト
 *
 * TypeScriptでは、globalThisに任意のプロパティを追加できないため、
 * 型アサーションを使用してprismaプロパティを持つ型に変換している
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Clientのシングルトンインスタンス
 *
 * 動作:
 * 1. globalForPrisma.prismaが既に存在する場合はそれを使用（再利用）
 * 2. 存在しない場合は新しいPrismaClientインスタンスを作成
 *
 * Null合体演算子（??）の使用:
 * - 左辺がnullまたはundefinedの場合に右辺を評価
 * - 既存インスタンスがない場合のみ、新規作成される
 *
 * このインスタンスをAPIルート（route.ts）やServer Componentsから
 * インポートして使用することで、データベース操作を行う
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

/**
 * 開発環境でのみグローバルにPrisma Clientを保存
 *
 * 条件分岐の理由:
 * - 開発環境（NODE_ENV !== 'production'）:
 *   ホットリロード対策として、作成したインスタンスをglobalThisに保存
 *   次回のリロード時に再利用される
 *
 * - 本番環境（NODE_ENV === 'production'）:
 *   本番環境ではホットリロードが発生しないため、この処理は不要
 *   グローバル変数への保存を避けることで、メモリ管理を最適化
 *
 * Note: 本番環境ではVercelやDockerなどのサーバーレス/コンテナ環境で
 * プロセスが長時間実行されるため、接続プールは適切に管理される
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
