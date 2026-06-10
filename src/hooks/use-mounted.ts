import { useState, useEffect } from "react";

/**
 * Hook that returns true only after the component has mounted on the client.
 * Used to avoid hydration mismatches with components that rely on browser APIs
 * (e.g., Recharts, window dimensions).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
