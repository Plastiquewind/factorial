import { create } from "zustand";
import { type SettingKey, type Settings, defaultSettings } from "./schema";
import { readSettings, writeSettings } from "./storage";

export interface SettingsState {
  values: Settings;
  loaded: boolean;
  load: () => void;
  update: (patch: Partial<Settings>) => Promise<void>;
}

export function createSettingsStore() {
  return create<SettingsState>((set, get) => ({
    values: defaultSettings(),
    loaded: false,

    load: () => {
      if (get().loaded) return;
      set({ values: readSettings(), loaded: true });
    },

    // Applies several changes at once with one save. Streaming functions subscribed to the
    // store pick up the new values themselves, so no workbook recalculation is needed.
    update: async (patch) => {
      const current = get().values;
      const changed = (Object.keys(patch) as SettingKey[]).filter(
        (k) => patch[k] !== undefined && patch[k] !== current[k]
      );
      if (changed.length === 0) return;

      const changes = Object.fromEntries(changed.map((k) => [k, patch[k]])) as Partial<Settings>;
      set({ values: { ...current, ...changes } });
      await writeSettings(changes);
    },
  }));
}
