import { z } from "zod";
import { buildFilePathInConfigDirectory } from ".";

export const configSchema = z.object({
  database: z.object({
    type: z.enum([ "sqlite", "postgresql" ]).default("sqlite"),

    sqlite: z.object({
      path: z.string().default(buildFilePathInConfigDirectory("trawler.db")),
    }).prefault({}),

    postgresql: z.object({
      host: z.string().default("127.0.0.1"),
      port: z.number().min(1).max(65535).default(5432),
      user: z.string().default("postgres"),
      password: z.string().default("postgres"),
      database: z.string().default("trawler"),
    }).prefault({}),
  }).prefault({}),

  webui: z.object({
    host: z.string().default("127.0.0.1"),
    port: z.number().min(1).max(65535).default(8080),
    enableBasicAuth: z.boolean().default(false),
    basicAuthUsername: z.string().optional(),
    basicAuthPassword: z.string().optional(),
  }).prefault({}),
});

export type ConfigSchema = z.infer<typeof configSchema>;

export function buildSqliteUrl(config: ConfigSchema): string {
  return `file:${config.database.sqlite.path}`;
}

export function buildPostgresqlUrl(config: ConfigSchema): string {
  const { host, port, user, password, database } = config.database.postgresql;
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
