import {
  DiscountType,
  ICreatedCoupon,
  ICreatedCoupons,
} from "@/models/coupons";

export default class CouponFormater {
  static formatDiscount(discount: number, discountType: DiscountType): string {
    if (discountType === "percentage") return `${discount}% OFF`;
    return `R$ ${discount} OFF`;
  }

  static formatConditions(
    discountLimit?: number | null,
    minPurchase?: number | null,
  ): string {
    const conditions: string[] = [];

    if (typeof discountLimit === "number")
      conditions.push(`até R$ ${discountLimit}`);
    if (typeof minPurchase === "number")
      conditions.push(`mín. R$ ${minPurchase}`);

    return conditions.join(" · ");
  }

  static formatCoupons(coupons: ICreatedCoupons): string {
    if (coupons.length > 1) {
      const text = ["*💥 Combo de cupons*", "Use os cupons:"];

      coupons.forEach((coupon) => {
        const couponText = `🏷️ \`${coupon.name}\``;
        text.push(couponText);
      });

      return text.join("\n");
    } else {
      return ["Use o cupom:", `🏷️ \`${coupons[0].name.toUpperCase()}\``].join(
        "\n",
      );
    }
  }

  static applyDiscount(price: number, coupons: ICreatedCoupon[]): number {
    if (typeof coupons !== "object") return price;

    let currentPrice = price;

    coupons.forEach((coupon) => {
      if (coupon.discount_type === "percentage") {
        const valueToBeDiscounted = Math.round(price * (coupon.discount / 100));
        currentPrice -= valueToBeDiscounted;

        const limit = (coupon.discount_limit || 0) * 100;
        if (limit && valueToBeDiscounted > limit) {
          const fixedValue = valueToBeDiscounted - limit;
          currentPrice += fixedValue;
        }
      } else {
        currentPrice -= coupon.discount * 100;
      }
    });
    return currentPrice;
  }
}
