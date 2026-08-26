import styles from "@/components/statusTag.module.css";

type TFlag =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "warning"
  | "posted"
  | "connected"
  | "disconnected";

type TColors =
  "green" | "red" | "blue" | "yellow" | "orange" | "purple" | "grey";

interface IColorHex {
  border: string;
  background: string;
}

const colorOptions: Record<TColors, IColorHex> = {
  green: { border: "#1a7f37", background: "rgba(26, 127, 55, 0.12)" },
  red: { border: "#cf222e", background: "rgba(207, 34, 46, 0.12)" },
  blue: { border: "#0969da", background: "rgba(9, 105, 218, 0.12)" },
  yellow: { border: "#9a6700", background: "rgba(154, 103, 0, 0.12)" },
  orange: { border: "#bc4c00", background: "rgba(188, 76, 0, 0.12)" },
  purple: { border: "#8250df", background: "rgba(130, 80, 223, 0.12)" },
  grey: { border: "#57606a", background: "rgba(87, 96, 106, 0.12)" },
};

const flagRelation: Record<TFlag, TColors> = {
  done: "green",
  posted: "green",
  warning: "orange",
  failed: "red",
  pending: "grey",
  processing: "blue",
  connected: "green",
  disconnected: "red",
};

interface IStatusTag {
  flag?: TFlag;
}

export default function StatusTag({ flag = "pending" }: IStatusTag) {
  return (
    <span
      className={styles.statusTagArea}
      style={{
        color: colorOptions[flagRelation[flag]].border,
        backgroundColor: colorOptions[flagRelation[flag]].background,
        borderColor: colorOptions[flagRelation[flag]].border,
      }}
    >
      {flag}
    </span>
  );
}
