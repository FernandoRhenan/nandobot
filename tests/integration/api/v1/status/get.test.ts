import { ISystemStatusResponse } from "@/app/api/v1/status/route";
import { IResponse } from "@/infra/responses";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(async () => {
  await new Orchestrator().waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Getting the system status", async () => {
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/status",
      );
      expect(response.status).toBe(200);

      const responseBody: IResponse<ISystemStatusResponse> =
        await response.json();

      expect(responseBody.data).toBeDefined();
      if (!responseBody.data) return;

      const parsedUpdatedAt = new Date(
        responseBody.data.updated_at,
      ).toISOString();

      expect(responseBody.data.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.data.dependencies.database.database_version).toBe(
        "16.14 (Debian 16.14-1.pgdg13+1)",
      );
      expect(responseBody.data.dependencies.database.max_connections).toBe(100);
      expect(
        responseBody.data.dependencies.database.current_connections <= 2,
      ).toBeTruthy();
    });
  });
});
