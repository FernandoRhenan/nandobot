import styles from "@/components/radioSelector.module.css";
import Text from "@/components/Text";

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface IRadioSelectorProps<T extends string = string> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  direction?: "row" | "column";
}

export default function RadioSelector<T extends string>({
  name,
  options,
  value,
  onChange,
  direction = "column",
}: IRadioSelectorProps<T>) {
  return (
    <div className={`${styles.optionList} ${styles[direction]}`}>
      {options.map((option) => (
        <label key={option.value} className={styles.optionItem}>
          <input
            type="radio"
            className={styles.radio}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className={styles.optionInfo}>
            <Text size={13}>{option.label}</Text>
            {option.description && (
              <Text size={12} color="faint">
                {option.description}
              </Text>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}
