import { MAX_N, type Rule, validate, validateN } from "../../src/core";

describe("validateN", () => {
  test.each([0, 1, 18, MAX_N])("accepts %p", (n) => {
    expect(validateN(n)).toBeNull();
  });

  test.each([
    [NaN, "N must be a number."],
    [Infinity, "N must be a number."],
    [2.5, "N must be a whole number."],
    [-1, "N must not be negative."],
    [MAX_N + 1, `N must not exceed ${MAX_N}.`],
  ])("rejects %p", (n, message) => {
    expect(validateN(n)).toEqual({ message, kind: "invalidNumber" });
  });

  test("reports the first failing rule", () => {
    // -1.5 is both negative and not whole; the whole-number rule comes first.
    expect(validateN(-1.5)?.message).toBe("N must be a whole number.");
  });
});

describe("validate", () => {
  const rules: Rule<string>[] = [
    { test: (s) => s.length > 0, message: "empty" },
    { test: (s) => s === s.toUpperCase(), message: "not upper", kind: "invalidValue" },
  ];

  test("passes when all rules pass", () => {
    expect(validate("OK", rules)).toBeNull();
  });

  test("uses the rule's kind, defaulting to invalidNumber", () => {
    expect(validate("", rules)).toEqual({ message: "empty", kind: "invalidNumber" });
    expect(validate("no", rules)).toEqual({ message: "not upper", kind: "invalidValue" });
  });
});
