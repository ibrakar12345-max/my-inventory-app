import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const borders = {
    success: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto bg-white dark:bg-slate-800 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${borders[toast.type]} px-4 py-3 flex items-center gap-3`}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
