import { Client, Pool, type QueryConfig } from "pg";

class Database {
  private pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: this.getSSLValues(),
  });

  async query<T>(queryObject: QueryConfig<T[]>) {
    let client: Client | undefined;
    try {
      client = await this.getNewClient();
      const result = await client.query(queryObject);
      return result;
    } catch (error) {
      console.log("\nErro no database.query()\n");
      console.log(error);
      throw error;
    } finally {
      if (client) {
        await client.end();
      }
    }
  }

  async getNewClient() {
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      ssl: this.getSSLValues(),
    });

    await client.connect();
    return client;
  }

  async getPoolClient() {
    const client = await this.pool.connect();
    return client;
  }

  private getSSLValues() {
    if (process.env.POSTGRES_CA) {
      return {
        ca: process.env.POSTGRES_CA,
      };
    }

    return process.env.NODE_ENV === "production" ? true : false;
  }
}

const database = new Database();

export default database;
