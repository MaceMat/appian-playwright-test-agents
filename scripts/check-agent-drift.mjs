#!/usr/bin/env node
/**
 * Run after every Playwright upgrade:  npm run agents:drift
 *
 * 1. Starts the installed Playwright test MCP server and asks it for its tool list (tools/list),
 *    then checks every `playwright-test/<tool>` our agents use still exists.
 * 2. Lists tools Playwright's official agents (shipped in node_modules) use that ours don't – candidates to adopt.
 * Exit code 1 if any of our tools no longer exists.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pwRoot = path.dirname(require.resolve('playwright/package.json'));
const pwVersion = JSON.parse(fs.readFileSync(path.join(pwRoot, 'package.json'), 'utf8')).version;

const toolsOf = (file) => {
  const frontmatter = fs.readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '';
  return new Set([...frontmatter.matchAll(/playwright-test\/([a-z_]+)/g)].map((m) => m[1]));
};

function listServerTools() {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const p = spawn(cmd, ['playwright', 'run-test-mcp-server'], { stdio: ['pipe', 'pipe', 'ignore'], shell: process.platform === 'win32' });
    const send = (m) => p.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...m }) + '\n');
    const timer = setTimeout(() => { p.kill(); reject(new Error('MCP server did not answer within 30 s')); }, 30_000);
    let buf = '';
    p.stdout.on('data', (d) => {
      buf += d;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines.filter(Boolean)) {
        const msg = JSON.parse(line);
        if (msg.id === 1) { send({ method: 'notifications/initialized' }); send({ id: 2, method: 'tools/list' }); }
        if (msg.id === 2) { clearTimeout(timer); p.kill(); resolve(new Set(msg.result.tools.map((t) => t.name))); }
      }
    });
    send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'agents-drift', version: '1' } } });
  });
}

const serverTools = await listServerTools();
console.log(`Playwright ${pwVersion} – test MCP server exposes ${serverTools.size} tools\n`);

const oursDir = path.resolve('.github/agents');
const ours = new Set();
let missing = 0;
for (const f of fs.readdirSync(oursDir).filter((f) => f.endsWith('.agent.md'))) {
  const tools = toolsOf(path.join(oursDir, f));
  tools.forEach((t) => ours.add(t));
  const gone = [...tools].filter((t) => !serverTools.has(t));
  missing += gone.length;
  console.log(`${gone.length ? '✗' : '✓'} ${f} (${tools.size} MCP tools)${gone.length ? `  → no longer exist: ${gone.join(', ')}` : ''}`);
}

const officialDir = path.join(pwRoot, 'lib', 'agents');
const official = new Set();
for (const f of fs.readdirSync(officialDir).filter((f) => f.endsWith('.agent.md'))) toolsOf(path.join(officialDir, f)).forEach((t) => official.add(t));
const candidates = [...official].filter((t) => !ours.has(t)).sort();

console.log('\nUsed by Playwright\'s official agents but not by ours (review, adopt if useful):');
console.log(candidates.length ? candidates.map((t) => `  - ${t}`).join('\n') : '  (none)');
console.log(`\nAlso skim the official instructions for new guidance: ${path.relative(process.cwd(), officialDir)}/*.agent.md`);
process.exit(missing ? 1 : 0);
