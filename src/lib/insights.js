/**
 * Gigzora AI Insights Engine
 * Pure JavaScript market intelligence — no external AI APIs.
 */

// ─── High Demand Skills ──────────────────────────────────────────────────────

export function highDemandSkills(jobs) {
  const skillCount = {};

  jobs.forEach(job => {
    (job.skills || []).forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  return Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / jobs.length) * 100),
    }));
}

// ─── Underserved Opportunities ───────────────────────────────────────────────
// High-value jobs with low competition (high salary + low applicant count)

export function underservedOpportunities(jobs) {
  // Parse salary to numeric (rough estimate for comparison)
  function parseSalary(salaryStr) {
    if (!salaryStr) return 0;
    const nums = salaryStr.match(/[\d,]+/g);
    if (!nums || nums.length === 0) return 0;
    // Take the higher end of the range
    const values = nums.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
    return values.length > 0 ? Math.max(...values) : 0;
  }

  return jobs
    .map(job => ({
      ...job,
      salaryNum: parseSalary(job.salary),
      competitionRatio: (job.applicants || 999) + 1,
    }))
    .filter(job => job.salaryNum > 0)
    .sort((a, b) => {
      // Score = salary / competition — higher is better
      const scoreA = a.salaryNum / a.competitionRatio;
      const scoreB = b.salaryNum / b.competitionRatio;
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      salary: job.salary,
      applicants: job.applicants,
      demand: job.demand,
      opportunityScore: Math.round((job.salaryNum / job.competitionRatio) * 10) / 10,
    }));
}

// ─── Skill Gap Analysis ──────────────────────────────────────────────────────
// Compare user skills against market demand

export function skillGapAnalysis(userSkills, jobs) {
  const demanded = highDemandSkills(jobs);
  const userSet  = new Set((userSkills || []).map(s => s.toLowerCase().trim()));

  const gaps = demanded
    .filter(item => !userSet.has(item.skill.toLowerCase().trim()))
    .map(item => ({
      skill: item.skill,
      demandCount: item.count,
      demandPercentage: item.percentage,
      priority: item.percentage >= 30 ? 'high' : item.percentage >= 15 ? 'medium' : 'low',
    }));

  const strengths = demanded
    .filter(item => userSet.has(item.skill.toLowerCase().trim()))
    .map(item => ({
      skill: item.skill,
      demandCount: item.count,
      demandPercentage: item.percentage,
    }));

  return { gaps, strengths };
}

// ─── Market Summary ──────────────────────────────────────────────────────────

export function marketSummary(jobs) {
  const totalJobs     = jobs.length;
  const avgApplicants = totalJobs > 0
    ? Math.round(jobs.reduce((sum, j) => sum + (j.applicants || 0), 0) / totalJobs)
    : 0;

  const demandBreakdown = { high: 0, medium: 0, low: 0 };
  jobs.forEach(j => {
    const d = (j.demand || 'low').toLowerCase();
    demandBreakdown[d] = (demandBreakdown[d] || 0) + 1;
  });

  const locationBreakdown = {};
  jobs.forEach(j => {
    const loc = j.locationType || 'unknown';
    locationBreakdown[loc] = (locationBreakdown[loc] || 0) + 1;
  });

  return {
    totalJobs,
    avgApplicants,
    demandBreakdown,
    locationBreakdown,
  };
}
