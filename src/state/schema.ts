export type Orientation = "row" | "column";

export interface SettingDef<T> {
  default: T;
  // Validates a value read from the workbook; anything unexpected falls back to a safe value.
  parse: (stored: unknown) => T;
}

// Single place to declare task pane settings. Add an entry here to add a setting.
export const SETTINGS = {
  orientation: {
    default: "row" as Orientation,
    parse: (stored: unknown): Orientation => (stored === "column" ? "column" : "row"),
  },
} as const satisfies Record<string, SettingDef<any>>;

export type SettingKey = keyof typeof SETTINGS;
export type Settings = { [K in SettingKey]: (typeof SETTINGS)[K]["default"] };

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[];

export function defaultSettings(): Settings {
  return Object.fromEntries(SETTING_KEYS.map((k) => [k, SETTINGS[k].default])) as Settings;
}
