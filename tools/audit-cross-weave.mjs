/** Audit documented intersections of one authored action, one learning dimension and one RPG element. */
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
export const TARGET = 10;
const catalogueStatus = new Map([['✓', 'playable'], ['◐', 'partial'], ['○', 'planned'], ['✗', 'excluded']]);
const listId = (kind, id) => `${kind}:${id}`;
const distinct = (items) => [...new Set(items)];
const cellKey = (world, dimension, element) => [world, dimension, element].join('|');

// Each row identifies a complete action and the intersection its trace actually supports.
// Optional branches and composite objectives count once per objective in one physical world.
const proofRows = [
  {
    objective: 'nexus.facing.compare', map: 'nexus.archive', target: 'facing-cue-nexus',
    source: 'tests/facing-cue.test.ts', anchor: 'runs the %s Nexus readback and the %s House handover',
    action: 'Repeat the four-beat phrase from the two facings and see how the same call changes the endpoint.',
    dimensions: ['concept:perspective', 'area:ART', 'subject:dance', 'micro:449'], elements: ['game:247'],
  },
  {
    objective: 'sill.bridge.checked', map: 'emberford.sill-bridge', target: 'sill-bell-wheel',
    source: 'tests/sill-bridge.test.ts', anchor: 'serves the %s route only through its own passage',
    action: 'Use both walked locations and test the French instruction at an open notch and at the second ring before opening either route.',
    dimensions: ['concept:interpretation', 'framework:methods-and-tools', 'subject:lang-ab-initio'], elements: ['game:195'],
  },
  {
    objective: 'bend.nile.compare', map: 'nile.route', target: 'nile-bend-board',
    source: 'tests/strip-bend.test.ts', anchor: "d.done('bend.nile.compare')",
    action: 'Load and lift the same practice weight at two stops on both strips before approving a work arrangement.',
    dimensions: ['concept:evidence', 'framework:methods-and-tools', 'subject:physics'], elements: ['game:195'],
  },
  {
    objective: 'catchment.compare', map: 'water.culvert', target: 'catchment-model',
    source: 'tests/catchment.test.ts', anchor: 'keeps the upper pulse fixed and lets the player find the missing floats',
    action: 'Trace the same six floats through each setting and account for the lower count at the changed pocket.',
    dimensions: ['concept:evidence', 'concept:objectivity', 'framework:methods-and-tools', 'subject:physics', 'micro:411',
      'question:KQ-CATCHMENT-01'], elements: ['game:195', 'story:77'],
  },
  {
    objective: 'catchment.local-receipt', map: 'water.lower-channel', target: 'catchment-terrace-receipt',
    source: 'tests/catchment.test.ts', anchor: 'keeps the %s receipt, then opens the revised %s route',
    action: 'Open one of two staffed passages and record who still has to wait before testing the other notice.',
    dimensions: ['concept:values', 'concept:responsibility', 'framework:ethics', 'micro:350'], elements: ['game:22', 'story:11'],
  },
  {
    objective: 'catchment.civic.receipt', map: 'civic.canal', target: 'catchment-civic-rail',
    source: 'tests/catchment.test.ts', anchor: "d.done('catchment.civic.receipt')",
    action: 'Bring the Commons signed notice to its matching Canal Walk crew and check whose load still waits.',
    dimensions: ['framework:scope', 'concept:responsibility', 'micro:887'], elements: ['game:263', 'story:15'],
  },
  {
    objective: 'copies.wordclip.deliver', map: 'copies.archive', target: 'wordclip-receive.records',
    source: 'tests/witness-clip.test.ts', anchor: 'carries one object to different receivers',
    action: 'Bring the bound, dated wrapper record to its receiver, preserving the gloss and the witness’s limited report.',
    dimensions: ['vocabulary:version', 'vocabulary:gloss', 'vocabulary:witness'], elements: ['game:263'],
  },
  {
    objective: 'nexus.rest.checked', map: 'nexus.archive', target: 'nexus-rest-pair-ready',
    source: 'tests/opening-rests.test.ts', anchor: 'helps the pair at the low table and keeps the borrower’s unmet request',
    action: 'Place both rests at the low table and clip the borrower’s outstanding request beside the loan total.',
    dimensions: ['concept:values', 'concept:responsibility', 'framework:ethics', 'profile:caring'],
    elements: ['game:271', 'story:72'],
  },
  {
    objective: 'nile.way.compare', map: 'nile.route', target: 'nile-way-board',
    source: 'tests/nile-map-guide.test.ts', anchor: 'Hold the room marks steady',
    action: 'Check the aisle and shelf ends of the same room, then turn its sketch against the fixed landmarks.',
    dimensions: ['concept:perspective', 'concept:interpretation', 'framework:perspectives', 'subject:geography',
      'question:KQ-NEW-003', 'question:KQ-ROUTE-24', 'micro:79'],
    elements: ['game:13'],
  },
  {
    objective: 'nile.routes', map: 'nile.route', target: 'nile-route-model',
    source: 'tests/nile.test.ts', anchor: "d.done('nile.routes')",
    action: 'Run the same cart load on the model’s two roads and leave the trial conditions separate from the Mine Map record.',
    dimensions: ['concept:objectivity', 'concept:evidence', 'framework:methods-and-tools', 'question:KQ-ROUTE-32', 'micro:611'],
    elements: ['game:195'],
  },
  {
    objective: 'sea.finish', map: 'sea.harbour', target: 'sea-harbourkeeper',
    source: 'tests/cartographers-story.test.ts', anchor: "d.done('sea.finish')",
    action: 'After hearing the reader, revise directions to show where the harbour and shoal surveys stop.',
    dimensions: ['concept:responsibility', 'framework:scope', 'subject:geography', 'question:KQ-ROUTE-15', 'micro:350'],
    elements: ['game:13', 'story:130'],
  },
  {
    objective: 'stage.compare', map: 'stage.rehearsal', target: 'stage-director',
    source: 'tests/performance-story.test.ts', anchor: "d.done('stage.compare')",
    action: 'Rehearse identical words and movement with the pause on either side of the crate move, then pin the contrast.',
    dimensions: ['concept:interpretation', 'area:ART', 'subject:theatre', 'question:KQ-ROUTE-30', 'micro:449'],
    elements: ['game:234', 'game:247'],
  },
  {
    objective: 'water.publish', map: 'water.council', target: 'water-scribe',
    source: 'tests/water-story.test.ts', anchor: "d.done('water.publish')",
    action: 'Use measured drought flows and two work cards to post a tested allocation and show which work must wait.',
    dimensions: ['concept:values', 'concept:responsibility', 'framework:ethics', 'question:KQ-NEW-006', 'question:KQ-ROUTE-35', 'micro:436'],
    elements: ['game:271', 'story:11'],
  },
  {
    objective: 'civic.overlap.evidence', map: 'civic.dispatch', target: 'civic-overlap-rack',
    source: 'tests/civic-story.test.ts', anchor: 'Group the remaining rows',
    action: 'Fill and group the arrival rows, then check them against the local crew’s release time.',
    dimensions: ['concept:evidence', 'area:MAT', 'atl:thinking', 'subject:math-ai'],
    elements: ['game:184', 'story:72'],
  },
];

export function parseCatalogue(text, kind, size) {
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    const columns = line.split('|').map((column) => column.trim());
    if (!/^\d+$/.test(columns[1] ?? '')) continue;
    const number = Number(columns[1]);
    const status = catalogueStatus.get(columns[kind === 'game' ? 3 : 4]);
    if (!status || !columns[2] || rows.has(number)) throw Error(`Invalid ${kind} catalogue row ${number}.`);
    rows.set(number, { id: listId(kind, number), number, kind, name: columns[2], status });
  }
  if (rows.size !== size || Array.from({ length: size }, (_, index) => index + 1).some((number) => !rows.has(number))) {
    throw Error(`The ${kind} catalogue should contain rows 1–${size} once each.`);
  }
  return [...rows.values()].sort((a, b) => a.number - b.number);
}

function makeDimensions({ pack, curriculum, levels, topics, exhibition, micro, suppliedMicro, microSkillId }) {
  const group = (kind, items) => items.map(([value, name]) => ({ id: listId(kind, value), kind, name }));
  const named = (values) => Object.entries(values).map(([id, name]) => [id, name]);
  const names = (values) => values.map((id) => [id, id]);
  const questionPrompts = new Set(exhibition.map(({ question }) => question.id));
  const microNames = new Map(micro.map(({ number, name }) => [number, name]));
  const supplied = new Set(suppliedMicro);
  if (questionPrompts.size !== 35 || exhibition.length !== 35) throw Error('The exhibition prompt registry should have 35 unique IDs.');
  const questions = pack.questions.map(({ id }) => ({
    id: listId('question', id), kind: 'question', name: id, exhibitionPrompt: questionPrompts.has(id),
  }));
  if (questions.filter(({ exhibitionPrompt }) => exhibitionPrompt).length !== questionPrompts.size) {
    throw Error('An exhibition prompt is missing from the registered question inventory.');
  }
  return [
    ...group('concept', named(curriculum.CONCEPT_NAMES)),
    ...group('framework', names(levels.FRAMEWORK)),
    ...group('area', topics.TOK_AREAS.map((id) => [id, curriculum.AOK_NAMES[id]])),
    ...group('theme', topics.TOK_OPTIONAL_THEMES.map((id) => [id, curriculum.AOK_NAMES[id]])),
    { id: 'theme:knower', kind: 'theme', name: 'Knowledge and the knower' },
    ...group('subject', Object.entries(curriculum.SUBJECTS).map(([id, { name }]) => [id, name])),
    ...group('atl', named(curriculum.ATL_NAMES)),
    ...group('profile', named(curriculum.PROFILE_NAMES)),
    ...group('att', [
      ['inquiry', 'Inquiry'], ['conceptual', 'Conceptual understanding'], ['contexts', 'Local and global contexts'],
      ['teams', 'Teamwork and collaboration'], ['barriers', 'Removing barriers'], ['feedback', 'Formative feedback'],
    ]),
    ...group('cas-practice', names(['creativity', 'activity', 'service'])),
    { id: 'ee-practice:bounded-inquiry', kind: 'ee-practice', name: 'Bounded research practice' },
    ...group('skill', pack.skills.filter(({ domain }) => domain !== 'MICRO').map(({ id, name }) => [id, name])),
    ...group('vocabulary', pack.glossary.map(({ id, term }) => [id, term])),
    ...group('etymology', pack.glossary.map(({ id, term }) => [id, term])),
    ...questions,
    ...Array.from({ length: 1000 }, (_, i) => i + 1).map((number) => ({
      id: listId('micro', number), kind: 'micro', name: microNames.get(number) ?? `#${number}`,
      supplied: supplied.has(number), skillId: microSkillId(number),
    })),
  ];
}

function countsBy(rows, key) {
  const counts = {};
  for (const row of rows) counts[row[key]] = (counts[row[key]] ?? 0) + 1;
  return counts;
}

export function collectProofs({ objectives, maps, elements, dimensions, rows, sourceText }) {
  const elementById = new Map(elements.map((row) => [row.id, row]));
  const dimensionById = new Map(dimensions.map((row) => [row.id, row]));
  return rows.map((row) => {
    const place = objectives.get(row.objective);
    const map = maps[row.map];
    const targets = [...(map?.interactables ?? []), ...(map?.npcs ?? [])];
    if (!place || !targets.some(({ id }) => id === row.target) || !row.anchor || !sourceText.get(row.source)?.includes(row.anchor)) {
      throw Error(`Unresolved action proof for ${row.objective} at ${row.map}/${row.target}.`);
    }
    if (!row.action.trim() || !row.dimensions.length || !row.elements.length) throw Error(`Empty proof for ${row.objective}.`);
    for (const id of row.dimensions) {
      const dimension = dimensionById.get(id);
      if (!dimension || dimension.supplied === false) throw Error(`Unavailable dimension ${id} in proof for ${row.objective}.`);
      if (dimension.kind === 'question') {
        const question = id.slice('question:'.length);
        if (![place.step.kq, ...(place.step.questionWays ?? [])].some((link) => link?.id === question)) {
          throw Error(`Unsupported question ${question} in proof for ${row.objective}.`);
        }
      }
      if (dimension.kind === 'micro' && !place.step.skills?.includes(dimension.skillId)) {
        throw Error(`Unsupported micro-skill ${id} in proof for ${row.objective}.`);
      }
    }
    for (const id of row.elements) {
      const element = elementById.get(id);
      if (!element || !['playable', 'partial'].includes(element.status)) throw Error(`Unavailable element ${id} in proof for ${row.objective}.`);
    }
    return { ...row, world: map.world, mission: place.mission.id, missionWorld: place.mission.world };
  });
}

/** An objective identity is counted once in the same physical world and pair, even with several proof rows. */
export function indexPairs(proofs) {
  const cells = new Map();
  for (const row of proofs) {
    for (const dimension of row.dimensions) for (const element of row.elements) {
      const key = cellKey(row.world, dimension, element);
      const actions = cells.get(key) ?? new Set();
      actions.add(row.objective);
      cells.set(key, actions);
    }
  }
  return cells;
}

export function pairStatus(dimension, element, count) {
  if (count >= TARGET) return 'meets-target';
  if (count > 0) return 'below-target';
  if (element.status === 'excluded') return 'excluded-by-design';
  if (element.status === 'planned') return 'planned-element';
  if (dimension.supplied === false) return 'source-unavailable';
  return 'no-action-proof';
}

export function totalsFor(worlds, dimensions, elements, index) {
  const worldSet = new Set(worlds.map(({ id }) => id));
  const dims = new Set(dimensions.map(({ id }) => id));
  const elems = new Set(elements.map(({ id }) => id));
  const count = worlds.length * dimensions.length;
  const excluded = count * elements.filter(({ status }) => status === 'excluded').length;
  const planned = count * elements.filter(({ status }) => status === 'planned').length;
  const unavailable = worlds.length * dimensions.filter(({ supplied }) => supplied === false).length
    * elements.filter(({ status }) => status === 'playable' || status === 'partial').length;
  let present = 0;
  let meets = 0;
  for (const [key, actions] of index) {
    const [world, dimension, element] = key.split('|');
    if (!worldSet.has(world) || !dims.has(dimension) || !elems.has(element)) continue;
    present++;
    if (actions.size >= TARGET) meets++;
  }
  const possible = count * elements.length;
  return {
    cells: possible, 'meets-target': meets, 'below-target': present - meets,
    'no-action-proof': possible - present - excluded - planned - unavailable,
    'planned-element': planned, 'excluded-by-design': excluded, 'source-unavailable': unavailable,
  };
}

function authoredLinks(objectives, micro, elements) {
  const statuses = new Map(elements.map(({ id, status }) => [id, status]));
  return micro.flatMap(({ number, uses }) => uses.map(({ objective, action, game, story, styles, modes }) => {
    const place = objectives.get(objective);
    const elementIds = [listId('game', game), listId('story', story)];
    const issues = elementIds.filter((id) => !['playable', 'partial'].includes(statuses.get(id)));
    return {
      objective, action, dimension: listId('micro', number), elements: elementIds, styles, modes,
      missionWorld: place?.mission.world ?? null,
      note: !place ? 'unknown-objective' : issues.length ? 'check-element-status' : 'needs-action-and-map-review',
    };
  }));
}

async function loadAudit() {
  const server = await createServer({
    root, configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false },
  });
  try {
    const [{ buildPack }, { MAPS }, curriculum, levels, topics, { QUESTION_ROUTES }, { MICRO_SKILLS, microSkillId }, { SUPPLIED_SKILL_IDS }, game, story] =
      await Promise.all([
        server.ssrLoadModule('/src/content/index.ts'), server.ssrLoadModule('/src/maps/index.ts'),
        server.ssrLoadModule('/src/domain/curriculum.ts'), server.ssrLoadModule('/src/domain/learningLevels.ts'),
        server.ssrLoadModule('/tools/tok-floor.ts'), server.ssrLoadModule('/src/content/questionEncounters.ts'),
        server.ssrLoadModule('/src/content/microSkillEvidence.ts'), server.ssrLoadModule('/src/domain/microSkillAudit.ts'),
        readFile(resolve(root, 'docs/GAME_ELEMENTS.md'), 'utf8'), readFile(resolve(root, 'docs/STORY_ELEMENTS.md'), 'utf8'),
      ]);
    const pack = buildPack();
    const objectives = new Map(pack.missions.flatMap((mission) => mission.objectives.map((step) => [step.id, { mission, step }])));
    const maps = Object.values(MAPS);
    const worlds = distinct(maps.map(({ world }) => world)).sort().map((id) => ({
      id, maps: maps.filter(({ world }) => world === id).map((map) => map.id),
    }));
    const elements = [...parseCatalogue(game, 'game', 288), ...parseCatalogue(story, 'story', 150)];
    const dimensions = makeDimensions({ pack, curriculum, levels, topics, exhibition: QUESTION_ROUTES,
      micro: MICRO_SKILLS, suppliedMicro: SUPPLIED_SKILL_IDS, microSkillId });
    if (new Set(dimensions.map(({ id }) => id)).size !== dimensions.length) throw Error('Duplicate learning dimension IDs.');
    const sourceText = new Map(await Promise.all(distinct(proofRows.map(({ source }) => source)).map(async (file) =>
      [file, await readFile(resolve(root, file), 'utf8')])));
    const proofs = collectProofs({ objectives, maps: MAPS, elements, dimensions, rows: proofRows, sourceText });
    const candidates = authoredLinks(objectives, MICRO_SKILLS, elements);
    return { worlds, elements, dimensions, proofs, candidates };
  } finally {
    await server.close();
  }
}

const limitations = [
  'Proof rows are source-reviewed actions anchored to a map target and a representative test. This audit does not run gameplay, measure participation, or establish learning.',
  'An objective can cover several steps. Mission-wide tags, shared world, item names, text matches, repeated plays and micro-skill candidate records do not themselves count as action-level proof.',
  'Vocabulary and etymology use the current glossary IDs as a bounded inventory. Each needs an explicit action proof. The glossary does not define all TOK vocabulary.',
  'Past essay prompt access has no documented item inventory here, so its coverage and denominator are unknown. Extended Essay and CAS are practice opportunities only.',
  'The 35 exhibition question families are a labeled subset of the knowledge-question IDs and enter the denominator once.',
  'The 197 unsupplied micro-skill numbers are reported as source-unavailable. Their descriptions and action links are unknown.',
  'Thinking taxonomies and player or encounter preferences have their own separate semantics and reports. They do not multiply this intersection census.',
];

const unknownInventories = [
  { scope: 'past-essay-prompts', total: null, reason: 'An itemized accessible source inventory is unavailable to this audit.' },
  { scope: 'tok-vocabulary-beyond-the-glossary', total: null, reason: 'The registered terms define the bounded vocabulary and etymology census.' },
];

function readOptions(args) {
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (['--help', '--json', '--cells'].includes(key)) options[key.slice(2)] = true;
    else if (['--world', '--dimension', '--element'].includes(key) && args[0] && !args[0].startsWith('--')) {
      options[key.slice(2)] = args.shift();
    } else throw Error(`Unknown or incomplete audit option ${key}. Use --help.`);
  }
  if (options.json && options.cells) throw Error('Use --json for the sparse report or --cells for expanded JSON lines.');
  return options;
}

function select(rows, query, label) {
  if (!query) return rows;
  const result = rows.filter(({ id, kind, exhibitionPrompt }) => id === query || kind === query
    || (query === 'exhibition-prompt' && exhibitionPrompt));
  if (!result.length) throw Error(`Unknown ${label} ${query}.`);
  return result;
}

async function expand(worlds, dimensions, elements, index) {
  for (const { id: world } of worlds) for (const dimension of dimensions) for (const element of elements) {
    const actions = [...(index.get(cellKey(world, dimension.id, element.id)) ?? [])];
    const status = pairStatus(dimension, element, actions.length);
    const missingToTarget = ['no-action-proof', 'below-target', 'meets-target'].includes(status)
      ? Math.max(0, TARGET - actions.length) : null;
    const row = { world, dimension: dimension.id, element: element.id, actions, count: actions.length, missingToTarget, status };
    if (!process.stdout.write(`${JSON.stringify(row)}\n`)) await once(process.stdout, 'drain');
  }
}

async function main() {
  const options = readOptions(process.argv.slice(2));
  if (options.help) {
    console.log('node tools/audit-cross-weave.mjs [--json | --cells] [--world WORLD-01] [--dimension concept:evidence] [--element game:271]');
    console.log('--json returns the sparse audit with inventories. --cells expands every selected pair as one JSON line.');
    console.log('Use a kind such as concept or story to select the whole kind. Exhibition prompts can be selected as exhibition-prompt.');
    return;
  }
  const audit = await loadAudit();
  const worlds = select(audit.worlds, options.world, 'world');
  const dimensions = select(audit.dimensions, options.dimension, 'dimension');
  const elements = select(audit.elements, options.element, 'element');
  const index = indexPairs(audit.proofs);
  if (options.cells) return expand(worlds, dimensions, elements, index);
  const summary = totalsFor(worlds, dimensions, elements, index);
  const worldSummary = worlds.map((world) => ({ world: world.id, ...totalsFor([world], dimensions, elements, index) }));
  const elementSummary = distinct(elements.map(({ kind }) => kind)).map((kind) => {
    const group = elements.filter((row) => row.kind === kind);
    return { kind, catalogue: countsBy(group, 'status'), ...totalsFor(worlds, dimensions, group, index) };
  });
  if (options.json) {
    const worldIds = new Set(worlds.map(({ id }) => id));
    const dimIds = new Set(dimensions.map(({ id }) => id));
    const elementIds = new Set(elements.map(({ id }) => id));
    const provenCells = [...index].flatMap(([key, actions]) => {
      const [world, dimension, element] = key.split('|');
      return worldIds.has(world) && dimIds.has(dimension) && elementIds.has(element)
        ? [{ world, dimension, element, actions: [...actions], count: actions.size,
          missingToTarget: Math.max(0, TARGET - actions.size), status: actions.size >= TARGET ? 'meets-target' : 'below-target' }] : [];
    });
    console.log(JSON.stringify({
      schema: 1, target: TARGET, summary, worldSummary, elementSummary, limitations, unknownInventories,
      worlds, dimensions, elements, provenCells,
      proofs: audit.proofs.filter((row) => worldIds.has(row.world) && row.dimensions.some((id) => dimIds.has(id))
        && row.elements.some((id) => elementIds.has(id))),
      authoredCandidates: audit.candidates.filter((row) => worldIds.has(row.missionWorld) && dimIds.has(row.dimension)
        && row.elements.some((id) => elementIds.has(id))),
      allCandidateNotes: countsBy(audit.candidates, 'note'),
      candidateIssues: audit.candidates.filter(({ note }) => note !== 'needs-action-and-map-review'),
    }, null, 2));
    return;
  }
  console.log(`Target ${TARGET} distinct documented actions for each learning dimension × element in each world.`);
  console.log(`${worlds.length} worlds, ${dimensions.length} dimensions, ${elements.length} elements.`);
  console.log(`Dimension inventories ${JSON.stringify(countsBy(dimensions, 'kind'))}`);
  console.log(`Catalogue statuses ${JSON.stringify(countsBy(elements, 'status'))}`);
  console.log(JSON.stringify(summary));
  for (const { kind, ...counts } of elementSummary) console.log(`${kind} catalogue ${JSON.stringify(counts)}`);
  for (const { world, ...counts } of worldSummary) console.log(`${world} ${JSON.stringify(counts)}`);
  console.log(`${audit.candidates.length} authored micro-skill candidate rows. Candidate rows provide no automatic pair credit.`);
  for (const limit of limitations) console.log(limit);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
