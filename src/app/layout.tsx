/**
 * ルートレイアウトコンポーネント
 * Next.js 15のApp Routerにおける最上位レイアウト
 *
 * このファイルの役割:
 * - アプリケーション全体で共有されるHTML構造を定義
 * - すべてのページで適用されるグローバルスタイルの読み込み
 * - メタデータ（タイトル、descriptionなど）の設定
 * - 共通のヘッダー、フッター、ナビゲーションなどを配置可能
 *
 * 重要な特徴:
 * - このレイアウトは全ページで自動的に適用される
 * - <html>と<body>タグは必ずこのファイルに含める必要がある
 * - childrenプロパティには各ページのコンテンツが挿入される
 * - metadataはNext.jsが自動的にHTMLの<head>に挿入する
 */
import type { Metadata } from "next";
import "./globals.css";  // Tailwind CSSなどのグローバルスタイルをインポート

/**
 * メタデータの設定
 * Next.js 15のApp Routerでは、metadataオブジェクトをエクスポートすることで
 * HTMLの<head>タグ内のメタ情報を自動生成できる
 *
 * 設定可能な項目:
 * - title: ブラウザのタブに表示されるタイトル、検索エンジンの結果に使用
 * - description: ページの説明文、検索エンジンの結果に表示される
 * - keywords: SEO用のキーワード（オプション）
 * - openGraph: SNSでシェアされた際の表示内容（オプション）
 * - robots: 検索エンジンのクローラー制御（オプション）
 *
 * 生成されるHTML:
 * <head>
 *   <title>Next.js + MySQL + Prisma</title>
 *   <meta name="description" content="Next.js application with MySQL and Prisma" />
 * </head>
 */
export const metadata: Metadata = {
  title: "Next.js + MySQL + Prisma",
  description: "Next.js application with MySQL and Prisma",
};

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体を包む最上位のレイアウト
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 各ページのコンテンツが挿入される
 *
 * HTML構造:
 * - <html lang="ja">: 日本語サイトであることをブラウザと検索エンジンに通知
 * - <body>: ページの本文を含むコンテナ
 * - {children}: ルーティングに応じて動的に変わるページコンテンツ
 *
 * 拡張例:
 * - 共通ヘッダー: <body><Header />{children}<Footer /></body>
 * - フォントの適用: <body className={font.className}>{children}</body>
 * - テーマプロバイダー: <body><ThemeProvider>{children}</ThemeProvider></body>
 * - 認証プロバイダー: <body><AuthProvider>{children}</AuthProvider></body>
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;  // Readonly: propsの不変性を保証（TypeScriptの型安全性向上）
}>) {
  return (
    <html lang="ja">
      {/* lang="ja"で日本語サイトであることを宣言（アクセシビリティとSEO向上） */}
      <body>
        {/* childrenには各ページ（page.tsx）のコンテンツが挿入される */}
        {/* 例: "/" → src/app/page.tsx の内容が挿入 */}
        {children}
      </body>
    </html>
  );
}
