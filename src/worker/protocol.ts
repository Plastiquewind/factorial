import type { Cell } from "../core";

// Messages exchanged between the main thread and the factorial worker.
export interface FactorialRequest {
  id: number;
  n: number;
}

export type FactorialResponse = { id: number; values: Cell[] } | { id: number; error: string };
