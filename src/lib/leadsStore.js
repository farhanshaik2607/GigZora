/**
 * Leads Storage Utility
 * Reads/writes leads to data/leads.json with deduplication by email + company.
 */

const fs = require('fs');
const path = require('path');

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

function ensureDir() {
  const dir = path.dirname(LEADS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readLeads() {
  try {
    ensureDir();
    if (!fs.existsSync(LEADS_FILE)) return [];
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('[LeadsStore] Read error:', error.message);
    return [];
  }
}

function writeLeads(leads) {
  try {
    ensureDir();
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (error) {
    console.error('[LeadsStore] Write error:', error.message);
  }
}

/**
 * Generates a dedup key from email + company (lowercased).
 */
function dedupKey(lead) {
  const email = (lead.email || '').toLowerCase().trim();
  const company = (lead.company || '').toLowerCase().trim();
  return `${email}::${company}`;
}

/**
 * Appends new leads, deduplicating by email + company.
 * Returns the full merged list.
 */
function appendLeads(newLeads) {
  const existing = readLeads();
  const seen = new Set(existing.map(dedupKey));
  let addedCount = 0;

  for (const lead of newLeads) {
    const key = dedupKey(lead);
    // Allow leads with no email and company='N/A' (they are unique by id)
    if (key === '::n/a' || key === '::') {
      existing.push(lead);
      addedCount++;
    } else if (!seen.has(key)) {
      seen.add(key);
      existing.push(lead);
      addedCount++;
    }
  }

  writeLeads(existing);
  console.log(`[LeadsStore] Added ${addedCount} new leads (total: ${existing.length})`);
  return existing;
}

module.exports = { readLeads, writeLeads, appendLeads };
