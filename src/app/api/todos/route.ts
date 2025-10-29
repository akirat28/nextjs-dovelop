/**
 * Todoアプリケーション - APIルートハンドラー
 * エンドポイント: /api/todos
 *
 * このファイルはNext.js 15のApp RouterでのAPI Routeを定義
 * データベース操作にはPrismaを使用
 *
 * 提供する機能:
 * - GET: Todoリストの全件取得
 * - POST: 新規Todoの作成
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/todos
 * すべてのTodoをデータベースから取得
 *
 * @returns {Promise<NextResponse>} Todoの配列をJSON形式で返却
 *
 * レスポンス例（成功時 - 200 OK）:
 * [
 *   {
 *     "id": 1,
 *     "title": "買い物に行く",
 *     "completed": false,
 *     "createdAt": "2025-10-29T10:00:00.000Z",
 *     "updatedAt": "2025-10-29T10:00:00.000Z"
 *   }
 * ]
 *
 * レスポンス例（エラー時 - 500 Internal Server Error）:
 * { "error": "Failed to fetch todos" }
 *
 * 処理フロー:
 * 1. Prisma Clientを使用してtodoテーブルから全レコードを取得
 * 2. 作成日時の降順（新しい順）でソート
 * 3. 取得したTodoリストをJSON形式で返却
 * 4. エラー発生時は500エラーを返す
 */
export async function GET() {
  try {
    // データベースから全てのTodoを取得（新しい順）
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc' // 作成日時の降順（最新が先頭）
      }
    })
    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/todos
 * 新しいTodoをデータベースに作成
 *
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} 作成されたTodoをJSON形式で返却
 *
 * リクエストボディ:
 * {
 *   "title": "買い物に行く"
 * }
 *
 * レスポンス例（成功時 - 201 Created）:
 * {
 *   "id": 1,
 *   "title": "買い物に行く",
 *   "completed": false,
 *   "createdAt": "2025-10-29T10:00:00.000Z",
 *   "updatedAt": "2025-10-29T10:00:00.000Z"
 * }
 *
 * レスポンス例（バリデーションエラー - 400 Bad Request）:
 * { "error": "Title is required" }
 *
 * レスポンス例（サーバーエラー - 500 Internal Server Error）:
 * { "error": "Failed to create todo" }
 *
 * 処理フロー:
 * 1. リクエストボディからJSONデータを取得
 * 2. titleフィールドのバリデーション（必須、文字列型チェック）
 * 3. titleの前後の空白を削除（trim）してデータベースに保存
 * 4. 作成されたTodoを201 Createdステータスで返却
 * 5. エラー発生時は適切なHTTPステータスコードで返す
 */
export async function POST(request: Request) {
  try {
    // リクエストボディをパース
    const body = await request.json()
    const { title } = body

    // バリデーション: titleが必須かつ文字列型であることを確認
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 } // 400 Bad Request
      )
    }

    // データベースに新規Todoを作成
    const todo = await prisma.todo.create({
      data: {
        title: title.trim() // 前後の空白を削除して保存
        // completed, createdAt, updatedAtはPrismaのデフォルト値が自動設定される
      }
    })

    // 作成されたTodoを201 Createdで返却
    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 } // 500 Internal Server Error
    )
  }
}
