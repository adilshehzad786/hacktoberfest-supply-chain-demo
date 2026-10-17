import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The exercise deliberately executes one authored local package at build time.
// This is not a sandbox for arbitrary npm packages.
const appRoot = await realpath(process.cwd());
const buildRoot = await realpath(path.dirname(fileURLToPath(import.meta.url)));
if (appRoot !== buildRoot) throw new Error('Run this build from its copied app directory.');

async function requireLocalPath(relative, kind) {
  const fullPath = path.join(appRoot, relative);
  const info = await lstat(fullPath);
  if (info.isSymbolicLink() || (kind === 'file' ? !info.isFile() : !info.isDirectory())) {
    throw new Error(`Expected a local ${kind}: ${relative}`);
  }
  return fullPath;
}

for (const directory of ['node_modules', 'node_modules/@workshop', 'node_modules/@workshop/contributor-card']) {
  await requireLocalPath(directory, 'directory');
}
const entry = await requireLocalPath('node_modules/@workshop/contributor-card/index.cjs', 'file');
const require = createRequire(import.meta.url);
const card = require(entry);
if (!card || typeof card !== 'object' || Array.isArray(card)) {
  throw new Error('The teaching package must export a contribution-card object.');
}
for (const field of ['headline', 'message']) {
  if (typeof card[field] !== 'string' || card[field].length === 0 || card[field].length > 300) {
    throw new Error(`Invalid contribution-card ${field}.`);
  }
}
if (!['reviewed', 'changed'].includes(card.status)) throw new Error('Invalid contribution-card style.');

// Status selects presentation only. The app does not turn a package's own
// assertions into a security verdict; the CI workflow verifies package bytes.
const result = { headline: card.headline, message: card.message, status: card.status };
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const template = await readFile(await requireLocalPath('template.html', 'file'), 'utf8');
const styles = await readFile(await requireLocalPath('styles.css', 'file'), 'utf8');
const styleHash = createHash('sha256').update(styles).digest('base64');
const values = {
  HEADLINE: escapeHtml(result.headline),
  MESSAGE: escapeHtml(result.message),
  VARIANT: result.status === 'changed' ? 'changed' : 'reviewed',
  STYLES: styles,
  STYLE_HASH: styleHash,
};
const html = template.replace(/\{\{(HEADLINE|MESSAGE|VARIANT|STYLES|STYLE_HASH)\}\}/g, (_, key) => values[key]);

try {
  await mkdir(path.join(appRoot, 'site'));
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
await requireLocalPath('site', 'directory');
for (const [filename, contents] of [
  ['index.html', html],
  ['result.json', `${JSON.stringify(result, null, 2)}\n`],
]) {
  const relative = `site/${filename}`;
  try { await requireLocalPath(relative, 'file'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(path.join(appRoot, relative), contents, 'utf8');
}
console.log('Built the contribution card: site/index.html');
