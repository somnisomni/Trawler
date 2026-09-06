import { DEFAULT_CONFIG_FILE_PATH } from "../common";
import { buildHelpMessage } from "./help";

type ArgDefinition = {
  short?: string;
  description: string;
  type: "string" | "boolean" | "number";
  default?: string | boolean | number;

  handle(value: string): boolean;
};

export const argDefinitions: { [x: string]: ArgDefinition } = {
  "help": {
    short: "h",
    description: "Display the help message",
    type: "boolean",

    handle(): boolean {
      console.log(buildHelpMessage());
      return false;
    },
  },
  "verbose": {
    short: "v",
    description: "Enable verbose logging",
    type: "boolean",
    default: false,

    handle(): boolean {
      process.env.TRAWLER_LOGGING_VERBOSE = "true";
      return true;
    },
  },
  "pretty": {
    short: "p",
    description: "Enable pretty logging",
    type: "boolean",
    default: false,

    handle(): boolean {
      process.env.TRAWLER_LOGGING_PRETTY = "true";
      return true;
    },
  },
  "config-file": {
    short: "c",
    description: "Path to the configuration file",
    type: "string",
    default: DEFAULT_CONFIG_FILE_PATH,

    handle(value: string): boolean {
      process.env.TRAWLER_CONFIG_FILE = value;
      return true;
    },
  },
};

export type AvailableArgs = keyof typeof argDefinitions;
