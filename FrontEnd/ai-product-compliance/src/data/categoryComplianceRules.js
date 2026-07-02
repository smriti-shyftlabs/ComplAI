/**
 * categoryComplianceRules.js — compliance rules organised by product category.
 *
 * The Compliance Rules view (Settings → Compliance Rules) uses this to show only
 * the rules relevant to the selected product category. Category keys match the
 * app's canonical names (see AVAILABLE_CATEGORIES in categorySchemas.js):
 * 'Food & Beverage' and 'Electronics'.
 */

export const RULE_CATEGORIES = ['Food & Beverage', 'Electronics'];

export const CATEGORY_COMPLIANCE_RULES = {
  'Food & Beverage': [
    { id: 'FB-001', name: 'FDA Food Labeling', category: 'Labeling', severity: 'critical', description: 'Packaged foods must carry an FDA-compliant label with product identity, net quantity, and manufacturer information.', requirement: 'Statement of identity, net quantity of contents, and name/address of manufacturer or distributor.' },
    { id: 'FB-002', name: 'Nutrition Facts', category: 'Labeling', severity: 'high', description: 'A Nutrition Facts panel in the FDA 2016/2020 format is required for most packaged foods.', requirement: 'Serving size, calories, and required nutrients per current FDA panel format.' },
    { id: 'FB-003', name: 'Ingredient Declaration', category: 'Labeling', severity: 'high', description: 'All ingredients must be listed in descending order of predominance by weight.', requirement: 'Complete ingredient list using common or usual names, ordered by weight.' },
    { id: 'FB-004', name: 'Allergen Labeling', category: 'Safety', severity: 'critical', description: 'The major food allergens must be clearly declared per FALCPA.', requirement: '"Contains" statement identifying major allergens (e.g. milk, soy, wheat, peanuts).' },
    { id: 'FB-005', name: 'Shelf Life', category: 'Quality', severity: 'medium', description: 'Products should declare a validated shelf life appropriate to the food type.', requirement: 'Documented shelf-life duration supported by stability data.' },
    { id: 'FB-006', name: 'Best Before Date', category: 'Labeling', severity: 'high', description: 'A best-before / expiration date must be printed and legible on the packaging.', requirement: 'Clear best-before or use-by date in an accepted date format.' },
    { id: 'FB-007', name: 'Storage Instructions', category: 'Handling', severity: 'medium', description: 'Storage and handling conditions must be stated where required for safety or quality.', requirement: 'Temperature/handling guidance (e.g. "Keep refrigerated") when applicable.' },
    { id: 'FB-008', name: 'Food Safety Claims', category: 'Claims', severity: 'high', description: 'Health and safety claims must be substantiated and comply with FDA claim rules.', requirement: 'No unauthorized health claims; nutrient-content claims must meet FDA definitions.' },
  ],
  Electronics: [
    { id: 'EL-001', name: 'FCC Compliance', category: 'Certification', severity: 'critical', description: 'Electronic devices that emit RF energy require FCC authorization and a visible FCC ID.', requirement: 'Valid FCC ID and Supplier Declaration of Conformity / certification on file.' },
    { id: 'EL-002', name: 'UL Safety Standards', category: 'Safety', severity: 'high', description: 'Electrical products should be tested to the applicable UL safety standard.', requirement: 'UL (or equivalent NRTL) listing/marking for electrical safety.' },
    { id: 'EL-003', name: 'Battery Safety (UN38.3)', category: 'Safety', severity: 'critical', description: 'Lithium batteries require a UN38.3 transport test summary.', requirement: 'UN38.3 test summary and, where applicable, MSDS for the battery.' },
    { id: 'EL-004', name: 'RoHS Compliance', category: 'Materials', severity: 'high', description: 'Restriction of hazardous substances in electrical and electronic equipment.', requirement: 'Declaration that restricted substances are within RoHS limits.' },
    { id: 'EL-005', name: 'ICES-003', category: 'Certification', severity: 'medium', description: 'Canadian standard for electromagnetic interference from digital apparatus.', requirement: 'ICES-003 compliance label for the Canadian market.' },
    { id: 'EL-006', name: 'CE Marking', category: 'Certification', severity: 'high', description: 'CE marking indicates conformity with EU health, safety, and environmental requirements.', requirement: 'EU Declaration of Conformity and CE mark for products sold in the EU.' },
    { id: 'EL-007', name: 'Energy Efficiency', category: 'Environmental', severity: 'medium', description: 'Applicable energy-efficiency labeling and standards must be met.', requirement: 'Energy Star / regional efficiency labeling where applicable.' },
    { id: 'EL-008', name: 'SAR Requirements', category: 'Safety', severity: 'high', description: 'Wireless devices used near the body must meet Specific Absorption Rate limits.', requirement: 'SAR test report demonstrating limits are met for RF exposure.' },
  ],
};

export function getRulesForCategory(category) {
  return CATEGORY_COMPLIANCE_RULES[category] || [];
}
