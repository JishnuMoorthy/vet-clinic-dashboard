import { useEffect, useCallback, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Warns users when navigating away from a form with unsaved changes.
 * Uses both react-router blocker and browser beforeunload event.
 */
export function useUnsavedChanges(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Browser tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // React Router navigation
  const blocker = useBlocker(
    useCallback(
      () => isDirtyRef.current,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    )
  );

  return blocker;
}
