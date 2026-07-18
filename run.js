#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const isWin = process.platform === "win32";
const venvBin = isWin
  ? path.join("venvapp", "Scripts")
  : path.join("venvapp", "bin");

const python = isWin
  ? path.join(venvBin, "python.exe")
  : path.join(venvBin, "python");

// Create the virtual environment if it doesn't exist (cross-platform setup).
// This is what makes `bun run setup` work on Windows without the bash setup.sh.
if (!fs.existsSync(python)) {
  console.error(`Python venv not found at ${python} — creating it now...`);
  const created = spawnSync(
    isWin ? "py" : "python3",
    ["-m", "venv", "venvapp"],
    { stdio: "inherit", shell: true }
  );
  if (created.status !== 0 || !fs.existsSync(python)) {
    console.error(
      "Failed to create venv. Install Python 3.9+ (and 'py' launcher on Windows) and retry 'bun run setup'."
    );
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const binPath = path.resolve(venvBin);

if (isWin) {
  process.env.PATH = `${binPath};${process.env.PATH}`;
} else {
  process.env.PATH = `${binPath}:${process.env.PATH}`;
}

const result = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
