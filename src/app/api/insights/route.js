import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';
import { highDemandSkills, underservedOpportunities, skillGapAnalysis, marketSummary } from '@/lib/insights';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userSkillsParam  = searchParams.get('skills'); // comma-separated

    const demanded     = highDemandSkills(jobs);
    const opportunities = underservedOpportunities(jobs);
    const summary      = marketSummary(jobs);

    const result = {
      highDemandSkills: demanded,
      underservedOpportunities: opportunities,
      ...summary,
    };

    // If user skills are provided, include gap analysis
    if (userSkillsParam) {
      const userSkills = userSkillsParam.split(',').map(s => s.trim()).filter(Boolean);
      result.skillGap  = skillGapAnalysis(userSkills, jobs);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /insights] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
