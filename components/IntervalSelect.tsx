import styles from "@/components/intervalSelect.module.css";

const MIN_INTERVAL_MINUTES = 1;
const MAX_INTERVAL_MINUTES = 60;
const INTERVAL_STEP_MINUTES = 4;

const intervalOptions = Array.from(
  {
    length:
      (MAX_INTERVAL_MINUTES - MIN_INTERVAL_MINUTES) / INTERVAL_STEP_MINUTES + 1,
  },
  (_, index) => MIN_INTERVAL_MINUTES + index * INTERVAL_STEP_MINUTES,
);

interface IIntervalSelectProps {
  value: number;
  onChange: (value: number) => void;
}

export default function IntervalSelect({
  value,
  onChange,
}: IIntervalSelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {intervalOptions.map((minutes) => (
        <option key={minutes} value={minutes}>
          {minutes} minutos
        </option>
      ))}
    </select>
  );
}
