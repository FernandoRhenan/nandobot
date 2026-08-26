import { Response } from "@/infra/responses";
import { ICreatedProduct, ICreateProduct } from "@/models/products";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/products", async () => {
  describe("Anonimous user", () => {
    test("With a valid product and two coupons", async () => {
      const coupon = await orchestrator.createCoupon({
        name: "TESTNAME",
        discount: 20,
        discount_type: "percentage",
        discount_limit: 60,
        min_purchase: 19,
      });
      const coupon2 = await orchestrator.createCoupon({
        name: "TESTNAME2",
        discount: 20,
        discount_type: "percentage",
        discount_limit: 50,
        min_purchase: 19,
      });

      const productRequest = await orchestrator.createProductRequest(
        "https://meli.la/dqwoin1",
        [coupon.id, coupon2.id],
      );

      const product: ICreateProduct = {
        name: "teste",
        image_url:
          "https://http2.mlstatic.com/D_NQ_NP_2X_662415-MLA97812910758_112025-F.webp",
        current_price: 99900,
        old_price: 149985,
        product_request_id: productRequest.id,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      const responseBody: Response<ICreatedProduct> = await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(201);
      expect(responseBody.message).toBe("");
      expect(responseBody.action).toBe("");

      const data = responseBody.data;

      expect(data).toStrictEqual<ICreatedProduct>({
        id: expect.any(Number),
        name: expect.any(String),
        image_url: expect.any(String),
        current_price: expect.any(Number),
        old_price: expect.any(Number),
        status: expect.any(String),
        product_request_id: expect.any(Number),
        coupons: [
          {
            discount: 20,
            discount_limit: 60,
            min_purchase: 19,
            discount_type: "percentage",
            id: expect.any(Number),
            name: "TESTNAME",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
          {
            discount: 20,
            discount_limit: 50,
            min_purchase: 19,
            discount_type: "percentage",
            id: expect.any(Number),
            name: "TESTNAME2",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
        ],
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });

      expect(Date.parse(data!.created_at as unknown as string)).not.toBeNaN();
      expect(Date.parse(data!.updated_at as unknown as string)).not.toBeNaN();
    });

    test("With a valid product and coupon", async () => {
      const createdCoupon = await orchestrator.createCoupon({
        name: "VALIDPRODUCT",
        discount: 15,
        discount_type: "percentage",
      });
      const productRequest = await orchestrator.createProductRequest(
        undefined,
        [createdCoupon.id],
      );

      const product: ICreateProduct = {
        name: "teste",
        image_url:
          "https://http2.mlstatic.com/D_NQ_NP_2X_662415-MLA97812910758_112025-F.webp",
        current_price: 99900,
        old_price: 149985,
        product_request_id: productRequest.id,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      const responseBody: Response<ICreatedProduct> = await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(201);
      expect(responseBody.message).toBe("");
      expect(responseBody.action).toBe("");

      const data = responseBody.data;

      expect(data).toStrictEqual<ICreatedProduct>({
        id: expect.any(Number),
        name: expect.any(String),
        image_url: expect.any(String),
        current_price: expect.any(Number),
        old_price: expect.any(Number),
        status: expect.any(String),
        product_request_id: expect.any(Number),
        coupons: [
          {
            discount: 15,
            discount_limit: null,
            min_purchase: null,
            discount_type: "percentage",
            id: expect.any(Number),
            name: "VALIDPRODUCT",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
        ],
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });

      expect(Date.parse(data!.created_at as unknown as string)).not.toBeNaN();
      expect(Date.parse(data!.updated_at as unknown as string)).not.toBeNaN();
    });

    test("With a invalid product image url", async () => {
      const productRequest = await orchestrator.createProductRequest();

      const product: ICreateProduct = {
        name: "teste",
        image_url: "http://1234",
        current_price: 99900,
        old_price: 149985,
        product_request_id: productRequest.id,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      const responseBody: Response<ICreatedProduct> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The image url must be a valid URL.");
      expect(responseBody.action).toBe("Adjust the data and try again.");
      expect(responseBody.data).toBeUndefined();
    });

    test("With a invalid product current price", async () => {
      const productRequest = await orchestrator.createProductRequest();

      const product: ICreateProduct = {
        name: "teste",
        image_url:
          "https://http2.mlstatic.com/D_NQ_NP_2X_662415-MLA97812910758_112025-F.webp",
        current_price: -1,
        old_price: 149985,
        product_request_id: productRequest.id,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      const responseBody: Response<ICreatedProduct> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe(
        "The current price must be a positive number.",
      );
      expect(responseBody.action).toBe("Adjust the data and try again.");
      expect(responseBody.data).toBeUndefined();
    });

    test("With a invalid product request id", async () => {
      const product: ICreateProduct = {
        name: "teste",
        image_url:
          "https://http2.mlstatic.com/D_NQ_NP_2X_662415-MLA97812910758_112025-F.webp",
        current_price: 99950,
        old_price: 149985,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      const responseBody: Response<ICreatedProduct> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("Invalid input");
      expect(responseBody.action).toBe("Adjust the data and try again.");
      expect(responseBody.data).toBeUndefined();
    });
  });
});
