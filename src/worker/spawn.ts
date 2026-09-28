/* global Worker */

// Kept in its own file: webpack needs this exact `new Worker(new URL(..., import.meta.url))`
// pattern to bundle the worker, and Jest (CommonJS) cannot parse import.meta, so tests mock this module.
export function spawnWorker(): Worker {
  return new Worker(new URL("./factorial.worker.ts", import.meta.url));
}
