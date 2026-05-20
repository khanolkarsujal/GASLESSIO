/**
 * Vercel build script for TanStack Start SSR app.
 */

import { execSync } from "child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const FRONTEND_DIR = "frontend";
const DEST_OUTPUT = join(".vercel", "output");

// ── 1. Install ────────────────────────────────────────────────────────────────
console.log("▶  Installing frontend dependencies…");
execSync("npm install", { cwd: FRONTEND_DIR, stdio: "inherit" });

// ── 2. Build ──────────────────────────────────────────────────────────────────
console.log("▶  Building frontend…");
execSync("npm run build", { cwd: FRONTEND_DIR, stdio: "inherit" });

// ── 3. Assemble Vercel Output API format ──────────────────────────────────────
console.log(`▶  Assembling ${DEST_OUTPUT}`);
if (existsSync(DEST_OUTPUT)) {
  rmSync(DEST_OUTPUT, { recursive: true, force: true });
}

// Create base directories
mkdirSync(join(DEST_OUTPUT, "static"), { recursive: true });
const funcDir = join(DEST_OUTPUT, "functions", "[[...catchall]].func");
mkdirSync(funcDir, { recursive: true });

// Copy static assets
cpSync(join(FRONTEND_DIR, "dist", "client"), join(DEST_OUTPUT, "static"), { recursive: true });

// Copy server output
cpSync(join(FRONTEND_DIR, "dist", "server"), funcDir, { recursive: true });

// Write config.json
writeFileSync(join(DEST_OUTPUT, "config.json"), JSON.stringify({
  version: 3,
  routes: [
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/[[...catchall]]" }
  ]
}, null, 2));

// Write function config
writeFileSync(join(funcDir, ".vc-config.json"), JSON.stringify({
  runtime: "edge",
  entrypoint: "server.js"
}, null, 2));

console.log("✓  Vercel build complete!");
