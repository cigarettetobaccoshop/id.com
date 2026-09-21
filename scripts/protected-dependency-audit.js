#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const args = process.argv.slice(2);
const baseArg = args.indexOf("--base");
const base = baseArg >= 0 ? args[baseArg + 1] : process.env.GITHUB_BASE_SHA;

if (!base) {
  console.error("Protected cleanup audit: missing base commit. Use --base <sha>.");
  process.exit(2);
}

function git(...gitArgs) {
  return execFileSync("git", gitArgs, { encoding: "utf8" }).trim();
}

const protectedPaths = new Set([
  "components/homepage/DeferredWarehouseMap.js",
  "components/BentoGrid.jsx",
  "components/BentoItem.jsx",
  "components/thumbnails/ThumbnailProvider.tsx",
  "lib/curatedBadges.js",
  "utils/supabase-server.ts",
  "lib/supabaseStorage.js"
]);

const deleted = git("diff", "--name-only", "--diff-filter=D", `${base}...HEAD`)
  .split("\n")
  .map(s => s.trim())
  .filter(Boolean);

if (deleted.length === 0) {
  console.log("Protected cleanup audit: no deleted files in this change.");
  process.exit(0);
}

const tracked = git("ls-files").split("\n").filter(Boolean);
const textExtensions = new Set([".js",".jsx",".ts",".tsx",".mjs",".cjs",".json",".css"]);

function contentAtHead(file) {
  try {
    return git("show", `HEAD:${file}`);
  } catch {
    return "";
  }
}

function resolveRelative(fromFile, specifier) {
  if (!specifier.startsWith(".")) return null;
  const basePath = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), specifier));
  const possibilities = [
    basePath,
    ...[".js",".jsx",".ts",".tsx",".mjs",".cjs",".json"].map(ext => basePath + ext),
    ...["index.js","index.jsx","index.ts","index.tsx"].map(name => path.posix.join(basePath, name))
  ];
  return possibilities.find(p => tracked.includes(p) || deleted.includes(p)) || null;
}

let failures = 0;

for (const candidate of deleted) {
  if (protectedPaths.has(candidate)) {
    console.error(`PROTECTED FILE DELETED: ${candidate}`);
    failures++;
  }

  const references = [];
  for (const file of tracked) {
    if (file === candidate || !textExtensions.has(path.extname(file))) continue;
    const content = contentAtHead(file);
    const re = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]|(?:require|import)\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = re.exec(content))) {
      const specifier = match[1] || match[2];
      if (specifier && resolveRelative(file, specifier) === candidate) {
        references.push(`${file} -> ${specifier}`);
      }
    }
  }

  if (references.length) {
    console.error(`ACTIVE REFERENCE TO DELETED FILE: ${candidate}`);
    for (const ref of references) console.error(`  ${ref}`);
    failures++;
  } else {
    console.log(`OK candidate has no static relative import references: ${candidate}`);
  }
}

if (failures) {
  console.error(`Protected cleanup audit failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log("Protected cleanup audit passed.");
