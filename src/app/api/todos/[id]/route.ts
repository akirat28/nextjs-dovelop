/**
 * Todoアプリケーション - 個別TodoのAPIルートハンドラー
 * エンドポイント: /api/todos/[id]
 *
 * このファイルはNext.js 15のDynamic Route（動的ルート）を定義
 * 特定のIDを持つTodoに対する操作を提供
 *
 * 提供する機能:
 * - PATCH: Todoの完了状態の更新
 * - DELETE: Todoの削除
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/todos/[id]
 * 指定されたIDのTodoを更新（主に完了状態の切り替えに使用）
 *
 * @param {Request} request - HTTPリクエストオブジェクト
 * @param {Object} params - ルートパラメータ（非同期でidを含む）
 * @returns {Promise<NextResponse>} 更新されたTodoをJSON形式で返却
 *
 * パスパラメータ:
 * - id: 更新対象のTodoのID（数値）
 *
 * リクエストボディ:
 * {
 *   "completed": true
 * }
 *
 * レスポンス例（成功時 - 200 OK）:
 * {
 *   "id": 1,
 *   "title": "買い物に行く",
 *   "completed": true,
 *   "createdAt": "2025-10-29T10:00:00.000Z",
 *   "updatedAt": "2025-10-29T10:05:00.000Z"
 * }
 *
 * レスポンス例（バリデーションエラー - 400 Bad Request）:
 * { "error": "Invalid todo ID" } または
 * { "error": "Completed must be a boolean" }
 *
 * レスポンス例（サーバーエラー - 500 Internal Server Error）:
 * { "error": "Failed to update todo" }
 *
 * 処理フロー:
 * 1. URLパラメータからTodoのIDを取得し、数値に変換
 * 2. IDの妥当性チェック（数値でない場合は400エラー）
 * 3. リクエストボディからcompletedフィールドを取得
 * 4. completedがboolean型であることをバリデーション
 * 5. Prismaを使用してデータベースのTodoを更新
 * 6. 更新されたTodoを返却
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15では、paramsが非同期Promiseになっているためawaitが必要
    const { id } = await params
    const todoId = parseInt(id) // 文字列のIDを数値に変換

    // バリデーション: IDが数値であることを確認
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      )
    }

    // リクエストボディをパース
    const body = await request.json()
    const { completed } = body

    // バリデーション: completedがboolean型であることを確認
    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Completed must be a boolean' },
        { status: 400 }
      )
    }

    // データベースのTodoを更新
    const todo = await prisma.todo.update({
      where: { id: todoId }, // 更新対象のTodoをIDで指定
      data: { completed }     // completed状態を更新（updatedAtは自動更新）
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/todos/[id]
 * 指定されたIDのTodoをデータベースから削除
 *
 * @param {Request} request - HTTPリクエストオブジェクト
 * @param {Object} params - ルートパラメータ（非同期でidを含む）
 * @returns {Promise<NextResponse>} 削除成功のレスポンスを返却
 *
 * パスパラメータ:
 * - id: 削除対象のTodoのID（数値）
 *
 * レスポンス例（成功時 - 200 OK）:
 * {
 *   "success": true
 * }
 *
 * レスポンス例（バリデーションエラー - 400 Bad Request）:
 * { "error": "Invalid todo ID" }
 *
 * レスポンス例（サーバーエラー - 500 Internal Server Error）:
 * { "error": "Failed to delete todo" }
 *
 * 処理フロー:
 * 1. URLパラメータからTodoのIDを取得し、数値に変換
 * 2. IDの妥当性チェック（数値でない場合は400エラー）
 * 3. Prismaを使用してデータベースから該当のTodoを削除
 * 4. 削除成功のレスポンスを返却
 *
 * 注意事項:
 * - 存在しないIDを指定した場合、Prismaがエラーをスローし500エラーが返る
 * - 削除は不可逆的な操作のため、クライアント側で確認ダイアログを出すことを推奨
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15では、paramsが非同期Promiseになっているためawaitが必要
    const { id } = await params
    const todoId = parseInt(id) // 文字列のIDを数値に変換

    // バリデーション: IDが数値であることを確認
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      )
    }

    // データベースから指定されたIDのTodoを削除
    await prisma.todo.delete({
      where: { id: todoId }
    })

    // 削除成功のレスポンス
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
