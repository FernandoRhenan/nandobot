import CouponFormater from "@/helpers/CouponFormater";
import PriceFormater from "@/helpers/PriceFormater";
import Text from "@/components/Text";
import { ICreatedCoupons } from "@/models/coupons";

interface IDiscountedPriceProps {
  price: number;
  coupons: ICreatedCoupons;
}

export default function DiscountedPrice({
  price,
  coupons,
}: IDiscountedPriceProps) {
  return (
    <Text color="muted" bold>
      {PriceFormater.formatNumberToString(
        CouponFormater.applyDiscount(price, coupons),
      )}
    </Text>
  );
}
