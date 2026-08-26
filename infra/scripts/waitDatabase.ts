import { exec, type ExecException } from "node:child_process";
const DOCKER_CONTAINER = "postgres_nandobot";
function checkPostgres() {
  exec(
    "docker exec " + DOCKER_CONTAINER + " pg_isready --host localhost",
    handleReturn,
  );

  function handleReturn(error: ExecException | null, stdout: string) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      setTimeout(() => checkPostgres(), 1000);
      return;
    }

    console.log("\n🟢 Postgres está aceitando conexões!");
  }
}

console.log("🔴 Aguardando Postgres iniciar");

checkPostgres();
