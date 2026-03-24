'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const categories = [
  { name: 'Development & IT', icon: '💻', count: '1.2M+' },
  { name: 'Design & Creative', icon: '🎨', count: '900K+' },
  { name: 'Sales & Marketing', icon: '📈', count: '500K+' },
  { name: 'Writing & Translation', icon: '✍️', count: '400K+' },
  { name: 'Admin & Customer Support', icon: '🎧', count: '300K+' },
  { name: 'Finance & Accounting', icon: '📊', count: '150K+' },
  { name: 'Engineering & Architecture', icon: '🏗️', count: '100K+' },
  { name: 'Legal', icon: '⚖️', count: '50K+' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-white dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-900 dark:text-white mb-6 leading-tight">
                How work <br /> 
                <span className="text-primary-600">should work</span> 
              </h1>
              <p className="text-lg text-surface-600 dark:text-surface-400 mb-8 max-w-lg">
                Forget the old rules. You can have the best people. Right now. Right here. Welcome to GigZora, the world&apos;s work marketplace designed for you.
              </p>
              
              {/* Search Box */}
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full py-4 pl-5 pr-32 rounded-lg border border-surface-300 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-medium"
                />
                <button className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md transition-colors">
                  Search
                </button>
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-surface-900">Popular:</span>
                <span className="text-sm px-3 py-1 rounded-full border border-surface-200 text-surface-600 hover:bg-surface-100 cursor-pointer font-medium">Website Design</span>
                <span className="text-sm px-3 py-1 rounded-full border border-surface-200 text-surface-600 hover:bg-surface-100 cursor-pointer font-medium">WordPress</span>
                <span className="text-sm px-3 py-1 rounded-full border border-surface-200 text-surface-600 hover:bg-surface-100 cursor-pointer font-medium">Logo Design</span>
                <span className="text-sm px-3 py-1 rounded-full border border-surface-200 text-surface-600 hover:bg-surface-100 cursor-pointer font-medium">AI Services</span>
              </div>
            </div>

            {/* Right Image/Graphic area */}
            <div className="hidden lg:block relative">
               <div className="aspect-[4/3] rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden relative shadow-lg">
                  <div className="absolute inset-0 bg-primary-600/5 mix-blend-multiply" />
                  <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-primary-600/10" />
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-dashed border-primary-500/20 rounded-xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                     <span className="text-6xl mb-4 block">🎯</span>
                     <p className="font-bold text-xl text-surface-800">Find the Perfect Match</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <div className="border-y border-surface-200 bg-surface-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-surface-500 uppercase tracking-widest mb-4">Trusted by over 4,000 businesses</p>
          <div className="flex justify-center gap-10 opacity-60 grayscale flex-wrap">
            <span className="font-bold text-2xl tracking-tighter">Microsoft</span>
            <span className="font-bold text-2xl tracking-tight">airbnb</span>
            <span className="font-bold text-2xl font-serif">BISSELL</span>
            <span className="font-bold text-2xl tracking-wide">GoDaddy</span>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-10">Browse talent by category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="marketplace-card hover:-translate-y-1 hover:border-primary-500 transition-all cursor-pointer p-6">
              <div className="text-3xl mb-4">{cat.icon}</div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{cat.name}</h3>
              <div className="flex justify-between items-center text-sm text-surface-500">
                <span>★ 4.85/5</span>
                <span>{cat.count} skills</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Intelligence Block */}
      <section className="py-20 bg-primary-50 dark:bg-surface-900 border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
           <div>
             <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-6">
               A whole world of freelance talent at your fingertips
             </h2>
             <ul className="space-y-6">
               <li className="flex gap-4">
                 <div className="flex-shrink-0 mt-1"><svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>
                 <div>
                   <h4 className="text-xl font-semibold text-surface-900">The best for every budget</h4>
                   <p className="text-surface-600 mt-1">Find high-quality services at every price point. No hourly rates, just project-based pricing.</p>
                 </div>
               </li>
               <li className="flex gap-4">
                 <div className="flex-shrink-0 mt-1"><svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>
                 <div>
                   <h4 className="text-xl font-semibold text-surface-900">Quality work done quickly</h4>
                   <p className="text-surface-600 mt-1">Find the right freelancer to begin working on your project within minutes.</p>
                 </div>
               </li>
               <li className="flex gap-4">
                 <div className="flex-shrink-0 mt-1"><svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>
                 <div>
                   <h4 className="text-xl font-semibold text-surface-900">Protected payments, every time</h4>
                   <p className="text-surface-600 mt-1">Always know what you&apos;ll pay upfront. Your payment isn&apos;t released until you approve the work.</p>
                 </div>
               </li>
             </ul>
           </div>
           
           <div className="marketplace-card p-10 bg-white shadow-xl shadow-primary-500/5">
             <div className="flex justify-between items-center mb-8 border-b border-surface-200 pb-4">
               <div>
                  <h3 className="font-bold tracking-tight text-xl text-surface-900">GigZora AI Match</h3>
                  <p className="text-sm text-surface-500">Log in to unleash intelligent scoring</p>
               </div>
               <span className="badge bg-primary-100 text-primary-700">Beta</span>
             </div>
             
             <p className="text-surface-700 mb-6 font-medium">GigZora helps you discover missing skills and pairs you automatically with high-probability clients.</p>
             
             <Link href={user ? '/dashboard' : '/signup'} className="btn-primary w-full block text-center py-3 text-lg">
                Explore Dashboard
             </Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-bold text-xl text-surface-800 tracking-tight">GigZora.</p>
          <p className="text-sm text-surface-500">
            © 2024 GigZora Global Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
