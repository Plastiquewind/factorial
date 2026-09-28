// Kinds map to Excel error values (e.g. invalidNumber is #NUM!) at the custom function boundary.
export type ErrorKind = "invalidNumber" | "invalidValue" | "notAvailable";

export interface Rule<T> {
  test: (value: T) => boolean;
  message: string;
  kind?: ErrorKind; // default "invalidNumber"
}

export interface ValidationError {
  message: string;
  kind: ErrorKind;
}

// First failing rule wins, so order matters: type checks before range checks.
export function validate<T>(value: T, rules: readonly Rule<T>[]): ValidationError | null {
  const failed = rules.find((r) => !r.test(value));
  return failed ? { message: failed.message, kind: failed.kind ?? "invalidNumber" } : null;
}
