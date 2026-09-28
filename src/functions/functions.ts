/* global CustomFunctions, Office */
import { type Cell, validateN } from "../core";
import { computeFactorials } from "../worker";
import { type Orientation, useSettings } from "../state";
import { toCustomFunctionError } from "./errors";

Office.onReady(() => useSettings.getState().load());

function shape(values: Cell[], orientation: Orientation): Cell[][] {
  return orientation === "column" ? values.map((v) => [v]) : [values];
}

/**
 * Returns the factorials [0!, 1!, ..., N!] as a spill range.
 * Orientation (row or column) follows the task pane setting and updates live.
 * Values above 18! are returned as exact text.
 * @customfunction FACTORIALROW
 * @streaming
 * @param n Non-negative integer N (0 to 500).
 * @param invocation Streaming invocation used to push results.
 */
export function factorialRow(
  n: number,
  // Custom function metadata only accepts number | string | boolean | any here, so Cell[][]
  // (Cell = number | string) cannot be written; everything inside the function uses Cell.
  invocation: CustomFunctions.StreamingInvocation<any[][]>
): void {
  const error = validateN(n);
  if (error) {
    invocation.setResult(toCustomFunctionError(error));
    return;
  }

  // N is fixed for this invocation, so factorials are computed once; a setting change only reshapes them.
  let values: Cell[] | undefined;
  let canceled = false;
  const push = () => {
    if (values && !canceled)
      invocation.setResult(shape(values, useSettings.getState().values.orientation));
  };

  const unsubscribe = useSettings.subscribe((state, prev) => {
    if (state.values.orientation !== prev.values.orientation) push();
  });
  // Called when the cell is deleted, the formula changes, or the workbook closes.
  invocation.onCanceled = () => {
    canceled = true;
    unsubscribe();
  };

  computeFactorials(n).then(
    (computed) => {
      values = computed;
      push();
    },
    (e: unknown) => {
      if (canceled) return;
      const message = e instanceof Error ? e.message : String(e);
      invocation.setResult(
        new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable, message)
      );
    }
  );
}
