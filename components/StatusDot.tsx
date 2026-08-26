import styles from "@/components/statusDot.module.css";

type TFlag =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "warning"
  | "posted"
  | "connected"
  | "connecting"
  | "disconnected";

type TColors =
  "green" | "red" | "blue" | "yellow" | "orange" | "purple" | "grey";

const colorOptions: Record<TColors, string> = {
  green: "#1a7f37",
  red: "#cf222e",
  blue: "#0969da",
  yellow: "#9a6700",
  orange: "#bc4c00",
  purple: "#8250df",
  grey: "#57606a",
};

const flagRelation: Record<TFlag, TColors> = {
  done: "green",
  posted: "green",
  warning: "orange",
  failed: "red",
  pending: "grey",
  processing: "blue",
  connected: "green",
  connecting: "yellow",
  disconnected: "red",
};

interface IStatusDot {
  flag?: TFlag;
}

export default function StatusDot({ flag = "pending" }: IStatusDot) {
  return (
    <span
      className={styles.statusDotArea}
      style={{ backgroundColor: colorOptions[flagRelation[flag]] }}
    />
  );
}
