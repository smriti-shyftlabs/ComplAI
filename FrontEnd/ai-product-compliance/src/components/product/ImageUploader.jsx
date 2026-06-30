import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX, FiPlus } from 'react-icons/fi';

export default function ImageUploader({ images = [], onChange, maxImages = 8, label = 'Product Images' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const newImages = [...images];
    Array.from(files).slice(0, maxImages - images.length).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newImages.push({ url, name: file.name, file });
      }
    });
    onChange(newImages);
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-500 text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{images.length}/{maxImages} images</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group aspect-square"
            >
              <img
                src={img.url || img}
                alt={img.name || `Product image ${i + 1}`}
                className="w-full h-full object-cover rounded-xl border border-gray-200"
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-500">Main</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
          >
            <FiPlus className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <FiImage className="w-3.5 h-3.5" />
        First image will be used as main product image. Minimum 1000x1000px recommended.
      </p>
    </div>
  );
}
