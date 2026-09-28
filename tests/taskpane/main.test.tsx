/**
 * @jest-environment jsdom
 */
import { act, screen } from "@testing-library/react";
import { documentSettings } from "../fakes/office";

test("loads saved settings and renders the app once Office is ready", async () => {
  document.body.innerHTML = '<div id="root"></div>';
  documentSettings().store.set("factorial.orientation", "column");

  // Plain require (not isolateModules) so the module shares React with Testing Library.
  await act(async () => {
    require("../../src/taskpane/main");
  });

  expect(Office.onReady).toHaveBeenCalled();
  expect(screen.getByRole("radio", { name: "Column" })).toBeChecked();
});
