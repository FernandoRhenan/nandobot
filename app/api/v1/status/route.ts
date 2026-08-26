import database from "@/infra/database";
import { Response } from "@/infra/responses";
import { NextResponse } from "next/server";

export async function GET() {
  const databaseName = process.env.POSTGRES_DB;
  const updatedAt = new Date().toISOString();
  const databaseVersion = await database.query({
    text: "SHOW server_version;",
  });
  const maxConnections = await database.query({
    text: "SHOW max_connections;",
  });

  const currentConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const response: ISystemStatusResponse = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        database_version: databaseVersion.rows[0].server_version,
        max_connections: parseInt(maxConnections.rows[0].max_connections),
        current_connections: currentConnections.rows[0].count,
      },
    },
  };

  return NextResponse.json(
    new Response<ISystemStatusResponse>({
      status_code: 200,
      data: response,
      error: false,
    }),
    { status: 200 },
  );
}

export interface ISystemStatusResponse {
  updated_at: string;
  dependencies: {
    database: {
      database_version: string;
      max_connections: number;
      current_connections: number;
    };
  };
}
