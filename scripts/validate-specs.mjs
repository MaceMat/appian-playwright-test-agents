#!/usr/bin/env node
/**
 * Offline consistency check for agent-written artifacts:  npm run validate
 * Needs no Appian environment, browser or credentials, so it runs on every PR.
 *
 * Test-case files (specs/test-cases/*.yaml)
 *   - valid against specs/test-cases/test-cases.schema.json
 *   - `analysis` and `dataFile` exist; every `dataSet` exists in the data file and is non-empty
 *   - test-case ids are unique across all files; every `role` has a seed (tests/seeds/seed.<role>.spec.ts)
 *   - every {{row.<field>}} used in steps exists in every row of the data set
 * Data files (test-data/*.json)
 *   - every row has a unique `id` and a `case`; only known placeholders ({{uniqueId}}, {{today±N}})
 * Specs (tests/**\/*.spec.ts, except seeds)
 *   - traceability header present (analysis, testCases, data, seed)
 *   - every referenced file exists; every #TC-ID and #dataSet after a path exists
 *
 * Files starting with "_" are templates/examples: a missing analysis file is only a warning there.
 * Exit code 1 on any error.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const exists = (p) => fs.existsSync(path.resolve(root, p));

const errors = [];
const warnings = [];
const error = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);
const isTemplate = (p) => path.basename(p).startsWith('_');

function walk(dir, filter) {
  const abs = path.resolve(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(abs, e.name);
    if (e.isDirectory()) return walk(rel(p), filter);
    return filter(e.name) ? [rel(p)] : [];
  });
}

// ---------- data files ----------
const PLACEHOLDER = /\{\{([^}]*)\}\}/g;
const KNOWN_PLACEHOLDER = /^(uniqueId|today([+-]\d+)?)$/;
const dataCache = new Map();

function loadDataFile(file) {
  if (dataCache.has(file)) return dataCache.get(file);
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
  } catch (e) {
    error(file, `invalid JSON – ${e.message}`);
  }
  dataCache.set(file, data);
  return data;
}

for (const file of walk('test-data', (n) => n.endsWith('.json'))) {
  const data = loadDataFile(file);
  if (!data) continue;
  if (typeof data !== 'object' || Array.isArray(data)) {
    error(file, 'top level must be an object of { <dataSet>: [rows] }');
    continue;
  }
  for (const [set, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) {
      error(file, `data set "${set}" must be an array`);
      continue;
    }
    const ids = new Set();
    rows.forEach((row, i) => {
      const where = `${set}[${i}]`;
      if (!row || typeof row !== 'object') return error(file, `${where} must be an object`);
      if (!row.id) error(file, `${where} has no "id"`);
      else if (ids.has(row.id)) error(file, `${where} duplicate id "${row.id}"`);
      else ids.add(row.id);
      if (!row.case) error(file, `${where} has no "case" (used in test titles)`);
      for (const [key, value] of Object.entries(row)) {
        for (const [, name] of String(value).matchAll(PLACEHOLDER)) {
          if (!KNOWN_PLACEHOLDER.test(name.trim())) {
            error(file, `${where}.${key} unknown placeholder {{${name}}} (allowed: {{uniqueId}}, {{today}}, {{today±N}})`);
          }
        }
      }
    });
  }
}

// ---------- test-case files ----------
const schema = JSON.parse(fs.readFileSync(path.resolve(root, 'specs/test-cases/test-cases.schema.json'), 'utf8'));
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
const testCaseFiles = new Map(); // file -> Set of TC ids
const tcOwner = new Map(); // TC id -> file

for (const file of walk('specs/test-cases', (n) => /\.ya?ml$/.test(n))) {
  let doc;
  try {
    doc = YAML.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
  } catch (e) {
    error(file, `invalid YAML – ${e.message}`);
    continue;
  }
  if (!validate(doc)) {
    for (const e of validate.errors) error(file, `schema: ${e.instancePath || '/'} ${e.message}`);
    continue;
  }

  if (!exists(doc.analysis)) {
    (isTemplate(file) ? warn : error)(file, `analysis file not found: ${doc.analysis}`);
  }
  const data = exists(doc.dataFile) ? loadDataFile(doc.dataFile) : null;
  if (!exists(doc.dataFile)) error(file, `dataFile not found: ${doc.dataFile}`);

  const ids = new Set();
  for (const tc of doc.testCases) {
    if (tcOwner.has(tc.id)) error(file, `${tc.id} is already defined in ${tcOwner.get(tc.id)}`);
    else tcOwner.set(tc.id, file);
    ids.add(tc.id);

    if (!exists(`tests/seeds/seed.${tc.role}.spec.ts`)) {
      error(file, `${tc.id} role "${tc.role}" has no seed file tests/seeds/seed.${tc.role}.spec.ts`);
    }

    const rowRefs = new Set(
      tc.steps.flatMap((s) => [...`${s.action} ${s.expected ?? ''}`.matchAll(/\{\{\s*row\.([\w-]+)\s*\}\}/g)].map((m) => m[1])),
    );
    if (!tc.dataSet) {
      if (rowRefs.size) error(file, `${tc.id} uses {{row.*}} but has no dataSet`);
      continue;
    }
    if (!data) continue;
    const rows = data[tc.dataSet];
    if (!Array.isArray(rows) || rows.length === 0) {
      error(file, `${tc.id} dataSet "${tc.dataSet}" not found or empty in ${doc.dataFile}`);
      continue;
    }
    for (const field of rowRefs) {
      const missing = rows.filter((r) => !(field in r)).map((r) => r.id);
      if (missing.length) error(file, `${tc.id} uses {{row.${field}}} but rows ${missing.join(', ')} in "${tc.dataSet}" lack it`);
    }
  }
  testCaseFiles.set(file, { ids });
}

// ---------- spec traceability headers ----------
const HEADER_KEYS = ['analysis', 'testCases', 'data', 'seed'];

for (const file of walk('tests', (n) => n.endsWith('.spec.ts'))) {
  if (file.startsWith('tests/seeds/')) continue;
  const head = fs.readFileSync(path.resolve(root, file), 'utf8').split('\n').slice(0, 15);
  const header = {};
  for (const line of head) {
    const m = line.match(/^\/\/\s*(analysis|testCases|data|seed):\s*(\S+)/);
    if (m) header[m[1]] = m[2];
  }
  const missingKeys = HEADER_KEYS.filter((k) => !header[k]);
  if (missingKeys.length) {
    error(file, `traceability header missing: ${missingKeys.join(', ')} (see .github/skills/appian-playwright/references/spec-pattern.md)`);
  }

  const split = (ref) => {
    const [p, frag] = ref.split('#');
    return [p, frag ? frag.split(',').map((s) => s.trim()).filter(Boolean) : []];
  };

  let fromTemplate = false;
  if (header.testCases) {
    const [p, tcIds] = split(header.testCases);
    const tcFile = testCaseFiles.get(p);
    fromTemplate = isTemplate(p);
    if (!exists(p)) error(file, `testCases file not found: ${p}`);
    else if (tcFile) {
      for (const id of tcIds) if (!tcFile.ids.has(id)) error(file, `test case ${id} not found in ${p}`);
    }
  }
  if (header.analysis && !exists(header.analysis)) {
    (fromTemplate ? warn : error)(file, `analysis file not found: ${header.analysis}`);
  }
  if (header.data) {
    const [p, sets] = split(header.data);
    if (!exists(p)) error(file, `data file not found: ${p}`);
    else {
      const data = loadDataFile(p);
      for (const s of sets) if (data && !(s in data)) error(file, `data set "${s}" not found in ${p}`);
    }
  }
  if (header.seed && !exists(header.seed)) error(file, `seed file not found: ${header.seed}`);
}

// ---------- report ----------
for (const w of warnings) console.log(`⚠ ${w}`);
for (const e of errors) console.log(`✗ ${e}`);
console.log(
  `\n${testCaseFiles.size} test-case file(s), ${dataCache.size} data file(s) checked – ` +
    `${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length ? 1 : 0);
