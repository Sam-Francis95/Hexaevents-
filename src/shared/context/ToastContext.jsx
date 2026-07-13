import { useCallback, useMemo, useState } from 'react';
import { ToastContext } from './ToastContextBase.js';

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { variant = 'info', duration = 4000 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toasts,
      show,
      dismiss,
      success: (msg, opts) => show(msg, { ...opts, variant: 'success' }),
      error: (msg, opts) => show(msg, { ...opts, variant: 'danger' }),
      info: (msg, opts) => show(msg, { ...opts, variant: 'info' }),
    }),
    [toasts, show, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
