import { useState, useRef } from 'react';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { createProduct } from '../../services/productService';

const TEMPLATE_HEADERS = ['name', 'brand', 'sku', 'category', 'price', 'description'];
const TEMPLATE_CSV =
  'name,brand,sku,category,price,description\n' +
  'ZenBook Pro 14,ZenTech,SKU-1001,Electronics,1299,A premium 14-inch ultrabook with all-day battery.\n' +
  'Maple Protein Chips,SnackCo,SKU-2002,Food & Beverage,4.99,High-protein baked chips with maple seasoning.\n';

/** Minimal CSV parser: handles quoted fields, commas, and CRLF/LF newlines. */
function parseCSV(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(v => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some(v => v.trim() !== '')) rows.push(row); }
  return rows;
}

/** Turn parsed CSV rows into product payloads keyed by header name. */
function rowsToProducts(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(cells => {
    const rec = {};
    headers.forEach((h, i) => { rec[h] = (cells[i] || '').trim(); });
    return {
      name: rec.name || '',
      brand: rec.brand || '',
      sku: rec.sku || '',
      category: rec.category || '',
      price: rec.price ? parseFloat(rec.price) || 0 : 0,
      description: rec.description || '',
      productType: rec.product || rec.producttype || '',
      targetMarkets: ['US'],
    };
  });
}

export default function BulkUploadModal({ isOpen, onClose, onImported }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);          // parsed product payloads
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);    // { created, failed }

  const reset = () => {
    setFileName(''); setRows([]); setError(''); setImporting(false); setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => { reset(); onClose(); };

  const handleFile = async (file) => {
    setError(''); setResult(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = rowsToProducts(parseCSV(text));
      const valid = parsed.filter(p => p.name && p.category);
      if (parsed.length === 0) setError('No data rows found in the CSV.');
      else if (valid.length === 0) setError('Rows are missing required "name" and "category" columns.');
      setRows(parsed);
    } catch {
      setError('Could not read that file. Please upload a valid .csv.');
      setRows([]);
    }
  };

  const importable = rows.filter(p => p.name && p.category);

  const handleImport = async () => {
    setImporting(true);
    let created = 0;
    const failed = [];
    for (let i = 0; i < rows.length; i++) {
      const p = rows[i];
      if (!p.name || !p.category) { failed.push({ row: i + 2, reason: 'missing name/category' }); continue; }
      try { await createProduct(p); created += 1; }
      catch (e) { failed.push({ row: i + 2, reason: e.message || 'create failed' }); }
    }
    setImporting(false);
    setResult({ created, failed });
    if (created > 0) onImported?.();
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'product-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const footer = result ? (
    <Button onClick={close}>Done</Button>
  ) : (
    <>
      <Button variant="ghost" onClick={close} disabled={importing}>Cancel</Button>
      <Button onClick={handleImport} loading={importing} disabled={importable.length === 0}>
        Import {importable.length || ''} product{importable.length === 1 ? '' : 's'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={close} title="Bulk upload via CSV"
      subtitle="Import multiple products at once from a CSV file." size="lg" footer={footer}>
      {result ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
            <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm font-500 text-green-800">
              {result.created} product{result.created === 1 ? '' : 's'} imported as pending.
            </p>
          </div>
          {result.failed.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm font-500 text-yellow-800 flex items-center gap-1.5">
                <FiAlertTriangle className="w-4 h-4" /> {result.failed.length} row(s) skipped
              </p>
              <ul className="mt-1 text-xs text-yellow-700 list-disc pl-5">
                {result.failed.slice(0, 6).map((f, i) => <li key={i}>Row {f.row}: {f.reason}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Required columns: <span className="font-500">{TEMPLATE_HEADERS.join(', ')}</span>
            </p>
            <button onClick={downloadTemplate} className="text-xs text-teal-700 hover:underline flex items-center gap-1">
              <FiDownload className="w-3.5 h-3.5" /> Download template
            </button>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-gray-50 transition-colors"
          >
            <FiUploadCloud className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-500 text-gray-700">{fileName || 'Choose a CSV file'}</span>
            <span className="text-xs text-gray-400">Click to browse — .csv only</span>
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden"
            onChange={e => handleFile(e.target.files?.[0])} />

          {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><FiAlertTriangle className="w-4 h-4" /> {error}</p>}

          {importable.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                <FiFileText className="w-4 h-4 text-gray-400" />
                {importable.length} product{importable.length === 1 ? '' : 's'} ready to import
                {rows.length !== importable.length && ` (${rows.length - importable.length} incomplete row(s) will be skipped)`}
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-400 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-500">Name</th>
                      <th className="text-left py-2 px-3 font-500">Category</th>
                      <th className="text-left py-2 px-3 font-500">Brand</th>
                      <th className="text-left py-2 px-3 font-500">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importable.slice(0, 50).map((p, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-gray-900 font-500">{p.name}</td>
                        <td className="py-2 px-3 text-gray-600">{p.category}</td>
                        <td className="py-2 px-3 text-gray-600">{p.brand || '—'}</td>
                        <td className="py-2 px-3 text-gray-600">{p.price ? `$${p.price}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
