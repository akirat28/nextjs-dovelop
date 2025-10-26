export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Next.js + MySQL + Prisma</h1>
        <p className="text-lg mb-8">
          Docker環境で動作するNext.jsアプリケーション
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">開発環境</h2>
            <p>ポート3001でホットリロードが有効です</p>
          </div>
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">本番環境</h2>
            <p>ポート3000で本番ビルドが動作します</p>
          </div>
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">MySQL</h2>
            <p>ポート3306でデータベースが稼働中</p>
          </div>
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Prisma</h2>
            <p>型安全なORMでデータベースにアクセス</p>
          </div>
        </div>
      </div>
    </main>
  );
}
