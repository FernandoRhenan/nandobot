import { Response } from "@/infra/responses";
import { TCreatedProductAndUrl } from "@/models/products";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/products", async () => {
  describe("Authorized user", () => {
    test("With a valid request and a one coupon", async () => {
      const coupon = await orchestrator.createCoupon({
        name: "VEMPROTESTE",
        discount: 10,
        discount_type: "percentage",
        discount_limit: 50,
        min_purchase: 15,
      });
      const productRequest = await orchestrator.createProductRequest(
        "https://meli.la/123",
        [coupon.id],
      );
      const productCreated = await orchestrator.createProduct({
        name: "Produto teste",
        current_price: 4999,
        old_price: 6500,
        image_url: "https://http2.mlstatic.com/image-that-dont-exists",
        product_request_id: productRequest.id,
      });

      const date = new Date(productCreated.created_at)
        .toISOString()
        .split("T")[0];

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/products?date=${date}`,
      );

      const responseBody: Response<TCreatedProductAndUrl[]> =
        await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(200);
      expect(responseBody.message).toBe("");
      expect(responseBody.action).toBe("");

      const data = responseBody.data;

      expect(data).toStrictEqual<TCreatedProductAndUrl[]>([
        {
          id: productCreated.id,
          name: productCreated.name,
          image_url: productCreated.image_url,
          current_price: productCreated.current_price,
          old_price: productCreated.old_price,
          status: productCreated.status,
          product_request_id: productCreated.product_request_id,
          url: responseBody.data![0].url,
          created_at: new Date(responseBody.data![0].created_at).toISOString(),
          updated_at: new Date(responseBody.data![0].updated_at).toISOString(),
          coupons: [
            {
              id: coupon.id,
              name: coupon.name,
              discount: coupon.discount,
              discount_limit: coupon.discount_limit,
              discount_type: coupon.discount_type,
              min_purchase: coupon.min_purchase,
              created_at: new Date(coupon.created_at).toISOString(),
              updated_at: new Date(coupon.updated_at).toISOString(),
            },
          ],
        },
      ]);
      await orchestrator.cleanDatabase();
      await orchestrator.runPendingMigrations();
    });

    test("With a valid request and a two coupons", async () => {
      const coupon = await orchestrator.createCoupon({
        name: "VEMPROTESTE",
        discount: 10,
        discount_type: "percentage",
        discount_limit: 50,
        min_purchase: 15,
      });
      const coupon2 = await orchestrator.createCoupon({
        name: "VEMPROTESTE2",
        discount: 20,
        discount_type: "fixed",
        min_purchase: 15,
      });

      const productRequest = await orchestrator.createProductRequest(
        "https://meli.la/123",
        [coupon.id, coupon2.id],
      );
      const productCreated = await orchestrator.createProduct({
        name: "Produto teste",
        current_price: 4999,
        old_price: 6500,
        image_url: "https://http2.mlstatic.com/image-that-dont-exists",
        product_request_id: productRequest.id,
      });

      const date = new Date(productCreated.created_at)
        .toISOString()
        .split("T")[0];

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/products?date=${date}`,
      );

      const responseBody: Response<TCreatedProductAndUrl[]> =
        await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(200);
      expect(responseBody.message).toBe("");
      expect(responseBody.action).toBe("");

      const data = responseBody.data;
      expect(data).toStrictEqual<TCreatedProductAndUrl[]>([
        {
          id: productCreated.id,
          name: productCreated.name,
          image_url: productCreated.image_url,
          current_price: productCreated.current_price,
          old_price: productCreated.old_price,
          status: productCreated.status,
          product_request_id: productCreated.product_request_id,
          url: responseBody.data![0].url,
          created_at: new Date(responseBody.data![0].created_at).toISOString(),
          updated_at: new Date(responseBody.data![0].updated_at).toISOString(),
          coupons: [
            {
              id: coupon.id,
              name: coupon.name,
              discount: coupon.discount,
              discount_limit: coupon.discount_limit,
              discount_type: coupon.discount_type,
              min_purchase: coupon.min_purchase,
              created_at: new Date(coupon.created_at).toISOString(),
              updated_at: new Date(coupon.updated_at).toISOString(),
            },
            {
              id: coupon2.id,
              name: coupon2.name,
              discount: coupon2.discount,
              discount_limit: coupon2.discount_limit,
              discount_type: coupon2.discount_type,
              min_purchase: coupon2.min_purchase,
              created_at: new Date(coupon2.created_at).toISOString(),
              updated_at: new Date(coupon2.updated_at).toISOString(),
            },
          ],
        },
      ]);
    });
  });
});
