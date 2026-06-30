/**
 * aiService.js — AI analysis backed by InMemoryDB `complianceReports` collection.
 * Results are persisted so the same product always returns consistent data.
 */

import { delay, generateId } from '../utils/helpers';
import { Reports, Rules, Products } from '../db/initDB';
import { getChatbotResponse } from './chatbotService';

const violationTemplates = {
  Electronics: [
    { rule: 'FCC Certification', severity: 'critical', description: 'FCC ID not found in product listing', fix: 'Upload FCC certification document and display FCC ID on product page', suggestion: 'Add FCC ID to product description and upload scanned certificate' },
    { rule: 'Battery Safety', severity: 'high', description: 'Lithium battery UN38.3 test report missing', fix: 'Provide UN38.3 test summary and MSDS for lithium battery', suggestion: 'Contact battery manufacturer for UN38.3 documentation' }
  ],
  'Health & Beauty': [
    { rule: 'Medical Claims', severity: 'critical', description: 'Product description contains unverified health claims', fix: 'Remove or substantiate all medical claims with clinical evidence', suggestion: 'Replace "treats/cures" language with "supports/promotes" and add FDA disclaimer' },
    { rule: 'Ingredient Label', severity: 'high', description: 'Ingredient list not in INCI format', fix: 'Reformat ingredient list using International Nomenclature of Cosmetic Ingredients', suggestion: 'Use INCI database to convert common names to standardized format' }
  ],
  'Food & Beverage': [
    { rule: 'Nutrition Facts Panel', severity: 'high', description: 'Nutrition label does not meet FDA 2020 format requirements', fix: 'Update nutrition label to include added sugars and Vitamin D per 2020 FDA guidelines', suggestion: 'Use FDA nutrition label generator tool to create compliant label' },
    { rule: 'Allergen Declaration', severity: 'critical', description: 'Top 9 allergens not clearly identified', fix: 'Add "Contains: [allergens]" statement after ingredient list', suggestion: 'Bold all allergen-containing ingredients and add contains statement' }
  ],
  Toys: [
    { rule: 'ASTM F963 Certification', severity: 'critical', description: 'ASTM F963 toy safety certificate not uploaded', fix: 'Obtain ASTM F963 testing from accredited lab and upload certificate', suggestion: 'Use CPSC-accepted test labs: SGS, Intertek, or Bureau Veritas' },
    { rule: 'Age Warning Label', severity: 'high', description: 'Age appropriateness label is missing or unclear', fix: 'Add standardized age grading label per ASTM F963 guidelines', suggestion: 'Use ASTM-approved age determination guidelines to set correct age range' }
  ],
  Industrial: [
    { rule: 'GHS Hazard Labels', severity: 'critical', description: 'GHS pictograms missing from product images', fix: 'Display all required GHS hazard pictograms on product listing', suggestion: 'Use UN GHS labeling standards - minimum required: signal word, pictogram, hazard statement' },
    { rule: 'SDS Documentation', severity: 'critical', description: 'Safety Data Sheet not attached', fix: 'Upload 16-section GHS-compliant SDS for all chemical components', suggestion: 'SDS must be in English and language of destination market' }
  ],
  Automotive: [
    { rule: 'OBD2 Protocol Disclosure', severity: 'medium', description: 'Compatible OBD2 protocols not listed', fix: 'List all supported OBD2 protocols (CAN, ISO 9141-2, J1850 VPW, etc.)', suggestion: 'Add technical specifications section with protocol compatibility matrix' }
  ],
  Sports: [
    { rule: 'Material Safety', severity: 'medium', description: 'Material composition not fully disclosed', fix: 'List all materials with percentages for products contacting skin', suggestion: 'Add materials section: "Upper: 80% polyester, 20% spandex"' }
  ],
  Apparel: [
    { rule: 'Care Instructions', severity: 'medium', description: 'Care instruction label not visible in product images', fix: 'Upload image showing care label. Add care symbols to listing', suggestion: 'Include a dedicated care label image showing all ISO care symbols' },
    { rule: 'Country of Origin', severity: 'high', description: 'Made in [Country] label not found in images', fix: 'Ensure "Made in [Country]" is visible on label and product listing', suggestion: 'Add country of origin to product description and display on packaging image' }
  ],
  Books: [],
  'Home & Garden': [
    { rule: 'California Prop 65', severity: 'high', description: 'Prop 65 warning may be required for CA customers', fix: 'Evaluate if product contains listed chemicals. Add warning if required', suggestion: 'Run product through CA OEHHA chemical database to determine if warning needed' }
  ]
};

const suggestionTemplates = [
  'Add a comprehensive FAQ section to address common compliance questions',
  'Include 360-degree product images to better demonstrate safety features',
  'Add a dedicated "Safety & Certifications" section to the product listing',
  'Consider obtaining third-party verification from an accredited lab',
  'Update product title to include key safety attributes and certifications',
  'Add a product comparison chart highlighting compliance advantages',
  'Include videos demonstrating proper product usage and safety precautions',
  'Add customer review solicitation focusing on safety and quality experience'
];

export const getComplianceReport = async (productId) => {
  await delay(150);
  return Reports().findOne({ productId }) || null;
};

export const getAllReports = async () => {
  await delay(200);
  return Reports().sort('analyzedAt', 'desc');
};

export const analyzeProduct = async (product) => {
  await delay(100);

  // Return cached report if exists
  const cached = Reports().findOne({ productId: product.id });
  if (cached) return cached;

  const categoryViolations = violationTemplates[product.category] || [];
  const baseScore = product.complianceScore || Math.floor(Math.random() * 40) + 50;
  const hasImages = product.images && product.images.length >= 3;
  const hasCerts = product.certificates && product.certificates.length > 0;
  const hasDescription = product.description && product.description.length >= 100;

  let score = baseScore;
  const violations = [];

  if (!hasImages) {
    score -= 10;
    violations.push({
      rule: 'Image Requirements',
      severity: 'high',
      description: 'Product has fewer than 3 images',
      fix: 'Add at least 3 images: front, back, and detail views with white background',
      suggestion: 'Use professional product photography or request image update from supplier'
    });
  }

  if (!hasCerts && product.category !== 'Books') {
    score -= 15;
    violations.push({
      rule: 'Safety Certification',
      severity: 'critical',
      description: 'No safety certificates uploaded',
      fix: 'Upload applicable safety certificates for your product category',
      suggestion: `For ${product.category}: obtain required certifications from accredited testing laboratory`
    });
  }

  if (!hasDescription) {
    score -= 8;
    violations.push({
      rule: 'Description Completeness',
      severity: 'medium',
      description: 'Product description is too short (under 100 characters)',
      fix: 'Expand description to include materials, features, dimensions, and usage',
      suggestion: 'Aim for 200-500 characters covering key product attributes'
    });
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

  const suggestions = [
    ...suggestionTemplates.slice(0, 3).map((text, i) => ({
      id: i + 1,
      text,
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
      category: 'enhancement'
    }))
  ];

  const recommendation = score >= 75
    ? 'Product meets minimum compliance requirements. Recommend approval with minor suggestions.'
    : score >= 50
    ? 'Product requires changes before approval. Address high-severity violations first.'
    : 'Product has critical compliance failures. Recommend rejection pending major revisions.';

  const report = {
    id: generateId('RPT'),
    productId: product.id,
    productName: product.name,
    category: product.category,
    score,
    riskLevel,
    violations,
    suggestions,
    confidence: Math.floor(Math.random() * 10) + 88,
    recommendation,
    analyzedAt: new Date().toISOString(),
    rulesChecked: 20,
    rulesPassed: 20 - violations.length,
    rulesFailed: violations.length,
  };

  // Persist report
  Reports().insert(report);

  // Update product's compliance score in the products collection
  Products().update(product.id, { complianceScore: score, riskLevel, aiScore: score });

  return report;
};

export const simulateAnalysis = async (onProgress) => {
  const steps = [
    'Reading Product Data',
    'OCR Processing Documents',
    'Detecting Category & Region',
    'Loading Compliance Rules',
    'Running Compliance Checks',
    'Generating AI Suggestions'
  ];

  for (let i = 0; i < steps.length; i++) {
    await delay(600 + Math.random() * 600);
    if (onProgress) {
      onProgress({
        step: i + 1,
        total: steps.length,
        label: steps[i],
        progress: Math.round(((i + 1) / steps.length) * 100)
      });
    }
  }
};

/**
 * Backward-compatible entry point — delegates to the data-aware
 * chatbot service which can answer both regulatory questions and
 * live questions about the catalog.
 */
export const getAIResponse = (question) => getChatbotResponse(question);
