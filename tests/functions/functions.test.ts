import { ErrorCode, FakeCustomFunctionError, documentSettings } from "../fakes/office";
import { createInvocation, flush } from "../fakes/invocation";

let computeFactorials: jest.Mock;
let factorialRow: typeof import("../../src/functions/functions").factorialRow;
let useSettings: typeof import("../../src/state").useSettings;

beforeEach(() => {
  jest.resetModules();
  computeFactorials = jest.fn(async (n: number) => {
    const { factorialCells } = jest.requireActual("../../src/core");
    return factorialCells(n);
  });
  jest.doMock("../../src/worker", () => ({ computeFactorials }));
  ({ factorialRow } = require("../../src/functions/functions"));
  ({ useSettings } = require("../../src/state"));
});

test("loads saved settings when Office is ready", () => {
  expect(Office.onReady).toHaveBeenCalled();
  expect(useSettings.getState().loaded).toBe(true);
});

test("pushes a row of factorials by default", async () => {
  const { invocation, last } = createInvocation();
  factorialRow(5, invocation as never);
  await flush();
  expect(last()).toEqual([[1, 1, 2, 6, 24, 120]]);
  expect(computeFactorials).toHaveBeenCalledWith(5);
});

test("pushes a column when the saved setting is column", async () => {
  jest.resetModules();
  documentSettings().store.set("factorial.orientation", "column");
  delete (globalThis as Record<symbol, unknown>)[Symbol.for("factorial.settingsStore")];
  jest.doMock("../../src/worker", () => ({ computeFactorials }));
  ({ factorialRow } = require("../../src/functions/functions"));

  const { invocation, last } = createInvocation();
  factorialRow(2, invocation as never);
  await flush();
  expect(last()).toEqual([[1], [1], [2]]);
});

test("re-shapes the result when orientation changes, without recomputing", async () => {
  const { invocation, results } = createInvocation();
  factorialRow(3, invocation as never);
  await flush();

  await useSettings.getState().update({ orientation: "column" });
  await useSettings.getState().update({ orientation: "row" });

  expect(results).toEqual([[[1, 1, 2, 6]], [[1], [1], [2], [6]], [[1, 1, 2, 6]]]);
  expect(computeFactorials).toHaveBeenCalledTimes(1);
});

test("waits for the values before reacting to a setting change", async () => {
  let reply!: (values: unknown[]) => void;
  computeFactorials.mockImplementationOnce(() => new Promise((resolve) => (reply = resolve)));
  const { invocation, last } = createInvocation();
  factorialRow(1, invocation as never);

  await useSettings.getState().update({ orientation: "column" }); // before the worker replies
  expect(invocation.setResult).not.toHaveBeenCalled();

  reply([1, 1]);
  await flush();
  expect(last()).toEqual([[1], [1]]);
});

test("ignores store changes that do not affect orientation", async () => {
  const { invocation } = createInvocation();
  factorialRow(1, invocation as never);
  await flush();

  useSettings.setState({ loaded: false });
  expect(invocation.setResult).toHaveBeenCalledTimes(1);
});

test("stops pushing after the invocation is canceled", async () => {
  const { invocation } = createInvocation();
  factorialRow(3, invocation as never);
  await flush();

  invocation.onCanceled!();
  await useSettings.getState().update({ orientation: "column" });
  expect(invocation.setResult).toHaveBeenCalledTimes(1);
});

test("does not push late results after being canceled", async () => {
  const { invocation } = createInvocation();
  factorialRow(3, invocation as never);
  invocation.onCanceled!();
  await flush();
  expect(invocation.setResult).not.toHaveBeenCalled();
});

test.each([
  [-1, "N must not be negative."],
  [2.5, "N must be a whole number."],
  [501, "N must not exceed 500."],
])("returns #NUM! for invalid N %p without computing", (n, message) => {
  const { invocation, last } = createInvocation();
  factorialRow(n, invocation as never);
  expect(last()).toBeInstanceOf(FakeCustomFunctionError);
  expect(last()).toMatchObject({ code: ErrorCode.invalidNumber, message });
  expect(computeFactorials).not.toHaveBeenCalled();
});

test.each([
  [new Error("worker crashed"), "worker crashed"],
  ["plain failure", "plain failure"],
])("returns #N/A when the worker fails with %p", async (thrown, message) => {
  computeFactorials.mockRejectedValueOnce(thrown);
  const { invocation, last } = createInvocation();
  factorialRow(3, invocation as never);
  await flush();
  expect(last()).toMatchObject({ code: ErrorCode.notAvailable, message });
});

test("does not report a worker failure after being canceled", async () => {
  computeFactorials.mockRejectedValueOnce(new Error("late"));
  const { invocation } = createInvocation();
  factorialRow(3, invocation as never);
  invocation.onCanceled!();
  await flush();
  expect(invocation.setResult).not.toHaveBeenCalled();
});
