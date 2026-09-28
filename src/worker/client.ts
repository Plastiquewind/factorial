/* global MessageEvent */
import type { Cell } from "../core";
import type { FactorialRequest, FactorialResponse } from "./protocol";
import { spawnWorker } from "./spawn";

type Pending = { resolve: (values: Cell[]) => void; reject: (error: Error) => void };

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (!worker) {
    worker = spawnWorker();
    worker.onmessage = (event: MessageEvent<FactorialResponse>) => {
      const msg = event.data;
      const entry = pending.get(msg.id);
      if (!entry) return;
      pending.delete(msg.id);
      if ("error" in msg) entry.reject(new Error(msg.error));
      else entry.resolve(msg.values);
    };
    worker.onerror = (event) => {
      const error = new Error(event.message || "Factorial worker failed.");
      pending.forEach((entry) => entry.reject(error));
      pending.clear();
      worker?.terminate();
      worker = undefined;
    };
  }
  return worker;
}

// Runs the computation in a web worker; the worker keeps the factorial cache.
export function computeFactorials(n: number): Promise<Cell[]> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    const request: FactorialRequest = { id, n };
    getWorker().postMessage(request);
  });
}
