import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { handleArgs } from "./cli";
import { loadedConfig } from "./config";
import Logger from "./logging";

if(!handleArgs()) {
  process.exit(0);
}

const app = new Hono();

app.get("/", c => c.text("Hello Hono!"));

serve({
  fetch: app.fetch,
  port: loadedConfig?.webui.port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

Logger.log("Server initialization");
