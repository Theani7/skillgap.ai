#!/usr/bin/env bun
import { spawn } from "node:child_process";

const procs = [
  { name: "backend", cmd: "bun", args: ["run", "dev:backend"] },
  { name: "frontend", cmd: "bun", args: ["run", "dev:frontend"] },
];

const children = procs.map(({ name, cmd, args }) => {
  const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], shell: true });
  const tag = `[${name}] `;
  const color = name === "backend" ? "\x1b[34m" : "\x1b[32m";
  const paint = (s) => s.trimEnd().split("\n").forEach((l) => console.log(color + tag + "\x1b[0m" + l));
  child.stdout.on("data", (d) => paint(d.toString()));
  child.stderr.on("data", (d) => paint(d.toString()));
  return child;
});

const shutdown = () => {
  children.forEach((c) => c.kill());
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
