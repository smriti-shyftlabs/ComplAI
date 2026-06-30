/**
 * chatbotService.js
 *
 * A data-aware compliance assistant. It does two things:
 *   1. DATA INTENTS — queries the live InMemoryDB (products, reports,
 *      approvals, rules) to answer questions about *your* catalog, e.g.
 *      "why was PRD-005 rejected?", "how many products are pending?".
 *   2. KNOWLEDGE INTENTS — a scored knowledge base of compliance topics
 *      (FCC, ASTM F963, FDA, hazmat, CE, RoHS, Prop 65, etc.).
 *
 * Matching is score-based (best match wins), not first-match, so the
 * answers are far more relevant than simple keyword lookups.
 */

import { delay } from '../utils/helpers';
import { Products, Reports, Approvals, Rules } from '../db/initDB';

// ─── App overview ─────────────────────────────────────────────────────────────

const APP_SUMMARY =
  "**ComplianceAI** is an AI-powered product compliance & catalog governance platform. It helps e-commerce teams review products *before* they go live.\n\n**The workflow:**\n1. **Add Product** — submit a product with images, certificates, and details.\n2. **AI Analysis** — it's scanned against 20+ compliance rules (certifications, labels, safety, hazmat, country of origin) and given a 0–100 compliance score + risk level.\n3. **Compliance Report** — see passed/failed rules, violations, and AI-generated fix suggestions.\n4. **Human Approval** — a reviewer approves, rejects, or requests changes (human-in-the-loop).\n5. **Publish** — approved products go to the marketplace; everything is tracked.\n\n**Key sections:**\n• **Dashboard** — KPIs and compliance trends\n• **Approvals** — the reviewer queue\n• **Audit Trail** — full history of every action\n• **Analytics** — compliance by category, approval rates, AI accuracy\n\nI'm the built-in assistant — ask me about regulations *or* your live catalog (e.g. \"why was PRD-005 rejected?\").";

// ─── Knowledge base ───────────────────────────────────────────────────────────
// Each entry: keywords (with weights) + a rich answer. Highest total score wins.

const KNOWLEDGE_BASE = [
  {
    id: 'fcc',
    keywords: ['fcc', 'radio', 'wireless', 'bluetooth', 'wifi', 'emc', 'electronic'],
    answer:
      "**FCC Certification** is required for electronic devices sold in the US that emit radio-frequency energy (Bluetooth, Wi-Fi, etc.).\n\n• **Process:** Test at an FCC-accredited lab → file the application → receive your FCC ID.\n• **Timeline:** ~4–8 weeks · **Cost:** $5,000–$15,000 depending on complexity.\n• **On the listing:** The FCC ID must be visible on the product label and stated in the description.\n\nFor intentional radiators you'll need a full **Part 15 Subpart C** test report.",
  },
  {
    id: 'astm',
    keywords: ['astm', 'f963', 'toy', 'toys', 'children', 'kids', 'choking', 'en71'],
    answer:
      "**ASTM F963** is the mandatory US toy-safety standard (enforced by the CPSC).\n\nRequired for children's products:\n• ASTM F963 test report (or **EN71** for the EU)\n• **CPSIA** compliance + a Children's Product Certificate (CPC)\n• Age-grading label and tracking label\n• Choking-hazard warning for small parts (< 3.17 cm) on items for ages under 3\n\nUse a CPSC-accepted lab — SGS, Intertek, or Bureau Veritas.",
  },
  {
    id: 'hazmat',
    keywords: ['hazmat', 'flammable', 'chemical', 'ghs', 'sds', 'msds', 'hazardous', 'corrosive', 'aerosol'],
    answer:
      "**Hazardous materials** need special documentation before they can be listed:\n• **GHS hazard classification** (signal word, pictogram, hazard statement)\n• **Safety Data Sheet (SDS)** in the 16-section GHS format\n• Proper **UN number** and packing group\n• Warning labels on packaging\n\nFlammable goods require a **Class 3** hazmat declaration. The SDS must be available in English and in the destination market's language.",
  },
  {
    id: 'food',
    keywords: ['food', 'beverage', 'supplement', 'fda', 'nutrition', 'allergen', 'ingredient', 'edible', 'dietary'],
    answer:
      "**Food & supplement products** must meet FDA requirements:\n• FDA facility registration\n• **Nutrition Facts** panel in the 2020 format (added sugars + Vitamin D)\n• Ingredient list with **Top-9 allergen** declaration (\"Contains: …\")\n• Net weight + manufacturer/distributor info\n\nHealth claims must be FDA-approved **structure/function** claims. Dietary supplements also need **DSHEA** compliance and the FDA disclaimer.",
  },
  {
    id: 'cosmetics',
    keywords: ['cosmetic', 'beauty', 'skincare', 'serum', 'inci', 'medical claim', 'retinol', 'cream'],
    answer:
      "**Health & Beauty** products are scrutinized for two things:\n• **No unverified medical claims** — replace \"treats/cures\" with \"supports/promotes\" and add an FDA disclaimer where needed.\n• **Ingredient list in INCI format** (International Nomenclature of Cosmetic Ingredients).\n\nClaims like \"clinically proven\" require substantiation on file. MoCRA registration may also apply.",
  },
  {
    id: 'ce-rohs',
    keywords: ['ce', 'ce mark', 'rohs', 'reach', 'eu', 'europe', 'european', 'weee'],
    answer:
      "**Selling into the EU?** You'll typically need:\n• **CE Mark** — declares conformity with applicable EU directives.\n• **RoHS** — restricts hazardous substances (lead, mercury, cadmium…) in electronics.\n• **REACH** — chemical safety registration.\n• **WEEE** — e-waste recycling registration for electronics.\n\nKeep the **EU Declaration of Conformity** and technical file on hand for customs.",
  },
  {
    id: 'prop65',
    keywords: ['prop 65', 'prop65', 'proposition 65', 'california', 'warning', 'oehha'],
    answer:
      "**California Prop 65** requires a warning if a product can expose consumers to any of ~900 listed chemicals.\n\n• Check components against the **CA OEHHA** chemical list.\n• If a listed chemical is present above the safe-harbor level, add the standardized warning (\"⚠️ WARNING: This product can expose you to…\").\n• Applies to anything shipped to California, regardless of where you're based.",
  },
  {
    id: 'origin',
    keywords: ['country of origin', 'made in', 'origin', 'import', 'customs', 'tariff'],
    answer:
      "**Country of Origin** must be disclosed for imported goods:\n• A permanent \"Made in [Country]\" mark on the product/packaging.\n• Stated in the product description.\n• Accurate HS/tariff classification for customs.\n\nMislabeling origin is a customs violation and a common rejection reason.",
  },
  {
    id: 'score',
    keywords: ['score', 'compliance score', 'how is score', 'calculated', 'scoring', 'rating'],
    answer:
      "The **compliance score (0–100)** is a weighted blend:\n• Certificate validity — **30%**\n• Image quality & count — **20%**\n• Label requirements — **20%**\n• Description completeness — **15%**\n• Safety standards — **15%**\n\n**Bands:** 90+ excellent · 75–90 good · 50–75 fair · <50 needs immediate attention. Products need **75+** to be eligible for publishing.",
  },
  {
    id: 'publish',
    keywords: ['publish', 'go live', 'live', 'marketplace', 'launch', 'list'],
    answer:
      "To **publish** a product it must:\n1. Reach a compliance score of **75+**\n2. Have **all critical violations** resolved\n3. Obtain **reviewer approval** (human-in-the-loop)\n4. Pass automated checks\n5. Have all required certifications uploaded\n\nAfter approval, publishing completes in 1–2 business days.",
  },
  {
    id: 'reject',
    keywords: ['reject', 'rejected', 'rejection', 'denied', 'fail', 'failed'],
    answer:
      "Products are **rejected** for critical violations that can't be waived:\n• Missing mandatory safety certifications\n• Unverified medical/health claims\n• Hazmat documentation gaps (no SDS/GHS labels)\n• Counterfeit indicators\n• Import/restriction violations\n\nSellers can fix the issues and resubmit. Tip: ask me \"why was [product ID] rejected?\" for a specific case.",
  },
  {
    id: 'appeal',
    keywords: ['appeal', 'dispute', 'contest', 'overturn', 'escalate'],
    answer:
      "You can **appeal** a decision within **30 days** of rejection:\n1. Submit a written rebuttal addressing each violation.\n2. Attach supporting docs (test reports, certificates).\n3. Request a senior-reviewer reassignment.\n\nAppeals are reviewed within **5–7 business days**.",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_WORDS = {
  pending: 'pending', approve: 'approved', approved: 'approved',
  reject: 'rejected', rejected: 'rejected', publish: 'published',
  published: 'published', revision: 'revision',
};

/** Pull a product reference (id or fuzzy name) out of a question. */
function findReferencedProduct(question) {
  const all = Products().findAll();

  // 1. Explicit ID like PRD-005
  const idMatch = question.match(/prd[-\s]?(\d{1,3})/i);
  if (idMatch) {
    const id = `PRD-${String(idMatch[1]).padStart(3, '0')}`;
    const byId = all.find(p => p.id.toUpperCase() === id);
    if (byId) return byId;
  }

  // 2. Fuzzy name match — longest product name whose significant words appear
  const q = question.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of all) {
    const words = p.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hits = words.filter(w => q.includes(w)).length;
    if (hits > bestScore) { bestScore = hits; best = p; }
  }
  return bestScore >= 1 ? best : null;
}

async function describeProduct(product) {
  let report = Reports().findOne({ productId: product.id });
  // Lazily generate a report if one doesn't exist yet (seeded products
  // start without reports) so we can always explain the decision.
  if (!report) {
    const { analyzeProduct } = await import('./aiService');
    report = await analyzeProduct(product);
  }
  const approval = Approvals()
    .findByIndex('productId', product.id)
    .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt))[0];
  return { report, approval };
}

// ─── Data-intent handlers ─────────────────────────────────────────────────────

async function handleDataIntent(question) {
  const q = question.toLowerCase();
  const product = findReferencedProduct(question);

  // "why was X rejected/approved" or "what rule failed for X" or "what's missing for X"
  if (product && /(why|reason|rule|fail|violation|missing|wrong|score|status|certif|document)/.test(q)) {
    const { report, approval } = await describeProduct(product);
    const lines = [`**${product.name}** (${product.id})`,
      `Status: **${product.status}** · Score: **${product.complianceScore}/100** · Risk: **${product.riskLevel}**`];

    if (approval?.comment) {
      lines.push(`\n**Reviewer note (${approval.decision}):** "${approval.comment}"`);
    }

    if (report?.violations?.length) {
      lines.push(`\n**${report.violations.length} issue(s) detected:**`);
      report.violations.slice(0, 5).forEach(v => {
        lines.push(`• [${(v.severity || 'medium').toUpperCase()}] ${v.rule} — ${v.description}`);
      });
      if (/missing|document|certif/.test(q)) {
        lines.push(`\n**To fix:** ${report.violations[0].fix}`);
      }
    } else if (report) {
      lines.push('\n✅ No outstanding violations — this product passed all checks.');
    } else {
      lines.push('\nThis product has not been analyzed yet. Run an AI analysis from the product page.');
    }

    if (report?.recommendation) lines.push(`\n💡 ${report.recommendation}`);
    return lines.join('\n');
  }

  // "how many products are pending/approved/..." or counts
  if (/(how many|count|number of|total)/.test(q)) {
    const counts = Products().groupCount('status');
    const total = Products().count();

    for (const [word, status] of Object.entries(STATUS_WORDS)) {
      if (q.includes(word)) {
        const n = counts[status] || 0;
        return `You currently have **${n}** ${status} product${n === 1 ? '' : 's'} (out of ${total} total).`;
      }
    }
    const summary = Object.entries(counts)
      .map(([s, n]) => `• ${n} ${s}`)
      .join('\n');
    return `**Catalog overview — ${total} products:**\n${summary}\n\nAverage compliance score: **${Products().avg('complianceScore')}/100**.`;
  }

  // "show me high risk products" / "list rejected products"
  if (/(show|list|which|what)\s+(me\s+)?(.*)(product|item)/.test(q) || /high risk|high-risk|risky/.test(q)) {
    let matches = [];
    let label = '';
    if (/high risk|high-risk|risky/.test(q)) {
      matches = Products().findByIndex('riskLevel', 'high'); label = 'high-risk';
    } else {
      for (const [word, status] of Object.entries(STATUS_WORDS)) {
        if (q.includes(word)) { matches = Products().findByIndex('status', status); label = status; break; }
      }
    }
    if (matches.length) {
      const list = matches.slice(0, 6)
        .map(p => `• ${p.name} (${p.id}) — score ${p.complianceScore}`)
        .join('\n');
      const more = matches.length > 6 ? `\n…and ${matches.length - 6} more.` : '';
      return `Found **${matches.length}** ${label} product(s):\n${list}${more}`;
    }
  }

  // "what's the average score" / analytics
  if (/(average|avg|mean).*(score|compliance)/.test(q)) {
    return `The catalog's **average compliance score** is **${Products().avg('complianceScore')}/100** across ${Products().count()} products.`;
  }

  // rules questions
  if (/(how many|what).*(rule|rules)/.test(q)) {
    const total = Rules().count();
    const bySeverity = Rules().groupCount('severity');
    const breakdown = Object.entries(bySeverity).map(([s, n]) => `${n} ${s}`).join(', ');
    return `The engine checks **${total} compliance rules** (${breakdown}). Ask about a category like \"food\" or \"toys\" for specifics.`;
  }

  return null; // no data intent matched
}

// ─── Knowledge-intent handler (scored) ────────────────────────────────────────

function handleKnowledgeIntent(question) {
  const q = question.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.includes(' ') ? 2 : 1; // phrases weigh more
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }

  return bestScore > 0 ? best.answer : null;
}

// ─── Public entry point ────────────────────────────────────────────────────────

export const getChatbotResponse = async (question) => {
  await delay(600 + Math.random() * 700);

  const q = (question || '').trim();
  if (!q) return "Ask me about compliance rules, certifications, or any product in your catalog.";

  // Greetings
  if (/^(hi|hello|hey|yo|sup)\b/i.test(q)) {
    return "Hi! I'm ComplianceAI. I can explain compliance rules **and** answer questions about your actual catalog. Try:\n• \"Why was PRD-005 rejected?\"\n• \"How many products are pending?\"\n• \"What FCC certifications do I need?\"";
  }
  if (/(thank|thanks|cheers)/i.test(q)) {
    return "You're welcome! Anything else I can help with?";
  }

  // App overview / "what is this" / "what can you do" / "help"
  if (/(what is this|what'?s this|about (this|the) app|what does (this|it) do|what can you do|how (does this|do you) work|tell me about|overview|summary|^help\b|guide me)/i.test(q)) {
    return APP_SUMMARY;
  }

  // 1. Try data-aware intents first (most specific / valuable)
  const dataAnswer = await handleDataIntent(q);
  if (dataAnswer) return dataAnswer;

  // 2. Fall back to the knowledge base
  const kbAnswer = handleKnowledgeIntent(q);
  if (kbAnswer) return kbAnswer;

  // 3. Helpful default with suggestions
  return `I'm not sure I have a precise answer for "${q}". I can help with:\n\n**ℹ️ This app** — "what is this app?", "what can you do?"\n**📊 Your catalog** — "why was PRD-012 rejected?", "how many approved products?", "show high-risk products"\n**📚 Regulations** — FCC, ASTM F963, FDA/food, hazmat, CE/RoHS, Prop 65, country of origin\n\nTry rephrasing, or pick one of the topics above.`;
};
