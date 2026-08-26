import CouponFormater from "@/helpers/CouponFormater";
import Text from "@/components/Text";
import { ICreatedCoupons } from "@/models/coupons";

interface ICouponTagProps {
  coupons?: ICreatedCoupons;
}

export default function CouponTag({ coupons }: ICouponTagProps) {
  if (!coupons || coupons.length < 1) return <Text color="faint">—</Text>;

  return (
    <>
      {coupons.map((coupon) => (
        <div key={coupon.id}>
          <Text charsLimit={16} bold>
            {coupon.name}
          </Text>
          <Text size={12} color="faint">
            {CouponFormater.formatDiscount(
              coupon.discount,
              coupon.discount_type,
            )}
          </Text>
        </div>
      ))}
    </>
  );
}
