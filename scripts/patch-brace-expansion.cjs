#!/usr/bin/env node
/**
 * brace-expansion 5.x only exports `{ expand }`. minimatch@3 (eslint) still
 * does `require("brace-expansion")(pattern)`. After the CVE-safe 5.0.9
 * override, make the CJS entry callable without changing expansion behavior.
 */
const fs = require("fs");
const path = require("path");

const MARKER = "/* metric-brace-expansion-callable */";
const PATCH = `
${MARKER}
if (typeof exports.expand === "function" && typeof module.exports !== "function") {
  module.exports = Object.assign(exports.expand, exports, { expand: exports.expand });
}
`;

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  const src = fs.readFileSync(file, "utf8");
  if (src.includes(MARKER)) return;
  fs.writeFileSync(file, `${src.trimEnd()}\n${PATCH}`);
  patched += 1;
}

function scanNodeModules(nm) {
  if (!fs.existsSync(nm) || !fs.statSync(nm).isDirectory()) return;
  for (const name of fs.readdirSync(nm)) {
    if (name.startsWith(".")) continue;
    const pkgDir = path.join(nm, name);
    if (!fs.statSync(pkgDir).isDirectory()) continue;
    if (name.startsWith("@")) {
      for (const scoped of fs.readdirSync(pkgDir)) {
        visitPackage(path.join(pkgDir, scoped));
      }
    } else {
      visitPackage(pkgDir);
    }
  }
}

function visitPackage(pkgDir) {
  if (!fs.existsSync(pkgDir) || !fs.statSync(pkgDir).isDirectory()) return;
  if (path.basename(pkgDir) === "brace-expansion") {
    patchFile(path.join(pkgDir, "dist", "commonjs", "index.js"));
  }
  scanNodeModules(path.join(pkgDir, "node_modules"));
}

let patched = 0;
scanNodeModules(path.join(process.cwd(), "node_modules"));

if (patched) {
  console.log(`patched brace-expansion CJS export (${patched} file${patched === 1 ? "" : "s"})`);
}
