import { createSettingsStore } from "./store";

// The task pane and the functions are separate webpack bundles running in one shared runtime.
// Each bundle gets its own copy of this module, so the store lives on globalThis to be shared.
// Symbol.for (not Symbol) so both bundles resolve the same key from the global symbol registry.
const GLOBAL_KEY = Symbol.for("factorial.settingsStore");

type SettingsStore = ReturnType<typeof createSettingsStore>;
const globalScope = globalThis as unknown as Record<symbol, SettingsStore | undefined>;

export const useSettings: SettingsStore = (globalScope[GLOBAL_KEY] ??= createSettingsStore());
