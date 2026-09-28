import type { FactorialRequest, FactorialResponse } from "../../src/worker/protocol";

type WorkerScope = {
  onmessage?: (event: { data: FactorialRequest }) => void;
  postMessage: jest.Mock<void, [FactorialResponse]>;
};

// Loads the worker script against a fake `self`, the way a browser would.
function loadWorker(): WorkerScope {
  const scope: WorkerScope = { postMessage: jest.fn() };
  (globalThis as Record<string, unknown>).self = scope;
  jest.isolateModules(() => {
    require("../../src/worker/factorial.worker");
  });
  return scope;
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).self;
  jest.dontMock("../../src/core");
});

test("replies with the factorial cells for the request id", () => {
  const scope = loadWorker();
  scope.onmessage!({ data: { id: 7, n: 4 } });
  expect(scope.postMessage).toHaveBeenCalledWith({ id: 7, values: [1, 1, 2, 6, 24] });
});

test.each([
  [new Error("boom"), "boom"],
  ["plain failure", "plain failure"],
])("replies with an error when computing throws %p", (thrown, message) => {
  jest.doMock("../../src/core", () => ({
    factorialCells: () => {
      throw thrown;
    },
  }));
  const scope = loadWorker();
  scope.onmessage!({ data: { id: 3, n: 1 } });
  expect(scope.postMessage).toHaveBeenCalledWith({ id: 3, error: message });
});
