import { MAX_N, cachedCount, factorialCells, toCell } from "../../src/core";

describe("factorialCells", () => {
  test("0! only", () => {
    expect(factorialCells(0)).toEqual([1]);
  });

  test("0! through 5!", () => {
    expect(factorialCells(5)).toEqual([1, 1, 2, 6, 24, 120]);
  });

  test("18! is a number, 19! is exact text", () => {
    const cells = factorialCells(19);
    expect(cells[18]).toBe(6402373705728000);
    expect(cells[19]).toBe("121645100408832000");
  });

  test("500! is exact", () => {
    const last = factorialCells(MAX_N)[MAX_N] as string;
    expect(last).toHaveLength(1135);
    expect(last.startsWith("12201368259911100687")).toBe(true);
    expect(last.endsWith("0".repeat(124))).toBe(true);
  });

  test("each value is computed once", () => {
    factorialCells(MAX_N);
    const before = cachedCount();
    factorialCells(MAX_N);
    factorialCells(10);
    expect(cachedCount()).toBe(before);
    expect(before).toBe(MAX_N + 1);
  });
});

test("toCell switches to text above MAX_SAFE_INTEGER", () => {
  expect(toCell(BigInt(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
  expect(toCell(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1))).toBe("9007199254740992");
});
