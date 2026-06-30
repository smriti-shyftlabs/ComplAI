/**
 * InMemoryDB — a lightweight, localStorage-backed in-memory database.
 *
 * Features
 * ─────────
 * • Multiple named collections (tables)
 * • Auto-generated IDs with configurable prefix
 * • Index support for O(1) lookups by any field
 * • Event emitter (subscribe to insert / update / delete / clear)
 * • Optional localStorage persistence (survives page refresh)
 * • Query helpers: find, findOne, where, count, paginate, sort
 */

// ─── Tiny event emitter ──────────────────────────────────────────────────────

class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(l => l !== fn);
  }

  emit(event, payload) {
    (this._listeners[event] || []).forEach(fn => fn(payload));
    (this._listeners['*'] || []).forEach(fn => fn({ event, payload }));
  }
}

// ─── Collection ──────────────────────────────────────────────────────────────

class Collection extends EventEmitter {
  /**
   * @param {string} name        Collection name (used as localStorage key prefix)
   * @param {object} options
   * @param {string}   options.idPrefix        Prefix for auto-generated IDs, e.g. "PRD"
   * @param {string[]} options.indexes         Fields to build O(1) index maps on
   * @param {boolean}  options.persist         Persist to localStorage (default true)
   * @param {object[]} options.seed            Initial seed data (only used when storage is empty)
   */
  constructor(name, options = {}) {
    super();
    this.name = name;
    this._idPrefix = options.idPrefix || name.toUpperCase().slice(0, 3);
    this._indexFields = options.indexes || [];
    this._persist = options.persist !== false;
    this._storageKey = `complianceai_db_${name}`;

    // Primary store: Map<id, record>
    this._store = new Map();
    // Secondary indexes: Map<field, Map<value, Set<id>>>
    this._indexes = new Map();
    this._indexFields.forEach(f => this._indexes.set(f, new Map()));

    // Sequence counter for IDs
    this._seq = 0;

    // Load from localStorage or seed
    if (this._persist && this._loadFromStorage()) {
      // loaded
    } else if (options.seed && options.seed.length) {
      options.seed.forEach(record => this._insert(record, false));
      this._saveToStorage();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  _nextId() {
    this._seq += 1;
    return `${this._idPrefix}-${String(this._seq).padStart(3, '0')}`;
  }

  _addToIndexes(record) {
    this._indexFields.forEach(field => {
      const idx = this._indexes.get(field);
      const val = String(record[field] ?? '');
      if (!idx.has(val)) idx.set(val, new Set());
      idx.get(val).add(record.id);
    });
  }

  _removeFromIndexes(record) {
    this._indexFields.forEach(field => {
      const idx = this._indexes.get(field);
      const val = String(record[field] ?? '');
      idx.get(val)?.delete(record.id);
    });
  }

  _insert(data, save = true) {
    const id = String(data.id || this._nextId());
    // Keep seq in sync when seeding records with explicit IDs like "PRD-047"
    const numeric = parseInt(id.split('-').pop(), 10);
    if (!isNaN(numeric) && numeric > this._seq) this._seq = numeric;

    const record = { ...data, id };
    this._store.set(id, record);
    this._addToIndexes(record);
    if (save) this._saveToStorage();
    return record;
  }

  _saveToStorage() {
    if (!this._persist) return;
    try {
      const arr = Array.from(this._store.values());
      localStorage.setItem(this._storageKey, JSON.stringify(arr));
    } catch {
      // localStorage quota exceeded — silently ignore
    }
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (!raw) return false;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return false;
      arr.forEach(record => this._insert(record, false));
      return true;
    } catch {
      return false;
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Return total record count */
  count() {
    return this._store.size;
  }

  /** Insert a new record. Returns the inserted record (with generated id). */
  insert(data) {
    const record = this._insert(data);
    this.emit('insert', record);
    return { ...record };
  }

  /** Insert multiple records at once. Returns array of inserted records. */
  insertMany(dataArray) {
    const inserted = dataArray.map(d => this._insert(d));
    this._saveToStorage();
    inserted.forEach(r => this.emit('insert', r));
    return inserted.map(r => ({ ...r }));
  }

  /** Find a single record by id. Returns null if not found. */
  findById(id) {
    const r = this._store.get(id);
    return r ? { ...r } : null;
  }

  /** Find all records. Returns shallow-copy array. */
  findAll() {
    return Array.from(this._store.values()).map(r => ({ ...r }));
  }

  /**
   * Query records using a predicate function or a plain equality object.
   *
   * Examples:
   *   col.find(r => r.status === 'pending')
   *   col.find({ status: 'pending', category: 'Electronics' })
   */
  find(predicate) {
    const results = [];
    if (typeof predicate === 'function') {
      for (const r of this._store.values()) {
        if (predicate(r)) results.push({ ...r });
      }
    } else if (predicate && typeof predicate === 'object') {
      const entries = Object.entries(predicate);
      for (const r of this._store.values()) {
        if (entries.every(([k, v]) => r[k] === v)) results.push({ ...r });
      }
    }
    return results;
  }

  /** Same as find() but returns only the first match or null. */
  findOne(predicate) {
    const results = this.find(predicate);
    return results.length ? results[0] : null;
  }

  /**
   * Use a secondary index for O(1) field lookup.
   * Only works for fields declared in options.indexes.
   */
  findByIndex(field, value) {
    const idx = this._indexes.get(field);
    if (!idx) {
      console.warn(`[InMemoryDB] No index on "${this.name}.${field}". Falling back to scan.`);
      return this.find({ [field]: value });
    }
    const ids = idx.get(String(value)) || new Set();
    return Array.from(ids)
      .map(id => this._store.get(id))
      .filter(Boolean)
      .map(r => ({ ...r }));
  }

  /**
   * Update a record by id. Merges patch into existing record.
   * Returns the updated record or null if not found.
   */
  update(id, patch) {
    const existing = this._store.get(id);
    if (!existing) return null;

    this._removeFromIndexes(existing);
    const updated = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    this._store.set(id, updated);
    this._addToIndexes(updated);
    this._saveToStorage();
    this.emit('update', { ...updated });
    return { ...updated };
  }

  /**
   * Update all records matching a predicate.
   * Returns array of updated records.
   */
  updateWhere(predicate, patch) {
    const matches = this.find(predicate);
    return matches.map(r => this.update(r.id, patch)).filter(Boolean);
  }

  /**
   * Delete a record by id.
   * Returns the deleted record or null if not found.
   */
  delete(id) {
    const existing = this._store.get(id);
    if (!existing) return null;
    this._removeFromIndexes(existing);
    this._store.delete(id);
    this._saveToStorage();
    this.emit('delete', { ...existing });
    return { ...existing };
  }

  /** Delete all records matching a predicate. Returns deleted count. */
  deleteWhere(predicate) {
    const matches = this.find(predicate);
    matches.forEach(r => this.delete(r.id));
    return matches.length;
  }

  /** Remove all records from the collection. */
  clear() {
    this._store.clear();
    this._indexes.forEach(idx => idx.clear());
    this._seq = 0;
    this._saveToStorage();
    this.emit('clear', null);
  }

  /** Drop localStorage key and clear memory. */
  drop() {
    this.clear();
    if (this._persist) localStorage.removeItem(this._storageKey);
  }

  /**
   * Sort records.
   * @param {string} field   Field to sort by
   * @param {'asc'|'desc'} order
   */
  sort(field, order = 'asc') {
    const dir = order === 'desc' ? -1 : 1;
    return this.findAll().sort((a, b) => {
      if (a[field] < b[field]) return -1 * dir;
      if (a[field] > b[field]) return 1 * dir;
      return 0;
    });
  }

  /**
   * Paginate records.
   * @param {number} page     1-based page number
   * @param {number} perPage  Records per page
   * @param {Function|object} [predicate]  Optional filter
   * @returns {{ data, page, perPage, total, totalPages }}
   */
  paginate(page = 1, perPage = 10, predicate = null) {
    const all = predicate ? this.find(predicate) : this.findAll();
    const total = all.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const data = all.slice(start, start + perPage);
    return { data, page, perPage, total, totalPages };
  }

  /**
   * Aggregate — group records by a field and count.
   * @returns {object}  e.g. { Electronics: 12, Apparel: 8 }
   */
  groupCount(field) {
    const result = {};
    for (const r of this._store.values()) {
      const key = String(r[field] ?? 'Unknown');
      result[key] = (result[key] || 0) + 1;
    }
    return result;
  }

  /** Average of a numeric field across all (or filtered) records. */
  avg(field, predicate = null) {
    const records = predicate ? this.find(predicate) : this.findAll();
    if (!records.length) return 0;
    const sum = records.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
    return Math.round((sum / records.length) * 100) / 100;
  }
}

// ─── Database ─────────────────────────────────────────────────────────────────

class InMemoryDB extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, Collection>} */
    this._collections = new Map();
  }

  /**
   * Get (or create) a collection.
   * @param {string} name
   * @param {object} [options]   Passed to Collection constructor on first creation.
   * @returns {Collection}
   */
  collection(name, options) {
    if (!this._collections.has(name)) {
      const col = new Collection(name, options || {});
      this._collections.set(name, col);
      // Bubble up collection events to the DB level
      col.on('*', ({ event, payload }) =>
        this.emit(`${name}:${event}`, payload)
      );
    }
    return this._collections.get(name);
  }

  /** Drop all collections. */
  dropAll() {
    this._collections.forEach(col => col.drop());
    this._collections.clear();
  }

  /** Return a snapshot of stats for every collection. */
  stats() {
    const result = {};
    this._collections.forEach((col, name) => {
      result[name] = { count: col.count() };
    });
    return result;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const db = new InMemoryDB();

export { Collection };
export default db;
