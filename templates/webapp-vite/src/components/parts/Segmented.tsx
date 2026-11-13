import { Icon } from "./Icon";

type Props<T extends string> = {
  legend: string;
  name: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange(value: T): void;
};

/** A choice of few options that stand side by side. */
export function Segmented<T extends string>({ legend, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset className="sb-segmented">
      <legend>{legend}</legend>
      <div className="sb-segmented__options">
        {options.map((option) => (
          <label key={option.value} className="sb-segmented__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="sb-segmented__face">
              <Icon name="check--16" size={16} />
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
