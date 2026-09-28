import type { Orientation } from "../../../state";
import { RadioGroup, type RadioOption, Section, StatusMessage } from "../../components";
import { useSetting } from "../../hooks";

const OPTIONS: readonly RadioOption<Orientation>[] = [
  { value: "row", label: "Row" },
  { value: "column", label: "Column" },
];

export function OrientationSetting() {
  const { value, set, busy, error } = useSetting("orientation");
  return (
    <Section title="Spill orientation">
      <RadioGroup
        name="orientation"
        options={OPTIONS}
        value={value}
        onChange={set}
        disabled={busy}
      />
      <StatusMessage busy={busy} busyText="Saving..." error={error} />
    </Section>
  );
}
