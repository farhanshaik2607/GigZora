/**
 * GigZora Lead Scraper
 * Multi-source lead scraping engine using axios + cheerio.
 * Sources: google_maps, google_places, yelp, jooble, adzuna
 */

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

// ─── User-Agent Rotation ─────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  const ms = 1000 + Math.random() * 1000; // 1–2 sec
  return delay(ms);
}

// ─── Helper: Generate unique ID ──────────────────────────────────────────────
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// ─── Helper: Clean text ──────────────────────────────────────────────────────
function clean(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

// ─── Helper: Extract email from text ─────────────────────────────────────────
function extractEmails(text) {
  if (!text) return [];
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(re) || [])];
}

// ─── Helper: Extract phone from text ─────────────────────────────────────────
function extractPhones(text) {
  if (!text) return [];
  const re = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const matches = text.match(re) || [];
  return [...new Set(matches.map((p) => p.trim()).filter((p) => p.length >= 7))];
}

// ─── Normalize lead format ───────────────────────────────────────────────────
function normalizeLead(raw, source) {
  return {
    id: generateId(),
    name: clean(raw.name) || 'N/A',
    company: clean(raw.company) || clean(raw.name) || 'N/A',
    email: raw.email || '',
    phone: raw.phone || '',
    location: clean(raw.location) || '',
    website: raw.website || '',
    source: source,
    scrapedAt: new Date().toISOString(),
  };
}

// ─── Deep scrape: visit a URL to extract emails, phones, and links ───────────
async function deepScrapeContact(url) {
  if (!url || !url.startsWith('http')) return {};
  // Skip non-business URLs
  if (url.includes('google.com') || url.includes('yelp.com') || url.includes('facebook.com')) return {};
  
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': getRandomUA() },
      timeout: 8000,
      maxRedirects: 3,
    });

    const $ = cheerio.load(data);
    const pageText = $('body').text() || '';
    const pageHtml = data || '';

    // Extract emails from page text and mailto links
    const emails = new Set(extractEmails(pageText));
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const email = href.replace('mailto:', '').split('?')[0].trim();
      if (email && email.includes('@')) emails.add(email);
    });

    // Extract phone numbers from page text and tel links
    const phones = new Set(extractPhones(pageText));
    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const phone = href.replace('tel:', '').trim();
      if (phone) phones.add(phone);
    });

    // Extract website URL from common patterns
    let website = url;
    const canonical = $('link[rel="canonical"]').attr('href');
    if (canonical && canonical.startsWith('http')) website = canonical;

    // Extract social links
    const socials = [];
    $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="facebook.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) socials.push(href);
    });

    return {
      emails: [...emails].filter(e => !e.includes('example') && !e.includes('test')),
      phones: [...phones],
      website,
      socials: [...new Set(socials)].slice(0, 3),
    };
  } catch {
    return {};
  }
}

// ─── Enrich leads with deep-scraped contact data ─────────────────────────────
async function enrichLeads(leads) {
  const enriched = [];
  for (const lead of leads) {
    // Only deep scrape if we're missing email or if we have a website
    if ((!lead.email || !lead.phone) && lead.website) {
      await delay(500); // Rate limit
      const contact = await deepScrapeContact(lead.website);
      if (contact.emails && contact.emails.length > 0 && !lead.email) {
        lead.email = contact.emails[0];
      }
      if (contact.phones && contact.phones.length > 0 && !lead.phone) {
        lead.phone = contact.phones[0];
      }
      if (contact.website) {
        lead.website = contact.website;
      }
    }
    enriched.push(lead);
  }
  return enriched;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE 1: Google Maps (via web scraping search results)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeGoogleMaps(query) {
  const leads = [];

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' site:google.com/maps')}&num=20`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': getRandomUA() },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // Parse search results for business info
    $('div.g, div[data-hveid]').each((_, el) => {
      try {
        const titleEl = $(el).find('h3').first();
        const snippetEl = $(el).find('span.st, div[data-sncf], div.VwiC3b, div[style*="-webkit-line-clamp"]').first();
        const linkEl = $(el).find('a[href^="http"]').first();

        const name = clean(titleEl.text());
        const snippet = clean(snippetEl.text());
        const link = linkEl.attr('href') || '';

        if (!name || name.length < 2) return;

        const emails = extractEmails(snippet);
        const phones = extractPhones(snippet);

        // Try to extract location from snippet
        const locationMatch = snippet.match(/(?:in|at|near)\s+([A-Z][a-zA-Z\s,]+)/);
        const location = locationMatch ? locationMatch[1].trim() : '';

        leads.push(
          normalizeLead(
            {
              name: name.replace(/ - Google Maps$/, '').replace(/ · .*/, ''),
              company: name.replace(/ - Google Maps$/, ''),
              email: emails[0] || '',
              phone: phones[0] || '',
              location: location,
              website: link,
            },
            'google_maps'
          )
        );
      } catch (e) {
        // Skip malformed results
      }
    });

    // Fallback: also try a direct Maps-style search
    if (leads.length < 5) {
      await randomDelay();
      const mapsUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl&num=20`;
      const { data: mapsData } = await axios.get(mapsUrl, {
        headers: { 'User-Agent': getRandomUA() },
        timeout: 15000,
      });

      const $m = cheerio.load(mapsData);

      $m('div.rllt__details, div.VkpGBb').each((_, el) => {
        try {
          const name = clean($m(el).find('span.OSrXXb, div.dbg0pd').first().text());
          const addressEl = $m(el).find('div.rllt__wrapped, span[class*="Addr"]').first();
          const address = clean(addressEl.text());
          const phoneEl = $m(el).find('span.z3HNkc, span[class*="phone"]').first();
          const rawPhone = clean(phoneEl.text());

          if (name && name.length > 1) {
            leads.push(
              normalizeLead(
                {
                  name,
                  company: name,
                  email: '',
                  phone: rawPhone,
                  location: address,
                  website: '',
                },
                'google_maps'
              )
            );
          }
        } catch (e) {
          // skip
        }
      });
    }
  } catch (error) {
    console.error('[GoogleMaps] Scraping error:', error.message);
  }

  return leads;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE 2: Yelp (HTML scraping)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeYelp(query) {
  const leads = [];

  try {
    // Parse query for location
    const parts = query.match(/(.+?)\s+in\s+(.+)/i);
    const searchTerm = parts ? parts[1].trim() : query;
    const location = parts ? parts[2].trim() : 'United States';

    const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(searchTerm)}&find_loc=${encodeURIComponent(location)}`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUA(),
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // Yelp renders business cards in various selectors
    $('div[class*="businessName"], div[class*="container__09f24"], li[class*="border-color"]').each((_, el) => {
      try {
        const nameEl = $(el).find('a[class*="businessName"], h3 a, a[href*="/biz/"]').first();
        const name = clean(nameEl.text());
        const bizUrl = nameEl.attr('href') || '';

        const addressEl = $(el).find('address, span[class*="secondaryAttributes"], p[class*="address"]').first();
        const address = clean(addressEl.text());

        const phoneEl = $(el).find('p[class*="phone"], span[class*="phone"]').first();
        const phone = clean(phoneEl.text());

        if (name && name.length > 1) {
          leads.push(
            normalizeLead(
              {
                name,
                company: name,
                email: '',
                phone: phone,
                location: address || location,
                website: bizUrl.startsWith('http') ? bizUrl : `https://www.yelp.com${bizUrl}`,
              },
              'yelp'
            )
          );
        }
      } catch (e) {
        // skip
      }
    });

    // Fallback: try JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        const items = Array.isArray(json) ? json : json.itemListElement ? json.itemListElement : [json];
        items.forEach((item) => {
          const biz = item.item || item;
          if (biz.name && biz['@type'] === 'LocalBusiness') {
            const addr = biz.address || {};
            leads.push(
              normalizeLead(
                {
                  name: biz.name,
                  company: biz.name,
                  email: '',
                  phone: biz.telephone || '',
                  location: [addr.streetAddress, addr.addressLocality, addr.addressRegion].filter(Boolean).join(', '),
                  website: biz.url || '',
                },
                'yelp'
              )
            );
          }
        });
      } catch (e) {
        // skip
      }
    });
  } catch (error) {
    console.error('[Yelp] Scraping error:', error.message);
  }

  return leads;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE 3: Jooble (free API)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeJooble(query) {
  const leads = [];

  try {
    // Jooble free API endpoint
    const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || '4a5e32f7-98b0-4a3e-a93c-3f0c25a84296';

    const parts = query.match(/(.+?)\s+in\s+(.+)/i);
    const keywords = parts ? parts[1].trim() : query;
    const location = parts ? parts[2].trim() : '';

    const { data } = await axios.post(
      `https://jooble.org/api/${JOOBLE_API_KEY}`,
      {
        keywords: keywords,
        location: location,
        page: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (data && data.jobs && Array.isArray(data.jobs)) {
      for (const job of data.jobs.slice(0, 20)) {
        await delay(100); // minimal delay between processing

        const snippet = job.snippet || '';
        const emails = extractEmails(snippet + ' ' + (job.company || ''));

        leads.push(
          normalizeLead(
            {
              name: job.title || 'N/A',
              company: job.company || 'N/A',
              email: emails[0] || '',
              phone: '',
              location: job.location || location,
              website: job.link || '',
            },
            'jooble'
          )
        );
      }
    }
  } catch (error) {
    console.error('[Jooble] API error:', error.message);
  }

  return leads;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE 4: Adzuna (free API)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeAdzuna(query) {
  const leads = [];

  try {
    const APP_ID = process.env.ADZUNA_APP_ID || 'a3c22f15';
    const APP_KEY = process.env.ADZUNA_APP_KEY || '3f4d8a1b2c5e6f7a8b9c0d1e2f3a4b5c';

    const parts = query.match(/(.+?)\s+in\s+(.+)/i);
    const keywords = parts ? parts[1].trim() : query;
    const locationStr = parts ? parts[2].trim() : '';

    // Default to India (in) — change country code as needed
    const country = 'in';

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${encodeURIComponent(keywords)}&where=${encodeURIComponent(locationStr)}&content-type=application/json`;

    const { data } = await axios.get(url, {
      headers: { 'User-Agent': getRandomUA() },
      timeout: 15000,
    });

    if (data && data.results && Array.isArray(data.results)) {
      for (const job of data.results) {
        const desc = job.description || '';
        const emails = extractEmails(desc);
        const phones = extractPhones(desc);

        leads.push(
          normalizeLead(
            {
              name: job.title || 'N/A',
              company: job.company?.display_name || 'N/A',
              email: emails[0] || '',
              phone: phones[0] || '',
              location: job.location?.display_name || locationStr,
              website: job.redirect_url || '',
            },
            'adzuna'
          )
        );
      }
    }
  } catch (error) {
    console.error('[Adzuna] API error:', error.message);
  }

  return leads;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE 5: Google Places API (Text Search)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeGooglePlaces(query) {
  const leads = [];
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY || API_KEY === 'your-google-places-key') {
    console.warn('[GooglePlaces] No API key configured. Skipping.');
    return [];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    const { data } = await axios.get(url, { timeout: 10000 });

    if (data.status === 'OK' && data.results) {
      for (const place of data.results.slice(0, 20)) {
        // Optionally fetch details for phone/website
        let phone = '';
        let website = '';
        
        if (place.place_id) {
          try {
            const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&key=${API_KEY}`;
            const { data: detail } = await axios.get(detailUrl, { timeout: 5000 });
            phone = detail.result?.formatted_phone_number || '';
            website = detail.result?.website || '';
          } catch {
            // skip detail fetch
          }
          await delay(200); // Respect rate limits
        }

        leads.push(
          normalizeLead({
            name: place.name || 'N/A',
            company: place.name || 'N/A',
            email: '',
            phone,
            location: place.formatted_address || '',
            website,
          }, 'google_places')
        );
      }
    }
  } catch (error) {
    console.error('[GooglePlaces] API error:', error.message);
  }

  return leads;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main export: scrapeLeads(query, source)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeLeads(query, source) {
  if (!query || !source) return [];

  const scrapers = {
    google_maps: scrapeGoogleMaps,
    google_places: scrapeGooglePlaces,
    yelp: scrapeYelp,
    jooble: scrapeJooble,
    adzuna: scrapeAdzuna,
  };

  const scraperFn = scrapers[source];
  if (!scraperFn) {
    console.error(`[Scraper] Unknown source: ${source}`);
    return [];
  }

  try {
    console.log(`[Scraper] Starting ${source} scrape for: "${query}"`);
    let leads = await scraperFn(query);
    console.log(`[Scraper] Found ${leads.length} leads from ${source}`);
    
    // Deep scrape to enrich leads with emails and websites
    if (leads.length > 0) {
      console.log(`[Scraper] Enriching ${leads.length} leads with contact data...`);
      leads = await enrichLeads(leads);
      console.log(`[Scraper] Enrichment complete.`);
    }
    
    return leads;
  } catch (error) {
    console.error(`[Scraper] Fatal error for ${source}:`, error.message);
    return [];
  }
}

module.exports = { scrapeLeads };
