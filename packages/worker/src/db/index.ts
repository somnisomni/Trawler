import { DrizzleQueryError } from "drizzle-orm";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import Config from "../config";
import { buildPostgresqlUrl } from "../config/schema";
import Logger from "../logging";

export default class Database {
  private static _instance: Database | null = null;
  public static get instance(): Database | null { return this._instance; }

  public connection: ReturnType<typeof drizzlePostgres> | null = null;

  public static async initialize(): Promise<void> {
    if(Config.instance === null) {
      throw new Error("Configuration must be loaded before initializing the database.");
    }

    Logger.log(`Initializing database connection... type: ${Config.instance?.config?.database.type}`);

    this._instance = new Database();

    // #1. Create the database connection based on the configuration
    switch(Config.instance?.config?.database.type) {
      case "sqlite": {
        // const sqliteUrl = buildSqliteUrl(Config.instance?.config);
        // Logger.debug(`Using SQLite database at: ${sqliteUrl}`);
        // this._instance.connection = drizzleSqlite(sqliteUrl);
        Logger.error("SQLite support is not implemented yet.");
        throw new Error("SQLite support is not implemented yet.");
      }
      case "postgresql": {
        const postgresqlUrl = buildPostgresqlUrl(Config.instance?.config);
        Logger.debug(`Using PostgreSQL database at URL: ${postgresqlUrl}`);
        this._instance.connection = drizzlePostgres(postgresqlUrl);
        break;
      }
      default: {
        throw new Error(`Unsupported database type: ${Config.instance?.config?.database.type}`);
      }
    }

    if(this._instance.connection === null) {
      throw new Error("Failed to initialize the database connection.");
    } else {
      Logger.debug("Database connection instance created successfully.");
    }

    // #2. Test the database connection
    try {
      await this._instance.connection.execute("SELECT 1");
      Logger.debug("Database connection test query executed successfully.");
    } catch (error) {
      if(error instanceof DrizzleQueryError) {
        Logger.error(`Failed to execute test query on the database. Cause: ${error.cause?.message}`);
      } else {
        Logger.error(`Failed to execute test query on the database. Error: ${(error as Error).message}`);
      }
      throw error;
    }

    Logger.log("Database initialized successfully.");
  }
}
