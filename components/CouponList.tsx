import styles from "@/components/couponList.module.css";
import Text from "@/components/Text";
import CouponFormater from "@/helpers/CouponFormater";
import { ICreatedCoupons } from "@/models/coupons";

interface ICouponListProps {
  coupons: ICreatedCoupons;
  selectedCouponsId?: number[];
  onSelect: (couponsId: number[]) => void;
}

export default function CouponList({
  coupons,
  selectedCouponsId = [],
  onSelect,
}: ICouponListProps) {
  if (coupons.length === 0)
    return <Text color="muted">Nenhum cupom cadastrado.</Text>;

  function toggleCoupon(couponId: number) {
    if (selectedCouponsId.includes(couponId)) {
      onSelect(selectedCouponsId.filter((id) => id !== couponId));
    } else {
      onSelect([...selectedCouponsId, couponId]);
    }
  }

  return (
    <div className={styles.couponList}>
      {coupons.map((coupon) => {
        const conditions = CouponFormater.formatConditions(
          coupon.discount_limit,
          coupon.min_purchase,
        );

        const isSelected = selectedCouponsId.includes(coupon.id);

        return (
          <button
            key={coupon.id}
            type="button"
            aria-pressed={isSelected}
            className={`${styles.couponItem} ${
              isSelected ? styles.selected : ""
            }`}
            onClick={() => toggleCoupon(coupon.id)}
          >
            <Text bold>{coupon.name}</Text>
            <Text size={12} color="faint">
              {CouponFormater.formatDiscount(
                coupon.discount,
                coupon.discount_type,
              ) + (conditions ? ` · ${conditions}` : "")}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
