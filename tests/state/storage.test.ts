import { readSettings, storageKey, writeSettings } from "../../src/state/storage";
import { documentSettings } from "../fakes/office";

describe("readSettings", () => {
  test("returns defaults for an empty workbook", () => {
    expect(readSettings()).toEqual({ orientation: "row" });
    expect(documentSettings().get).toHaveBeenCalledWith("factorial.orientation");
  });

  test("returns stored values", () => {
    documentSettings().store.set(storageKey("orientation"), "column");
    expect(readSettings()).toEqual({ orientation: "column" });
  });

  test("falls back to a safe value for invalid stored data", () => {
    documentSettings().store.set(storageKey("orientation"), "diagonal");
    expect(readSettings()).toEqual({ orientation: "row" });
  });
});

describe("writeSettings", () => {
  test("sets each key and saves the workbook settings once", async () => {
    await writeSettings({ orientation: "column" });
    const settings = documentSettings();
    expect(settings.store.get("factorial.orientation")).toBe("column");
    expect(settings.saveAsync).toHaveBeenCalledTimes(1);
  });

  test("rejects when saving fails", async () => {
    const error = new Error("save failed");
    documentSettings().failNextSave(error);
    await expect(writeSettings({ orientation: "column" })).rejects.toBe(error);
  });
});
