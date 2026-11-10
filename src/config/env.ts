import path from 'path';
import dotenv from 'dotenv';

// Locally: values come from .env. In CI: from pipeline variables (process.env wins, .env is optional).
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env locally, or define it as a pipeline variable in CI.`,
    );
  }
  return value;
}

/** Roles that get a saved login session, e.g. "submitter,approver". First one is the default. */
const roles = (process.env.APPIAN_ROLES ?? 'submitter')
  .split(',')
  .map((r) => r.trim().toLowerCase())
  .filter(Boolean);

export type Credentials = { username: string; password: string };

export const env = {
  baseUrl: required('BASE_URL'),
  envName: process.env.ENV_NAME ?? 'local',
  isCI: !!process.env.CI || !!process.env.TF_BUILD,
  roles,
  defaultRole: roles[0],
  /** Appian date format used to resolve {{today}} placeholders. Tokens: DD, MM, YYYY. */
  dateFormat: process.env.APPIAN_DATE_FORMAT ?? 'MM/DD/YYYY',
  /** Landing page after login, used by seed tests. */
  homePath: process.env.APPIAN_HOME_PATH ?? '/suite/',
  /** Optional: API key for Appian Web APIs used for test-data setup. */
  apiKey: process.env.APPIAN_API_KEY,

  /** Lazy so only roles that are actually used must be configured. */
  credentials(role: string): Credentials {
    const key = role.toUpperCase();
    return {
      username: required(`APPIAN_${key}_USERNAME`),
      password: required(`APPIAN_${key}_PASSWORD`),
    };
  },
} as const;
