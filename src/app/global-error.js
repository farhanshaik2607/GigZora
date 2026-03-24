'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Critical Error</h2>
          <p className="text-gray-500 mb-6 text-sm">
            {error?.message || 'A critical error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
