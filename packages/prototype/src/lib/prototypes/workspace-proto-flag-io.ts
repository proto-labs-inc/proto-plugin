import fs from "node:fs";
import path from "node:path";

/** Read a `.proto/<name>` flag file written by the setup agent. */
export function readProtoBooleanFlag(
  hostRoot: string,
  relativePath: string,
): boolean {
  try {
    const value = fs
      .readFileSync(path.join(hostRoot, relativePath), "utf8")
      .trim()
      .toLowerCase();
    return value === "true" || value === "1" || value === "yes";
  } catch {
    return false;
  }
}

export function writeProtoBooleanFlag(
  hostRoot: string,
  relativePath: string,
): void {
  const flagPath = path.join(hostRoot, relativePath);
  fs.mkdirSync(path.dirname(flagPath), { recursive: true });
  fs.writeFileSync(flagPath, "true\n", "utf8");
}
