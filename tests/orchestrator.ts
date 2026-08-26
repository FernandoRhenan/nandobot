import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import retry from "async-retry";
import authenticatedFetch from "@/tests/authenticatedFetch";
import database from "@/infra/database";
import Migrator from "@/models/migrator";
import Scraper from "@/models/scraper";
import Products, { ICreateProduct } from "@/models/products";
import redis from "@/infra/redis";
import Coupons, { ICreateCoupon } from "@/models/coupons";

export default class Orchestrator {
  async waitForAllServices() {
    await this.waitForWebServer();
  }

  async cleanDatabase() {
    await database.query({
      text: "drop schema public cascade; create schema public;",
    });
  }

  async clearRedis() {
    const redisClient = await redis.startConnection();
    await redisClient.flushDb();
    await redis.closeConnection();
  }

  async runPendingMigrations() {
    await new Migrator().runPendingMigrations();
  }

  private async waitForWebServer() {
    return await retry(this.fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });
  }

  async createProductRequest(
    url: string = process.env.TEST_AFFILIATE_URL_MELI!,
    coupomId?: number[],
  ) {
    const scraperModel = new Scraper();
    const productRequest = await scraperModel.createProductRequest({
      url: url,
      couponId: coupomId ? coupomId : null,
    });

    if (coupomId) {
      const coupons = new Coupons();
      await Promise.all(
        coupomId.map((id) =>
          coupons.attachCouponToProduct(productRequest.id, id),
        ),
      );
    }

    return productRequest;
  }

  async createRequestWithCoupon(productRequestId: number, coupomId: number) {
    const coupons = new Coupons();
    const attachedCouponToProductRequest = await coupons.attachCouponToProduct(
      productRequestId,
      coupomId,
    );
    return attachedCouponToProductRequest;
  }

  async createCoupon(coupon: ICreateCoupon) {
    const coupons = new Coupons();
    const createdCoupon = await coupons.createCoupon(
      coupon ?? { name: "TESTE", discount: 15, discount_type: "percentage" },
    );
    return createdCoupon;
  }

  async whatsappConnect() {
    await authenticatedFetch("http://localhost:3000/api/v1/whatsapp/connect");
  }

  async createProduct(product: ICreateProduct) {
    const productsModel = new Products();
    const productCreated = await productsModel.createProduct(product);

    return productCreated;
  }

  // Doubles as the login retry: `authenticatedFetch` only reaches the status
  // route after it managed to authenticate against the running web server.
  private async fetchStatusPage() {
    const response = await authenticatedFetch(
      "http://localhost:3000/api/v1/status",
    );

    if (response.status !== 200) {
      throw Error();
    }
  }
}
