import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, source } = body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "query" field.' },
        { status: 400 }
      );
    }

    const validSources = ['google_maps', 'google_places', 'yelp', 'jooble', 'adzuna'];
    if (!source || !validSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      );
    }

    // Dynamic import for CommonJS modules
    const { scrapeLeads } = require('@/lib/scraper');
    const { appendLeads } = require('@/lib/leadsStore');

    // Scrape leads
    const leads = await scrapeLeads(query.trim(), source);

    // Persist to data/leads.json (with deduplication)
    if (leads.length > 0) {
      appendLeads(leads);
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      query: query.trim(),
      source,
      leads,
    });
  } catch (error) {
    console.error('[API /scrape] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { readLeads } = require('@/lib/leadsStore');
    const leads = readLeads();

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('[API /scrape GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
