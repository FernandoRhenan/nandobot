import DateFormater from "@/helpers/DateFormater";
import StatusTag from "@/components/StatusTag";
import Table, { ITableColumn } from "@/components/Table";
import { ICreatedProduct, ICreatedProducts } from "@/models/products";
import Text from "@/components/Text";
import PriceFormater from "@/helpers/PriceFormater";
import SmallImage from "../SmallImage";
import Link from "next/link";
import CouponTag from "@/components/CouponTag";
import DiscountedPrice from "@/components/DiscountedPrice";

interface IEnqueuedProductsTab {
  enqueuedProducts: ICreatedProducts | undefined;
  handleSelect?: (item: ICreatedProduct) => void;
  allowSelection?: boolean;
  selectedProductsId?: number[];
}

const columns: ITableColumn<ICreatedProduct>[] = [
  {
    header: "IMAGEM",
    render: (item) => (
      <Link href={item.image_url} referrerPolicy="no-referrer" target="_blank">
        <SmallImage alt={item.name} url={item.image_url} />
      </Link>
    ),
    flex: 1,
  },
  {
    header: "NOME",
    render: (item) => (
      <Text charsLimit={28} copyable>
        {item.name}
      </Text>
    ),
    flex: 2,
  },
  {
    header: "PREÇO",
    render: (item) =>
      item.coupons ? (
        <DiscountedPrice price={item.current_price} coupons={item.coupons} />
      ) : (
        <Text bold color="muted">
          {PriceFormater.formatNumberToString(item.current_price)}
        </Text>
      ),
    flex: 2,
  },
  {
    header: "PREÇO ANTIGO",
    render: (item) => (
      <Text color="muted">
        {PriceFormater.formatNumberToString(item.old_price)}
      </Text>
    ),
    flex: 2,
  },
  {
    header: "CUPOM",
    render: (item) => <CouponTag coupons={item.coupons} />,
    flex: 2,
  },
  {
    header: "STATUS",
    render: (item) => <StatusTag flag={item.status} />,
    flex: 2,
  },

  {
    header: "DATA DE CRIAÇÃO",
    render: (item) => DateFormater.format(item.created_at),
    flex: 2,
  },
];

export default function QueuedProductsTab({
  enqueuedProducts,
  handleSelect,
  allowSelection = false,
  selectedProductsId = [],
}: IEnqueuedProductsTab) {
  return (
    <Table
      allowSelection={allowSelection}
      handleSelect={handleSelect ? handleSelect : undefined}
      columns={columns}
      rowKey={(item) => item.id}
      selectedProductsId={selectedProductsId}
      data={enqueuedProducts}
    />
  );
}
