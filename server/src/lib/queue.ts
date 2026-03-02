import { PgBoss } from "pg-boss";
import { registerClassifyWorker } from "./classify-ticket";
import { registerAutoResolveWorker } from "./auto-resolve-ticket";
import { registerSendEmailWorker } from "./send-email";

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL!,
});

boss.on("error", console.error);

export { boss };

export async function startQueue(): Promise<void> {
  await boss.start();

  await registerClassifyWorker(boss);
  await registerAutoResolveWorker(boss);
  await registerSendEmailWorker(boss);

  console.log("Job queue started");
}

export async function stopQueue(): Promise<void> {
  await boss.stop({ graceful: true, timeout: 30000 });
}
