import { toCustomFunctionError } from "../../src/functions/errors";
import { ErrorCode, FakeCustomFunctionError } from "../fakes/office";

test.each([
  ["invalidNumber", ErrorCode.invalidNumber],
  ["invalidValue", ErrorCode.invalidValue],
  ["notAvailable", ErrorCode.notAvailable],
] as const)("maps %s to the matching Excel error", (kind, code) => {
  const error = toCustomFunctionError({ kind, message: "why" });
  expect(error).toBeInstanceOf(FakeCustomFunctionError);
  expect(error).toMatchObject({ code, message: "why" });
});
