import database from "@/infra/database";
import DateFormater from "@/helpers/DateFormater";
import { ICreatedCoupons } from "./coupons";

export default class Products implements IProducts {
  async createProduct(product: ICreateProduct): Promise<ICreatedProduct> {
    const command = await database.query({
      text: `
          WITH inserted_product AS (
            INSERT INTO
              products (name, image_url, current_price, old_price, product_request_id)
            VALUES
              ($1, $2, $3, $4, $5)
            RETURNING
              *
          )
          SELECT
            inserted_product.*,
            COALESCE(
              (
                SELECT
                  JSON_AGG(
                    TO_JSONB(coupons) || JSONB_BUILD_OBJECT(
                      'created_at', TO_CHAR(coupons.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                      'updated_at', TO_CHAR(coupons.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
                    )
                    ORDER BY coupons.id
                  )
                FROM
                  product_requests_coupons
                INNER JOIN
                  coupons
                ON
                  coupons.id = product_requests_coupons.coupon_id
                WHERE
                  product_requests_coupons.product_request_id = inserted_product.product_request_id
              ),
              '[]'::json
            ) AS coupons
          FROM
            inserted_product
          ;
        `,
      values: [
        product.name,
        product.image_url,
        product.current_price,
        product.old_price,
        product.product_request_id,
      ],
    });
    const response = command.rows[0] as ICreatedProduct;
    return response;
  }

  async getAllProducts(datetime: Date): Promise<TCreatedProductAndUrl[]> {
    const date = DateFormater.onlyDate(datetime);
    const command = await database.query({
      text: `
        SELECT
          products.*,
          product_requests.url AS url,
          COALESCE(
            (
              SELECT
                JSON_AGG(
                  TO_JSONB(coupons) || JSONB_BUILD_OBJECT(
                    'created_at', TO_CHAR(coupons.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                    'updated_at', TO_CHAR(coupons.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
                  )
                )
              FROM
                product_requests_coupons
              INNER JOIN
                coupons
              ON
                coupons.id = product_requests_coupons.coupon_id
              WHERE
                product_requests_coupons.product_request_id = products.product_request_id
            ),
            '[]'::json
          ) AS coupons
        FROM
          products
        INNER JOIN
          product_requests
        ON
          product_requests.id = products.product_request_id
        WHERE
          DATE(products.created_at) = $1
        ;
      `,
      values: [date],
    });
    return command.rows as TCreatedProductAndUrl[];
  }

  async getProductById(id: number): Promise<TCreatedProductAndUrl> {
    const command = await database.query({
      text: `
        SELECT
          products.*,
          product_requests.url AS url,
          COALESCE(
            (
              SELECT
                JSON_AGG(
                  TO_JSONB(coupons) || JSONB_BUILD_OBJECT(
                    'created_at', TO_CHAR(coupons.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                    'updated_at', TO_CHAR(coupons.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
                  )
                )
              FROM
                product_requests_coupons
              INNER JOIN
                coupons
              ON
                coupons.id = product_requests_coupons.coupon_id
              WHERE
                product_requests_coupons.product_request_id = product_requests.id
            ),
            '[]'::json
          ) AS coupons
        FROM
          products
        INNER JOIN
          product_requests
        ON
          product_requests.id = products.product_request_id
        WHERE
          products.id = $1
        ;
      `,
      values: [id],
    });

    return command.rows[0] as TCreatedProductAndUrl;
  }

  async changeProductsToPosted(id: number): Promise<void> {
    await database.query({
      text: `
        UPDATE
          products
        SET
          status = 'posted'
        WHERE
          id = $1
        ;
      `,
      values: [id],
    });
  }
}

export interface IProducts {
  createProduct(product: ICreateProduct): Promise<ICreatedProduct>;
  getAllProducts(datetime: Date): Promise<TCreatedProductAndUrl[]>;
  getProductById(id: number): Promise<TCreatedProductAndUrl>;
  changeProductsToPosted(id: number): Promise<void>;
}

export interface ICreateProduct {
  name: string;
  image_url: string;
  current_price: number;
  old_price: number;
  product_request_id?: number;
}

export interface ICreatedProduct {
  id: number;
  name: string;
  image_url: string;
  current_price: number;
  old_price: number;
  status: PostStatus;
  product_request_id: number;
  created_at: Date | string;
  updated_at: Date | string;
  coupons?: ICreatedCoupons;
}

export type TCreatedProductAndUrl = ICreatedProduct & { url: string };

export type ICreatedProducts = ICreatedProduct[];

export type PostStatus = "pending" | "posted" | "failed";
