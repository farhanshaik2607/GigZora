import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const location = searchParams.get('location') || '';
    const skills = searchParams.get('skills') || '';
    const type = searchParams.get('type') || '';

    let filtered = [...jobs];

    if (search) {
      filtered = filtered.filter(
        job =>
          job.title.toLowerCase().includes(search) ||
          job.company.toLowerCase().includes(search) ||
          job.description.toLowerCase().includes(search) ||
          job.skills.some(s => s.toLowerCase().includes(search))
      );
    }

    if (location) {
      filtered = filtered.filter(job => job.locationType === location);
    }

    if (skills) {
      const skillList = skills.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(job =>
        job.skills.some(s => skillList.includes(s.toLowerCase()))
      );
    }

    if (type) {
      filtered = filtered.filter(job => job.type.toLowerCase() === type.toLowerCase());
    }

    return NextResponse.json({ jobs: filtered, total: filtered.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
