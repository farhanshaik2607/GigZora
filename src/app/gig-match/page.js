'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import categoriesData from '@/data/categories.json';

const availableSkills = Array.from(
  new Set(
    categoriesData.flatMap(cat =>
      cat.subcategories.flatMap(sub => sub.skills)
    )
  )
).sort();

export default function GigMatchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState(1);
  const [locationPref, setLocationPref] = useState('any');
  const [skillSearch, setSkillSearch] = useState('');
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setSkills(user.skills || []);
      setExperience(user.experience || 1);
      setLocationPref(user.locationPreference || 'any');
    }
  }, [user, authLoading, router]);

  const filteredSkills = availableSkills.filter(
    s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(s)
  ).slice(0, 8);

  const addSkill = (skill) => {
    if (!skills.includes(skill)) setSkills([...skills, skill]);
    setSkillSearch('');
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const analyzeMatch = async () => {
    setLoading(true);
    setAnalyzed(false);
    try {
      const profile = {
        ...user,
        skills,
        experience,
        locationPreference: locationPref,
      };
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: profile }),
      });
      const data = await res.json();
      setMatchedJobs(data.jobs || []);
      setAnalyzed(true);
    } catch (err) {
      console.error('Match analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreRing = (score) => {
    if (score >= 80) return 'ring-emerald-200 dark:ring-emerald-900';
    if (score >= 60) return 'ring-amber-200 dark:ring-amber-900';
    return 'ring-red-200 dark:ring-red-900';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Strong Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Needs Upskilling';
    return 'Low Match';
  };

  const highMatches = matchedJobs.filter(j => j.matchScore >= 80);
  const medMatches = matchedJobs.filter(j => j.matchScore >= 60 && j.matchScore < 80);
  const lowMatches = matchedJobs.filter(j => j.matchScore < 60);

  const avgScore = matchedJobs.length > 0
    ? Math.round(matchedJobs.reduce((sum, j) => sum + j.matchScore, 0) / matchedJobs.length)
    : 0;

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
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
              🎯 Gig Match Predictor
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">
              See how well you match with available gigs based on your skills. Get personalized upskilling recommendations.
            </p>
          </div>

          {/* Step 1: Skills Input */}
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold flex items-center justify-center">1</span>
              Your Skills
            </h2>

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
              {skills.length === 0 && (
                <span className="text-sm text-surface-400 italic">Add your skills below...</span>
              )}
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>

            {/* Skill Search */}
            <div className="relative">
              <input
                type="text"
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                placeholder="Search and add skills (e.g. React, Python, SEO...)"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              {skillSearch && filteredSkills.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSkills.map(s => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 text-surface-700 dark:text-surface-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Experience + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={experience}
                  onChange={e => setExperience(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Location Preference</label>
                <select
                  value={locationPref}
                  onChange={e => setLocationPref(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="any">Any Location</option>
                  <option value="local">Local Only</option>
                  <option value="national">National</option>
                  <option value="international">International / Remote</option>
                </select>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeMatch}
            disabled={loading || skills.length === 0}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing {matchedJobs.length > 0 ? '...' : 'gigs...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Analyze My Gig Match
              </>
            )}
          </button>

          {/* Results */}
          {analyzed && (
            <div className="animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</div>
                  <div className="text-xs text-surface-500 mt-1">Avg. Match</div>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{highMatches.length}</div>
                  <div className="text-xs text-surface-500 mt-1">Strong Matches</div>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 text-center">
                  <div className="text-3xl font-bold text-amber-500">{medMatches.length}</div>
                  <div className="text-xs text-surface-500 mt-1">Moderate</div>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 text-center">
                  <div className="text-3xl font-bold text-red-500">{lowMatches.length}</div>
                  <div className="text-xs text-surface-500 mt-1">Need Upskilling</div>
                </div>
              </div>

              {/* Job Match List */}
              <div className="space-y-4">
                {matchedJobs.slice(0, 20).map(job => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Job Header Row */}
                    <div
                      className="p-5 cursor-pointer flex items-center gap-4"
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    >
                      {/* Score Circle */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-full ring-4 ${getScoreRing(job.matchScore)} flex items-center justify-center`}>
                        <span className={`text-lg font-bold ${getScoreColor(job.matchScore)}`}>{job.matchScore}%</span>
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-surface-900 dark:text-white truncate">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            job.matchScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {getScoreLabel(job.matchScore)}
                          </span>
                        </div>
                        <p className="text-sm text-surface-500 truncate">{job.company} • {job.location} • {job.salary}</p>
                      </div>

                      {/* Match Bar */}
                      <div className="hidden sm:flex items-center gap-3 flex-shrink-0 w-36">
                        <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getScoreBg(job.matchScore)}`}
                            style={{ width: `${job.matchScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Expand Arrow */}
                      <svg className={`w-5 h-5 text-surface-400 transition-transform flex-shrink-0 ${expandedJob === job.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expanded Details */}
                    {expandedJob === job.id && (
                      <div className="px-5 pb-5 border-t border-surface-100 dark:border-surface-800 pt-4 animate-fade-in">
                        {/* Skills Comparison */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Skills Analysis</h4>
                          <div className="flex flex-wrap gap-2">
                            {(job.skills || []).map(skill => {
                              const hasSkill = skills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                              return (
                                <span
                                  key={skill}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    hasSkill
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                      : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                  }`}
                                >
                                  {hasSkill ? '✓' : '✗'} {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Missing Skills + Suggestions */}
                        {job.missingSkills && job.missingSkills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                              📚 Upskilling Recommendations
                            </h4>
                            <div className="space-y-3">
                              {(job.suggestions || []).slice(0, 3).map((sug, i) => (
                                <div
                                  key={i}
                                  className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-3"
                                >
                                  <p className="text-sm text-surface-700 dark:text-surface-300 font-medium mb-1">
                                    🔹 {sug.message}
                                  </p>
                                  {sug.resources && sug.resources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {sug.resources.map((res, ri) => (
                                        <a
                                          key={ri}
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#fff" d="M9.545 15.568V8.432L15.818 12z"/></svg>
                                          {res.title}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="btn-primary py-2 px-5 text-sm"
                          >
                            View Full Details →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
