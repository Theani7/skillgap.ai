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

if (!fs.existsSync(python)) {
  console.error(`Python not found at ${python}. Run npm run setup first.`);
  process.exit(1);
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
