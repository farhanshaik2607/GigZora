import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';
import { matchJob, matchAllJobs } from '@/lib/matcher';

export async function POST(request) {
  try {
    const { userProfile, jobId } = await request.json();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile is required' }, { status: 400 });
    }

    if (jobId) {
      // Match for a specific job
      const job = jobs.find(j => String(j.id) === String(jobId));
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const { score, missingSkills, suggestions } = matchJob(userProfile, job);

      return NextResponse.json({
        job: { ...job, matchScore: score },
        missingSkills,
        suggestions: score < 70 ? suggestions : [],
      });
    }

    // Match all jobs
    const matchedJobs = matchAllJobs(userProfile, jobs);

    return NextResponse.json({ jobs: matchedJobs });
  } catch (error) {
    console.error('[API /match] Error:', error);
    return NextResponse.json({ error: 'Failed to calculate matches' }, { status: 500 });
  }
}
