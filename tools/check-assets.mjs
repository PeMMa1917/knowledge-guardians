// Checks that every file in public/assets/ has a licence entry in
// public/assets/credits.json, and that every entry points to a real file
// and a known pack. Run: npm run assets:check
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'public/assets';
const manifest = JSON.parse(readFileSync(join(ROOT, 'credits.json'), 'utf8'));
const errors = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(relative(ROOT, p).split('\\').join('/'));
  }
  return out;
}

const files = walk(ROOT).filter((f) => f !== 'credits.json');
for (const f of files) {
  if (!manifest.files[f]) errors.push(`No credits entry for public/assets/${f}`);
}
for (const [f, entry] of Object.entries(manifest.files)) {
  if (!existsSync(join(ROOT, f))) errors.push(`credits.json lists a missing file: ${f}`);
  const pack = manifest.packs[entry.pack];
  if (!pack) { errors.push(`Unknown pack "${entry.pack}" for ${f}`); continue; }
  if (!pack.licence || !pack.page || !pack.author) errors.push(`Pack "${entry.pack}" needs licence, page and author`);
  if (/\b(NC|ND)\b/.test(pack.licence)) errors.push(`Pack "${entry.pack}" has a non-commercial or no-derivatives licence`);
  if (f.startsWith('specimens/') && ![entry.source, entry.download].every((value) => /^https:\/\//.test(value ?? ''))) {
    errors.push(`Museum image ${f} needs its own catalogue and original image URLs.`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${files.length} asset files, all with source, author and licence.`);
