import { useCallback, useState } from "react";
import { type SettingKey, type Settings, useSettings } from "../../state";

// Value, setter and save status for one setting. Each caller keeps its own busy/error state.
export function useSetting<K extends SettingKey>(key: K) {
  const value = useSettings((s) => s.values[key]);
  const update = useSettings((s) => s.update);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback(
    async (next: Settings[K]) => {
      setBusy(true);
      setError(null);
      try {
        await update({ [key]: next } as Partial<Settings>);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [key, update]
  );

  return { value, set, busy, error };
}
