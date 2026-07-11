"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; message: string; tone: ToastTone };
type ToastOptions = { tone?: ToastTone; duration?: number };
type ToastContextValue = { showToast: (message: string, options?: ToastOptions) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = ++nextId.current;
    const tone = options.tone ?? "info";
    setItems((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), options.duration ?? 4000);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return <ToastContext.Provider value={value}>{children}<div className="toast-viewport" aria-live="polite" aria-atomic="true">{items.map((item) => <div className={`app-toast app-toast--${item.tone}`} role={item.tone === "error" ? "alert" : "status"} key={item.id}>{item.tone === "success" ? <CheckCircle2 /> : item.tone === "error" ? <CircleAlert /> : <Info />}<span>{item.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}><X /></button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
