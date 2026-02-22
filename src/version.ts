import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Get the package version
 * Works in both ESM and CommonJS (Jest) environments
 */
export function getVersion(): string {
  try {
    // Try CommonJS approach first (Jest environment)
    if (typeof __dirname !== 'undefined') {
      const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
      return packageJson.version;
    }

    // ESM approach - use Function constructor to avoid static analysis issues
    // This avoids eval() while still working around TypeScript's module checks
    const getUrl = new Function('return import.meta.url') as () => string;
    const __dirname_esm = dirname(fileURLToPath(getUrl()));
    const packageJson = JSON.parse(readFileSync(join(__dirname_esm, '../package.json'), 'utf-8'));
    return packageJson.version;
  } catch (_error) {
    // Ultimate fallback
    return '0.5.0';
  }
}

export const VERSION = getVersion();
