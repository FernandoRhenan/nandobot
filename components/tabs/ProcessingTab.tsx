import styles from "@/components/tabs/tabs.module.css";
import DateFormater from "@/helpers/DateFormater";
import { ICreatedProductsRequest, IProductRequest } from "@/models/scraper";
import Link from "next/link";
import StatusTag from "@/components/StatusTag";
import Table, { ITableColumn } from "@/components/Table";

interface IProcessingTab {
  processingProductsRequest: ICreatedProductsRequest | undefined;
  allowSelection: boolean;
}

const columns: ITableColumn<IProductRequest>[] = [
  {
    header: "URL",
    render: (item) => (
      <Link
        referrerPolicy="no-referrer"
        target="_blank"
        href={item.url}
        className={styles.link}
      >
        {item.url}
      </Link>
    ),
  },
  {
    header: "STATUS",
    render: (item) => <StatusTag flag={item.status} />,
  },
  {
    header: "DATA DE CRIAÇÃO",
    render: (item) => DateFormater.format(item.created_at),
  },
];

export default function ProcessingTab({
  processingProductsRequest,
  allowSelection = false,
}: IProcessingTab) {
  return (
    <Table
      allowSelection={allowSelection}
      columns={columns}
      data={processingProductsRequest}
      rowKey={(item) => item.id}
    />
  );
}
