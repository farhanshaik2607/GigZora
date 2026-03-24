/**
 * Gigzora AI Matcher
 * Pure JavaScript job matching algorithm — no external AI APIs.
 * 
 * Scoring:
 *   skillScore     = (matchingSkills / requiredSkills) * 50   (max 50)
 *   expScore       = 30 - |difference| * 5                    (max 30, min 0)
 *   locationScore  = 20 if match, 10 if flexible, 0 otherwise (max 20)
 *   total          = min(100, skill + exp + location)
 */

import youtubeLinks from '@/data/youtubeLinks.json';

// ─── Core matching ───────────────────────────────────────────────────────────

export function matchJob(userProfile, job) {
  if (!userProfile || !job) return { score: 0, missingSkills: [], suggestions: [] };

  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase().trim());
  const jobSkills  = (job.skills || []).map(s => s.toLowerCase().trim());

  // ── Skill Score (max 50) ───────────────────────────────────────────────
  const matchingSkills = jobSkills.filter(s => userSkills.includes(s));
  const missingSkills  = (job.skills || []).filter(s => !userSkills.includes(s.toLowerCase().trim()));
  const skillScore     = jobSkills.length > 0
    ? Math.round((matchingSkills.length / jobSkills.length) * 50)
    : 25; // neutral if job lists no skills

  // ── Experience Score (max 30) ──────────────────────────────────────────
  const userExp = Number(userProfile.experience) || 0;
  const jobMin  = Number(job.experienceMin) || 0;
  const jobMax  = Number(job.experienceMax) || 10;
  let expScore  = 30;

  if (userExp < jobMin) {
    expScore = Math.max(0, 30 - (jobMin - userExp) * 5);
  } else if (userExp > jobMax) {
    expScore = Math.max(0, 30 - (userExp - jobMax) * 3); // less penalty for overqualification
  }

  // ── Location Score (max 20) ────────────────────────────────────────────
  const pref = (userProfile.locationPreference || 'any').toLowerCase();
  const loc  = (job.locationType || 'international').toLowerCase();
  let locationScore = 0;

  if (pref === 'any' || pref === loc)             locationScore = 20;
  else if (pref === 'international')               locationScore = 15;
  else if (pref === 'national' && loc === 'local') locationScore = 10;
  else                                             locationScore = 5;

  // ── Total ──────────────────────────────────────────────────────────────
  const score = Math.min(100, Math.max(0, skillScore + expScore + locationScore));

  // ── Suggestions ────────────────────────────────────────────────────────
  const suggestions = [];

  missingSkills.forEach(skill => {
    const links = youtubeLinks[skill] || youtubeLinks[skill.toLowerCase()] || youtubeLinks.default || [];
    suggestions.push({
      skill,
      message: `Learn ${skill} to boost your match for "${job.title}"`,
      resources: (links || []).slice(0, 2),
    });
  });

  if (userExp < jobMin) {
    const gap = jobMin - userExp;
    suggestions.push({
      skill: 'Experience',
      message: `This role requires ${gap} more year${gap > 1 ? 's' : ''} of experience. Build your portfolio with freelance projects or contribute to open-source.`,
      resources: [],
    });
  }

  return {
    score,
    missingSkills,
    suggestions: suggestions.slice(0, 5),
  };
}

// ─── Batch match all jobs ────────────────────────────────────────────────────

export function matchAllJobs(userProfile, jobs) {
  return jobs
    .map(job => {
      const { score, missingSkills, suggestions } = matchJob(userProfile, job);
      return { ...job, matchScore: score, missingSkills, suggestions };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Match leads against a user profile ──────────────────────────────────────

export function matchLeads(userProfile, leads) {
  if (!userProfile || !leads) return [];

  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase().trim());

  return leads.map(lead => {
    // For leads, score is simpler — based on keyword overlap in name/company
    const text = `${lead.name} ${lead.company} ${lead.location}`.toLowerCase();
    let relevance = 0;

    userSkills.forEach(skill => {
      if (text.includes(skill)) relevance += 20;
    });

    // Bonus for having contact info
    if (lead.email) relevance += 10;
    if (lead.phone) relevance += 5;
    if (lead.website) relevance += 5;

    const matchScore = Math.min(100, relevance);
    return { ...lead, matchScore };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
