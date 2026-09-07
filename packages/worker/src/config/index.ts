import type { ConfigSchema } from "./schema";
import type { z } from "zod";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Logger from "../logging";
import { configSchema } from "./schema";

function getDefaultConfigDirectory(): string {
  const appName = "Trawler";
  const homeDir = os.homedir();

  switch(process.platform) {
    case "win32": {
      const appdata = process.env.APPDATA || path.join(homeDir, "AppData", "Roaming");
      return path.join(appdata, appName);
    }

    case "darwin": {
      return path.join(homeDir, "Library", "Preferences", appName);
    }

    case "linux":
    default: {
      const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(homeDir, ".config");
      return path.join(xdgConfigHome, appName.toLowerCase());
    }
  }
}

export function buildFilePathInConfigDirectory(fileName: string): string {
  return path.join(getDefaultConfigDirectory(), fileName);
}

export default class Config {
  private static readonly DEFAULT_CONFIG_FILE_NAME = "config.json";

  private static _instance: Config | null = null;
  public static get instance(): Config | null { return this._instance; }

  public config: ConfigSchema | null = null;
  private configFilePath: string | null = null;

  private constructor() { }

  public static get defaultConfigFilePath(): string {
    return buildFilePathInConfigDirectory(this.DEFAULT_CONFIG_FILE_NAME);
  }

  public static async loadConfig(): Promise<void> {
    const configFilePath = process.env.TRAWLER_CONFIG_FILE || this.defaultConfigFilePath;
    let configData: string;

    Logger.log("Loading configuration...");
    Logger.debug(`Using configuration file: ${configFilePath}`);

    // #1. Read the configuration file
    let shouldCreateConfigFile = false;
    try {
      configData = await readFile(configFilePath, { encoding: "utf-8", flag: "r" });
      Logger.debug("Configuration file read successfully.");
    } catch (error) {
      if(error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT") {
        Logger.log("Configuration file not found. Will creating one with default values...");

        shouldCreateConfigFile = true;
        configData = JSON.stringify(configSchema.parse({}));
      } else {
        Logger.error(`Configuration file cannot be read. Error: ${(error as Error).message}`);
        throw error;
      }
    }

    // #2. Parse the configuration data
    let parsedConfig: unknown;
    try {
      parsedConfig = JSON.parse(configData);
      Logger.debug("Configuration data parsed successfully.");
    } catch (error) {
      Logger.error(`Configuration data cannot be parsed. Error: ${(error as Error).message}`);
      throw error;
    }

    // #3. Validate the configuration data
    const result = configSchema.safeParse(parsedConfig);
    if(!result.success) {
      Logger.error("Failed to validate the configuration!");
      this.handleZodError(result.error, message => Logger.error(message));
      throw new Error("Failed to validate the configuration");
    }
    Logger.debug("Configuration data validated successfully.");

    // #4. Create the Config instance
    const configInstance = new Config();
    configInstance.config = result.data;
    configInstance.configFilePath = configFilePath;
    this._instance = configInstance;

    Logger.log("Configuration loaded successfully.");

    // #5. Create the configuration file if it doesn't exist
    if(shouldCreateConfigFile) {
      await this._instance.save();
    }
  }

  public async save(): Promise<void> {
    if(!this.configFilePath || !this.config) {
      Logger.error("Invalid config instance! Configuration cannot be saved.");
      throw new Error("Config data is invalid in this config instance.");
    }

    Logger.log("Saving configuration to file...");
    Logger.debug(`Target configuration file: ${this.configFilePath}`);

    // #1. Validate the configuration data first
    const validateResult = configSchema.safeParse(this.config);
    if(!validateResult.success) {
      Logger.error("Failed to validate the configuration before saving!");
      Config.handleZodError(validateResult.error, message => Logger.error(message));
      throw new Error("Failed to validate the configuration before saving.");
    }
    Logger.debug("Current in-memory configuration data validated successfully.");

    // #2. Try to create the configuration directory if it doesn't exist
    const targetDir = path.dirname(this.configFilePath);
    try {
      await mkdir(targetDir, { recursive: true });
      Logger.debug(`Configuration directory created successfully (or already exists): ${targetDir}`);
    } catch (error) {
      Logger.error(`Configuration directory cannot be created: ${targetDir}. Error: ${(error as Error).message}`);
      throw error;
    }

    // #3. Write the configuration data to a temp file
    const filename = path.basename(this.configFilePath);
    const tempFilePath = path.join(targetDir, `.${filename}.${Date.now()}.tmp`);
    try {
      const jsonData = JSON.stringify(this.config, null, 2);

      await writeFile(tempFilePath, jsonData, { encoding: "utf-8", flag: "w" });
      Logger.debug(`Temporary configuration file written successfully. File path: ${tempFilePath}`);

      await rename(tempFilePath, this.configFilePath);
      Logger.debug("Renamed temporary configuration file to target configuration file successfully.");
    } catch (error) {
      Logger.error(`Failed to save configuration file to ${this.configFilePath}. Error: ${(error as Error).message}`);
      throw error;
    }

    Logger.log("Configuration saved successfully.");
  }

  private static handleZodError(error: z.ZodError, handler: (message: string) => void): void {
    error.issues.forEach((issue) => {
      const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      const message = `  - [${fieldPath}] ${issue.message}`;
      handler(message);
    });
  }
}
