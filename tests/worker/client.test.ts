import type { FactorialRequest, FactorialResponse } from "../../src/worker/protocol";

class FakeWorker {
  onmessage?: (event: { data: FactorialResponse }) => void;
  onerror?: (event: { message: string }) => void;
  posted: FactorialRequest[] = [];
  terminate = jest.fn();
  postMessage(request: FactorialRequest) {
    this.posted.push(request);
  }
  reply(response: FactorialResponse) {
    this.onmessage!({ data: response });
  }
  fail(message: string) {
    this.onerror!({ message });
  }
}

let workers: FakeWorker[];
let computeFactorials: typeof import("../../src/worker").computeFactorials;

beforeEach(() => {
  workers = [];
  jest.resetModules();
  jest.doMock("../../src/worker/spawn", () => ({
    spawnWorker: () => {
      const w = new FakeWorker();
      workers.push(w);
      return w;
    },
  }));
  ({ computeFactorials } = require("../../src/worker"));
});

test("sends a request and resolves with the matching reply", async () => {
  const result = computeFactorials(3);
  const [worker] = workers;
  expect(worker.posted).toEqual([{ id: 0, n: 3 }]);

  worker.reply({ id: 0, values: [1, 1, 2, 6] });
  await expect(result).resolves.toEqual([1, 1, 2, 6]);
});

test("reuses one worker and matches replies by id, in any order", async () => {
  const a = computeFactorials(1);
  const b = computeFactorials(2);
  expect(workers).toHaveLength(1);

  workers[0].reply({ id: 1, values: [1, 1, 2] });
  workers[0].reply({ id: 0, values: [1, 1] });
  await expect(a).resolves.toEqual([1, 1]);
  await expect(b).resolves.toEqual([1, 1, 2]);
});

test("ignores replies for unknown ids", async () => {
  const result = computeFactorials(0);
  workers[0].reply({ id: 99, values: [42] });
  workers[0].reply({ id: 0, values: [1] });
  await expect(result).resolves.toEqual([1]);
});

test("rejects when the worker reports an error", async () => {
  const result = computeFactorials(5);
  workers[0].reply({ id: 0, error: "bad input" });
  await expect(result).rejects.toThrow("bad input");
});

test("rejects all pending requests and starts a new worker after a crash", async () => {
  const a = computeFactorials(1);
  const b = computeFactorials(2);
  workers[0].fail("");

  await expect(a).rejects.toThrow("Factorial worker failed.");
  await expect(b).rejects.toThrow("Factorial worker failed.");
  expect(workers[0].terminate).toHaveBeenCalled();

  const c = computeFactorials(0);
  expect(workers).toHaveLength(2);
  workers[1].reply({ id: 2, values: [1] });
  await expect(c).resolves.toEqual([1]);
});

test("uses the worker's error message when it has one", async () => {
  const result = computeFactorials(1);
  workers[0].fail("out of memory");
  await expect(result).rejects.toThrow("out of memory");
});
