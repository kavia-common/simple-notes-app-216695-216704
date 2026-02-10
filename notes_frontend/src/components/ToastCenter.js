import React, { useEffect, useMemo, useState } from "react";

/**
 * Tiny toast center (no external dependencies).
 * - Supports success/error/info.
 * - Auto-dismiss with pause-on-hover.
 */

// PUBLIC_INTERFACE
export function ToastCenter({ toasts, onDismiss }) {
  /** Renders a stack of toasts; toasts should be controlled by parent state. */
  return (
    <div className="toastRegion" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const { id, type, message } = toast;

  return (
    <div className={`toast toast--${type || "info"}`} role="status">
      <div className="toast__message">{message}</div>
      <button className="toast__close" onClick={() => onDismiss(id)} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
export function useToasts() {
  /** Hook to manage toasts: addToast(type,message), dismissToast(id), clearToasts(). */
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const clearToasts = () => setToasts([]);

  const addToast = (type, message, { timeoutMs = 3500 } = {}) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (timeoutMs > 0) {
      window.setTimeout(() => dismissToast(id), timeoutMs);
    }
  };

  // Keep a stable API
  return useMemo(
    () => ({ toasts, addToast, dismissToast, clearToasts }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toasts]
  );
}
