/**
 * GigZora Job Aggregator
 * Fetches jobs from external APIs (Jooble, Adzuna), normalizes them,
 * and deduplicates with local jobs.
 */

import axios from 'axios';

// ─── Jooble API ──────────────────────────────────────────────────────────────

export async function fetchJoobleJobs(query, location = '') {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey || apiKey === 'your-jooble-api-key') return [];

  try {
    const res = await axios.post(
      `https://jooble.org/api/${apiKey}`,
      { keywords: query, location, page: 1 },
      { timeout: 8000 }
    );

    return (res.data.jobs || []).slice(0, 20).map((job, i) => ({
      id: `jooble-${Date.now()}-${i}`,
      title: job.title || 'Untitled',
      company: job.company || 'Unknown Company',
      location: job.location || 'Remote',
      locationType: inferLocationType(job.location),
      type: job.type || 'Full-time',
      salary: job.salary || 'Not specified',
      skills: extractSkillsFromText(job.snippet || job.title || ''),
      experienceMin: 1,
      experienceMax: 5,
      description: job.snippet || `${job.title} position at ${job.company}.`,
      requirements: ['See original posting for full requirements'],
      applicants: Math.floor(Math.random() * 100) + 5,
      postedDays: Math.floor(Math.random() * 14) + 1,
      demand: 'medium',
      source: 'jooble',
      externalUrl: job.link,
    }));
  } catch (err) {
    console.error('[JobAggregator] Jooble error:', err.message);
    return [];
  }
}

// ─── Adzuna API ──────────────────────────────────────────────────────────────

export async function fetchAdzunaJobs(query, location = 'us') {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || appId === 'your-adzuna-app-id') return [];

  try {
    const country = location.length === 2 ? location.toLowerCase() : 'us';
    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: {
          app_id: appId,
          app_key: appKey,
          what: query,
          results_per_page: 20,
          content_type: 'application/json',
        },
        timeout: 8000,
      }
    );

    return (res.data.results || []).map((job, i) => ({
      id: `adzuna-${Date.now()}-${i}`,
      title: job.title || 'Untitled',
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      locationType: inferLocationType(job.location?.display_name),
      type: job.contract_time === 'part_time' ? 'Part-time' : 'Full-time',
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`
        : 'Not specified',
      skills: extractSkillsFromText(job.description || job.title || ''),
      experienceMin: 1,
      experienceMax: 5,
      description: (job.description || '').slice(0, 500),
      requirements: ['See original posting for full requirements'],
      applicants: Math.floor(Math.random() * 80) + 10,
      postedDays: Math.floor((Date.now() - new Date(job.created).getTime()) / 86400000) || 1,
      demand: 'medium',
      source: 'adzuna',
      externalUrl: job.redirect_url,
    }));
  } catch (err) {
    console.error('[JobAggregator] Adzuna error:', err.message);
    return [];
  }
}

// ─── Deduplication ───────────────────────────────────────────────────────────

export function deduplicateJobs(localJobs, externalJobs) {
  const seen = new Set();

  // Index local jobs first
  localJobs.forEach(job => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    seen.add(key);
  });

  // Filter out duplicates from external
  const unique = externalJobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return [...localJobs, ...unique];
}

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function inferLocationType(loc) {
  if (!loc) return 'international';
  const lower = loc.toLowerCase();
  if (lower.includes('remote') || lower.includes('worldwide')) return 'international';
  if (lower.includes('us') || lower.includes('united states') || lower.includes('uk')) return 'national';
  return 'local';
}

const KNOWN_SKILLS = [
  'react', 'next.js', 'javascript', 'typescript', 'python', 'node.js', 'css', 'html',
  'aws', 'docker', 'kubernetes', 'graphql', 'mongodb', 'postgresql', 'firebase',
  'figma', 'vue.js', 'angular', 'machine learning', 'ai', 'data science',
  'seo', 'marketing', 'wordpress', 'php', 'java', 'c#', '.net', 'ruby', 'go',
  'swift', 'kotlin', 'flutter', 'react native', 'photoshop', 'illustrator',
  'copywriting', 'content writing', 'video editing', 'animation', 'ux', 'ui',
];

function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const found = KNOWN_SKILLS.filter(skill => lower.includes(skill));
  // Capitalize first letter
  return found.length > 0
    ? found.map(s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    : ['General'];
}
