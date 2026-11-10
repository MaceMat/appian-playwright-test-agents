import path from 'path';

/** Saved login session per role (git-ignored). */
export function storageStateFor(role: string): string {
  return path.resolve(__dirname, `../../playwright/.auth/${role}.json`);
}
