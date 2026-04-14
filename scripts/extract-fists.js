#!/usr/bin/env node
// Extracts the M5 (FISTs) Lottie animation from the Wero site dump JS bundle
// and writes it to public/sowieso/animations/fists.json

const fs = require("fs");
const path = require("path");
const os = require("os");

const srcFile = path.resolve(
  __dirname,
  "../reference/site-dump/sowieso.wero-wallet.eu/_nuxt/Cd_iCvQE.js",
);
const outFile = path.resolve(
  __dirname,
  "../public/sowieso/animations/fists.json",
);

const content = fs.readFileSync(srcFile, "utf8");
const lines = content.split("\n");

// M5 variables span lines 7381–7794 (1-indexed); closing `},` is on line 7794
// Extract lines 7380–7793 (0-indexed end-exclusive = up to line 7794 inclusive)
const chunk = lines.slice(7380, 7794).join("\n");

// The chunk is a comma-separated variable declaration block (continuation of a var statement).
// Wrap it so it evaluates as standalone JS with module.exports = { M5 }
const code = `var ${chunk.trimEnd().replace(/,\s*$/, "")};\nmodule.exports = { M5 };\n`;

// Write to a temp file and require() it
const tmpFile = path.join(os.tmpdir(), `fists-extract-${Date.now()}.js`);
fs.writeFileSync(tmpFile, code, "utf8");

let M5;
try {
  ({ M5 } = require(tmpFile));
} finally {
  fs.unlinkSync(tmpFile);
}

if (!M5 || !M5.layers) {
  console.error("Failed to extract M5 — check line range in script");
  process.exit(1);
}

fs.writeFileSync(outFile, JSON.stringify(M5), "utf8");
console.log(
  `Written ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(0)} KB)`,
);
