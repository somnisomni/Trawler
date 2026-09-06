import type { AvailableArgs } from "./args";
import type { ParseArgsOptionsConfig } from "node:util";
import { parseArgs } from "node:util";
import Logger from "../logging";
import { argDefinitions } from "./args";

export function handleArgs(): boolean {
  const parseOptions: ParseArgsOptionsConfig = {};

  for(const key in argDefinitions) {
    const arg = argDefinitions[key];
    parseOptions[key] = {
      type: arg.type === "number" ? "string" : arg.type,
      short: arg.short,
      default: typeof arg.default === "number" ? arg.default.toString() : arg.default,
    };
  };

  const parsedArgs = parseArgs({ options: parseOptions });

  for(const key in parsedArgs.values) {
    const value = parsedArgs.values[key];
    const definition = argDefinitions[key as AvailableArgs];
    const isValidValue = value !== null && value !== undefined && ((typeof value === "boolean" && value === true) || (typeof value === "string" && value.length > 0));

    if(definition && isValidValue) {
      const shouldContinue = definition.handle(value as string);

      if(!shouldContinue) {
        return false;
      }
    }
  }

  Logger.reinitialize();
  return true;
}
