/**
 * readiness.js — validation + Compliance Readiness Score for Add Product.
 *
 * Readiness (0–100%) is form-completeness, distinct from the backend AI
 * compliance score. It rewards providing recommended info beyond the bare
 * mandatory fields:
 *
 *   readiness = 60 × (mandatory completion) + 40 × (optional completion)
 *
 * So all mandatory fields filled = 60% ("Needs More Information"); filling the
 * recommended/optional fields pushes it toward 100%. Publish requires ≥ 75%.
 */

import { COMMON_FIELDS, getCategoryFields } from '../data/categorySchemas';

const MANDATORY_WEIGHT = 60;
const OPTIONAL_WEIGHT = 40;
export const PUBLISH_THRESHOLD = 75;

/** Is a single field considered "provided", given its type + value? */
export function isFilled(field, value) {
  if (value === undefined || value === null) return false;
  switch (field.type) {
    case 'multiselect':
    case 'chips':
    case 'images':
      return Array.isArray(value) && value.length > 0;
    case 'toggle':
      return value === true;
    case 'number':
      return value !== '' && !Number.isNaN(Number(value));
    default:
      return String(value).trim().length > 0;
  }
}

/** All fields in play for a category: common + category-specific. */
function allFields(category) {
  return [...COMMON_FIELDS, ...getCategoryFields(category)];
}

/**
 * Compute the readiness score + progress details for the current form values.
 * `values` is a flat map keyed by field.key (common + category keys).
 */
export function computeReadiness(category, values) {
  const fields = allFields(category);
  const mandatory = fields.filter(f => f.required);
  const optional = fields.filter(f => !f.required);

  const mDone = mandatory.filter(f => isFilled(f, values[f.key])).length;
  const oDone = optional.filter(f => isFilled(f, values[f.key])).length;

  const mComp = mandatory.length ? mDone / mandatory.length : 0;
  const oComp = optional.length ? oDone / optional.length : 1;

  const score = Math.round(MANDATORY_WEIGHT * mComp + OPTIONAL_WEIGHT * oComp);

  return {
    score,
    mandatoryDone: mDone,
    mandatoryTotal: mandatory.length,
    optionalDone: oDone,
    optionalTotal: optional.length,
    mandatoryComplete: mandatory.length > 0 && mDone === mandatory.length,
  };
}

/** Band metadata for a readiness score, used by the progress meter. */
export function readinessBand(score) {
  if (score >= 90) return { key: 'excellent', label: 'Excellent Compliance', short: 'Excellent', color: '#10B981', bar: 'bg-green-500', text: 'text-green-700' };
  if (score >= PUBLISH_THRESHOLD) return { key: 'good', label: 'Ready to Publish', short: 'Good', color: '#3B82F6', bar: 'bg-blue-500', text: 'text-blue-700' };
  if (score >= 50) return { key: 'fair', label: 'Needs More Information', short: 'Fair', color: '#F59E0B', bar: 'bg-yellow-500', text: 'text-yellow-700' };
  return { key: 'poor', label: 'Not Ready', short: 'Poor', color: '#EF4444', bar: 'bg-red-500', text: 'text-red-700' };
}

/**
 * Validate mandatory fields for the selected category.
 * Returns an { [fieldKey]: message } map (empty = valid).
 */
export function validateProduct(category, values) {
  const errors = {};

  if (!category) errors.category = 'Category is required';

  allFields(category)
    .filter(f => f.required)
    .forEach(f => {
      if (!isFilled(f, values[f.key])) {
        if (f.type === 'images') errors[f.key] = 'At least one image is required';
        else errors[f.key] = `${f.label} is required`;
      }
    });

  // Description length rule (mirrors the field's minLength hint).
  const desc = COMMON_FIELDS.find(f => f.key === 'description');
  if (desc?.minLength && values.description && String(values.description).trim().length < desc.minLength) {
    errors.description = `Description must be at least ${desc.minLength} characters`;
  }

  // Price must be a positive number.
  if (values.price !== undefined && values.price !== '' && (Number.isNaN(parseFloat(values.price)) || parseFloat(values.price) <= 0)) {
    errors.price = 'Enter a valid price';
  }

  return errors;
}
