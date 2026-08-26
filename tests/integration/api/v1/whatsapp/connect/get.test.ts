import { IWhatsappConnectResponse } from "@/app/api/v1/whatsapp/connect/route";
import { IResponse } from "@/infra/responses";
import authenticatedFetch from "@/tests/authenticatedFetch";
import Orchestrator from "@/tests/orchestrator";
import { test, expect, beforeAll, describe } from "vitest";

const orchestrator = new Orchestrator();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/whatsapp/connect", () => {
  describe("Anonimous user", () => {
    // First I need to remove the persistent auth file, but not yet.
    test.skip("With a normal connection", async () => {
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/connect",
      );

      expect(response.status).toBe(200);

      const responseBody: IResponse<IWhatsappConnectResponse> =
        await response.json();

      expect(responseBody.status_code).toBe(200);
      expect(responseBody.action).toBe(
        "Scan the QR code with WhatsApp to connect.",
      );
      expect(responseBody.data).not.toBe("");
      console.log(responseBody.data?.qr_code);
      expect(responseBody.message).toBe("QR code generated.");
      expect(responseBody.error).toBeFalsy();
    });

    test.skip("With a existent connection", async () => {
      const response = await authenticatedFetch(
        "http://localhost:3000/api/v1/whatsapp/connect",
      );

      expect(response.status).toBe(400);

      const responseBody: IResponse<IWhatsappConnectResponse> =
        await response.json();

      expect(responseBody.status_code).toBe(400);
      expect(responseBody.action).toBeUndefined();
      expect(responseBody.data).toBeUndefined();
      expect(responseBody.message).toBe("Whatsapp already connected.");
      expect(responseBody.error).toBeTruthy();
    });
  });
});
