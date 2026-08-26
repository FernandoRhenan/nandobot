import { Response } from "@/infra/responses";
import { IPostMessageInGroups } from "@/models/publisher";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.clearRedis();
});

describe("POST /api/v1/whatsapp/send/group-message", () => {
  describe.skip("Anonimous user", () => {
    test("With a valid request", async () => {
      const product = await orchestrator.createProduct();

      const body: IPostMessageInGroups = {
        productsId: [product.id],
        groupsId: ["123456789@g.us"],
        interval: 30,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/send/group-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      expect(response.status).toBe(201);

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(201);
      expect(responseBody.message).toBe("Messages enqueued.");
      expect(responseBody.action).toBe("");
      expect(responseBody.data).toBeUndefined();
    });

    test("With any product id", async () => {
      const body: IPostMessageInGroups = {
        productsId: [],
        groupsId: ["123456789@g.us"],
        interval: 30,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/send/group-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      expect(response.status).toBe(400);

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("Send at least one product id.");
      expect(responseBody.action).toBe("Adjust the data and try again.");
      expect(responseBody.data).toBeUndefined();
    });

    test("With any group id", async () => {
      const product = await orchestrator.createProduct();

      const body: IPostMessageInGroups = {
        productsId: [product.id],
        groupsId: [],
        interval: 30,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/send/group-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      expect(response.status).toBe(400);

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe("Send at least one group id.");
      expect(responseBody.action).toBe("Adjust the data and try again.");
      expect(responseBody.data).toBeUndefined();
    });

    test("With an invalid interval", async () => {
      const product = await orchestrator.createProduct();

      const body: IPostMessageInGroups = {
        productsId: [product.id],
        groupsId: ["123456789@g.us"],
        interval: -30,
      };

      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/send/group-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      expect(response.status).toBe(400);

      const responseBody: Response<undefined> = await response.json();

      expect(responseBody.error).toBeTruthy();
      expect(responseBody.status_code).toBe(400);
      expect(responseBody.message).toBe(
        "The interval must be a positive number.",
      );
      expect(responseBody.action).toBe("Adjust the data and try again.");
      expect(responseBody.data).toBeUndefined();
    });
  });
});
