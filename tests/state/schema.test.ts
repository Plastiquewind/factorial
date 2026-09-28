import { SETTINGS, SETTING_KEYS, defaultSettings } from "../../src/state/schema";
import { storageKey } from "../../src/state/storage";

test("defaults come from the schema", () => {
  expect(defaultSettings()).toEqual({ orientation: "row" });
});

test("orientation parse falls back to row for unexpected values", () => {
  const { parse } = SETTINGS.orientation;
  expect(parse("column")).toBe("column");
  expect(parse("row")).toBe("row");
  expect(parse(undefined)).toBe("row");
  expect(parse("COLUMN")).toBe("row");
  expect(parse(42)).toBe("row");
});

test("storage keys are namespaced", () => {
  expect(SETTING_KEYS).toEqual(["orientation"]);
  expect(storageKey("orientation")).toBe("factorial.orientation");
});
