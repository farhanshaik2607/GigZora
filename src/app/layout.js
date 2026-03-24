import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import ToastProvider from '@/components/ToastProvider';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'GigZora - AI-Powered Freelancer Platform',
  description: 'Discover job opportunities, generate leads, and improve your chances of getting selected with AI-powered matching.',
  keywords: 'freelance, jobs, AI matching, career, opportunities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('gigzora-theme') === 'dark' || (!('gigzora-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main>{children}</main>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
