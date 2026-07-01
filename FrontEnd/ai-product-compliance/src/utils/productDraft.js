/**
 * productDraft.js — persists the in-progress Add Product draft so the form
 * survives navigation (Add Product ⇄ Compliance Report) and page refreshes.
 *
 * Two layers:
 *  - An in-memory singleton keeps the *live* draft, including image File objects
 *    and blob preview URLs, intact across client-side (react-router) navigation.
 *  - A serializable snapshot is mirrored to sessionStorage so text fields,
 *    selections, category data, and the analysis result survive a hard refresh.
 *    (Raw File objects can't be serialized; image names are kept so the list is
 *    still shown — previews may need re-upload after a full page reload.)
 */

const STORAGE_KEY = 'complai_product_draft';
let memory = null;

/** Strip non-serializable bits (File objects) before writing to sessionStorage. */
function toSerializable(draft) {
  const images = (draft.values?.images || []).map(img =>
    typeof img === 'string' ? img : { url: img.url, name: img.name }
  );
  return { ...draft, values: { ...draft.values, images } };
}

/** Load the current draft — in-memory first (full fidelity), else sessionStorage. */
export function loadDraft() {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = JSON.parse(raw);
      return memory;
    }
  } catch { /* ignore corrupt/unavailable storage */ }
  return null;
}

/** Save the live draft (kept in memory) and a serializable mirror to storage. */
export function saveDraft(draft) {
  memory = draft;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSerializable(draft)));
  } catch { /* storage full / unavailable — in-memory copy still works */ }
}

/** Clear the draft (e.g. after a successful publish or explicit discard). */
export function clearDraft() {
  memory = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

/**
 * Stable signature of the compliance-relevant form values. Used to detect when
 * a product changed after analysis so the report can be flagged "Outdated".
 */
export function draftSignature(values = {}) {
  const images = (values.images || []).map(img => (typeof img === 'string' ? img : img.name));
  return JSON.stringify({ ...values, images });
}
