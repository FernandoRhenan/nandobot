import { resolve } from "node:path";
import database from "@/infra/database";
import { runner as migrationRunner, RunnerOption } from "node-pg-migrate";
import { ServiceError } from "@/infra/error";

export default class Migrator {
  async listPendingMigrations() {
    let dbClient;

    try {
      dbClient = await database.getNewClient();
      const defaultOptions: RunnerOption = {
        dir: resolve("infra", "migrations"),
        direction: "up",
        log: () => {},
        migrationsTable: "pgmigrations",
        dryRun: true,
        dbClient: dbClient,
      };

      const pendingMigrations = await migrationRunner({
        ...defaultOptions,
      });

      return pendingMigrations;
    } catch (error) {
      const serviceErrorObject = new ServiceError({
        cause: error,
        message: "Ocorreu um erro ao consultar as migrações.",
      });

      throw serviceErrorObject;
    } finally {
      await dbClient?.end();
    }
  }

  async runPendingMigrations() {
    let dbClient;

    try {
      dbClient = await database.getNewClient();
      const defaultOptions: RunnerOption = {
        dir: resolve("infra", "migrations"),
        direction: "up",
        log: () => {},
        migrationsTable: "pgmigrations",
        dryRun: true,
        dbClient: dbClient,
      };

      const migratedMigrations = await migrationRunner({
        ...defaultOptions,
        dryRun: false,
      });

      return migratedMigrations;
    } catch (error) {
      const serviceErrorObject = new ServiceError({
        cause: error,
        message: "Ocorreu um erro ao rodar as migrações.",
      });

      throw serviceErrorObject;
    } finally {
      await dbClient?.end();
    }
  }
}
