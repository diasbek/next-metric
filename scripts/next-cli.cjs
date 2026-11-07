#!/usr/bin/env node
/**
 * Hostinger Node apps run on glibc < 2.29. Native `@next/swc-linux-x64-*.node`
 * then fails to dlopen and Next floods the build log with one warning per worker
 * before falling back to WASM. Prefer WASM up-front when native cannot work.
 *
 * Override: METRIC_SWC_WASM=1|0
 */
const { spawn } = require("child_process");
const path = require("path");

function glibcTooOldForNativeSwc() {
  try {
    const report = process.report?.getReport?.();
    const raw = report?.header?.glibcVersionRuntime;
    if (typeof raw !== "string" || !raw) return false;
    const [maj, min] = raw.split(".").map((n) => parseInt(n, 10));
    if (!Number.isFinite(maj) || !Number.isFinite(min)) return false;
    return maj < 2 || (maj === 2 && min < 29);
  } catch {
    return false;
  }
}

function onHostingerLayout() {
  return /\/domains\/[^/]+\/(hbuilds|public_html)\b/.test(process.cwd());
}

function shouldForceSwcWasm() {
  if (process.env.METRIC_SWC_WASM === "0") return false;
  if (process.env.METRIC_SWC_WASM === "1") return true;
  if (process.env.NEXT_TEST_WASM === "1") return true;
  return glibcTooOldForNativeSwc() || onHostingerLayout();
}

if (shouldForceSwcWasm()) {
  process.env.NEXT_TEST_WASM = "1";
}

const nextBin = path.join(
  path.dirname(require.resolve("next/package.json")),
  "dist",
  "bin",
  "next",
);

const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
