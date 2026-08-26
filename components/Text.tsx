import { CSSProperties, ReactNode, useState } from "react";

interface ITextProps {
  size?: 6 | 8 | 10 | 12 | 13 | 14 | 15 | 16;
  color?: "muted" | "faint" | "default";
  bold?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  charsLimit?: number;
  copyable?: boolean;
}

export default function Text({
  color = "default",
  bold = false,
  size = 13,
  charsLimit,
  copyable = false,
  children,
  style,
  className,
}: ITextProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (typeof children !== "string") return;
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const isString = typeof children === "string";
  const isTruncated = isString && charsLimit && children.length > charsLimit;
  const displayText = isTruncated
    ? children.slice(0, charsLimit) + "..."
    : children;

  return (
    <p
      className={className}
      style={{
        color: `var(--text-${color})`,
        fontWeight: bold ? "bold" : "normal",
        fontSize: size,
        position: isTruncated ? "relative" : undefined,
        ...style,
      }}
      onMouseEnter={isTruncated ? () => setShowTooltip(true) : undefined}
      onMouseLeave={isTruncated ? () => setShowTooltip(false) : undefined}
    >
      {displayText}
      {copyable && typeof children === "string" && (
        <button
          onClick={handleCopy}
          title={copied ? "Copiado!" : "Copiar"}
          style={{
            marginLeft: 5,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: copied ? "var(--accent)" : "var(--text-faint)",
            verticalAlign: "middle",
            lineHeight: 1,
          }}
        >
          {copied ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}
      {isTruncated && showTooltip && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 5px)",
            left: 0,
            backgroundColor: "var(--panel)",
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius2)",
            padding: "6px 10px",
            fontSize: size,
            maxWidth: 320,
            whiteSpace: "normal",
            wordBreak: "break-word",
            zIndex: 9999,
            boxShadow: "var(--shadow-lg)",
            pointerEvents: "none",
            lineHeight: 1.5,
          }}
        >
          {children}
        </span>
      )}
    </p>
  );
}
