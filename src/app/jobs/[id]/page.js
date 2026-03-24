'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { MatchBadge, LocationBadge, SuggestionCard } from '@/components/ui';

export default function JobDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && id) {
      fetchJobDetails();
    }
  }, [user, authLoading, id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: user, jobId: id }),
      });
      const data = await res.json();
      setJob(data.job || null);
      setSuggestions(data.suggestions || null);
    } catch (err) {
      console.error('Failed to fetch job:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <span className="text-6xl">😕</span>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Job Not Found</h2>
        <p className="text-surface-500 dark:text-surface-400">This job listing may have been removed.</p>
        <Link href="/dashboard" className="btn-primary mt-4">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors animate-fade-in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="marketplace-card p-8 animate-slide-up bg-white dark:bg-surface-900 border-surface-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2">{job.title}</h1>
                  <p className="text-lg text-surface-500 dark:text-surface-400">{job.company}</p>
                </div>
                <MatchBadge score={job.matchScore} />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <LocationBadge type={job.locationType} />
                <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">{job.type}</span>
                <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">{job.location}</span>
                {job.salary && (
                  <span className="badge-success">💰 {job.salary}</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.applicants} applicants
                </span>
                <span>Posted {job.postedDays} day{job.postedDays !== 1 ? 's' : ''} ago</span>
                <span className={`badge ${job.demand === 'high' ? 'badge-danger' : job.demand === 'medium' ? 'badge-warning' : 'badge-primary'}`}>
                  {job.demand} demand
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="marketplace-card p-8 animate-slide-up bg-white dark:bg-surface-900 border-surface-200" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">About This Role</h2>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="marketplace-card p-8 animate-slide-up bg-white dark:bg-surface-900 border-surface-200" style={{ animationDelay: '200ms' }}>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {(job.requirements || []).map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-surface-600 dark:text-surface-400">
                    <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="marketplace-card p-8 animate-slide-up bg-white dark:bg-surface-900 border-surface-200" style={{ animationDelay: '300ms' }}>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).map(skill => {
                  const hasSkill = (user?.skills || []).some(s => s.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        hasSkill
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {hasSkill ? '✓' : '✗'} {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Improvement Suggestions */}
            {suggestions && suggestions.suggestions?.length > 0 && (
              <div className="space-y-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <span>📈</span> Improve Your Match
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Your match score is {job.matchScore}%. Here are some suggestions to improve it:
                </p>
                {suggestions.suggestions.map((sug, i) => (
                  <SuggestionCard key={i} suggestion={sug} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="marketplace-card p-6 text-center animate-slide-up sticky top-24 bg-white dark:bg-surface-900 border-surface-200">
              <div className="mb-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
                  job.matchScore >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                } mb-3`}>
                  <span className={`text-3xl font-bold ${
                    job.matchScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {job.matchScore}%
                  </span>
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Match Score</p>
              </div>

              <button className="btn-primary w-full mb-3 text-lg !py-3.5">
                Apply Now →
              </button>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {job.applicants} people have already applied
              </p>
            </div>

            {/* Experience Range */}
            <div className="marketplace-card p-6 animate-slide-up bg-white dark:bg-surface-900 border-surface-200" style={{ animationDelay: '100ms' }}>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Experience Required</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{
                      width: `${Math.min(100, ((user?.experience || 0) / (job.experienceMax || 10)) * 100)}%`
                    }}
                  />
                </div>
                <span className="text-sm text-surface-500 whitespace-nowrap">
                  {job.experienceMin}-{job.experienceMax} yrs
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-2">
                Your experience: {user?.experience || 0} years
              </p>
            </div>

            {/* Quick Stats */}
            <div className="marketplace-card p-6 animate-slide-up bg-white dark:bg-surface-900 border-surface-200" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Demand Level</span>
                  <span className="font-medium text-surface-800 dark:text-surface-200 capitalize">{job.demand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Job Type</span>
                  <span className="font-medium text-surface-800 dark:text-surface-200">{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Location</span>
                  <span className="font-medium text-surface-800 dark:text-surface-200">{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Salary</span>
                  <span className="font-medium text-surface-800 dark:text-surface-200">{job.salary || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
