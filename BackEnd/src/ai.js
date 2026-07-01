/**
 * ai.js — compliance analysis + chat assistant.
 *
 * Real Claude is used when ANTHROPIC_API_KEY is set; otherwise everything
 * falls back to deterministic local logic so the app works fully offline.
 * Generated reports are cached in the complianceReports collection.
 */

import Anthropic from '@anthropic-ai/sdk';
import { Products, Reports, Rules, Approvals } from './seed.js';
import { generateId } from './utils.js';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
export const aiEnabled = !!client;

// ── Category-specific violation templates (mock engine) ─────────────────────
const violationTemplates = {
  Electronics: [
    { rule: 'FCC Certification', severity: 'critical', description: 'FCC ID not found in product listing', fix: 'Upload FCC certification document and display FCC ID on product page', suggestion: 'Add FCC ID to product description and upload scanned certificate' },
    { rule: 'Battery Safety', severity: 'high', description: 'Lithium battery UN38.3 test report missing', fix: 'Provide UN38.3 test summary and MSDS for lithium battery', suggestion: 'Contact battery manufacturer for UN38.3 documentation' },
  ],
  'Health & Beauty': [
    { rule: 'Medical Claims', severity: 'critical', description: 'Product description contains unverified health claims', fix: 'Remove or substantiate all medical claims with clinical evidence', suggestion: 'Replace "treats/cures" language with "supports/promotes" and add FDA disclaimer' },
    { rule: 'Ingredient Label', severity: 'high', description: 'Ingredient list not in INCI format', fix: 'Reformat ingredient list using International Nomenclature of Cosmetic Ingredients', suggestion: 'Use INCI database to convert common names to standardized format' },
  ],
  'Food & Beverage': [
    { rule: 'Nutrition Facts Panel', severity: 'high', description: 'Nutrition label does not meet FDA 2020 format requirements', fix: 'Update nutrition label to include added sugars and Vitamin D per 2020 FDA guidelines', suggestion: 'Use FDA nutrition label generator tool to create compliant label' },
    { rule: 'Allergen Declaration', severity: 'critical', description: 'Top 9 allergens not clearly identified', fix: 'Add "Contains: [allergens]" statement after ingredient list', suggestion: 'Bold all allergen-containing ingredients and add contains statement' },
  ],
  Toys: [
    { rule: 'ASTM F963 Certification', severity: 'critical', description: 'ASTM F963 toy safety certificate not uploaded', fix: 'Obtain ASTM F963 testing from accredited lab and upload certificate', suggestion: 'Use CPSC-accepted test labs: SGS, Intertek, or Bureau Veritas' },
    { rule: 'Age Warning Label', severity: 'high', description: 'Age appropriateness label is missing or unclear', fix: 'Add standardized age grading label per ASTM F963 guidelines', suggestion: 'Use ASTM-approved age determination guidelines to set correct age range' },
  ],
  Industrial: [
    { rule: 'GHS Hazard Labels', severity: 'critical', description: 'GHS pictograms missing from product images', fix: 'Display all required GHS hazard pictograms on product listing', suggestion: 'Use UN GHS labeling standards - minimum required: signal word, pictogram, hazard statement' },
    { rule: 'SDS Documentation', severity: 'critical', description: 'Safety Data Sheet not attached', fix: 'Upload 16-section GHS-compliant SDS for all chemical components', suggestion: 'SDS must be in English and language of destination market' },
  ],
  Automotive: [
    { rule: 'OBD2 Protocol Disclosure', severity: 'medium', description: 'Compatible OBD2 protocols not listed', fix: 'List all supported OBD2 protocols (CAN, ISO 9141-2, J1850 VPW, etc.)', suggestion: 'Add technical specifications section with protocol compatibility matrix' },
  ],
  Sports: [
    { rule: 'Material Safety', severity: 'medium', description: 'Material composition not fully disclosed', fix: 'List all materials with percentages for products contacting skin', suggestion: 'Add materials section: "Upper: 80% polyester, 20% spandex"' },
  ],
  Apparel: [
    { rule: 'Care Instructions', severity: 'medium', description: 'Care instruction label not visible in product images', fix: 'Upload image showing care label. Add care symbols to listing', suggestion: 'Include a dedicated care label image showing all ISO care symbols' },
    { rule: 'Country of Origin', severity: 'high', description: 'Made in [Country] label not found in images', fix: 'Ensure "Made in [Country]" is visible on label and product listing', suggestion: 'Add country of origin to product description and display on packaging image' },
  ],
  Books: [],
  'Home & Garden': [
    { rule: 'California Prop 65', severity: 'high', description: 'Prop 65 warning may be required for CA customers', fix: 'Evaluate if product contains listed chemicals. Add warning if required', suggestion: 'Run product through CA OEHHA chemical database to determine if warning needed' },
  ],
};

const suggestionTemplates = [
  'Add a comprehensive FAQ section to address common compliance questions',
  'Include 360-degree product images to better demonstrate safety features',
  'Add a dedicated "Safety & Certifications" section to the product listing',
  'Consider obtaining third-party verification from an accredited lab',
];

// ── Deterministic scoring (mock engine) ─────────────────────────────────────
function mockReport(product) {
  const categoryViolations = violationTemplates[product.category] || [];
  const baseScore = product.complianceScore || Math.floor(Math.random() * 40) + 50;
  const hasImages = product.images && product.images.length >= 3;
  const hasCerts = product.certificates && product.certificates.length > 0;
  const hasDescription = product.description && product.description.length >= 100;

  let score = baseScore;
  const violations = [];

  if (!hasImages) {
    score -= 10;
    violations.push({ rule: 'Image Requirements', severity: 'high', description: 'Product has fewer than 3 images', fix: 'Add at least 3 images: front, back, and detail views with white background', suggestion: 'Use professional product photography or request image update from supplier' });
  }
  if (!hasCerts && product.category !== 'Books') {
    score -= 15;
    violations.push({ rule: 'Safety Certification', severity: 'critical', description: 'No safety certificates uploaded', fix: 'Upload applicable safety certificates for your product category', suggestion: `For ${product.category}: obtain required certifications from accredited testing laboratory` });
  }
  if (!hasDescription) {
    score -= 8;
    violations.push({ rule: 'Description Completeness', severity: 'medium', description: 'Product description is too short (under 100 characters)', fix: 'Expand description to include materials, features, dimensions, and usage', suggestion: 'Aim for 200-500 characters covering key product attributes' });
  }

  categoryViolations.forEach((v, i) => {
    if (i === 0 || Math.random() > 0.4) {
      violations.push(v);
      if (v.severity === 'critical') score -= 12;
      else if (v.severity === 'high') score -= 8;
      else if (v.severity === 'medium') score -= 4;
      else score -= 2;
    }
  });

  score = Math.max(10, Math.min(100, score));
  const riskLevel = score >= 75 ? 'low' : score >= 50 ? 'medium' : 'high';
  const suggestions = suggestionTemplates.slice(0, 3).map((text, i) => ({
    id: i + 1, text, priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low', category: 'enhancement',
  }));
  const recommendation = score >= 75
    ? 'Product meets minimum compliance requirements. Recommend approval with minor suggestions.'
    : score >= 50
    ? 'Product requires changes before approval. Address high-severity violations first.'
    : 'Product has critical compliance failures. Recommend rejection pending major revisions.';

  return { score, riskLevel, violations, suggestions, recommendation, confidence: Math.floor(Math.random() * 10) + 88 };
}

// ── Claude-powered analysis (with structured output) ─────────────────────────
const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    score: { type: 'integer' },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    confidence: { type: 'integer' },
    recommendation: { type: 'string' },
    violations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          rule: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          description: { type: 'string' },
          fix: { type: 'string' },
          suggestion: { type: 'string' },
        },
        required: ['rule', 'severity', 'description', 'fix', 'suggestion'],
      },
    },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          text: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['text', 'priority'],
      },
    },
  },
  required: ['score', 'riskLevel', 'confidence', 'recommendation', 'violations', 'suggestions'],
};

async function claudeReport(product) {
  const ruleNames = Rules().findAll().map(r => r.rule || r.name).filter(Boolean).slice(0, 30);
  const prompt = `You are an e-commerce product compliance analyst. Analyze this product against US/EU marketplace compliance rules and return a structured assessment.

Product:
- Name: ${product.name}
- Category: ${product.category}
- Brand: ${product.brand || 'n/a'}
- Description: ${product.description || '(none)'}
- Images provided: ${(product.images || []).length}
- Certificates provided: ${(product.certificates || []).length}

Known rule areas: ${ruleNames.join(', ') || 'general safety, labeling, certification, hazmat, country of origin'}.

Score 0-100 (certificate validity 30%, image quality/count 20%, label requirements 20%, description completeness 15%, safety standards 15%). riskLevel: low (>=75), medium (50-74), high (<50). Provide concrete violations (with a fix and a suggestion each) and 2-3 enhancement suggestions. confidence is 80-99.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    output_config: { format: { type: 'json_schema', schema: ANALYSIS_SCHEMA } },
    messages: [{ role: 'user', content: prompt }],
  });
  const text = res.content.find(b => b.type === 'text')?.text;
  const parsed = JSON.parse(text);
  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  parsed.suggestions = (parsed.suggestions || []).map((s, i) => ({ id: i + 1, category: 'enhancement', ...s }));
  return parsed;
}

/**
 * Analyze a product, cache + persist the report, and update the product.
 * Pass { force: true } to re-generate after a product was edited (drops the
 * cached report and re-scores).
 */
export async function analyzeProduct(product, { force = false } = {}) {
  const cached = Reports().findOne({ productId: product.id });
  if (cached && !force) return cached;
  if (cached && force) Reports().deleteWhere(r => r.productId === product.id);

  let result;
  try {
    result = client ? await claudeReport(product) : mockReport(product);
  } catch (err) {
    console.warn('[ai] Claude analysis failed, using fallback:', err.message);
    result = mockReport(product);
  }

  const report = {
    id: generateId('RPT'),
    productId: product.id,
    productName: product.name,
    category: product.category,
    score: result.score,
    riskLevel: result.riskLevel,
    violations: result.violations || [],
    suggestions: result.suggestions || [],
    confidence: result.confidence,
    recommendation: result.recommendation,
    analyzedAt: new Date().toISOString(),
    rulesChecked: 20,
    rulesPassed: 20 - (result.violations?.length || 0),
    rulesFailed: result.violations?.length || 0,
    engine: client ? 'claude' : 'mock',
  };

  Reports().insert(report);
  Products().update(product.id, { complianceScore: report.score, riskLevel: report.riskLevel, aiScore: report.score });
  return report;
}

// ── Chat assistant ──────────────────────────────────────────────────────────
const APP_SUMMARY =
  "**ComplAI** is an AI-powered product compliance & catalog governance platform. It helps e-commerce teams review products *before* they go live.\n\n**The workflow:**\n1. **Add Product** — submit a product with images, certificates, and details.\n2. **AI Analysis** — it's scanned against 20+ compliance rules and given a 0–100 compliance score + risk level.\n3. **Compliance Report** — see passed/failed rules, violations, and AI-generated fix suggestions.\n4. **Human Approval** — a reviewer approves, rejects, or requests changes.\n5. **Publish** — approved products go to the marketplace.\n\nAsk me about regulations *or* your live catalog (e.g. \"why was PRD-005 rejected?\").";

const KNOWLEDGE_BASE = [
  { id: 'fcc', keywords: ['fcc', 'radio', 'wireless', 'bluetooth', 'wifi', 'emc', 'electronic'], answer: "**FCC Certification** is required for electronic devices sold in the US that emit radio-frequency energy.\n\n• **Process:** Test at an FCC-accredited lab → file the application → receive your FCC ID.\n• **Timeline:** ~4–8 weeks · **Cost:** $5,000–$15,000.\n• **On the listing:** The FCC ID must be visible on the label and in the description." },
  { id: 'astm', keywords: ['astm', 'f963', 'toy', 'toys', 'children', 'kids', 'choking', 'en71'], answer: "**ASTM F963** is the mandatory US toy-safety standard (CPSC).\n• ASTM F963 test report (or **EN71** for the EU)\n• **CPSIA** compliance + Children's Product Certificate (CPC)\n• Age-grading + tracking labels\n• Choking-hazard warning for small parts under age 3" },
  { id: 'hazmat', keywords: ['hazmat', 'flammable', 'chemical', 'ghs', 'sds', 'msds', 'hazardous', 'corrosive', 'aerosol'], answer: "**Hazardous materials** need: GHS hazard classification, a 16-section **SDS**, proper **UN number** + packing group, and warning labels. Flammable goods require a **Class 3** hazmat declaration." },
  { id: 'food', keywords: ['food', 'beverage', 'supplement', 'fda', 'nutrition', 'allergen', 'ingredient', 'edible', 'dietary'], answer: "**Food & supplements** must meet FDA requirements: facility registration, **Nutrition Facts** panel (2020 format), ingredient list with **Top-9 allergen** declaration, and net weight + manufacturer info." },
  { id: 'cosmetics', keywords: ['cosmetic', 'beauty', 'skincare', 'serum', 'inci', 'medical claim', 'retinol', 'cream'], answer: "**Health & Beauty**: no unverified medical claims (use \"supports/promotes\", add an FDA disclaimer), and ingredient lists in **INCI** format. MoCRA registration may apply." },
  { id: 'ce-rohs', keywords: ['ce', 'ce mark', 'rohs', 'reach', 'eu', 'europe', 'european', 'weee'], answer: "**Selling into the EU?** Typically need the **CE Mark**, **RoHS** (restricted substances), **REACH** (chemical safety), and **WEEE** (e-waste). Keep the EU Declaration of Conformity on hand." },
  { id: 'prop65', keywords: ['prop 65', 'prop65', 'proposition 65', 'california', 'warning', 'oehha'], answer: "**California Prop 65** requires a warning if a product can expose consumers to any of ~900 listed chemicals. Check components against the **CA OEHHA** list and add the standardized warning if needed." },
  { id: 'origin', keywords: ['country of origin', 'made in', 'origin', 'import', 'customs', 'tariff'], answer: "**Country of Origin** must be disclosed for imports: a permanent \"Made in [Country]\" mark, stated in the description, with accurate HS/tariff classification." },
  { id: 'score', keywords: ['score', 'compliance score', 'how is score', 'calculated', 'scoring', 'rating'], answer: "The **compliance score (0–100)**: Certificates 30%, Images 20%, Labels 20%, Description 15%, Safety 15%.\n**Bands:** 90+ excellent · 75–90 good · 50–75 fair · <50 needs attention. Products need **75+** to publish." },
  { id: 'publish', keywords: ['publish', 'go live', 'live', 'marketplace', 'launch', 'list'], answer: "To **publish**: score **75+**, all critical violations resolved, reviewer approval, automated checks passed, and required certifications uploaded." },
  { id: 'reject', keywords: ['reject', 'rejected', 'rejection', 'denied', 'fail', 'failed'], answer: "Products are **rejected** for critical violations: missing safety certs, unverified medical claims, hazmat gaps, counterfeit indicators, or import violations. Ask \"why was [product ID] rejected?\" for a specific case." },
];

const STATUS_WORDS = {
  pending: 'pending', approve: 'approved', approved: 'approved',
  reject: 'rejected', rejected: 'rejected', publish: 'published',
  published: 'published', revision: 'revision',
};

function findReferencedProduct(question) {
  const all = Products().findAll();
  const idMatch = question.match(/prd[-\s]?(\d{1,3})/i);
  if (idMatch) {
    const id = `PRD-${String(idMatch[1]).padStart(3, '0')}`;
    const byId = all.find(p => p.id.toUpperCase() === id);
    if (byId) return byId;
  }
  const q = question.toLowerCase();
  let best = null, bestScore = 0;
  for (const p of all) {
    const words = p.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hits = words.filter(w => q.includes(w)).length;
    if (hits > bestScore) { bestScore = hits; best = p; }
  }
  return bestScore >= 1 ? best : null;
}

async function describeProduct(product) {
  let report = Reports().findOne({ productId: product.id });
  if (!report) report = await analyzeProduct(product);
  const approval = Approvals().findByIndex('productId', product.id)
    .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt))[0];
  return { report, approval };
}

async function handleDataIntent(question) {
  const q = question.toLowerCase();
  const product = findReferencedProduct(question);

  if (product && /(why|reason|rule|fail|violation|missing|wrong|score|status|certif|document)/.test(q)) {
    const { report, approval } = await describeProduct(product);
    const lines = [`**${product.name}** (${product.id})`,
      `Status: **${product.status}** · Score: **${product.complianceScore}/100** · Risk: **${product.riskLevel}**`];
    if (approval?.comment) lines.push(`\n**Reviewer note (${approval.decision}):** "${approval.comment}"`);
    if (report?.violations?.length) {
      lines.push(`\n**${report.violations.length} issue(s) detected:**`);
      report.violations.slice(0, 5).forEach(v => lines.push(`• [${(v.severity || 'medium').toUpperCase()}] ${v.rule} — ${v.description}`));
      if (/missing|document|certif/.test(q)) lines.push(`\n**To fix:** ${report.violations[0].fix}`);
    } else if (report) {
      lines.push('\n✅ No outstanding violations — this product passed all checks.');
    }
    if (report?.recommendation) lines.push(`\n💡 ${report.recommendation}`);
    return lines.join('\n');
  }

  if (/(how many|count|number of|total)/.test(q)) {
    const counts = Products().groupCount('status');
    const total = Products().count();
    for (const [word, status] of Object.entries(STATUS_WORDS)) {
      if (q.includes(word)) {
        const n = counts[status] || 0;
        return `You currently have **${n}** ${status} product${n === 1 ? '' : 's'} (out of ${total} total).`;
      }
    }
    const summary = Object.entries(counts).map(([s, n]) => `• ${n} ${s}`).join('\n');
    return `**Catalog overview — ${total} products:**\n${summary}\n\nAverage compliance score: **${Products().avg('complianceScore')}/100**.`;
  }

  if (/(show|list|which|what)\s+(me\s+)?(.*)(product|item)/.test(q) || /high risk|high-risk|risky/.test(q)) {
    let matches = [], label = '';
    if (/high risk|high-risk|risky/.test(q)) { matches = Products().findByIndex('riskLevel', 'high'); label = 'high-risk'; }
    else {
      for (const [word, status] of Object.entries(STATUS_WORDS)) {
        if (q.includes(word)) { matches = Products().findByIndex('status', status); label = status; break; }
      }
    }
    if (matches.length) {
      const list = matches.slice(0, 6).map(p => `• ${p.name} (${p.id}) — score ${p.complianceScore}`).join('\n');
      const more = matches.length > 6 ? `\n…and ${matches.length - 6} more.` : '';
      return `Found **${matches.length}** ${label} product(s):\n${list}${more}`;
    }
  }

  if (/(average|avg|mean).*(score|compliance)/.test(q)) {
    return `The catalog's **average compliance score** is **${Products().avg('complianceScore')}/100** across ${Products().count()} products.`;
  }

  if (/(how many|what).*(rule|rules)/.test(q)) {
    const total = Rules().count();
    const bySeverity = Rules().groupCount('severity');
    const breakdown = Object.entries(bySeverity).map(([s, n]) => `${n} ${s}`).join(', ');
    return `The engine checks **${total} compliance rules** (${breakdown}). Ask about a category like "food" or "toys" for specifics.`;
  }
  return null;
}

function handleKnowledgeIntent(question) {
  const q = question.toLowerCase();
  let best = null, bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) if (q.includes(kw)) score += kw.includes(' ') ? 2 : 1;
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 0 ? best.answer : null;
}

async function claudeChat(question) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: 'You are ComplAI, the built-in assistant for an e-commerce product compliance platform. Answer questions about product compliance regulations (FCC, ASTM F963, FDA, hazmat/GHS, CE/RoHS, Prop 65, country of origin, etc.) clearly and concisely. Use markdown. Keep answers under ~200 words.',
    messages: [{ role: 'user', content: question }],
  });
  return res.content.find(b => b.type === 'text')?.text || null;
}

/** Main chat entry point. */
export async function chatbotResponse(question) {
  const q = (question || '').trim();
  if (!q) return 'Ask me about compliance rules, certifications, or any product in your catalog.';

  if (/^(hi|hello|hey|yo|sup)\b/i.test(q))
    return "Hi! I'm ComplAI. I can explain compliance rules **and** answer questions about your catalog. Try:\n• \"Why was PRD-005 rejected?\"\n• \"How many products are pending?\"\n• \"What FCC certifications do I need?\"";
  if (/(thank|thanks|cheers)/i.test(q)) return "You're welcome! Anything else I can help with?";
  if (/(what is this|what'?s this|about (this|the) app|what does (this|it) do|what can you do|how (does this|do you) work|tell me about|overview|summary|^help\b|guide me)/i.test(q))
    return APP_SUMMARY;

  // 1. Live catalog intents (always handled in-code against the DB)
  const dataAnswer = await handleDataIntent(q);
  if (dataAnswer) return dataAnswer;

  // 2. Real Claude for general regulatory questions when available
  if (client) {
    try {
      const answer = await claudeChat(q);
      if (answer) return answer;
    } catch (err) {
      console.warn('[ai] Claude chat failed, using knowledge base:', err.message);
    }
  }

  // 3. Local knowledge base
  const kb = handleKnowledgeIntent(q);
  if (kb) return kb;

  return `I'm not sure I have a precise answer for "${q}". I can help with:\n\n**ℹ️ This app** — "what is this app?", "what can you do?"\n**📊 Your catalog** — "why was PRD-012 rejected?", "how many approved products?"\n**📚 Regulations** — FCC, ASTM F963, FDA/food, hazmat, CE/RoHS, Prop 65, country of origin`;
}
