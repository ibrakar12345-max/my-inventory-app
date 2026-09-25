import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { type Item } from '@/lib/supabase';
import { Minus, Undo2, Pencil, Trash2, Package, AlertTriangle, ArrowRightLeft } from 'lucide-react';

type Props = {
  item: Item;
  onDecrease: (item: Item) => void;
  onRestore: (item: Item) => void;
  onMove: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export default function ItemCard({ item, onDecrease, onRestore, onMove, onEdit, onDelete }: Props) {
  const { t, lang, user } = useApp();
  const isAdmin = user?.role === 'admin';
  const isLowStock = item.quantity > 0 && item.quantity <= 3;
  const isOutOfStock = item.quantity === 0;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.image_url]);

  const showImage = item.image_url && !imageError;

  return (
    <div
      className={`item-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
        {showImage ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
            <Package size={48} />
          </div>
        )}

        {/* Quantity badge */}
        <div
          className={`absolute top-2 ${
            lang === 'ar' ? 'left-2' : 'right-2'
          } px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
            isOutOfStock
              ? 'bg-red-500 text-white'
              : isLowStock
                ? 'bg-amber-500 text-white'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200'
          }`}
        >
          {t.items.quantity}: {item.quantity}
        </div>

        {/* Low stock indicator */}
        {isLowStock && (
          <div className={`absolute top-2 ${lang === 'ar' ? 'right-2' : 'left-2'}`}>
            <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-sm">
              <AlertTriangle size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1 line-clamp-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {/* Decrease (everyone) */}
          <button
            onClick={() => onDecrease(item)}
            disabled={item.quantity === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={16} />
            {t.items.decrease}
          </button>

          {/* Restore (everyone) */}
          <button
            onClick={() => onRestore(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-sm font-medium"
          >
            <Undo2 size={16} />
            {t.items.restore}
          </button>

          {/* Move (admin only) */}
          {isAdmin && (
            <button
              onClick={() => onMove(item)}
              className="flex items-center justify-center p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40"
              title={item.location === 'room' ? t.items.moveToWarehouse : t.items.moveToRoom}
            >
              <ArrowRightLeft size={16} />
            </button>
          )}

          {/* Edit (admin only) */}
          {isAdmin && (
            <button
              onClick={() => onEdit(item)}
              className="flex items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              <Pencil size={16} />
            </button>
          )}

          {/* Delete (admin only) */}
          {isAdmin && (
            <button
              onClick={() => onDelete(item)}
              className="flex items-center justify-center p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
