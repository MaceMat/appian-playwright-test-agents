import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

/** Every data row needs a stable id + case label (used in test titles). */
export type DataRow = { id: string; case: string } & Record<string, string>;

/**
 * Loads a data set from test-data/<scope>.json WITHOUT resolving placeholders,
 * so test titles stay identical across workers (Playwright requires that).
 */
export function loadData<T extends DataRow = DataRow>(scope: string, dataSet: string): T[] {
  const file = path.resolve(__dirname, `../../test-data/${scope}.json`);
  const all = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, T[]>;
  const rows = all[dataSet];
  if (!rows?.length) throw new Error(`Data set "${dataSet}" not found or empty in ${file}`);
  return rows;
}

/**
 * Resolves placeholders inside the test (per run):
 *   {{uniqueId}}  -> short unique string
 *   {{today}}, {{today+5}}, {{today-1}} -> date in env.dateFormat
 */
export function resolveRow<T extends DataRow>(row: T): T {
  const uniqueId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    resolved[key] = String(value)
      .replace(/\{\{uniqueId\}\}/g, uniqueId)
      .replace(/\{\{today(?:([+-])(\d+))?\}\}/g, (_m, sign?: string, days?: string) => {
        const d = new Date();
        if (sign && days) d.setDate(d.getDate() + (sign === '+' ? 1 : -1) * Number(days));
        return formatDate(d, env.dateFormat);
      });
  }
  return resolved as T;
}

function formatDate(d: Date, format: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return format
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()));
}
