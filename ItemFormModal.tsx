import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { type Item } from '@/lib/supabase';
import { X, Package, FileText, Hash, Upload, ImageIcon, Trash2 } from 'lucide-react';

export type ItemFormData = {
  title: string;
  description: string;
  quantity: number;
  image_url: string;
  location: 'room' | 'warehouse';
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  location: 'room' | 'warehouse';
  editingItem?: Item | null;
  onSubmit: (data: ItemFormData) => void;
};

const MAX_IMAGE_DIMENSION = 600;
const JPEG_QUALITY = 0.7;

function fileToCompressedDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ItemFormModal({ isOpen, onClose, location, editingItem, onSubmit }: Props) {
  const { t, lang } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageData, setImageData] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || '');
      setQuantity(String(editingItem.quantity));
      setImageData(editingItem.image_url || '');
    } else {
      setTitle('');
      setDescription('');
      setQuantity('');
      setImageData('');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const inputClass = `w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 ${
    lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'
  } text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent`;

  const iconStyle = lang === 'ar' ? { right: '12px' } : { left: '12px' };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setIsProcessingImage(true);
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      setImageData(dataUrl);
    } catch {
      // ignore
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    const data: ItemFormData = {
      title: title.trim(),
      description: description.trim(),
      quantity: Math.max(0, parseInt(quantity) || 0),
      image_url: imageData,
      location,
    };
    if (!data.title) return;
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="modal-content relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {editingItem ? t.items.editItem : t.items.addItem}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.items.title}
            </label>
            <div className="relative">
              <Package size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={iconStyle} />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.items.titlePlaceholder}
                className={inputClass}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.items.description}
            </label>
            <div className="relative">
              <FileText size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={iconStyle} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.items.descriptionPlaceholder}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.items.quantity}
            </label>
            <div className="relative">
              <Hash size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={iconStyle} />
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.items.imageUrl}
            </label>

            {/* Preview or upload area */}
            {imageData ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img
                  src={imageData}
                  alt="preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 text-white text-xs font-medium backdrop-blur-sm"
                  >
                    <Upload size={14} />
                    {t.items.changeImage}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageData('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-medium backdrop-blur-sm"
                  >
                    <Trash2 size={14} />
                    {t.items.removeImage}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                {isProcessingImage ? (
                  <>
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                    <span className="text-xs">...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <ImageIcon size={24} />
                    </div>
                    <span className="text-sm font-medium">{t.items.uploadImage}</span>
                    <span className="text-xs text-slate-400">{t.items.imageUrlPlaceholder}</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t.items.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold"
          >
            {t.items.save}
          </button>
        </div>
      </div>
    </div>
  );
}
