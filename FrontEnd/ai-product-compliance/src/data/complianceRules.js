export const complianceRules = [
  {
    id: 'RULE-001',
    name: 'Product Description Completeness',
    category: 'Product Description',
    severity: 'high',
    description: 'Product description must be at least 100 characters and include key features, materials, and dimensions.',
    checkType: 'text_analysis',
    requirement: 'Minimum 100 characters. Must include: materials, key features, usage instructions.'
  },
  {
    id: 'RULE-002',
    name: 'Product Description - No Medical Claims',
    category: 'Product Description',
    severity: 'critical',
    description: 'Product descriptions must not make unverified medical or health claims without FDA disclaimer.',
    checkType: 'ai_nlp',
    requirement: 'No disease treatment claims. Health supplements must include FDA disclaimer.'
  },
  {
    id: 'RULE-003',
    name: 'Main Image Requirements',
    category: 'Images',
    severity: 'high',
    description: 'Products must have at least one main image with white background, minimum 1000x1000px resolution.',
    checkType: 'image_analysis',
    requirement: 'Minimum 1 image. White background. Resolution: 1000x1000px minimum. JPEG or PNG.'
  },
  {
    id: 'RULE-004',
    name: 'Image Count Requirements',
    category: 'Images',
    severity: 'medium',
    description: 'Products should have a minimum of 3 images showing different angles.',
    checkType: 'image_count',
    requirement: 'Recommended 3-8 images. Must show front, back, and detail views.'
  },
  {
    id: 'RULE-005',
    name: 'Price Reasonableness Check',
    category: 'Pricing',
    severity: 'medium',
    description: 'Product price must be within reasonable market range and not indicate predatory pricing.',
    checkType: 'price_validation',
    requirement: 'Price must be positive. MSRP deviation must be within 200% of market average.'
  },
  {
    id: 'RULE-006',
    name: 'Price Comparison Accuracy',
    category: 'Pricing',
    severity: 'high',
    description: 'Crossed-out comparison prices must be verifiable and not misleading.',
    checkType: 'price_accuracy',
    requirement: 'Was/Now pricing requires evidence of previous selling price for 90+ days.'
  },
  {
    id: 'RULE-007',
    name: 'Safety Certificate Required',
    category: 'Certifications',
    severity: 'critical',
    description: 'Products in regulated categories (Electronics, Toys, Food) must provide valid safety certificates.',
    checkType: 'document_verification',
    requirement: 'Electronics: FCC/CE. Toys: ASTM F963/EN71. Food: FDA Registration. All certificates must be current.'
  },
  {
    id: 'RULE-008',
    name: 'Certificate Expiry Check',
    category: 'Certifications',
    severity: 'high',
    description: 'All submitted certificates must be valid and not expired.',
    checkType: 'expiry_check',
    requirement: 'Certificates must have at least 30 days remaining validity.'
  },
  {
    id: 'RULE-009',
    name: 'Flammability Warning Labels',
    category: 'Safety',
    severity: 'critical',
    description: 'Flammable products must include proper warning labels and hazard symbols.',
    checkType: 'label_detection',
    requirement: 'GHS flammability label required. UN hazmat class declaration required. SDS must be attached.'
  },
  {
    id: 'RULE-010',
    name: 'Choking Hazard Warning',
    category: 'Safety',
    severity: 'critical',
    description: 'Products with small parts intended for children under 3 must display choking hazard warning.',
    checkType: 'age_safety',
    requirement: 'Products with parts < 3.17cm diameter: CHOKING HAZARD label required for children under 3.'
  },
  {
    id: 'RULE-011',
    name: 'Nutrition Label Compliance',
    category: 'Labels',
    severity: 'high',
    description: 'Food and supplement products must include FDA-compliant nutrition facts panel.',
    checkType: 'label_compliance',
    requirement: 'FDA Nutrition Facts panel required. Serving size, calories, macronutrients must be listed.'
  },
  {
    id: 'RULE-012',
    name: 'Ingredient List Requirements',
    category: 'Labels',
    severity: 'high',
    description: 'All ingredients must be listed in descending order of predominance.',
    checkType: 'ingredient_validation',
    requirement: 'Complete ingredient list required. Top 8 allergens must be clearly identified.'
  },
  {
    id: 'RULE-013',
    name: 'Hazardous Material Classification',
    category: 'Hazmat',
    severity: 'critical',
    description: 'Hazardous materials must be properly classified per UN/DOT/IATA regulations.',
    checkType: 'hazmat_classification',
    requirement: 'HAZMAT products require: UN number, proper shipping name, hazard class, packing group.'
  },
  {
    id: 'RULE-014',
    name: 'SDS Documentation',
    category: 'Hazmat',
    severity: 'high',
    description: 'Chemical products must have Safety Data Sheet (SDS) in GHS format.',
    checkType: 'document_check',
    requirement: 'SDS must contain all 16 GHS sections. Must be in English and language of destination country.'
  },
  {
    id: 'RULE-015',
    name: 'Age Restriction Compliance',
    category: 'Age Restrictions',
    severity: 'critical',
    description: 'Products restricted to adults (18+/21+) must have proper age verification mechanisms.',
    checkType: 'age_verification',
    requirement: 'Alcohol, tobacco, adult content: mandatory age verification. Clear age restriction labels.'
  },
  {
    id: 'RULE-016',
    name: 'Age Appropriateness Label',
    category: 'Age Restrictions',
    severity: 'high',
    description: 'Toys and games must display appropriate age range prominently on packaging.',
    checkType: 'age_label',
    requirement: 'Toys must display recommended age range. Must align with safety testing standards.'
  },
  {
    id: 'RULE-017',
    name: 'Country of Origin Disclosure',
    category: 'Country of Origin',
    severity: 'high',
    description: 'Products must clearly state country of origin on packaging and listing.',
    checkType: 'origin_disclosure',
    requirement: '"Made in [Country]" label required. Must match customs declaration.'
  },
  {
    id: 'RULE-018',
    name: 'Import/Export Compliance',
    category: 'Country of Origin',
    severity: 'high',
    description: 'Products from certain countries may require additional documentation or may be restricted.',
    checkType: 'trade_compliance',
    requirement: 'Verify product is not on restricted goods list. Import permits required for controlled items.'
  },
  {
    id: 'RULE-019',
    name: 'Trademark and IP Compliance',
    category: 'Product Description',
    severity: 'critical',
    description: 'Product listing must not infringe on trademarks, patents, or copyrights.',
    checkType: 'ip_check',
    requirement: 'No use of registered trademarks without authorization. Original product images only.'
  },
  {
    id: 'RULE-020',
    name: 'Battery Safety Compliance',
    category: 'Safety',
    severity: 'high',
    description: 'Products containing lithium batteries must meet UN38.3 standards and include proper documentation.',
    checkType: 'battery_safety',
    requirement: 'Lithium batteries: UN38.3 test report, MSDS, Watt-hour rating disclosure required.'
  }
];
