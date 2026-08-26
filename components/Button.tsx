import styles from "@/components/button.module.css";
import { ReactNode } from "react";

interface IButtonProps {
  onClick?: () => void;
  label?: string;
  disabled: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  width?: number | string;
  height?: number | string;
  variant?: "accent" | "danger" | "green";
}

export default function Button({
  onClick,
  label,
  disabled = false,
  type = "button",
  icon,
  width = "100%",
  height,
  variant = "accent",
}: IButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
}
