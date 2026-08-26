import { IResponse } from "@/infra/responses";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator.js";
import { RunMigration } from "node-pg-migrate/migration";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(async () => {
  await new Orchestrator().waitForAllServices();
  await new Orchestrator().cleanDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Getting the pending migrations", async () => {
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/migrations",
      );

      expect(response.status).toBe(200);

      const responseBody: IResponse<RunMigration[]> = await response.json();

      expect(responseBody.error).toBeFalsy();
      expect(responseBody.status_code).toBe(200);
      expect(responseBody.data).toBeDefined();

      if (!responseBody.data) return;
      expect(Array.isArray(responseBody.data)).toBe(true);
      expect(responseBody.data.length).toBeGreaterThan(0);
      expect(responseBody.data[0]).not.toBeUndefined();
    });
  });
});
