// Each folder's index.ts is its public API; these tests fail if an export is added or removed
// without updating the list, so API changes are always deliberate.
const expectApi = (mod: Record<string, unknown>, names: string[]) => {
  expect(Object.keys(mod).sort()).toEqual([...names].sort());
  for (const name of names) expect(mod[name]).toBeDefined();
};

test("core", () => {
  expectApi(require("../src/core"), [
    "factorialsUpTo",
    "cachedCount",
    "toCell",
    "factorialCells",
    "validate",
    "MAX_N",
    "N_RULES",
    "validateN",
  ]);
});

test("core/validation", () => {
  expectApi(require("../src/core/validation"), ["validate", "MAX_N", "N_RULES", "validateN"]);
});

test("worker", () => {
  jest.doMock("../src/worker/spawn", () => ({ spawnWorker: jest.fn() }));
  expectApi(require("../src/worker"), ["computeFactorials"]);
});

test("state", () => {
  expectApi(require("../src/state"), ["useSettings"]);
});

test("taskpane/components", () => {
  expectApi(require("../src/taskpane/components"), ["RadioGroup", "Section", "StatusMessage"]);
});

test("taskpane/features", () => {
  expectApi(require("../src/taskpane/features"), ["OrientationSetting", "UsageInfo"]);
});

test("taskpane/hooks", () => {
  expectApi(require("../src/taskpane/hooks"), ["useSetting"]);
});
