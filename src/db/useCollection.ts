import { useCallback, useEffect, useState } from "react";
import { vault } from "./vault";

export function useCollection<T>(collection: string, fallback: T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!vault.unlocked) return;
    const value = await vault.get<T>(collection, fallback);
    setData(value);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  useEffect(() => {
    reload();
    const unsub = vault.subscribe(() => {
      reload();
    });
    return unsub;
  }, [reload]);

  const save = useCallback(
    async (value: T) => {
      setData(value);
      await vault.set(collection, value);
    },
    [collection],
  );

  return { data, setData: save, loading, reload };
}
