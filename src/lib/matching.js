import youtubeLinks from '@/data/youtubeLinks.json';

/**
 * AI Matching Algorithm
 * Calculates a match percentage (0-100) based on:
 * - Skill overlap (50% weight)
 * - Experience level (30% weight)
 * - Location preference (20% weight)
 */
export function calculateMatch(userProfile, job) {
  if (!userProfile || !job) return 0;

  const skillScore = calculateSkillScore(userProfile.skills || [], job.skills || []);
  const experienceScore = calculateExperienceScore(userProfile.experience || 0, job.experienceMin || 0, job.experienceMax || 10);
  const locationScore = calculateLocationScore(userProfile.locationPreference || 'any', job.locationType || 'international');

  const total = Math.round(skillScore * 0.5 + experienceScore * 0.3 + locationScore * 0.2);
  return Math.min(100, Math.max(0, total));
}

function calculateSkillScore(userSkills, jobSkills) {
  if (jobSkills.length === 0) return 50;
  const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map(s => s.toLowerCase().trim());
  const matching = normalizedJob.filter(s => normalizedUser.includes(s));
  return Math.round((matching.length / normalizedJob.length) * 100);
}

function calculateExperienceScore(userExp, minExp, maxExp) {
  if (userExp >= minExp && userExp <= maxExp) return 100;
  if (userExp >= minExp - 1 && userExp <= maxExp + 2) return 70;
  if (userExp >= minExp - 2) return 40;
  return 15;
}

function calculateLocationScore(preference, jobLocation) {
  if (preference === 'any') return 100;
  if (preference === jobLocation) return 100;
  if (preference === 'national' && jobLocation === 'local') return 80;
  if (preference === 'international') return 90;
  return 30;
}

/**
 * Get missing skills from a job
 */
export function getMissingSkills(userSkills, jobSkills) {
  const normalizedUser = (userSkills || []).map(s => s.toLowerCase().trim());
  return (jobSkills || []).filter(s => !normalizedUser.includes(s.toLowerCase().trim()));
}

/**
 * Get improvement suggestions for a user/job pair
 */
export function getImprovementSuggestions(userProfile, job) {
  const matchScore = calculateMatch(userProfile, job);
  if (matchScore >= 70) return null;

  const missingSkills = getMissingSkills(userProfile.skills || [], job.skills || []);
  const suggestions = [];

  missingSkills.forEach(skill => {
    const links = youtubeLinks[skill] || youtubeLinks.default;
    suggestions.push({
      skill,
      message: `Learn ${skill} to improve your match for this role`,
      resources: links.slice(0, 2),
    });
  });

  const expGap = (job.experienceMin || 0) - (userProfile.experience || 0);
  if (expGap > 0) {
    suggestions.push({
      skill: 'Experience',
      message: `This role requires ${expGap} more year${expGap > 1 ? 's' : ''} of experience. Consider freelancing or contributing to open source to build your portfolio.`,
      resources: [],
    });
  }

  return {
    matchScore,
    missingSkills,
    suggestions: suggestions.slice(0, 5),
  };
}

/**
 * Get high-demand skills from job data
 */
export function getHighDemandSkills(jobs) {
  const skillCount = {};
  jobs.forEach(job => {
    (job.skills || []).forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  return Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count, percentage: Math.round((count / jobs.length) * 100) }));
}

/**
 * Get underserved opportunities (high demand + few applicants)
 */
export function getUnderservedOpportunities(jobs) {
  return jobs
    .filter(job => job.demand === 'high' && job.applicants < 30)
    .sort((a, b) => a.applicants - b.applicants)
    .slice(0, 5)
    .map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      applicants: job.applicants,
      demand: job.demand,
    }));
}
