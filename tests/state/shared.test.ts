// Each bundle loads its own copy of the state module; both must end up with one store.
test("separate module copies share one store through globalThis", () => {
  let first: typeof import("../../src/state") | undefined;
  let second: typeof import("../../src/state") | undefined;
  jest.isolateModules(() => {
    first = require("../../src/state");
  });
  jest.isolateModules(() => {
    second = require("../../src/state");
  });

  expect(first!.useSettings).toBe(second!.useSettings);
  expect((globalThis as Record<symbol, unknown>)[Symbol.for("factorial.settingsStore")]).toBe(
    first!.useSettings
  );
});
