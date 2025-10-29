/**
 * Todoアプリケーションのメインページコンポーネント
 * Next.js 15のApp Routerを使用したクライアントサイドコンポーネント
 *
 * 機能:
 * - Todoの一覧表示
 * - 新規Todoの追加
 * - Todoの完了状態の切り替え
 * - Todoの削除（アニメーション付き）
 * - 統計情報の表示（完了数/全体数）
 */
'use client'

import { useState, useEffect } from 'react'

/**
 * Todoアイテムの型定義
 * データベース（Prisma）から取得するTodoの構造を表現
 */
type Todo = {
  id: number          // Todo固有のID（主キー）
  title: string       // Todoのタイトル
  completed: boolean  // 完了状態（true: 完了, false: 未完了）
  createdAt: string   // 作成日時（ISO 8601形式）
  updatedAt: string   // 最終更新日時（ISO 8601形式）
}

export default function Home() {
  // ===== 状態管理 =====
  // Todoリストの配列を保持（データベースから取得したTodoを格納）
  const [todos, setTodos] = useState<Todo[]>([])

  // 新規Todoの入力値を保持
  const [newTodo, setNewTodo] = useState('')

  // Todo追加処理中のローディング状態を管理（二重送信防止）
  const [loading, setLoading] = useState(false)

  // 削除中のTodoのIDを保持（削除アニメーション制御用）
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ===== API連携関数 =====

  /**
   * Todoリストをデータベースから取得する関数
   * GET /api/todos エンドポイントを呼び出し、全てのTodoを取得
   *
   * 処理フロー:
   * 1. APIエンドポイント（/api/todos）にGETリクエスト
   * 2. レスポンスが成功（200 OK）の場合、JSONデータをパース
   * 3. 取得したTodoリストを状態に反映
   * 4. エラー発生時はコンソールにログを出力
   */
  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos')
      if (res.ok) {
        const data = await res.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    }
  }

  /**
   * 初回レンダリング時にTodoリストを取得
   * 依存配列が空配列なので、コンポーネントのマウント時に1度だけ実行される
   */
  useEffect(() => {
    fetchTodos()
  }, [])

  /**
   * 新しいTodoを追加する関数
   * POST /api/todos エンドポイントを呼び出し、Todoをデータベースに保存
   *
   * @param e - フォーム送信イベント
   *
   * 処理フロー:
   * 1. フォームのデフォルト送信動作を防止
   * 2. 入力値が空白のみの場合は早期リターン（バリデーション）
   * 3. ローディング状態をtrueに設定（ボタン無効化）
   * 4. APIエンドポイントにPOSTリクエストで新規Todoを送信
   * 5. 成功時は入力フィールドをクリアし、Todoリストを再取得
   * 6. finally句でローディング状態を解除
   */
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault() // フォーム送信によるページリロードを防止
    if (!newTodo.trim()) return // 空白文字のみの入力をスキップ

    setLoading(true)
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo })
      })

      if (res.ok) {
        setNewTodo('') // 入力フィールドをクリア
        await fetchTodos() // 最新のTodoリストを取得
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    } finally {
      setLoading(false) // 処理完了後、ローディング状態を解除
    }
  }

  /**
   * Todoの完了状態を切り替える関数
   * PATCH /api/todos/[id] エンドポイントを呼び出し、completedフラグを反転
   *
   * @param id - 更新対象のTodoのID
   * @param completed - 現在の完了状態（反転させるため）
   *
   * 処理フロー:
   * 1. 指定されたIDのTodoに対してPATCHリクエストを送信
   * 2. completed状態を反転した値（!completed）を送信
   * 3. 成功時はTodoリストを再取得してUIを更新
   * 4. エラー時はコンソールにログを出力
   */
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }) // 現在の状態を反転
      })

      if (res.ok) {
        await fetchTodos() // UIを最新の状態に更新
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  /**
   * Todoを削除する関数（フェードアウトアニメーション付き）
   * DELETE /api/todos/[id] エンドポイントを呼び出し、Todoをデータベースから削除
   *
   * @param id - 削除対象のTodoのID
   *
   * 処理フロー:
   * 1. 削除対象のIDをdeletingIdにセット（CSSアニメーション発火）
   * 2. 300msの待機時間でフェードアウトアニメーションを完了させる
   * 3. APIエンドポイントにDELETEリクエストを送信
   * 4. 成功時はTodoリストを再取得してUIから削除
   * 5. finally句でdeletingIdをnullにリセット
   *
   * UX配慮: アニメーションにより視覚的フィードバックを提供し、
   *         突然の削除による違和感を軽減
   */
  const deleteTodo = async (id: number) => {
    // アニメーション開始（対象Todoが半透明化・縮小・左移動）
    setDeletingId(id)

    // アニメーション完了を待つ（CSSのtransition-duration: 300msと同期）
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchTodos() // 削除後、最新のリストを取得
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    } finally {
      setDeletingId(null) // アニメーション状態をリセット
    }
  }

  // ===== レンダリング =====
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      {/* コンテンツのコンテナ（最大幅2xlでセンタリング） */}
      <div className="w-full max-w-2xl">
        {/* ページタイトル */}
        <h1 className="text-4xl font-bold mb-8 text-center">Todo App</h1>

        {/* 新規Todo追加フォーム */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            {/* Todo入力フィールド */}
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="新しいTodoを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              disabled={loading} // 送信中は入力を無効化
            />
            {/* 追加ボタン */}
            <button
              type="submit"
              disabled={loading || !newTodo.trim()} // 送信中または空入力時は無効化
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              追加
            </button>
          </div>
        </form>

        {/* Todoリスト表示エリア */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            /* Todoが存在しない場合の空状態メッセージ */
            <p className="text-center text-gray-500 py-8">
              Todoがありません。上のフォームから追加してください。
            </p>
          ) : (
            /* Todoリストをマッピングして各アイテムを表示 */
            todos.map((todo) => (
              <div
                key={todo.id}
                /*
                  削除アニメーション制御:
                  - deletingIdが一致する場合: 透明度0、縮小95%、左に4単位移動
                  - それ以外: 通常表示（透明度100%、サイズ100%、移動なし）
                  - transition-all duration-300でスムーズなアニメーション
                */
                className={`flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 ${
                  deletingId === todo.id
                    ? 'opacity-0 scale-95 -translate-x-4'
                    : 'opacity-100 scale-100 translate-x-0'
                }`}
              >
                {/* 完了チェックボックス */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="w-5 h-5 cursor-pointer"
                />
                {/* Todoのタイトル（完了時は取り消し線を表示） */}
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? 'line-through text-gray-500' // 完了済み: 取り消し線 + グレー
                      : 'text-gray-900 dark:text-gray-100' // 未完了: 通常表示
                  }`}
                >
                  {todo.title}
                </span>
                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  disabled={deletingId === todo.id} // 削除中は無効化（二重削除防止）
                  className="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === todo.id ? '削除中...' : '削除'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* 統計情報（Todoが1つ以上ある場合のみ表示） */}
        {todos.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {/*
                完了したTodoの数と全体のTodo数を表示
                filter()で完了済み（completed === true）のTodoのみを抽出してカウント
              */}
              完了: {todos.filter((t) => t.completed).length} / 全体: {todos.length}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
