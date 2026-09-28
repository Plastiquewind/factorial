/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, Section, StatusMessage } from "../../src/taskpane/components";

describe("RadioGroup", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ] as const;

  test("renders options with the current value checked", () => {
    render(<RadioGroup name="x" legend="Pick" options={options} value="b" onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "Pick" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Alpha" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  });

  test("calls onChange with the chosen option's value", async () => {
    const onChange = jest.fn();
    render(<RadioGroup name="x" options={options} value="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  test("omits the legend when none is given, and can be disabled", () => {
    const { container } = render(
      <RadioGroup name="x" options={options} value="a" onChange={() => {}} disabled />
    );
    expect(container.querySelector("legend")).toBeNull();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeDisabled();
  });
});

describe("Section", () => {
  test("renders a title and content", () => {
    render(<Section title="Heading">body</Section>);
    expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  test("renders content without a title", () => {
    render(<Section>only body</Section>);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("only body")).toBeInTheDocument();
  });
});

describe("StatusMessage", () => {
  test("renders nothing when idle", () => {
    const { container } = render(<StatusMessage />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the default busy text", () => {
    render(<StatusMessage busy />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving...");
  });

  test("shows custom busy text", () => {
    render(<StatusMessage busy busyText="Working" />);
    expect(screen.getByRole("status")).toHaveTextContent("Working");
  });

  test("an error wins over busy text", () => {
    render(<StatusMessage busy error="Nope" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Nope");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
