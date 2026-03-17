import { useEffect, useRef, useCallback } from "react";

/**
 * Auto-saves form state to localStorage with debounce.
 * Restores on mount. Clears on successful submit.
 * Only active for "new" forms (not edit).
 */
export function useFormDraft<T extends Record<string, any>>(
  key: string,
  form: T,
  setForm: (val: T) => void,
  enabled: boolean = true
) {
  const isInitialized = useRef(false);

  // Restore draft on mount
  useEffect(() => {
    if (!enabled) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(parsed);
      }
    } catch {}
    isInitialized.current = true;
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced save
  useEffect(() => {
    if (!enabled || !isInitialized.current) return;
    const hasContent = Object.values(form).some((v) => v !== "" && v !== undefined && v !== null);
    if (!hasContent) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(form));
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [key, form, enabled]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(key); } catch {}
  }, [key]);

  const hasDraft = useCallback(() => {
    try { return !!localStorage.getItem(key); } catch { return false; }
  }, [key]);

  return { clearDraft, hasDraft };
}
