/* global CustomFunctions */
import type { ValidationError } from "../core";

// The only place that turns validation results into Excel error values.
export function toCustomFunctionError(error: ValidationError): CustomFunctions.Error {
  return new CustomFunctions.Error(CustomFunctions.ErrorCode[error.kind], error.message);
}
