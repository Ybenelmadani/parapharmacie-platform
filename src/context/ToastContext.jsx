import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: TriangleAlert,
    wrapper: "border-rose-200 bg-rose-50 text-rose-900",
    iconClass: "text-rose-600",
  },
  info: {
    icon: Info,
    wrapper: "border-sky-200 bg-sky-50 text-sky-900",
    iconClass: "text-sky-600",
  },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur ${style.wrapper}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} />
              <div className="min-w-0 flex-1">
                {toast.title ? <div className="text-sm font-semibold">{toast.title}</div> : null}
                {toast.message ? <div className="text-sm opacity-90">{toast.message}</div> : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-current/70 transition hover:bg-black/5 hover:text-current"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    ({ type = "info", title = "", message = "", duration = 3200 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, type, title, message }]);

      const timeoutId = setTimeout(() => {
        dismiss(id);
      }, duration);

      timeoutsRef.current.set(id, timeoutId);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const activeTimeouts = timeoutsRef.current;

    return () => {
      activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      activeTimeouts.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      show,
      success: (message, options = {}) => show({ type: "success", message, ...options }),
      error: (message, options = {}) => show({ type: "error", message, ...options }),
      info: (message, options = {}) => show({ type: "info", message, ...options }),
      dismiss,
    }),
    [dismiss, show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
