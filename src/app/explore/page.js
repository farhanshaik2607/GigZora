'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import categoriesData from '@/data/categories.json';

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoriesData[0].id);

  // Sync category from URL params
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam && categoriesData.some(c => c.id === catParam)) {
      setSelectedCategory(catParam);
      setSearch(''); // clear search if they clicked a category nav link
    }
  }, [searchParams]);

  const activeCategory = categoriesData.find(c => c.id === selectedCategory);

  // Filter skills globally if searching
  const isSearching = search.trim().length > 0;
  const searchResults = isSearching ? categoriesData.flatMap(cat => 
    cat.subcategories.flatMap(sub => 
      sub.skills
        .filter(skill => skill.toLowerCase().includes(search.toLowerCase()))
        .map(skill => ({ skill, subcategory: sub.name, category: cat.name }))
    )
  ) : [];

  return (
    <div className="min-h-screen pt-32 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Explore All <span className="text-primary-600">Services</span>
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-8">
            From data entry to AI development. Find exactly what you need from over 150+ specialized freelance skills.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search for any skill (e.g., 'React', 'Logo Design', 'SEO')..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-surface-900 dark:text-white transition-all text-lg"
            />
          </div>
        </div>

        {isSearching ? (
          // Search Results View
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 border border-surface-200 dark:border-surface-800 shadow-sm animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-surface-900 dark:text-white">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => router.push(`/dashboard?search=${encodeURIComponent(result.skill)}`)}
                    className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer transition-all"
                  >
                    <p className="font-semibold text-surface-900 dark:text-white">{result.skill}</p>
                    <p className="text-xs text-surface-500 mt-1">{result.category} &rsaquo; {result.subcategory}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-surface-500 text-lg">No skills found matching &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </div>
        ) : (
          // Category Browser View
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4 shrink-0">
              <div className="sticky top-28 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2">
                {categoriesData.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      router.push(`/explore?category=${cat.id}`);
                    }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                      selectedCategory === cat.id 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold' 
                        : 'hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-surface-100 dark:border-surface-800">
                  <span className="text-3xl bg-surface-100 dark:bg-surface-800 p-3 rounded-xl">{activeCategory.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{activeCategory.name}</h2>
                    <p className="text-sm text-surface-500 mt-1">{activeCategory.subcategories.length} subcategories • {activeCategory.subcategories.reduce((acc, sub) => acc + sub.skills.length, 0)} skills</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {activeCategory.subcategories.map((sub, i) => (
                    <div key={i} className="mb-4">
                      <h3 className="font-bold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                        {sub.name}
                      </h3>
                      <ul className="space-y-2">
                        {sub.skills.map((skill, j) => (
                          <li key={j}>
                            <button 
                              onClick={() => router.push(`/dashboard?search=${encodeURIComponent(skill)}`)}
                              className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center group text-left w-full"
                            >
                              <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-500 mr-2 text-xs">▹</span>
                              {skill}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
