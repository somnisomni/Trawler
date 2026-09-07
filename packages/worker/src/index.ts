import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { handleArgs } from "./cli";
import Config from "./config";
import Database from "./db";
import Logger from "./logging";

if(!handleArgs()) {
  process.exit(0);
}

await Config.loadConfig();
await Database.initialize();

const app = new Hono();

app.get("/", c => c.text("Hello Hono!"));

serve({
  fetch: app.fetch,
  port: Config.instance?.config?.webui.port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

Logger.log("Server initialization");
