import type { ConfigSchema } from "./schema";
import { configSchema } from "./schema";

export const loadedConfig: ConfigSchema | null = configSchema.safeParse({}).data || null;  // TODO
