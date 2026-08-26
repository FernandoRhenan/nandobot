import Orchestrator from "./orchestrator";

export default async function setup() {
  return async () => {
    const orchestrator = new Orchestrator();
    await orchestrator.cleanDatabase();
    await orchestrator.clearRedis();
  };
}
