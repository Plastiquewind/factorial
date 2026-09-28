/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { useSetting } from "../../src/taskpane/hooks";
import { useSettings } from "../../src/state";
import { documentSettings } from "../fakes/office";
import { resetSettingsStore } from "../fakes/store";

beforeEach(resetSettingsStore);

test("returns the current value", () => {
  const { result } = renderHook(() => useSetting("orientation"));
  expect(result.current).toMatchObject({ value: "row", busy: false, error: null });
});

test("set saves the value and ends not busy", async () => {
  const { result } = renderHook(() => useSetting("orientation"));
  await act(() => result.current.set("column"));
  expect(result.current).toMatchObject({ value: "column", busy: false, error: null });
  expect(documentSettings().store.get("factorial.orientation")).toBe("column");
});

test("is busy while saving", async () => {
  let finishSave!: () => void;
  documentSettings().saveAsync.mockImplementationOnce((callback) => {
    finishSave = () => callback({ status: "succeeded" });
  });
  const { result } = renderHook(() => useSetting("orientation"));

  let pending!: Promise<void>;
  act(() => {
    pending = result.current.set("column");
  });
  expect(result.current.busy).toBe(true);

  await act(async () => {
    finishSave();
    await pending;
  });
  expect(result.current.busy).toBe(false);
});

test.each([
  [new Error("save failed"), "save failed"],
  ["plain failure", "plain failure"],
])("reports a failed save %p as an error", async (thrown, message) => {
  useSettings.setState({ update: jest.fn().mockRejectedValue(thrown) });
  const { result } = renderHook(() => useSetting("orientation"));
  await act(() => result.current.set("column"));
  expect(result.current).toMatchObject({ busy: false, error: message });
});

test("clears a previous error on the next attempt", async () => {
  documentSettings().failNextSave(new Error("once"));
  const { result } = renderHook(() => useSetting("orientation"));
  await act(() => result.current.set("column"));
  expect(result.current.error).toBe("once");

  await act(() => result.current.set("row"));
  expect(result.current.error).toBeNull();
});
