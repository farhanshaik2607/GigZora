'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const navLinks = user
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/leads', label: 'Leads Scraper' },
      ]
    : [
        { href: '/login', label: 'Log In' },
        { href: '/signup', label: 'Sign Up', isButton: true },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-surface-950 border-b border-surface-200/80 dark:border-surface-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Search */}
          <div className="flex items-center gap-6 flex-1">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-extrabold text-primary-600 tracking-tight">GigZora.</span>
            </Link>
            
            {/* Desktop Search Bar (Marketplace style) */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input 
                type="text" 
                placeholder="Find services, jobs, or freelancers..." 
                className="w-full px-4 py-2 pl-4 pr-10 rounded-md bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <button className="absolute right-0 top-0 h-full px-3 text-white bg-primary-600 rounded-r-md hover:bg-primary-700 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400">
              Explore
            </Link>
            <Link href="/" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400">
              Find Freelancers
            </Link>

            <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2" />

            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.isButton
                    ? 'btn-primary py-1.5 px-4 text-sm'
                    : `text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'text-primary-600 dark:text-primary-400 font-semibold'
                          : 'text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`
                }
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <button
                onClick={logout}
                className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Log Out
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-1 rounded-full text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Bar (Marketplace style) */}
        <div className="hidden md:flex items-center gap-6 pb-3 overflow-x-auto scrollbar-hide">
          {['Graphics & Design', 'Programming & Tech', 'Digital Marketing', 'Video & Animation', 'Writing & Translation', 'Music & Audio', 'Business', 'Data'].map((cat) => (
            <span key={cat} className="text-sm font-medium text-surface-500 hover:text-primary-600 cursor-pointer whitespace-nowrap transition-colors">
              {cat}
            </span>
          ))}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-surface-200 dark:border-surface-800 animate-slide-down">
            <div className="flex flex-col gap-2 relative">
              <input 
                type="text" 
                placeholder="Find services..." 
                className="w-full px-4 py-2 rounded-md bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 text-sm mb-2"
              />
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    link.isButton ? 'btn-primary text-center mb-2' : 
                    isActive(link.href)
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-4 py-3 rounded-md text-sm font-medium text-left text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
