import styles from "@/components/tabs/tabSelector.module.css";

export interface Tab<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

interface TabSelectorProps<T extends string = string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
}

export default function TabSelector<T extends string>({
  tabs,
  active,
  onChange,
}: TabSelectorProps<T>) {
  return (
    <nav className={styles.bar}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab}${active === tab.key ? ` ${styles.active}` : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={styles.badge}>{tab.count}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
