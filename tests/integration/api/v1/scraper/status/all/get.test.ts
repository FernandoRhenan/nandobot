import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/scraper/status/all", () => {
  describe("Anonimous user", () => {
    test.skip("Retrieving all products", async () => {
      expect(1).toBe(1);
    });
  });
});
