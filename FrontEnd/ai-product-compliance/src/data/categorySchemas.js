/**
 * categorySchemas.js — declarative, category-driven Add Product form config.
 *
 * The Add Product page renders COMMON_FIELDS on load, then progressively
 * reveals the category-specific sections defined here once a category is
 * selected. Each field carries: key, label, type, required, and a `group`
 * used to assemble the submission payload (root | facts | documents).
 *
 * `required` fields gate "Run Compliance Analysis"; every field (required and
 * optional) feeds the Compliance Readiness Score in utils/readiness.js.
 */

// Only these categories are selectable today. Everything else in
// utils/constants → CATEGORIES renders as a disabled "Coming Soon" option.
export const AVAILABLE_CATEGORIES = ['Food & Beverage', 'Electronics'];

// Target market is locked to US: only option, always pre-filled, always required.
const MARKETS = ['US'];

// Fields common to every product, shown on page load (before category select).
// Category is handled by CategorySelector; images/description have bespoke UI.
export const COMMON_FIELDS = [
  { key: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g. ZenTech UltraBook Pro 14' },
  { key: 'sku', label: 'SKU ID', type: 'text', required: false, placeholder: 'e.g. SKU-1001' },
  { key: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g. ZenTech' },
  { key: 'price', label: 'Price ($)', type: 'number', required: true, placeholder: '0.00' },
  { key: 'productType', label: 'Product', type: 'text', required: false, placeholder: 'e.g. Laptop' },
  { key: 'images', label: 'Product Images', type: 'images', required: true, min: 1, max: 10 },
  { key: 'description', label: 'Description', type: 'textarea', required: true, minLength: 30 },
];

export const CATEGORY_SCHEMAS = {
  Electronics: {
    label: 'Electronics',
    sections: [
      {
        id: 'markets', title: 'Target Markets',
        fields: [
          { key: 'targetMarkets', label: 'Target Markets', type: 'multiselect', options: MARKETS, required: true, group: 'root', default: ['US'] },
        ],
      },
      {
        id: 'title', title: 'Listing Title',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true, group: 'root', placeholder: 'e.g. ZenTech UltraBook Pro 14 Laptop 16GB RAM 512GB SSD' },
        ],
      },
      {
        id: 'facts', title: 'Product Facts',
        fields: [
          { key: 'model_number', label: 'Model Number', type: 'text', required: false, group: 'facts' },
          { key: 'processor', label: 'Processor', type: 'text', required: false, group: 'facts', placeholder: 'e.g. Intel Core i7-1360P' },
          { key: 'ram', label: 'RAM', type: 'text', required: false, group: 'facts', placeholder: 'e.g. 16GB' },
          { key: 'storage', label: 'Storage', type: 'text', required: false, group: 'facts', placeholder: 'e.g. 512GB SSD' },
          { key: 'display_size', label: 'Display Size', type: 'text', required: false, group: 'facts', placeholder: 'e.g. 15.6"' },
          { key: 'battery_type', label: 'Battery Type', type: 'select', options: ['Lithium-ion', 'Lithium-polymer', 'NiMH', 'Alkaline', 'None'], required: false, group: 'facts' },
          { key: 'battery_capacity_wh', label: 'Battery Capacity (Wh)', type: 'number', required: false, group: 'facts' },
          { key: 'adapter_power_w', label: 'Adapter Power (W)', type: 'number', required: false, group: 'facts' },
          { key: 'adapter_input_voltage', label: 'Adapter Input Voltage', type: 'text', required: false, group: 'facts', placeholder: 'e.g. 100-240V' },
          { key: 'adapter_output_voltage', label: 'Adapter Output Voltage', type: 'text', required: false, group: 'facts', placeholder: 'e.g. 20V' },
          { key: 'country_of_origin', label: 'Country of Origin', type: 'text', required: false, group: 'facts', placeholder: 'e.g. China' },
          { key: 'manufacturer_name', label: 'Manufacturer Name', type: 'text', required: false, group: 'facts' },
          { key: 'warranty', label: 'Warranty', type: 'text', required: false, group: 'facts', placeholder: 'e.g. 1 year limited' },
          // ── optional (recommended → raise readiness) ──
          { key: 'wireless_features', label: 'Wireless Features', type: 'multiselect', options: ['Wi-Fi', 'Bluetooth', 'NFC', '5G', 'GPS', 'Zigbee'], required: false, group: 'facts' },
          { key: 'importer_name_us', label: 'Importer Name (US)', type: 'text', required: false, group: 'facts' },
          { key: 'importer_name_ca', label: 'Importer Name (Canada)', type: 'text', required: false, group: 'facts' },
        ],
      },
      {
        id: 'documents', title: 'Compliance Documents',
        fields: [
          { key: 'fcc_id', label: 'FCC ID', type: 'text', required: false, group: 'documents' },
          { key: 'fcc_sdoc', label: 'FCC SDoC', type: 'toggle', required: false, group: 'documents' },
          { key: 'fcc_test_report', label: 'FCC Test Report', type: 'toggle', required: false, group: 'documents' },
          { key: 'ised_certification_number', label: 'ISED Certification Number', type: 'text', required: false, group: 'documents' },
          { key: 'ised_rel_listing', label: 'ISED REL Listing', type: 'toggle', required: false, group: 'documents' },
          { key: 'ices_003_label', label: 'ICES-003 Label', type: 'toggle', required: false, group: 'documents' },
          { key: 'battery_un383_summary', label: 'Battery UN38.3 Summary', type: 'toggle', required: false, group: 'documents' },
          { key: 'battery_shipping_document', label: 'Battery Shipping Document', type: 'toggle', required: false, group: 'documents' },
          { key: 'user_manual', label: 'User Manual Uploaded', type: 'toggle', required: false, group: 'documents' },
          { key: 'certificate_expiry', label: 'Certificate Expiry Date', type: 'date', required: false, group: 'documents' },
          { key: 'claim_support_document', label: 'Claim Support Document', type: 'toggle', required: false, group: 'documents' },
        ],
      },
      {
        id: 'claims', title: 'Claims',
        fields: [
          { key: 'claims', label: 'Product Claims', type: 'chips', required: false, group: 'root', suggestions: ['Energy Efficient', 'Military Grade', 'Fast Charging', 'Eco-Friendly'] },
        ],
      },
    ],
  },

  'Food & Beverage': {
    label: 'Food & Beverage',
    sections: [
      {
        id: 'markets', title: 'Target Markets',
        fields: [
          { key: 'targetMarkets', label: 'Target Markets', type: 'multiselect', options: MARKETS, required: true, group: 'root', default: ['US'] },
        ],
      },
      {
        id: 'title', title: 'Listing Title',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true, group: 'root', placeholder: 'e.g. Maple Mustard Protein Chips' },
        ],
      },
      {
        id: 'facts', title: 'Product Facts',
        fields: [
          { key: 'common_name', label: 'Common Name', type: 'text', required: false, group: 'facts', placeholder: 'e.g. Protein Chips' },
          { key: 'net_quantity', label: 'Net Quantity', type: 'text', required: true, group: 'facts', placeholder: 'e.g. 150 g' },
          { key: 'ingredients', label: 'Ingredients', type: 'textarea', required: true, group: 'facts', placeholder: 'corn, mustard powder, soy protein, salt, sugar' },
          { key: 'allergen_statement_us', label: 'Allergen Statement (US)', type: 'text', required: false, group: 'facts', placeholder: 'Contains: Soy' },
          { key: 'manufacturer_name', label: 'Manufacturer Name', type: 'text', required: false, group: 'facts', placeholder: 'e.g. SnackCo Foods' },
          { key: 'manufacturer_address', label: 'Manufacturer Address', type: 'text', required: false, group: 'facts', placeholder: 'e.g. Boston, MA' },
          // ── optional (recommended → raise readiness) ──
          { key: 'nutrition_facts_panel', label: 'Nutrition Facts Panel', type: 'toggle', required: false, group: 'facts' },
          { key: 'nutrition_facts_table_ca', label: 'Nutrition Facts Table (Canada)', type: 'toggle', required: false, group: 'facts' },
          { key: 'label_language', label: 'Label Language', type: 'multiselect', options: ['English', 'French', 'Spanish'], required: false, group: 'facts' },
          { key: 'best_before_date', label: 'Best Before Date', type: 'date', required: true, group: 'facts' },
          { key: 'shelf_life_days', label: 'Shelf Life (days)', type: 'number', required: false, group: 'facts' },
          { key: 'storage_instruction', label: 'Storage Instructions', type: 'text', required: false, group: 'facts' },
          { key: 'sodium_mg_per_serving', label: 'Sodium per Serving (mg)', type: 'number', required: false, group: 'facts' },
          { key: 'sugars_g_per_serving', label: 'Sugar per Serving (g)', type: 'number', required: false, group: 'facts' },
          { key: 'sat_fat_g_per_serving', label: 'Saturated Fat per Serving (g)', type: 'number', required: false, group: 'facts' },
          { key: 'front_of_package_symbol_ca', label: 'Front of Package Symbol (Canada)', type: 'toggle', required: false, group: 'facts' },
        ],
      },
      {
        id: 'documents', title: 'Documents',
        fields: [
          { key: 'label_image', label: 'Label Image', type: 'toggle', required: false, group: 'documents' },
          { key: 'claim_support_document', label: 'Claim Support Document', type: 'toggle', required: false, group: 'documents' },
        ],
      },
      {
        id: 'claims', title: 'Claims',
        fields: [
          { key: 'claims', label: 'Product Claims', type: 'chips', required: false, group: 'root', suggestions: ['High Protein', 'Gluten Free', 'Organic', 'Non-GMO', 'Vegan'] },
        ],
      },
    ],
  },
};

export function getCategorySchema(category) {
  return CATEGORY_SCHEMAS[category] || null;
}

/** Flattened list of every category-specific field (across all sections). */
export function getCategoryFields(category) {
  const schema = CATEGORY_SCHEMAS[category];
  return schema ? schema.sections.flatMap(s => s.fields) : [];
}

/** Default form values for a category's fields (e.g. Target Markets → ["US"]). */
export function getCategoryDefaults(category) {
  const defaults = {};
  getCategoryFields(category).forEach(f => {
    if (f.default !== undefined) defaults[f.key] = f.default;
    else if (f.type === 'multiselect' || f.type === 'chips') defaults[f.key] = [];
    else if (f.type === 'toggle') defaults[f.key] = false;
  });
  return defaults;
}
