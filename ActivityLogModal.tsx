import { useApp } from '@/context/AppContext';
import { type ActivityLog } from '@/lib/supabase';
import { X, History, Plus, Pencil, Trash2, Minus, Undo2, ArrowRightLeft } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
};

const actionConfig = {
  add: { icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  edit: { icon: Pencil, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  delete: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
  decrease: { icon: Minus, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  restore: { icon: Undo2, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/40' },
  move: { icon: ArrowRightLeft, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
};

export default function ActivityLogModal({ isOpen, onClose, logs }: Props) {
  const { t, lang } = useApp();

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="modal-content relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <History size={22} className="text-slate-600 dark:text-slate-300" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {t.activityLog.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <History size={48} className="mx-auto mb-3 opacity-50" />
              <p>{t.activityLog.noLogs}</p>
            </div>
          ) : (
            logs.map((log) => {
              const config = actionConfig[log.action];
              const Icon = config.icon;
              return (
                <div
                  key={log.id}
                  className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {log.item_name}
                      </span>
                      <span className={`text-xs font-medium ${config.color}`}>
                        {t.activityLog.actions[log.action]}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {log.details}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <span>{log.username}</span>
                      <span>•</span>
                      <span>{formatDate(log.created_at)}</span>
                      <span>•</span>
                      <span>{formatTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
