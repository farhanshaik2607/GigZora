import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">404</div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Page Not Found</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary px-6 py-2.5">
          Go Home
        </Link>
      </div>
    </div>
  );
}
