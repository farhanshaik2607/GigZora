'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import PageTransition from '@/components/PageTransition';

const SOURCES = [
  { id: 'google_maps', label: 'Google Maps (Businesses)' },
  { id: 'google_places', label: 'Google Places (API)' },
  { id: 'yelp', label: 'Yelp (Local Services)' },
  { id: 'jooble', label: 'Jooble (Job Listings)' },
  { id: 'adzuna', label: 'Adzuna (Job Postings)' },
];

export default function LeadsDashboard() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('google_maps');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch all leads on mount
  useEffect(() => {
    async function fetchAllLeads() {
      try {
        const res = await fetch('/api/scrape');
        const data = await res.json();
        if (data.success && data.leads) {
          setLeads(data.leads.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt)));
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchAllLeads();
  }, []);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), source }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to scrape leads');
      }

      // Refresh the list after scraping to get latest combined data
      const refreshRes = await fetch('/api/scrape');
      const refreshData = await refreshRes.json();
      if (refreshData.success && refreshData.leads) {
         setLeads(refreshData.leads.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt)));
      }
      
      // Clear query if successful
      if (data.count > 0) {
          setQuery('');
          toast.success(`Found ${data.count} new leads!`);
      } else {
          setError(`No leads found for "${query}" on ${source}.`);
          toast.info('No leads found. Try a different query.');
      }

    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Scraping failed');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Name', 'Company', 'Email', 'Phone', 'Location', 'Website', 'Source', 'Date'];
    
    const rows = leads.map(lead => [
      // Enclose in quotes to handle commas within values
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.company || '').replace(/"/g, '""')}"`,
      `"${lead.email || ''}"`,
      `"${lead.phone || ''}"`,
      `"${(lead.location || '').replace(/"/g, '""')}"`,
      `"${lead.website || ''}"`,
      `"${lead.source || ''}"`,
      `"${new Date(lead.scrapedAt).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gigzora_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-surface-50 dark:bg-surface-950 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white mb-2">
              GigZora Scraping Center
            </h1>
            <p className="text-surface-600 dark:text-surface-400 max-w-2xl">
              Discover and extract high-value client leads across multiple platforms seamlessly.
            </p>
          </div>
          <button 
            onClick={exportCSV}
            disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-200 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm p-6 mb-8">
          <form onSubmit={handleScrape} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Graphic Designers in London"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all dark:text-white"
                  required
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Data Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all dark:text-white appearance-none"
              >
                {SOURCES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scraping...
                  </>
                ) : 'Run Scraper'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center bg-surface-50/50 dark:bg-surface-900/50">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Generated Leads</h2>
            <span className="text-sm font-medium px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full">
              {leads.length} Total
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800">
              <thead className="bg-surface-50 dark:bg-surface-950">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Business / Contact</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Contact Info</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Source</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-surface-900 divide-y divide-surface-200 dark:divide-surface-800">
                {initialLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-surface-500 dark:text-surface-400">
                      <svg className="animate-spin relative left-1/2 -ml-3 h-6 w-6 text-primary-600 mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading existing leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-surface-500 dark:text-surface-400">
                      <p className="mb-1">Your lead pipeline is empty.</p>
                      <p className="text-sm">Run a search above to discover opportunities.</p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-surface-900 dark:text-white line-clamp-1">{lead.name}</span>
                          <span className="text-sm text-surface-500 dark:text-surface-400 line-clamp-1">{lead.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          {lead.email ? (
                            <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                            </div>
                          ) : (
                            <span className="text-surface-400">No email</span>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-surface-600 dark:text-surface-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-surface-600 dark:text-surface-300 line-clamp-2">{lead.location || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 capitalize">
                          {lead.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {lead.website ? (
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
                            title="Visit Website"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="p-2 text-surface-300 inline-block">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
    </PageTransition>
  );
}
