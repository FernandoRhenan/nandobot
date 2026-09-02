import database from "@/infra/database";
import DateFormater from "@/helpers/DateFormater";

export default class Coupons implements ICoupons {
  async createCoupon(coupon: ICreateCoupon): Promise<ICreatedCoupon> {
    const command = await database.query({
      text: `
          INSERT INTO
            coupons (name, discount, discount_type, discount_limit, min_purchase)
          VALUES
            ($1, $2, $3, $4, $5)
          RETURNING
            *
          ;
        `,
      values: [
        coupon.name,
        coupon.discount,
        coupon.discount_type,
        coupon.discount_limit ?? null,
        coupon.min_purchase ?? null,
      ],
    });

    return command.rows[0] as ICreatedCoupon;
  }

  async attachCouponToProduct(
    productRequestId: number,
    coupomId: number,
  ): Promise<ICreatedProductRequestCoupons> {
    const command = await database.query({
      text: `
        INSERT INTO
          product_requests_coupons (coupon_id, product_request_id)
        VALUES
          ($1, $2)
        RETURNING
          *
        ;
      `,
      values: [coupomId, productRequestId],
    });

    return command.rows[0];
  }

  async getAllCoupons(
    initialDatetime: Date,
    finalDatetime: Date,
  ): Promise<ICreatedCoupons> {
    const initialDate = DateFormater.onlyDate(initialDatetime);
    const finalDate = DateFormater.onlyDate(finalDatetime);

    const command = await database.query({
      text: `
        SELECT
          *
        FROM
          coupons
        WHERE
          DATE(created_at) BETWEEN $1 AND $2
        ORDER BY
          created_at DESC
        ;
      `,
      values: [initialDate, finalDate],
    });

    return command.rows as ICreatedCoupons;
  }
}

export interface ICoupons {
  createCoupon(coupon: ICreateCoupon): Promise<ICreatedCoupon>;
  getAllCoupons(
    initialDatetime: Date,
    finalDatetime: Date,
  ): Promise<ICreatedCoupons>;
}

export interface ICreateCoupon {
  name: string;
  discount: number;
  discount_type: DiscountType;
  discount_limit?: number | null;
  min_purchase?: number | null;
}

export interface ICreatedCoupon {
  id: number;
  name: string;
  discount: number;
  discount_type: DiscountType;
  discount_limit: number | null;
  min_purchase: number | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ICreatedProductRequestCoupons {
  id: number;
  couponId: number;
  productRequestId: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export type ICreatedCoupons = ICreatedCoupon[];

export type DiscountType = "percentage" | "fixed";
