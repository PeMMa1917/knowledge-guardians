import { readFile } from 'node:fs/promises';
import { familyNames } from './combination-atlas.mjs';
export async function renderChecklist(atlas) {
  const read = (name) => readFile(new URL(name, import.meta.url), 'utf8');
  const [html, space, ledger, ui] = await Promise.all(
    [
      'combination-checklist.html',
      'combination-space.mjs',
      'combination-checklist.mjs',
      'combination-checklist-ui.mjs',
    ].map(read),
  );
  const plain = (s) =>
    s.replace(/^import .*?;\s*$/gm, '').replace(/^export /gm, '');
  const script = [space, ledger, ui].map(plain).join('\n');
  // Content can contain literal HTML. Use a raw JSON data block, escaped before embedding.
  const compact = {
    members: atlas.members,
    beats: atlas.beats,
    routes: atlas.routes,
    families: familyNames,
  };
  const data = JSON.stringify(compact)
    .replaceAll('<', '\\u003c')
    .replaceAll('&', '\\u0026');
  return html
    .replace('__ATLAS_DATA__', () => data)
    .replace('__CHECKLIST_CODE__', () => script);
}
