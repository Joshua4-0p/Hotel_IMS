import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: ToastItem['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS = {
  success: <Check size={14} className="shrink-0 text-emerald-400" />,
  error:   <X    size={14} className="shrink-0 text-red-400"     />,
  info:    <Info size={14} className="shrink-0 text-sky-400"     />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom-right, above everything */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[300] flex flex-col-reverse gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{   opacity: 0, y: 8,   scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3.5 rounded-[0.5rem] bg-[#141414] text-white body-sm shadow-xl max-w-[340px] min-w-[220px]"
            >
              {ICONS[t.type]}
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
