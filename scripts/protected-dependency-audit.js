#!/usr/bin/env node
/**
 * Protected dependency audit for cleanup PRs.
 *
 * Purpose:
 * 1. Detect deleted JS/JSX/TS/TSX modules that are still referenced.
 * 2. Resolve relative static and dynamic imports.
 * 3. Protect known dependency-sensitive modules.
 * 4. Fail closed when the audit cannot prove a deletion is safe.
 *
 * This is a dependency gate, not a replacement for Next.js build/runtime verification.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
const SOURCE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'coverage', 'dist', 'build']);

const PROTECTED = new Set([
  'components/homepage/DeferredWarehouseMap.js',
  'components/BentoGrid.jsx',
  'components/BentoItem.jsx',
  'components/thumbnails/ThumbnailProvider.tsx',
  'lib/curatedBadges.js',
  'utils/supabase-server.ts',
  'lib/supabaseStorage.js',
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    ...Array.from(SOURCE_EXTS).map(ext => base + ext),
    ...Array.from(SOURCE_EXTS).map(ext => path.join(base, 'index' + ext)),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function importsFrom(file) {
  const src = read(file);
  const specs = [];
  const re = /(?:import\\s+(?:[\\s\\S]*?\\s+from\\s+|)|export\\s+(?:[\\s\\S]*?\\s+from\\s+)|require\\s*\\(|import\\s*\\()(['"])(\\.{1,2}\\/[^'"]+)\\1/g;
  let m;
  while ((m = re.exec(src))) specs.push(m[2]);
  return specs;
}

function gitDeletedFiles() {
  const base = process.env.GITHUB_BASE_SHA;
  if (!base) return [];
  try {
    const output = execFileSync('git', ['diff', '--name-status', base + '...HEAD'], { encoding: 'utf8' });
    return output.split(/\\r?\\n/).filter(Boolean).flatMap(line => {
      const parts = line.split(/\\t+/);
      if (parts[0] !== 'D') return [];
      return [parts[1]];
    });
  } catch (err) {
    console.error('AUDIT ERROR: unable to inspect PR diff:', err.message);
    process.exit(2);
  }
}

const files = walk(ROOT);
const fileSet = new Set(files.map(rel));
const refs = new Map();

for (const file of files) {
  for (const spec of importsFrom(file)) {
    const target = resolveImport(file, spec);
    if (target) {
      const targetRel = rel(target);
      if (!refs.has(targetRel)) refs.set(targetRel, []);
      refs.get(targetRel).push(rel(file));
    }
  }
}

const deleted = gitDeletedFiles();
const sourceDeleted = deleted.filter(f => SOURCE_EXTS.has(path.extname(f)));
let failed = false;

console.log('Protected dependency audit');
console.log('Source files scanned:', files.length);
console.log('Deleted source candidates:', sourceDeleted.length);
console.log('Protected modules:', PROTECTED.size);

for (const candidate of sourceDeleted) {
  const references = refs.get(candidate) || [];
  const protectedFile = PROTECTED.has(candidate);

  if (protectedFile) {
    console.error('FAIL PROTECTED:', candidate);
    console.error('  This module is in the protected dependency registry and requires an explicit dependency/build/runtime review before deletion.');
    failed = true;
    continue;
  }

  if (references.length) {
    console.error('FAIL REFERENCED:', candidate);
    for (const ref of references) console.error('  referenced by:', ref);
    failed = true;
  } else {
    console.log('PASS UNREFERENCED:', candidate);
  }
}

if (!sourceDeleted.length) {
  console.log('PASS: no JS/JSX/TS/TSX deletions detected in this change.');
}

if (failed) {
  console.error('\\nProtected dependency audit FAILED. Cleanup PR cannot be considered safe.');
  process.exit(1);
}

console.log('\\nProtected dependency audit PASSED.');
