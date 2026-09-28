// Records what a streaming custom function pushes to its cells.
export function createInvocation() {
  const results: unknown[] = [];
  const invocation = {
    setResult: jest.fn((value: unknown) => {
      results.push(value);
    }),
    onCanceled: undefined as undefined | (() => void),
  };
  return { invocation, results, last: () => results[results.length - 1] };
}

// Lets pending promise callbacks run.
export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
