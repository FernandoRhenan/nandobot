import { Response } from "@/infra/responses";
import Coupons from "@/models/coupons";
import {
  ICreatedProductRequest,
  ICreatedProductsRequest,
} from "@/models/scraper";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/scraper/request", () => {
  describe("Authenticated user", () => {
    test("With valid URL and a coupon", async () => {
      const coupons = new Coupons();
      const coupon = await coupons.createCoupon({
        name: "TESTING",
        discount: 30,
        discount_type: "fixed",
      });

      const postedUrl = "https://meli.la/1234";
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/scraper/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: postedUrl,
            couponId: [coupon.id],
          }),
        },
      );
      expect(response.ok).toBeTruthy();

      const responseBody: Response<ICreatedProductRequest> =
        await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(201);
      expect(responseBody.message).toBe("URL enqueued.");
      expect(responseBody.action).toBe("You can start pipeline to find it.");

      const data = responseBody.data as ICreatedProductRequest;

      expect(data).toStrictEqual<ICreatedProductRequest>({
        id: data.id,
        url: postedUrl,
        status: "pending",
        created_at: data.created_at,
        updated_at: data.updated_at,
      });

      expect(Number.isInteger(data.id)).toBeTruthy();
      expect(Date.parse(data.created_at as unknown as string)).not.toBeNaN();
      expect(Date.parse(data.updated_at as unknown as string)).not.toBeNaN();
    });

    test("With valid URL", async () => {
      const postedUrl = "https://meli.la/1234";
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/scraper/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: postedUrl,
            couponId: null,
          }),
        },
      );

      expect(response.ok).toBeTruthy();

      const responseBody: Response<ICreatedProductRequest> =
        await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(201);
      expect(responseBody.message).toBe("URL enqueued.");
      expect(responseBody.action).toBe("You can start pipeline to find it.");

      const data = responseBody.data as ICreatedProductRequest;

      expect(data).toStrictEqual<ICreatedProductRequest>({
        id: data.id,
        url: postedUrl,
        status: "pending",
        created_at: data.created_at,
        updated_at: data.updated_at,
      });

      expect(Number.isInteger(data.id)).toBeTruthy();
      expect(Date.parse(data.created_at as unknown as string)).not.toBeNaN();
      expect(Date.parse(data.updated_at as unknown as string)).not.toBeNaN();
    });

    test("With any URL", async () => {
      const postedUrl = "";

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/scraper/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: postedUrl,
            couponId: null,
          }),
        },
      );

      expect(response.ok).toBeFalsy();

      const responseBody: Response<ICreatedProductsRequest> =
        await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The URL must be a valid link.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });

    test("With invalid URL", async () => {
      const postedUrl = "http://localhost.com";

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/scraper/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: postedUrl,
            couponId: null,
          }),
        },
      );
      expect(response.ok).toBeFalsy();

      const responseBody: Response<ICreatedProductsRequest> =
        await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The URL must be a valid link.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });
  });
});
