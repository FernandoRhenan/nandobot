import { Response } from "@/infra/responses";
import Migrator from "@/models/migrator";
import { NextResponse } from "next/server";
import { RunMigration } from "node-pg-migrate/migration";

export async function GET() {
  const listPendingMigrations = await new Migrator().listPendingMigrations();
  return NextResponse.json(
    new Response<RunMigration[]>({
      data: listPendingMigrations,
      error: false,
      status_code: 200,
    }),
    { status: 200 },
  );
}

export async function POST() {
  const migratedMigrations = await new Migrator().runPendingMigrations();

  if (migratedMigrations.length > 0) {
    return NextResponse.json(
      new Response<RunMigration[]>({
        data: migratedMigrations,
        error: false,
        status_code: 201,
      }),
      { status: 201 },
    );
  } else {
    return NextResponse.json(
      new Response<RunMigration[]>({
        data: migratedMigrations,
        error: false,
        status_code: 200,
      }),
      { status: 200 },
    );
  }
}
