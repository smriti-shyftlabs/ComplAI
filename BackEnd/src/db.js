/**
 * db.js — SQLite-backed document store.
 *
 * Each collection is a table of (id TEXT PRIMARY KEY, doc JSON). We query the
 * JSON with SQLite's json_extract(), so collections stay schema-flexible and
 * the route code mirrors the frontend's old InMemoryDB API almost 1:1.
 *
 * The Collection class exposes: insert, insertMany, findById, findAll, find,
 * findOne, findByIndex, update, updateWhere, delete, deleteWhere, count,
 * groupCount, avg, sort, paginate, search.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'complianceai.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

class Collection {
  /**
   * @param {string} name              Table name
   * @param {object} options
   * @param {string}   options.idPrefix Prefix for generated IDs (e.g. "PRD")
   */
  constructor(name, options = {}) {
    this.name = name;
    this._idPrefix = options.idPrefix || name.toUpperCase().slice(0, 3);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT PRIMARY KEY, doc TEXT NOT NULL)`).run();
    this._seq = this._maxSeq();
  }

  _maxSeq() {
    const rows = db.prepare(`SELECT id FROM ${this.name}`).all();
    let max = 0;
    for (const { id } of rows) {
      const n = parseInt(String(id).split('-').pop(), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
    return max;
  }

  nextId() {
    this._seq += 1;
    return `${this._idPrefix}-${String(this._seq).padStart(3, '0')}`;
  }

  // ── internal helpers ────────────────────────────────────────────────────
  _row(id) {
    const r = db.prepare(`SELECT doc FROM ${this.name} WHERE id = ?`).get(id);
    return r ? JSON.parse(r.doc) : null;
  }

  _all() {
    return db.prepare(`SELECT doc FROM ${this.name}`).all().map(r => JSON.parse(r.doc));
  }

  _write(record) {
    db.prepare(`INSERT INTO ${this.name} (id, doc) VALUES (?, ?)
                ON CONFLICT(id) DO UPDATE SET doc = excluded.doc`)
      .run(record.id, JSON.stringify(record));
    return record;
  }

  // ── reads ───────────────────────────────────────────────────────────────
  count() {
    return db.prepare(`SELECT COUNT(*) c FROM ${this.name}`).get().c;
  }

  findById(id) {
    return this._row(id);
  }

  findAll() {
    return this._all();
  }

  /** Predicate function OR plain equality object. */
  find(predicate) {
    if (typeof predicate === 'function') return this._all().filter(predicate);
    if (predicate && typeof predicate === 'object') {
      const entries = Object.entries(predicate);
      return this._all().filter(r => entries.every(([k, v]) => r[k] === v));
    }
    return [];
  }

  findOne(predicate) {
    const r = this.find(predicate);
    return r.length ? r[0] : null;
  }

  /** Equality lookup on a single field, via json_extract. */
  findByIndex(field, value) {
    const rows = db
      .prepare(`SELECT doc FROM ${this.name} WHERE json_extract(doc, '$.' || ?) = ?`)
      .all(field, value);
    return rows.map(r => JSON.parse(r.doc));
  }

  // ── writes ────────────────────────────────────────────────────────────────
  insert(data) {
    const id = String(data.id || this.nextId());
    const n = parseInt(id.split('-').pop(), 10);
    if (!Number.isNaN(n) && n > this._seq) this._seq = n;
    return this._write({ ...data, id });
  }

  insertMany(arr) {
    const tx = db.transaction(items => items.map(d => this.insert(d)));
    return tx(arr);
  }

  update(id, patch) {
    const existing = this._row(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
    return this._write(updated);
  }

  updateWhere(predicate, patch) {
    return this.find(predicate).map(r => this.update(r.id, patch)).filter(Boolean);
  }

  delete(id) {
    const existing = this._row(id);
    if (!existing) return null;
    db.prepare(`DELETE FROM ${this.name} WHERE id = ?`).run(id);
    return existing;
  }

  deleteWhere(predicate) {
    const matches = this.find(predicate);
    matches.forEach(r => this.delete(r.id));
    return matches.length;
  }

  clear() {
    db.prepare(`DELETE FROM ${this.name}`).run();
    this._seq = 0;
  }

  // ── aggregates / queries ──────────────────────────────────────────────────
  sort(field, order = 'asc') {
    const dir = order === 'desc' ? -1 : 1;
    return this._all().sort((a, b) => {
      if (a[field] < b[field]) return -1 * dir;
      if (a[field] > b[field]) return 1 * dir;
      return 0;
    });
  }

  paginate(page = 1, perPage = 10, predicate = null) {
    const all = predicate ? this.find(predicate) : this._all();
    const total = all.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    return { data: all.slice(start, start + perPage), page, perPage, total, totalPages };
  }

  groupCount(field) {
    const rows = db
      .prepare(`SELECT json_extract(doc, '$.' || ?) k, COUNT(*) c FROM ${this.name} GROUP BY k`)
      .all(field);
    const out = {};
    for (const { k, c } of rows) out[k ?? 'Unknown'] = c;
    return out;
  }

  avg(field, predicate = null) {
    if (predicate) {
      const records = this.find(predicate);
      if (!records.length) return 0;
      const sum = records.reduce((a, r) => a + (Number(r[field]) || 0), 0);
      return Math.round((sum / records.length) * 100) / 100;
    }
    const r = db
      .prepare(`SELECT AVG(CAST(json_extract(doc, '$.' || ?) AS REAL)) a FROM ${this.name}`)
      .get(field);
    return r.a == null ? 0 : Math.round(r.a * 100) / 100;
  }
}

const collections = new Map();

/** Get (or lazily create) a collection. */
export function collection(name, options) {
  if (!collections.has(name)) collections.set(name, new Collection(name, options || {}));
  return collections.get(name);
}

export default db;
