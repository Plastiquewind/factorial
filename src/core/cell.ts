import { factorialsUpTo } from "./factorial";

export type Cell = number | string;

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// Exact values only: numbers while they fit in a double exactly (0!..18!), text beyond.
export function toCell(value: bigint): Cell {
  return value <= MAX_SAFE ? Number(value) : value.toString();
}

export function factorialCells(n: number): Cell[] {
  return factorialsUpTo(n).map(toCell);
}
