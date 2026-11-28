import { cognitiveGuide, rubricSources } from './combination-rubric.mjs';
import { readFile } from 'node:fs/promises';
import { familyNames } from './combination-atlas.mjs';
export async function renderChecklist(atlas) {
  const read = (name) => readFile(new URL(name, import.meta.url), 'utf8');
  const [html, space, ledger, storage, sheets, ui] = await Promise.all(
    [
      'combination-checklist.html',
      'combination-space.mjs',
      'combination-checklist.mjs',
      'combination-browser-storage.mjs',
      'chapter-review-csv.mjs',
      'combination-checklist-ui.mjs',
    ].map(read),
  );
  const plain = (s) =>
    s.replace(/^import .*?;\s*$/gm, '').replace(/^export /gm, '');
  const script = [space, ledger, storage, sheets, ui].map(plain).join('\n');
  // Content can contain literal HTML. Use a raw JSON data block, escaped before embedding.
  // Objectives are starting points for a playtest. Their tags never mark a cognitive cell.
  const registered = new Set(atlas.members.map((m) => m.id));
  const leads = atlas.activities.map((a) => {
    const context = [
      ...a.concepts.map((x) => 'concept:' + x),
      ...a.framework.map((x) => 'framework:' + x),
      ...a.areas.map((x) => 'area:' + x),
      ...a.themes.map((x) => 'theme:' + x),
      ...a.atl.map((x) => 'atl:' + x),
      ...a.subjects.map((x) => 'subject:' + x),
      ...a.skills,
      ...a.questionIds,
      ...a.promptIds,
      ...a.learning,
    ].filter((x) => registered.has(x));
    return [
      a.id,
      a.chapter,
      a.title,
      [...new Set(context)],
      a.derivedFramework.map((x) => 'framework:' + x),
    ];
  });
  const compact = {
    leads,
    rubric: cognitiveGuide,
    rubricSources,
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
