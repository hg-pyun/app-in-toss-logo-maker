import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'warn';

interface ToastItem {
  id: number;
  message: string;
  variant: Variant;
}

interface ToastContextValue {
  showToast: (message: string, opts?: { variant?: Variant; durationMs?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const showToast = useCallback<ToastContextValue['showToast']>((message, opts) => {
    const id = ++seq.current;
    const variant = opts?.variant ?? 'default';
    const durationMs = opts?.durationMs ?? 3500;
    setItems((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ items }: { items: ToastItem[] }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2"
    >
      {items.map((t) => (
        <ToastView key={t.id} item={t} />
      ))}
    </div>
  );
}

function ToastView({ item }: { item: ToastItem }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 10);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div
      className={cn(
        'pointer-events-auto rounded-md border bg-card px-4 py-3 text-sm shadow-lg transition-all',
        mounted ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
        item.variant === 'warn' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'text-card-foreground',
      )}
    >
      {item.message}
    </div>
  );
}
