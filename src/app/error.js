'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Something went wrong</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary px-6 py-2.5"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
