import "@testing-library/jest-dom";
import { installOfficeFakes } from "./fakes/office";

// Every test starts with fresh Office / CustomFunctions globals, an empty workbook,
// and no shared settings store left over from a previous test.
beforeEach(() => {
  installOfficeFakes();
  delete (globalThis as Record<symbol, unknown>)[Symbol.for("factorial.settingsStore")];
});
