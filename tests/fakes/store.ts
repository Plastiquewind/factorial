import { useSettings } from "../../src/state";

// Captured once, with the store's real actions bound to this store instance.
const initialState = useSettings.getState();

// Test files that import the shared store statically keep one instance for the whole file;
// this puts it back to its initial, unloaded state (and undoes any replaced actions).
export function resetSettingsStore() {
  useSettings.setState(initialState, true);
}
