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
      const text = ["🏷️ Use os cupons:"];

      coupons.forEach((coupon) => {
        const couponText = `> ${coupon.name}`;
        text.push(couponText);
      });

      return text.join("\n");
    } else {
      return ["🏷️ Use o cupom:", `> ${coupons[0].name.toUpperCase()}`].join(
        "\n",
      );
    }
  }

  static applyDiscount(price: number, coupons: ICreatedCoupon[]): number {
    if (typeof coupons !== "object") return price;

    let newPrice = 0;
    let currentPrice = price;
    coupons.forEach((coupon) => {
      if (coupon.discount_type === "percentage") {
        const isolatedPrice = price;
        newPrice = Math.round(
          isolatedPrice - isolatedPrice * (coupon.discount / 100),
        );
      } else {
        const isolatedPrice = price;
        newPrice = isolatedPrice - coupon.discount;
      }
      const currentDiscount = (price - newPrice) / 100;

      if (coupon.discount_limit && currentDiscount > coupon.discount_limit) {
        const fixedDiscount = currentDiscount - coupon.discount_limit;
        newPrice += fixedDiscount;
      }
      // Não esta descontando o segundo cupom, apenas o primeiro
      currentPrice = currentPrice - (currentPrice - newPrice);
    });
    return currentPrice;
  }
}
