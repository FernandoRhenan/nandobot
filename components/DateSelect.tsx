import styles from "@/components/dateSelect.module.css";

interface IDateSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateSelect({ value, onChange }: IDateSelectProps) {
  return (
    <input
      type="date"
      lang="pt-BR"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
