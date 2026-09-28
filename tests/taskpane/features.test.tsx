/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/taskpane/App";
import { OrientationSetting, UsageInfo } from "../../src/taskpane/features";
import { useSettings } from "../../src/state";
import { documentSettings } from "../fakes/office";
import { resetSettingsStore } from "../fakes/store";

beforeEach(resetSettingsStore);

describe("UsageInfo", () => {
  test("explains how to use the function", () => {
    render(<UsageInfo />);
    expect(screen.getByRole("heading", { name: "Factorial" })).toBeInTheDocument();
    expect(screen.getByText("=TESTVELIXO.FACTORIALROW(N)")).toBeInTheDocument();
  });
});

describe("OrientationSetting", () => {
  test("shows the current orientation", () => {
    useSettings.setState({ values: { orientation: "column" } });
    render(<OrientationSetting />);
    expect(screen.getByRole("heading", { name: "Spill orientation" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Column" })).toBeChecked();
  });

  test("switching saves the new orientation", async () => {
    render(<OrientationSetting />);
    await userEvent.click(screen.getByRole("radio", { name: "Column" }));
    expect(screen.getByRole("radio", { name: "Column" })).toBeChecked();
    expect(useSettings.getState().values.orientation).toBe("column");
    expect(documentSettings().store.get("factorial.orientation")).toBe("column");
  });

  test("shows an error when saving fails", async () => {
    documentSettings().failNextSave(new Error("Could not save"));
    render(<OrientationSetting />);
    await userEvent.click(screen.getByRole("radio", { name: "Column" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save");
  });
});

describe("App", () => {
  test("lays out the usage info and the orientation setting", () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Factorial" })).toBeInTheDocument();
    expect(screen.getByRole("group")).toBeInTheDocument();
  });
});
