import styles from "@/components/table.module.css";
import { ReactNode } from "react";

export interface ITableColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
  flex?: number;
}

interface ITable<T> {
  columns: ITableColumn<T>[];
  data: T[] | undefined;
  rowKey: (item: T) => number;
  emptyMessage?: string;
  loadingMessage?: string;
  handleSelect?: (item: T) => void;
  allowSelection: boolean;
  selectedProductsId?: number[];
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "Nenhum registro",
  loadingMessage = "Loading",
  handleSelect,
  allowSelection = false,
  selectedProductsId,
}: ITable<T>) {
  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr className={styles.tr}>
          {columns.map((column) => (
            <th
              key={column.header}
              className={styles.th}
              style={{ flex: column.flex ?? 1 }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {data === undefined ? (
          <tr className={`${styles.trData} ${styles.trEmpty}`}>
            <td>{loadingMessage}</td>
          </tr>
        ) : data.length === 0 ? (
          <tr className={`${styles.trData} ${styles.trEmpty}`}>
            <td>{emptyMessage}</td>
          </tr>
        ) : (
          data.map((item) => (
            <tr
              key={rowKey(item)}
              className={
                allowSelection
                  ? `${styles.trData} ${styles.trDataHover}`
                  : styles.trData
              }
              style={
                selectedProductsId?.includes(rowKey(item))
                  ? { backgroundColor: "var(--accent-selected)" }
                  : undefined
              }
              onClick={
                allowSelection && handleSelect
                  ? () => {
                      handleSelect(item);
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={styles.td}
                  style={{ flex: column.flex ?? 1 }}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
