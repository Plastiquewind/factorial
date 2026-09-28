import { type Rule, validate } from "./rule";

export const MAX_N = 500;

// Rules for the N argument of FACTORIALROW. Add a rule here to add a check.
export const N_RULES: readonly Rule<number>[] = [
  { test: Number.isFinite, message: "N must be a number." },
  { test: Number.isInteger, message: "N must be a whole number." },
  { test: (n) => n >= 0, message: "N must not be negative." },
  { test: (n) => n <= MAX_N, message: `N must not exceed ${MAX_N}.` },
];

export const validateN = (n: number) => validate(n, N_RULES);
