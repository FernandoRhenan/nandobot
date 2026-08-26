import { IWhatsappGroupsResponse } from "@/app/api/v1/whatsapp/groups/route";
import { IResponse } from "@/infra/responses";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.whatsappConnect();
});

describe("GET /api/v1/whatsapp/groups", () => {
  describe("Anonimous user", () => {
    test.skip("Returning all groups", async () => {
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/groups",
      );

      expect(response.status).toBe(200);

      const responseBody: IResponse<IWhatsappGroupsResponse> =
        await response.json();

      expect(responseBody.status_code).toBe(200);
      expect(responseBody.action).toBe("");
      expect(responseBody.message).toBe("");
      expect(responseBody.data).toBeDefined();
      expect(responseBody.error).toBeFalsy();
    });
  });
});
