/**
 * usLaptop.js — deterministic US Laptop (Electronics) compliance rule engine.
 *
 * Rules are data (id, name, severity, owner, requiredFix, message, trigger).
 * The engine runs every applicable rule, sums severity points into a riskScore,
 * and derives GREEN / YELLOW / RED. AI extracts the facts; this engine makes the
 * final decision. Rule Book v1.0.
 *
 *   Severity points → Critical 40 · High 25 · Medium 10 · Low 5
 *   Status → GREEN (<20, no Critical) · YELLOW (20–49, no Critical) · RED (any Critical or ≥50)
 */

import { Products } from '../seed.js';

export const SEVERITY_SCORE = { Critical: 40, High: 25, Medium: 10, Low: 5 };

// ── field helpers ─────────────────────────────────────────────────────────
const facts = (p) => p.facts || {};
const docs = (p) => p.documents || {};
const text = (v) => v != null && String(v).trim() !== '';        // text/number present
const on = (v) => v === true;                                     // toggle provided
const num = (v) => v != null && v !== '' && !Number.isNaN(Number(v));
const hasWireless = (p) => Array.isArray(facts(p).wireless_features) && facts(p).wireless_features.length > 0;
const hasBattery = (p) => text(facts(p).battery_type) && facts(p).battery_type !== 'None';
const imageCount = (p) => (p.images || []).length;
const claims = (p) => (Array.isArray(p.claims) ? p.claims : []).filter(Boolean);

// ── Rule library (LAP-US-001 … 024; 025 = status logic below) ──────────────
export const US_LAPTOP_RULES = [
  { id: 'LAP-US-001', name: 'Brand Required', severity: 'High', owner: 'Catalog Ops',
    message: 'Brand is missing.', requiredFix: 'Provide the product brand.',
    trigger: (p) => !text(p.brand) },
  { id: 'LAP-US-002', name: 'Model Number Required', severity: 'High', owner: 'Catalog Ops',
    message: 'Model number is missing.', requiredFix: 'Add the model number.',
    trigger: (p) => !text(facts(p).model_number) },
  { id: 'LAP-US-003', name: 'SKU Required', severity: 'Critical', owner: 'Catalog Ops',
    message: 'SKU is missing.', requiredFix: 'Create a valid SKU.',
    trigger: (p) => !text(p.sku) },
  { id: 'LAP-US-004', name: 'Processor Required', severity: 'Medium', owner: 'Catalog Ops',
    message: 'Processor details are missing.', requiredFix: 'Add processor details.',
    trigger: (p) => !text(facts(p).processor) },
  { id: 'LAP-US-005', name: 'RAM Required', severity: 'Medium', owner: 'Catalog Ops',
    message: 'RAM is missing.', requiredFix: 'Add RAM.',
    trigger: (p) => !text(facts(p).ram) },
  { id: 'LAP-US-006', name: 'Storage Required', severity: 'Medium', owner: 'Catalog Ops',
    message: 'Storage is missing.', requiredFix: 'Add storage.',
    trigger: (p) => !text(facts(p).storage) },
  { id: 'LAP-US-007', name: 'Display Size', severity: 'Low', owner: 'Catalog Ops',
    message: 'Display size is missing.', requiredFix: 'Add display size.',
    trigger: (p) => !text(facts(p).display_size) },
  { id: 'LAP-US-008', name: 'Country of Origin', severity: 'Medium', owner: 'Compliance',
    message: 'Country of origin is missing.', requiredFix: 'Add country of origin.',
    trigger: (p) => !text(facts(p).country_of_origin) },
  { id: 'LAP-US-009', name: 'Manufacturer Details', severity: 'High', owner: 'Compliance',
    message: 'Manufacturer details are missing.', requiredFix: 'Provide the manufacturer.',
    trigger: (p) => !text(facts(p).manufacturer_name) },
  { id: 'LAP-US-010', name: 'US Importer', severity: 'Medium', owner: 'Compliance',
    message: 'US importer is missing.', requiredFix: 'Provide the US importer.',
    trigger: (p) => !text(facts(p).importer_name_us) },
  { id: 'LAP-US-011', name: 'FCC ID', severity: 'Critical', owner: 'Compliance',
    message: 'Wireless features are present but no FCC ID was provided.', requiredFix: 'Upload the FCC ID.',
    applicable: hasWireless, trigger: (p) => !text(docs(p).fcc_id) },
  { id: 'LAP-US-012', name: 'FCC Documentation', severity: 'Critical', owner: 'Compliance',
    message: 'FCC documentation (SDoC or Test Report) is missing.', requiredFix: 'Upload FCC evidence.',
    applicable: hasWireless, trigger: (p) => !(on(docs(p).fcc_sdoc) || on(docs(p).fcc_test_report)) },
  { id: 'LAP-US-013', name: 'Battery Safety Doc', severity: 'Critical', owner: 'Compliance',
    message: 'Battery safety documentation is missing.', requiredFix: 'Upload battery safety docs (UN38.3 / shipping).',
    applicable: hasBattery, trigger: (p) => !(on(docs(p).battery_un383_summary) || on(docs(p).battery_shipping_document)) },
  { id: 'LAP-US-014', name: 'Battery Capacity', severity: 'Medium', owner: 'Catalog Ops',
    message: 'Battery capacity is missing.', requiredFix: 'Add battery capacity (Wh).',
    applicable: hasBattery, trigger: (p) => !num(facts(p).battery_capacity_wh) },
  { id: 'LAP-US-015', name: 'Adapter Wattage', severity: 'Medium', owner: 'Catalog Ops',
    message: 'Adapter wattage is missing.', requiredFix: 'Add adapter wattage (W).',
    trigger: (p) => !num(facts(p).adapter_power_w) },
  { id: 'LAP-US-016', name: 'Warranty', severity: 'Low', owner: 'Catalog Ops',
    message: 'Warranty information is missing.', requiredFix: 'Provide warranty information.',
    trigger: (p) => !text(facts(p).warranty) },
  { id: 'LAP-US-017', name: 'Image Count', severity: 'High', owner: 'Catalog Ops',
    message: 'Fewer than 3 product images provided.', requiredFix: 'Upload at least 3 images.',
    trigger: (p) => imageCount(p) < 3 },
  { id: 'LAP-US-018', name: 'Primary Image', severity: 'Medium', owner: 'Catalog Ops',
    message: 'Primary (hero) image is missing.', requiredFix: 'Upload a primary product image.',
    trigger: (p) => imageCount(p) < 1 },
  { id: 'LAP-US-019', name: 'Specification Consistency', severity: 'High', owner: 'QA',
    message: 'Listing title does not reference the product specifications.', requiredFix: 'Align the title with the model/RAM/storage.',
    applicable: (p) => text(facts(p).title || p.title),
    trigger: (p) => {
      const title = String(facts(p).title || p.title || '').toLowerCase();
      const tokens = [facts(p).model_number, facts(p).ram, facts(p).storage].filter(text).map(t => String(t).toLowerCase());
      if (!tokens.length) return false;
      return !tokens.some(t => title.includes(t));
    } },
  { id: 'LAP-US-020', name: 'Claim Support', severity: 'High', owner: 'Compliance',
    message: 'Marketing claims are present without supporting evidence.', requiredFix: 'Upload claim-support documents.',
    applicable: (p) => claims(p).length > 0, trigger: (p) => !on(docs(p).claim_support_document) },
  { id: 'LAP-US-021', name: 'Duplicate SKU', severity: 'High', owner: 'Catalog Ops',
    message: 'Another product already uses this SKU.', requiredFix: 'Merge or fix the duplicate SKU.',
    trigger: (p, ctx) => ctx.duplicateSku },
  { id: 'LAP-US-022', name: 'Description Length', severity: 'Medium', owner: 'Catalog Ops',
    message: 'Product description is too short.', requiredFix: 'Expand the description (50+ characters).',
    trigger: (p) => String(p.description || '').trim().length < 50 },
  { id: 'LAP-US-023', name: 'Manual Uploaded', severity: 'Medium', owner: 'Compliance',
    message: 'User manual is not uploaded.', requiredFix: 'Upload the user manual.',
    trigger: (p) => !on(docs(p).user_manual) },
  { id: 'LAP-US-024', name: 'Certificate Expiry', severity: 'Critical', owner: 'Compliance',
    message: 'A provided certificate has expired.', requiredFix: 'Upload a valid, unexpired certificate.',
    applicable: (p) => text(docs(p).certificate_expiry),
    trigger: (p) => { const d = new Date(docs(p).certificate_expiry); return !Number.isNaN(d.getTime()) && d.getTime() < Date.now(); } },
];

/** Run the engine against a product and return report-shaped fields. */
export function evaluateUsLaptop(product) {
  // Context: duplicate-SKU lookup against the catalog.
  const duplicateSku = !!(product.sku && Products().findAll()
    .some(x => x.id !== product.id && x.sku && String(x.sku).trim() === String(product.sku).trim()));
  const ctx = { duplicateSku };

  let checked = 0;
  let riskScore = 0;
  const violations = [];

  for (const rule of US_LAPTOP_RULES) {
    if (rule.applicable && !rule.applicable(product)) continue;   // not applicable → not evaluated
    checked += 1;
    if (rule.trigger(product, ctx)) {
      riskScore += SEVERITY_SCORE[rule.severity] || 0;
      violations.push({
        ruleId: rule.id,
        rule: rule.name,
        severity: rule.severity.toLowerCase(),   // UI badges use lowercase
        description: rule.message,
        fix: rule.requiredFix,
        owner: rule.owner,
      });
    }
  }

  const hasCritical = violations.some(v => v.severity === 'critical');
  const status = hasCritical || riskScore >= 50 ? 'RED' : riskScore >= 20 ? 'YELLOW' : 'GREEN';

  // Map to the app's 0–100 compliance score (higher = better). RED is capped
  // below the 75 approval threshold so Approve is disabled on a blocked launch.
  const score = status === 'RED'
    ? Math.max(0, Math.min(49, 100 - riskScore))
    : Math.max(0, 100 - riskScore);
  const riskLevel = status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low';

  const recommendation = status === 'RED'
    ? 'Launch blocked — resolve all Critical failures before this laptop can be approved.'
    : status === 'YELLOW'
    ? 'Review required — address the findings below before approval.'
    : 'Meets US laptop compliance requirements. Recommend approval.';

  return {
    score,
    riskLevel,
    status,
    riskScore,
    violations,
    suggestions: [],
    confidence: 99,
    recommendation,
    rulesChecked: checked,
    rulesPassed: checked - violations.length,
    rulesFailed: violations.length,
    nextActions: violations.slice(0, 6).map(v => v.fix),
    engine: 'us-laptop-rules',
  };
}

/** Whether this product should be evaluated by the US laptop engine. */
export function isUsLaptop(product) {
  if (product.category !== 'Electronics') return false;
  const markets = product.targetMarkets;
  if (Array.isArray(markets) && markets.length && !markets.includes('US')) return false;
  return true;
}
