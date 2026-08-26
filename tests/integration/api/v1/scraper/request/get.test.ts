import { Response } from "@/infra/responses";
import { ICreateProduct } from "@/models/products";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/scraper/request", () => {
  describe("Anonimous user", () => {
    test("With a valid Meli URL", async () => {
      const productRequest = await orchestrator.createProductRequest(
        process.env.TEST_AFFILIATE_URL_MELI,
      );

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=${productRequest.id}&url=${productRequest.url}`,
      );

      expect(response.ok).toBeTruthy();

      const responseBody: Response<ICreateProduct> = await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(200);
      expect(responseBody.message).toBe("");
      expect(responseBody.action).toBe("");

      const data = responseBody.data;

      expect(data).toEqual<ICreateProduct>({
        name: expect.any(String),
        current_price: expect.any(Number),
        old_price: expect.any(Number),
        image_url: expect.any(String),
        product_request_id: expect.any(Number),
      });
    });

    test.skip("With a valid Amazon URL", async () => {
      const productRequest = await orchestrator.createProductRequest(
        process.env.TEST_AFFILIATE_URL_AMAZON,
      );

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=${productRequest.id}&url=${productRequest.url}`,
      );

      expect(response.ok).toBeTruthy();

      const responseBody: Response<ICreateProduct> = await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(200);
      expect(responseBody.message).toBe("");
      expect(responseBody.action).toBe("");

      const data = responseBody.data;

      expect(data).toEqual<ICreateProduct>({
        name: expect.any(String),
        current_price: expect.any(Number),
        old_price: expect.any(Number),
        image_url: expect.any(String),
        product_request_id: expect.any(Number),
      });
    });

    test("With any URL", async () => {
      const url = "";
      const id = 1;

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=${id}&url=${url}`,
      );

      expect(response.ok).toBeFalsy();

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The URL must be a valid link.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });

    test("With invalid URL", async () => {
      const url = "http://asdasd";
      const id = 1;

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=${id}&url=${url}`,
      );

      expect(response.ok).toBeFalsy();

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The URL must be a valid link.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });

    test("With any request id", async () => {
      const url = "https://meli.la";

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=&url=${url}`,
      );

      expect(response.ok).toBeFalsy();

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The id must be an integer.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });

    test("With negative request id", async () => {
      const url = "https://meli.la";
      const id = -1;

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=${id}&url=${url}`,
      );

      expect(response.ok).toBeFalsy();

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The id must be an integer.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });

    test("With a string in request id", async () => {
      const url = "https://meli.la";
      const id = "um";

      const response = await authenticatedFetch(
        `http://localhost:3000/api/v1/scraper/request?id=${id}&url=${url}`,
      );

      expect(response.ok).toBeFalsy();

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("The id must be an integer.");
      expect(responseBody.action).toBe("Adjust the data and try again.");

      const data = responseBody.data;

      expect(data).toBeUndefined();
    });
  });
});
