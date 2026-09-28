/* global self */
import { factorialCells } from "../core";
import type { FactorialRequest, FactorialResponse } from "./protocol";

self.onmessage = (event: MessageEvent<FactorialRequest>) => {
  const { id, n } = event.data;
  let response: FactorialResponse;
  try {
    response = { id, values: factorialCells(n) };
  } catch (e) {
    response = { id, error: e instanceof Error ? e.message : String(e) };
  }
  self.postMessage(response);
};
