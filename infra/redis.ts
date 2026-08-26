import { createClient, type RedisClientType } from "redis";

class Redis {
  private client: RedisClientType = createClient({
    url: process.env.REDIS_URL,
  });

  async startConnection() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }

    return this.client;
  }

  async closeConnection() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}

const redis = new Redis();

export default redis;

export const redisKeys = {
  AUTH_CREDS_KEY: "baileys:auth:creds",
  AUTH_KEYS_PREFIX: "baileys:auth:keys:",
  WHATSAPP_POST: "whatsapp:post:",
};
