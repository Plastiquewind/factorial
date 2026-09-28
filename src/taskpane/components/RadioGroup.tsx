export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  legend?: string;
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function RadioGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  disabled,
}: RadioGroupProps<T>) {
  return (
    <fieldset className="radio-group" disabled={disabled}>
      {legend && <legend className="radio-group__legend">{legend}</legend>}
      {options.map((o) => (
        <label key={o.value} className="radio-group__option">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
