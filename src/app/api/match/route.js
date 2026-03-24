import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';
import { calculateMatch, getImprovementSuggestions } from '@/lib/matching';

export async function POST(request) {
  try {
    const { userProfile, jobId } = await request.json();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile is required' }, { status: 400 });
    }

    if (jobId) {
      // Match for a specific job
      const job = jobs.find(j => j.id === parseInt(jobId));
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const matchScore = calculateMatch(userProfile, job);
      const suggestions = matchScore < 70 ? getImprovementSuggestions(userProfile, job) : null;

      return NextResponse.json({
        job: { ...job, matchScore },
        suggestions,
      });
    }

    // Match all jobs
    const matchedJobs = jobs
      .map(job => ({
        ...job,
        matchScore: calculateMatch(userProfile, job),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ jobs: matchedJobs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate matches' }, { status: 500 });
  }
}
