import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The bundle must carry its dependencies, and only the runtime ones: packing the working copy
// would ship the compiler and test tooling inside every install.
const root = join(import.meta.dirname, "..");
const stage = mkdtempSync(join(tmpdir(), "hamir-mcpb-"));
const run = (command: string, args: string[], cwd = root) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });

try {
  run("npm", ["run", "build"]);
  for (const entry of [
    "dist",
    "manifest.json",
    "icon.png",
    "README.md",
    "LICENSE",
    "package.json",
    "package-lock.json",
  ]) {
    cpSync(join(root, entry), join(stage, entry), { recursive: true });
  }
  run("npm", ["ci", "--omit=dev", "--no-audit", "--no-fund"], stage);
  run("npx", ["mcpb", "pack", stage, join(root, "hamir.mcpb")]);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
