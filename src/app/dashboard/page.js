'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { JobCard, SkeletonCard, SkeletonInsight, InsightCard, SuggestionCard, EmptyState } from '@/components/ui';
import ChatWidget from '@/components/ChatWidget';
import PageTransition from '@/components/PageTransition';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [matchRes, insightRes] = await Promise.all([
        fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userProfile: user }),
        }),
        fetch('/api/insights'),
      ]);

      const matchData = await matchRes.json();
      const insightData = await insightRes.json();

      setJobs(matchData.jobs || []);
      setInsights(insightData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchLocation = !locationFilter || job.locationType === locationFilter;
    const matchType = !typeFilter || job.type.toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchLocation && matchType;
  });

  const lowMatchJobs = jobs.filter(j => j.matchScore < 70).slice(0, 3);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <PageTransition>
    <div className="min-h-screen pt-32 pb-10 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
            Welcome back, <span className="gradient-text">{user.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Here are your personalized job matches based on your profile.
          </p>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonInsight key={i} />)
          ) : (
            <>
              <InsightCard
                title="Total Jobs"
                value={insights?.totalJobs || 0}
                subtitle="Available opportunities"
                color="blue"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              />
              <InsightCard
                title="Avg Match"
                value={`${jobs.length ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length) : 0}%`}
                subtitle="Your average match score"
                color="green"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <InsightCard
                title="High Match"
                value={jobs.filter(j => j.matchScore >= 70).length}
                subtitle="Jobs above 70% match"
                color="purple"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              />
              <InsightCard
                title="Avg Applicants"
                value={insights?.avgApplicants || 0}
                subtitle="Per job listing"
                color="orange"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search & Filters */}
            <div className="marketplace-card p-4 mb-6 animate-fade-in bg-white dark:bg-surface-900">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="Search jobs, skills, companies..."
                  />
                </div>
                <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="input-field !w-auto min-w-[140px]"
                >
                  <option value="">All Locations</option>
                  <option value="local">Local</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="input-field !w-auto min-w-[130px]"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Job List */}
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  />
                ))
              ) : (
                <EmptyState
                  icon="🔍"
                  title="No matching jobs found"
                  description="Try adjusting your search or filters to find more opportunities."
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* High Demand Skills */}
            <div className="marketplace-card p-6 animate-fade-in bg-white dark:bg-surface-900 border-surface-200">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">🔥</span> High Demand Skills
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton h-4 w-20" />
                      <div className="skeleton h-2 flex-1 rounded-full" />
                      <div className="skeleton h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(insights?.highDemandSkills || []).slice(0, 8).map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{item.skill}</span>
                        <span className="text-xs text-surface-500">{item.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Underserved Opportunities */}
            <div className="marketplace-card p-6 animate-fade-in bg-white dark:bg-surface-900 border-surface-200">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">💎</span> Hidden Gems
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">High demand, few applicants</p>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(insights?.underservedOpportunities || []).map((opp, i) => (
                    <div
                      key={i}
                      onClick={() => router.push(`/jobs/${opp.id}`)}
                      className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer transition-all group"
                    >
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{opp.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-surface-500">{opp.company}</span>
                        <span className="text-xs badge-success">{opp.applicants} applicants</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improvement Suggestions */}
            {!loading && lowMatchJobs.length > 0 && (
              <div className="marketplace-card p-6 animate-fade-in bg-white dark:bg-surface-900 border-surface-200">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">📈</span> Boost Your Score
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">Suggestions to improve your match</p>
                <div className="space-y-3">
                  {lowMatchJobs.map(job => {
                    const missingSkills = job.skills.filter(
                      s => !(user.skills || []).map(us => us.toLowerCase()).includes(s.toLowerCase())
                    );
                    if (missingSkills.length === 0) return null;
                    return (
                      <div key={job.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-1">{job.title}</p>
                        <p className="text-xs text-surface-500 mb-2">Missing skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {missingSkills.slice(0, 3).map(skill => (
                            <span key={skill} className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Your Profile */}
            <div className="marketplace-card p-6 animate-fade-in bg-white dark:bg-surface-900 border-surface-200">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span> Your Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Name</p>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Experience</p>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user.experience || 0} years</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(user.skills || []).length > 0 ? user.skills.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-medium">
                        {s}
                      </span>
                    )) : (
                      <span className="text-xs text-surface-500">No skills added</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Location Preference</p>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200 capitalize">{user.locationPreference || 'Any'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
    </PageTransition>
  );
}
