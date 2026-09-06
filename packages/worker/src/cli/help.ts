import { REPOSITORY_URL } from "../common";
import { argDefinitions } from "./args";

export function buildHelpMessage(): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(" ** Trawler **");
  lines.push(`   ${REPOSITORY_URL}`);
  lines.push("");
  lines.push(" List of available arguments:");

  for(const key in argDefinitions) {
    const arg = argDefinitions[key];
    const long = `--${key}`;
    const short = arg.short ? `| -${arg.short}` : "";
    const type = arg.type === "boolean" ? "" : ` <${arg.type}>`;
    const defaultValue = arg.default !== undefined ? `(default: ${arg.default})` : "";
    const description = `${arg.description} ${defaultValue}`;

    lines.push(`    ${long}${type} ${short}${type}`);
    lines.push(`      └ ${description}`);
    lines.push("");
  }

  lines.push("");
  return lines.join("\n");
}
