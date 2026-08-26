import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/whatsapp/status", () => {
  describe("Anonimous user", () => {
    test.skip("With a normal connection", async () => {
      expect(1).toBe(1);
    });
  });
});
