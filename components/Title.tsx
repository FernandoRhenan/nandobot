import { ReactNode } from "react";

interface ITitleProps {
  size?: 18 | 20 | 22 | 26 | 30 | 36 | 42;
  type?: "h1" | "h2" | "h3";
  color?: "muted" | "faint" | "text";
  bold?: boolean;
  children: ReactNode;
}

export default function Title({
  color = "text",
  bold = false,
  size = 18,
  type = "h1",
  children,
}: ITitleProps) {
  return (
    (type === "h1" && (
      <h1
        style={{
          color: `var(--text-${color})`,
          fontWeight: bold ? "bold" : "normal",
          fontSize: size,
        }}
      >
        {children}
      </h1>
    )) ||
    (type === "h2" && (
      <h2
        style={{
          color: `var(--text-${color})`,
          fontWeight: bold ? "bold" : "normal",
          fontSize: size,
        }}
      >
        {children}
      </h2>
    )) ||
    (type === "h3" && (
      <h3
        style={{
          color: `var(--text-${color})`,
          fontWeight: bold ? "bold" : "normal",
          fontSize: size,
        }}
      >
        {children}
      </h3>
    ))
  );
}
