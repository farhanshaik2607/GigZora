/**
 * Gigzora AI Chatbot
 * Keyword-based intent detection — no external AI APIs.
 * 10 intents: legal, pricing, invoice, contract, startup, client, proposal, tax, marketing, cold_email
 */

// ─── Intent → Keyword Mapping ────────────────────────────────────────────────

const INTENTS = {
  legal: {
    keywords: ['legal', 'law', 'agreement', 'ip', 'intellectual property', 'nda', 'terms', 'copyright', 'license', 'liability', 'dispute'],
    responses: [
      "📜 **Freelance Legal Essentials:**\n\n1. Always use a written contract — even for small gigs\n2. Include an NDA if you'll handle sensitive data\n3. Define IP ownership clearly (work-for-hire vs. licensed)\n4. Add a cancellation/termination clause\n5. Specify dispute resolution (arbitration vs. court)\n\n💡 Free templates: Bonsai, LegalZoom, AND CO (now Fiverr Workspace).",
      "⚖️ Protect yourself legally:\n\n• **Copyright** — your work belongs to you until you transfer it in writing\n• **Liability caps** — never accept unlimited liability\n• **Payment terms** — specify net-15/30 with late fees\n• **Kill fees** — charge 25-50% if a project is cancelled mid-way\n\nFor complex deals, budget $200-500 for a lawyer review — it's worth it.",
      "🔒 When working with international clients, check:\n\n• Tax treaties between your countries\n• Data protection laws (GDPR if EU clients)\n• Which jurisdiction governs the contract\n• Payment methods that protect both parties (escrow services)\n\nPro tip: Platforms like Deel and Remote.com simplify international freelance contracts."
    ]
  },
  pricing: {
    keywords: ['price', 'pricing', 'rate', 'charge', 'cost', 'hourly', 'salary', 'money', 'earning', 'income', 'revenue', 'billing', 'fee', 'budget'],
    responses: [
      "💰 **Freelance Pricing Guide:**\n\n| Level | Hourly Rate |\n|-------|------------|\n| Junior | $25–$50/hr |\n| Mid-level | $50–$100/hr |\n| Senior | $100–$200+/hr |\n\n🎯 Top tip: Don't just charge for hours. Charge for the *value* you deliver. A logo that increases brand recognition is worth more than 'X hours of design work'.",
      "📊 **How to set your rates:**\n\n1. Calculate your minimum: (Monthly expenses × 1.3) ÷ billable hours\n2. Research market rates on Glassdoor, Upwork, Toptal\n3. Add 25-40% for non-billable time (admin, marketing, learning)\n4. Consider value-based pricing for high-impact projects\n\n🚀 Pro tip: Raise your rates 10-15% every 6 months as you gain experience.",
      "💡 **Pricing strategies that work:**\n\n• **Project-based** — best for defined deliverables (websites, logos)\n• **Retainer** — monthly fee for ongoing work (ideal for stability)\n• **Value-based** — price tied to client ROI (highest earning potential)\n• **Day rate** — hourly × 8, good for on-site consulting\n\nAlways provide 3 pricing tiers (Basic/Standard/Premium) to give clients choice."
    ]
  },
  invoice: {
    keywords: ['invoice', 'invoicing', 'payment', 'bill', 'receipt', 'pay me', 'unpaid', 'overdue', 'accounts receivable'],
    responses: [
      "🧾 **Invoicing Best Practices:**\n\n1. Send invoices immediately upon delivery\n2. Use Net-15 terms (not Net-30 — you're not a bank)\n3. Include late payment fees (1.5-2% per month)\n4. Accept multiple payment methods (Stripe, PayPal, bank transfer)\n\nFree tools: Wave, Zoho Invoice, PayPal Invoicing.\n\n⚡ Pro tip: Request 50% upfront for new clients.",
      "💸 **Dealing with late payments:**\n\n1. Send a polite reminder on the due date\n2. Follow up 3 days later with a firmer tone\n3. At 14 days overdue, pause all work\n4. At 30 days, send a formal demand letter\n5. Consider a collections agency for large amounts\n\nPrevention > cure: Always get a deposit upfront and use milestone payments.",
      "📝 **Your invoice should include:**\n\n• Your business name & contact info\n• Client's name & address\n• Unique invoice number\n• Itemized list of services\n• Hourly rate or project fee\n• Payment due date\n• Accepted payment methods\n• Late fee policy\n\nPro tip: Add a 'Thank you for your business!' note — it's the little things."
    ]
  },
  contract: {
    keywords: ['contract', 'scope', 'deliverable', 'milestone', 'sow', 'statement of work', 'scope creep'],
    responses: [
      "📋 **Essential Contract Clauses:**\n\n1. **Scope of Work** — be extremely specific\n2. **Timeline** — milestones with dates\n3. **Payment Schedule** — amounts tied to milestones\n4. **Revision Policy** — e.g., '2 rounds included'\n5. **IP Transfer** — when ownership transfers\n6. **Termination** — exit conditions for both sides\n7. **Confidentiality** — NDA provisions\n\n🛡️ A good contract protects BOTH parties.",
      "🚫 **How to prevent scope creep:**\n\n1. Document everything before starting\n2. Use a Change Request form for additions\n3. Price changes separately (quote within 24 hours)\n4. Set clear revision limits in the contract\n5. Communicate weekly on progress vs. scope\n\nRemember: 'That's outside our agreed scope, but I'd be happy to quote it as an add-on' is a perfectly professional response.",
      "✅ **Contract checklist:**\n\n- [ ] Client and freelancer names\n- [ ] Project description & deliverables\n- [ ] Timeline with milestones\n- [ ] Payment terms & schedule\n- [ ] Revision/feedback rounds\n- [ ] Kill fee / cancellation policy\n- [ ] IP ownership clause\n- [ ] Confidentiality agreement\n- [ ] Governing jurisdiction\n- [ ] Signatures from both parties"
    ]
  },
  startup: {
    keywords: ['startup', 'start up', 'business', 'launch', 'mvp', 'funding', 'investor', 'venture', 'bootstrap', 'company', 'founder', 'co-founder'],
    responses: [
      "🚀 **Starting Your Freelance Business:**\n\n1. **Validate** — Test your services with 3-5 paying clients\n2. **Niche down** — Specialists earn 2-3x more than generalists\n3. **Build online** — Portfolio site + LinkedIn + one social platform\n4. **Price right** — Start competitive, raise as you get testimonials\n5. **Systemize** — Templates, contracts, invoicing from day one\n\n📈 Most successful freelancers reach full-time income within 6-12 months.",
      "💡 **Freelance to Agency Framework:**\n\n• **Solo** ($0-$5K/mo) — Do everything yourself\n• **Contractor** ($5-15K/mo) — Subcontract overflow work\n• **Studio** ($15-50K/mo) — Small team, defined processes\n• **Agency** ($50K+/mo) — Full team, you manage & sell\n\nKey shift: Stop selling your time, start selling outcomes.",
      "🎯 **MVP approach for side projects:**\n\n1. Identify ONE core problem to solve\n2. Build the simplest solution (days, not months)\n3. Launch on Product Hunt, Indie Hackers, Reddit\n4. Get 10 paying users before adding features\n5. Iterate based on real feedback, not assumptions\n\nTools: Vercel (hosting), Stripe (payments), Notion (docs), Crisp (support)."
    ]
  },
  client: {
    keywords: ['client', 'customer', 'prospect', 'lead', 'acquire', 'find work', 'get clients', 'outreach', 'referral'],
    responses: [
      "🤝 **Client Acquisition Strategies:**\n\n1. **Referrals** — Ask every happy client for 2 introductions\n2. **LinkedIn** — Post valuable content + engage with prospects\n3. **Upwork/Fiverr** — Great for building initial portfolio\n4. **Cold outreach** — Personalized emails to ideal clients\n5. **Communities** — Slack groups, Discord servers, Reddit\n\n📊 80% of freelancers get most work from referrals after year one.",
      "🎯 **Finding your ideal client:**\n\n• Define your Ideal Customer Profile (ICP)\n• Where do they hang out online?\n• What problems are they posting about?\n• What budget range do they typically have?\n\nThen go where they are and provide genuine value before pitching.",
      "⭐ **Client retention tips:**\n\n1. Over-deliver on the first project\n2. Communicate proactively (weekly updates)\n3. Meet every deadline (under-promise, over-deliver)\n4. Suggest improvements they haven't thought of\n5. Make yourself indispensable with ongoing value\n\nRetaining a client costs 5x less than acquiring a new one."
    ]
  },
  proposal: {
    keywords: ['proposal', 'pitch', 'bid', 'quote', 'estimate', 'cover letter', 'application'],
    responses: [
      "📝 **Winning Proposal Structure:**\n\n1. **Hook** — Show you understand their problem\n2. **Proof** — Relevant experience/case studies\n3. **Plan** — Your approach in 3-5 steps\n4. **Timeline** — Realistic milestones\n5. **Investment** — 3 pricing tiers\n6. **CTA** — 'Let's schedule a 15-min call'\n\n🎯 Personalization beats everything. Reference specific details from their job post.",
      "✍️ **Proposal mistakes to avoid:**\n\n❌ Generic copy-paste templates\n❌ Leading with 'I' instead of 'you'\n❌ Listing skills instead of outcomes\n❌ No social proof or examples\n❌ One flat price with no options\n\n✅ Instead: Lead with their pain point → show you've solved it before → propose how you'll solve it for them.",
      "🏆 **Stand out from 50+ proposals:**\n\n1. Record a 60-second Loom video addressing their project\n2. Include a mini-audit or quick mockup (show, don't tell)\n3. Reference a specific result: 'I increased X client's revenue 40%'\n4. Be specific about your process and timeline\n5. Follow up within 48 hours if no response\n\nTop 5% of freelancers close 1 in 3 proposals."
    ]
  },
  tax: {
    keywords: ['tax', 'taxes', 'deduction', 'write off', 'accountant', 'gst', 'vat', 'self-employment', '1099', 'quarterly'],
    responses: [
      "🧮 **Freelance Tax Essentials:**\n\n1. Set aside 25-30% of income for taxes\n2. Pay quarterly estimated taxes to avoid penalties\n3. Track every business expense (apps: Expensify, QuickBooks)\n4. Common deductions: home office, software, equipment, internet\n5. Consider forming an LLC for liability protection + tax benefits\n\n⚠️ Get a CPA — the $300-500/year fee pays for itself in saved taxes.",
      "📋 **Common Freelance Tax Deductions:**\n\n• Home office (dedicated space)\n• Computer, monitor, desk, chair\n• Software subscriptions (Adobe, Figma, etc.)\n• Internet & phone bills (business %)\n• Professional development courses\n• Business travel & meals (50%)\n• Health insurance premiums\n• Marketing & advertising costs\n\nKeep receipts for everything. Use an app to scan and categorize them.",
      "🌍 **International freelancer tax tips:**\n\n• Check tax treaties between your country and clients' countries\n• Register for GST/VAT if required in your jurisdiction\n• Use transfer pricing if you have an overseas entity\n• Keep records in both currencies\n• Consider a tax advisor specializing in international freelancers\n\nPlatforms like Deel, Payoneer, and Wise simplify cross-border payments."
    ]
  },
  marketing: {
    keywords: ['marketing', 'brand', 'branding', 'social media', 'content', 'seo', 'promote', 'visibility', 'audience', 'personal brand'],
    responses: [
      "📣 **Personal Brand Building for Freelancers:**\n\n1. **Pick a niche** — 'React developer for SaaS startups' > 'web developer'\n2. **Create content** — Weekly posts on LinkedIn/Twitter about your expertise\n3. **Build a portfolio** — 3-5 case studies with measurable results\n4. **Network online** — Engage genuinely in industry communities\n5. **Be consistent** — Show up regularly for 6+ months\n\n🎯 The goal: When someone needs X, your name comes to mind first.",
      "🔍 **SEO for Freelancers:**\n\n• Optimize your portfolio site for '[your skill] freelancer [your city]'\n• Write blog posts answering common client questions\n• Get listed on Google Business, Clutch, and industry directories\n• Ask clients for Google/LinkedIn reviews\n• Guest post on industry blogs for backlinks\n\nOrganic traffic = free leads while you sleep.",
      "📱 **Content strategy that works:**\n\n• **LinkedIn** — Long-form posts about lessons learned, case studies\n• **Twitter/X** — Quick tips, threads, engage with industry leaders\n• **YouTube** — Tutorials, behind-the-scenes, project walkthroughs\n• **Blog** — SEO-focused articles solving client problems\n\nThe 80/20 rule: Focus on the 1-2 platforms where your clients actually are."
    ]
  },
  cold_email: {
    keywords: ['cold email', 'outreach', 'follow up', 'email template', 'pitch email', 'prospecting', 'reach out'],
    responses: [
      "📧 **Cold Email Framework (AIDA):**\n\n**Attention** — Personalized first line (reference their work)\n**Interest** — Share a relevant result you achieved\n**Desire** — Briefly explain how you can help them\n**Action** — Simple CTA ('Worth a quick chat?')\n\n📊 Keep it under 100 words. Personalized emails get 3x more replies than templates.",
      "✉️ **Cold Email Template:**\n\nSubject: Quick idea for [Company Name]\n\nHi [Name],\n\nI noticed [specific observation about their business]. I recently helped [similar company] achieve [specific result].\n\nI have a few ideas that could help [Company Name] with [specific area]. Would you be open to a quick 15-minute chat this week?\n\nBest,\n[Your Name]\n\n⚡ Follow up 3 days later. 80% of deals close after the 5th follow-up.",
      "🎯 **Cold Outreach Best Practices:**\n\n1. Research each prospect for 5 minutes before writing\n2. Reference something specific about their company\n3. Lead with value, not with yourself\n4. Keep the email under 100 words\n5. Send between 8-10 AM on Tue-Thu\n6. Follow up 3x (day 3, day 7, day 14)\n7. Track opens and clicks with tools like Mailtrack\n\n📈 Expect 5-15% reply rate with good targeting and personalization."
    ]
  }
};

// ─── Greeting detection ──────────────────────────────────────────────────────

const GREETINGS = ['hello', 'hi', 'hey', 'greetings', 'sup', 'hola', 'good morning', 'good evening', 'good afternoon', 'yo', 'howdy'];

const GREETING_RESPONSES = [
  "Hey there! 👋 I'm your GigZora AI Assistant. I can help with:\n\n• 💰 Pricing strategies\n• 📜 Legal & contracts\n• 🧾 Invoicing tips\n• 🚀 Startup guidance\n• 🤝 Client acquisition\n• 📧 Cold email templates\n• 🧮 Tax advice\n• 📣 Marketing & branding\n• 📝 Winning proposals\n\nWhat would you like to know?",
  "Welcome to GigZora! 🚀 I'm your freelance business advisor. Ask me anything about pricing, legal matters, finding clients, taxes, or growing your freelance career!",
  "Hi! 👋 Great to see you here. I specialize in freelance business advice — from writing killer proposals to managing taxes. What's on your mind today?"
];

// ─── Fallback responses ──────────────────────────────────────────────────────

const FALLBACK_RESPONSES = [
  "I'm GigZora's AI Assistant! I specialize in freelance business advice. Try asking about:\n\n• 💰 'How should I price my services?'\n• 📜 'What legal protections do I need?'\n• 🤝 'How do I find clients?'\n• 📧 'Help me write a cold email'\n• 🧮 'Tax tips for freelancers'\n• 📝 'How to write a winning proposal'",
  "I can help with a wide range of freelance topics! Try asking about pricing, contracts, invoicing, taxes, marketing, cold emails, or finding clients. What interests you?",
  "That's a great question! While I focus on freelancing advice (pricing, legal, clients, proposals, marketing, taxes), feel free to ask me anything in those areas. I'm here to help! 🚀"
];

// ─── Main chatbot function ───────────────────────────────────────────────────

export function getChatResponse(message) {
  if (!message || typeof message !== 'string') {
    return FALLBACK_RESPONSES[0];
  }

  const msg = message.toLowerCase().trim();

  // Check greetings first
  if (GREETINGS.some(g => msg.includes(g)) && msg.length < 30) {
    return GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
  }

  // Score each intent by keyword matches
  let bestIntent = null;
  let bestScore  = 0;

  for (const [intent, data] of Object.entries(INTENTS)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (msg.includes(kw)) {
        score += kw.includes(' ') ? 3 : 1; // multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore  = score;
      bestIntent = intent;
    }
  }

  if (bestIntent && bestScore > 0) {
    const responses = INTENTS[bestIntent].responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

// ─── Detect intent (useful for analytics) ────────────────────────────────────

export function detectIntent(message) {
  if (!message) return 'unknown';
  const msg = message.toLowerCase().trim();

  if (GREETINGS.some(g => msg.includes(g)) && msg.length < 30) return 'greeting';

  let bestIntent = 'general';
  let bestScore  = 0;

  for (const [intent, data] of Object.entries(INTENTS)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (msg.includes(kw)) score += kw.includes(' ') ? 3 : 1;
    }
    if (score > bestScore) {
      bestScore  = score;
      bestIntent = intent;
    }
  }

  return bestScore > 0 ? bestIntent : 'general';
}
