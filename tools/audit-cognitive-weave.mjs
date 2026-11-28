/** Count a curriculum link, design elements and cognitive demand demonstrated together in one action. */
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAudit, TARGET } from './audit-cross-weave.mjs';
import { cognitiveActions } from './cognitive-actions.mjs';

const tokKinds = new Set(['concept', 'framework', 'area', 'theme', 'vocabulary', 'etymology', 'micro', 'question', 'bias', 'fallacy', 'deception']);
const depths = [1, 2, 3, 4];
const modes = ['narrative', 'game', 'joint'];

export function validatedActions(audit, reviews) {
  return reviews.map((review) => {
    const elements = [review.story && 'story:' + review.story, review.game && 'game:' + review.game].filter(Boolean);
    const matches = audit.proofs.filter((p) => p.objective === review.objective
      && (!review.anchor || p.anchor === review.anchor)
      && elements.every(id => p.elements.includes(id))
      && review.dimensions.every(id => p.dimensions.includes(id)));
    if (matches.length !== 1 || !elements.length || !review.dimensions.length || !audit.bloomLevels.includes(review.bloom)
        || !depths.includes(review.dok) || !review.demand?.trim() || !review.consequence?.trim()) {
      throw Error('Unresolved cognitive review at ' + review.objective);
    }
    const { world, map, target, actionId, anchor, source } = matches[0];
    return { ...review, world, map, target, actionId, anchor, source };
  });
}

function selected(entries, filter, label) {
  if (!filter) return entries;
  const matches = entries.filter(x => [x.id, x.kind, x.number].some(value => value !== undefined && String(value) === filter));
  if (!matches.length) throw Error('Unknown ' + label + ' ' + filter);
  return matches;
}

export function auditCognition(audit, chapters, reviews, options = {}) {
  const scope = options.scope ?? 'tok';
  const unit = options.unit ?? 'world';
  if (!['tok', 'all'].includes(scope) || !['world', 'chapter', 'campaign'].includes(unit)) throw Error('Unknown scope or grouping unit.');
  const allDimensions = scope === 'all' ? audit.dimensions : audit.dimensions.filter(d => tokKinds.has(d.kind));
  const dimensions = selected(allDimensions, options.dimension, 'learning dimension');
  const story = selected(audit.elements.filter(e => e.kind === 'story'), options.story, 'story element');
  const game = selected(audit.elements.filter(e => e.kind === 'game'), options.game, 'game element');
  let worlds = selected(audit.worlds, options.world, 'world');
  if (options.chapter) worlds = worlds.filter(w => String(chapters[w.id]) === String(options.chapter));
  if (!worlds.length) throw Error('No worlds in the selected chapter and world.');
  const blooms = options.bloom ? audit.bloomLevels.filter(b => b === options.bloom) : audit.bloomLevels;
  const levels = options.dok ? depths.filter(d => String(d) === String(options.dok)) : depths;
  if (!blooms.length || !levels.length) throw Error('Use a registered Bloom level and a DOK from 1 to 4.');
  const unitFor = world => unit === 'world' ? world : unit === 'chapter' ? chapters[world] : 'campaign';
  const countUnits = new Set(worlds.map(w => unitFor(w.id))).size;
  const worldIds = new Set(worlds.map(w => w.id));
  const dimensionIds = new Set(dimensions.map(d => d.id));
  const storyNumbers = new Set(story.map(e => e.number));
  const gameNumbers = new Set(game.map(e => e.number));
  const counts = [];
  const evidence = [];
  for (const bloom of blooms) for (const dok of levels) {
    const cells = Object.fromEntries(modes.map(mode => [mode, new Map()]));
    for (const row of reviews) {
      if (row.bloom !== bloom || row.dok !== dok || !worldIds.has(row.world)) continue;
      const dims = row.dimensions.filter(id => dimensionIds.has(id));
      if (!dims.length) continue;
      const s = storyNumbers.has(row.story), g = gameNumbers.has(row.game);
      if ((options.story && !s) || (options.game && !g) || (!s && !g)) continue;
      evidence.push({ ...row, dimensions: dims });
      for (const dim of dims) {
        const key = unitFor(row.world) + '|' + dim + '|';
        function add(map, design) {
          const cell = key + design;
          if (!map.has(cell)) map.set(cell, new Set());
          map.get(cell).add(row.actionId);
        }
        if (s) add(cells.narrative, row.story);
        if (g) add(cells.game, row.game);
        if (s && g) add(cells.joint, row.story + '/' + row.game);
      }
    }
    // When narrowing a joint query, unrelated one-element populations would be misleading.
    const included = options.story && options.game ? ['joint'] : options.story ? ['narrative','joint'] : options.game ? ['game','joint'] : modes;
    for (const mode of included) {
      const designs = mode === 'joint' ? story.length * game.length : mode === 'game' ? game.length : story.length;
      const possible = countUnits * dimensions.length * designs;
      const observed = cells[mode].size;
      const atTarget = [...cells[mode].values()].filter(a => a.size >= TARGET).length;
      counts.push({ bloom, dok, mode, possible, observed, atTarget, belowTarget: observed - atTarget, noReview: possible - observed });
    }
  }
  return { scope, unit, target: TARGET, dimensions: dimensions.length, worlds: worlds.length, units: countUnits,
    narrativeElements: story.length, gameElements: game.length, counts, evidence };
}

async function main() {
  const strings = ['scope','unit','world','chapter','dimension','story','game','bloom','dok'];
  const { values } = parseArgs({ options: {
    ...Object.fromEntries(strings.map(k => [k, { type: 'string' }])), json: { type: 'boolean' }, evidence: { type: 'boolean' },
  } });
  const [audit, chapters] = await Promise.all([loadAudit(),
    readFile(new URL('../src/content/world-chapters.json', import.meta.url), 'utf8').then(JSON.parse)]);
  const report = auditCognition(audit, chapters, validatedActions(audit, cognitiveActions), values);
  if (!values.evidence) delete report.evidence;
  if (values.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log('Bloom, DOK and design connections in the same action. Grouped by ' + report.unit + '.');
    console.table(report.counts);
    if (report.evidence) console.table(report.evidence.map(({ objective, map, bloom, dok, demand }) => ({ objective, map, bloom, dok, demand })));
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
