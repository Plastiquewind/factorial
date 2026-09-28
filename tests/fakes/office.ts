// Minimal in-memory stand-ins for the Office.js globals the add-in uses.

export interface FakeDocumentSettings {
  store: Map<string, unknown>;
  get: jest.Mock<unknown, [string]>;
  set: jest.Mock<void, [string, unknown]>;
  saveAsync: jest.Mock<void, [(result: { status: string; error?: Error }) => void]>;
  failNextSave: (error: Error) => void;
}

export class FakeCustomFunctionError extends Error {
  constructor(
    public code: string,
    message?: string
  ) {
    super(message);
  }
}

export const ErrorCode = {
  invalidValue: "#VALUE!",
  notAvailable: "#N/A",
  divisionByZero: "#DIV/0!",
  invalidNumber: "#NUM!",
  nullReference: "#NULL!",
  invalidName: "#NAME?",
  invalidReference: "#REF!",
} as const;

function createDocumentSettings(): FakeDocumentSettings {
  const store = new Map<string, unknown>();
  let nextError: Error | undefined;
  return {
    store,
    get: jest.fn((key: string) => (store.has(key) ? store.get(key) : null)),
    set: jest.fn((key: string, value: unknown) => {
      store.set(key, value);
    }),
    saveAsync: jest.fn((callback) => {
      const error = nextError;
      nextError = undefined;
      callback(error ? { status: "failed", error } : { status: "succeeded" });
    }),
    failNextSave: (error: Error) => {
      nextError = error;
    },
  };
}

export function installOfficeFakes() {
  const settings = createDocumentSettings();
  const g = globalThis as Record<string, unknown>;
  g.Office = {
    onReady: jest.fn((callback?: () => void) => {
      callback?.();
      return Promise.resolve({});
    }),
    context: { document: { settings } },
    AsyncResultStatus: { Succeeded: "succeeded", Failed: "failed" },
  };
  g.CustomFunctions = { Error: FakeCustomFunctionError, ErrorCode };
}

export function documentSettings(): FakeDocumentSettings {
  return (globalThis as unknown as { Office: { context: { document: { settings: FakeDocumentSettings } } } })
    .Office.context.document.settings;
}
