import DateFormater from "@/helpers/DateFormater";
import StatusTag from "@/components/StatusTag";
import Table, { ITableColumn } from "@/components/Table";
import { ICreatedProduct, ICreatedProducts } from "@/models/products";
import Text from "@/components/Text";
import SmallImage from "../SmallImage";

interface IFailedProductsTab {
  failedProducts: ICreatedProducts | undefined;
  allowSelection: boolean;
}

const columns: ITableColumn<ICreatedProduct>[] = [
  {
    header: "IMAGE",
    render: (item) => <SmallImage alt={item.name} url={item.image_url} />,
    flex: 1,
  },
  {
    header: "NOME",
    render: (item) => <Text>{item.name}</Text>,
  },
  {
    header: "PREÇO",
    render: (item) => <Text>{item.current_price}</Text>,
  },
  {
    header: "PREÇO ANTIGO",
    render: (item) => <Text>{item.old_price}</Text>,
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

export default function FailedProductsTab({
  failedProducts,
  allowSelection = false,
}: IFailedProductsTab) {
  return (
    <Table
      allowSelection={allowSelection}
      columns={columns}
      data={failedProducts}
      rowKey={(item) => item.id}
    />
  );
}
