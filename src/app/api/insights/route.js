import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';
import { getHighDemandSkills, getUnderservedOpportunities } from '@/lib/matching';

export async function GET() {
  try {
    const highDemandSkills = getHighDemandSkills(jobs);
    const underservedOpportunities = getUnderservedOpportunities(jobs);

    return NextResponse.json({
      highDemandSkills,
      underservedOpportunities,
      totalJobs: jobs.length,
      avgApplicants: Math.round(jobs.reduce((sum, j) => sum + j.applicants, 0) / jobs.length),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
