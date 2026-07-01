import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiFileText, FiX, FiCheck } from 'react-icons/fi';

export default function UploadBox({
  label = 'Upload Files',
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = true,
  files = [],
  onChange,
  helperText = 'Drop files here or click to browse'
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (newFiles) => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 800));
    const processed = Array.from(newFiles).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      file: f,
      uploadedAt: new Date().toISOString()
    }));
    onChange([...files, ...processed]);
    setUploading(false);
  };

  const removeFile = (i) => onChange(files.filter((_, idx) => idx !== i));

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (type) => {
    if (type?.includes('pdf')) return <FiFileText className="w-4 h-4 text-red-500" />;
    if (type?.includes('image')) return <FiFile className="w-4 h-4 text-teal-600" />;
    return <FiFile className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div>
      {label && <label className="block text-sm font-500 text-gray-700 mb-1.5">{label}</label>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all
          ${dragging ? 'border-teal-600 bg-teal-50 scale-[1.01]' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50 bg-white'}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <svg className="animate-spin w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm text-teal-700 font-500">Uploading files...</p>
          </div>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-teal-100' : 'bg-gray-100'}`}>
              <FiUploadCloud className={`w-6 h-6 transition-colors ${dragging ? 'text-teal-700' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-500 text-gray-700">{helperText}</p>
              <p className="text-xs text-gray-400 mt-1">Supports: {accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="text-xs text-teal-700 font-600 hover:underline bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                Browse Files
              </button>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
            {files.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {getIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-500 text-gray-700 truncate">{file.name}</p>
                  {file.size && <p className="text-xs text-gray-400">{formatSize(file.size)}</p>}
                </div>
                <FiCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
