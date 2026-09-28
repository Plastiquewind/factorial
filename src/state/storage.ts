/* global Office */
import { SETTINGS, SETTING_KEYS, type SettingKey, type Settings, defaultSettings } from "./schema";

// Settings live in the workbook (Office document settings), so they travel with the file.

export function storageKey(key: SettingKey): string {
  return `factorial.${key}`;
}

function readStored(key: SettingKey): unknown {
  const value = Office.context.document.settings.get(storageKey(key));
  return value ?? SETTINGS[key].default;
}

export function readSettings(): Settings {
  const values = defaultSettings();
  for (const key of SETTING_KEYS) {
    (values as Record<SettingKey, unknown>)[key] = SETTINGS[key].parse(readStored(key));
  }
  return values;
}

export function writeSettings(values: Partial<Settings>): Promise<void> {
  const docSettings = Office.context.document.settings;
  for (const key of Object.keys(values) as SettingKey[]) {
    docSettings.set(storageKey(key), values[key]);
  }
  return new Promise((resolve, reject) => {
    docSettings.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) resolve();
      else reject(result.error);
    });
  });
}
