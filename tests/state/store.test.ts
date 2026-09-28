import { createSettingsStore } from "../../src/state/store";
import { documentSettings } from "../fakes/office";

describe("createSettingsStore", () => {
  test("starts with defaults and not loaded", () => {
    const store = createSettingsStore();
    expect(store.getState().values).toEqual({ orientation: "row" });
    expect(store.getState().loaded).toBe(false);
  });

  test("load reads the workbook once", () => {
    documentSettings().store.set("factorial.orientation", "column");
    const store = createSettingsStore();

    store.getState().load();
    expect(store.getState()).toMatchObject({ values: { orientation: "column" }, loaded: true });

    documentSettings().store.set("factorial.orientation", "row");
    store.getState().load();
    expect(store.getState().values.orientation).toBe("column");
    expect(documentSettings().get).toHaveBeenCalledTimes(1);
  });

  test("update changes the value, notifies subscribers and saves", async () => {
    const store = createSettingsStore();
    const listener = jest.fn();
    store.subscribe(listener);

    await store.getState().update({ orientation: "column" });

    expect(store.getState().values.orientation).toBe("column");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(documentSettings().store.get("factorial.orientation")).toBe("column");
    expect(documentSettings().saveAsync).toHaveBeenCalledTimes(1);
  });

  test("update does nothing when nothing changes", async () => {
    const store = createSettingsStore();
    const listener = jest.fn();
    store.subscribe(listener);

    await store.getState().update({ orientation: "row" });
    await store.getState().update({ orientation: undefined });
    await store.getState().update({});

    expect(listener).not.toHaveBeenCalled();
    expect(documentSettings().saveAsync).not.toHaveBeenCalled();
  });

  test("update rejects when saving fails but keeps the new value in memory", async () => {
    const store = createSettingsStore();
    documentSettings().failNextSave(new Error("save failed"));

    await expect(store.getState().update({ orientation: "column" })).rejects.toThrow("save failed");
    expect(store.getState().values.orientation).toBe("column");
  });
});
