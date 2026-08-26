import styles from "@/components/inputText.module.css";

interface IInputProps {
  value: string;
  placeholder?: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
}

export default function InputText({
  value,
  placeholder = "",
  type = "text",
  onChange,
}: IInputProps) {
  return (
    <>
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}
