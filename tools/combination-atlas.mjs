// The catalogue, the same-action evidence and the observed order have separate provenance.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validatedActions } from './audit-cognitive-weave.mjs';
import { cognitiveActions } from './cognitive-actions.mjs';
import { requirements, matchesOrder } from './combination-space.mjs';
const data = (path) =>
  JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const stories = data('src/content/pocket-theatre-cases.json');
const chapters = data('src/content/world-chapters.json');
export const familyNames = {
  story: 'Narrative elements',
  game: 'Game elements',
  concept: 'TOK key concepts',
  framework: 'Knowledge framework',
  area: 'Areas of knowledge',
  theme: 'Core and optional themes',
  question: 'Knowledge questions',
  subject: 'DP subjects',
  atl: 'Approaches to learning',
  att: 'Approaches to teaching',
  profile: 'Learner profile',
  vocabulary: 'Vocabulary',
  etymology: 'Word histories',
  skill: 'Skills',
  micro: 'Micro-skills',
  fallacy: 'Logical fallacies',
  bias: 'Cognitive biases and related effects',
  deception: 'Forms of deliberate deception',
  reasoning: 'Reasoning modes',
  'essay-title': 'Prescribed title records',
  'cas-practice': 'CAS practice',
  'ee-practice': 'EE research practice',
};
const normalize = (s) => s.trim().replace(/\s+/g, ' ').normalize('NFC');
export function questionRegistry(audit) {
  const names = new Map(),
    ids = new Map();
  for (const [key, text] of Object.entries(audit.questionNames)) {
    const id = 'question:' + key;
    names.set(id, text);
    if (!ids.has(normalize(text))) ids.set(normalize(text), id);
  }
  for (const activity of audit.activities) {
    const text = normalize(activity.missionQuestion);
    if (!text || ids.has(text)) continue;
    const key =
      'question:mission-' +
      createHash('sha256').update(text).digest('hex').slice(0, 16);
    if (names.has(key)) throw Error('Colliding mission question IDs.');
    ids.set(text, key);
    names.set(key, text);
  }
  return { names, ids };
}
function inventory(audit, registry) {
  const entries = [...audit.elements, ...audit.dimensions].map((row) => {
    const entry = {
      id: row.id,
      kind: row.kind,
      name: registry.names.get(row.id) ?? row.name,
    };
    if (row.status) entry.status = row.status;
    if (row.aliases?.length) entry.aliases = row.aliases;
    if (row.kind === 'question')
      entry.origin = row.exhibitionPrompt
        ? 'Exhibition route adaptation'
        : 'Registered game question';
    if (row.kind === 'etymology')
      Object.assign(entry, audit.glossary[row.id.slice(10)]?.history);
    return entry;
  });
  const known = new Set(entries.map((e) => e.id));
  for (const [id, name] of registry.names)
    if (!known.has(id))
      entries.push({ id, kind: 'question', name, origin: 'Mission question' });
  return entries;
}
// Specific disciplinary lens supported by what the player does to the prop.
// This avoids copying all areas assigned to a district onto each individual operation.
const theatreLens = {
  'brass-price': 'HUM',
  'ten-stamps': 'HUM',
  'blue-fringe': 'ART',
  'reed-hand': 'HIS',
  'empty-peg': 'HIS',
  'mitten-sheet': 'HIS',
  'six-knots': 'MAT',
  varnish: 'NAT',
  'red-stitch': 'HUM',
  'white-tail': 'NAT',
  'cooling-hook': 'NAT',
  'ninth-tooth': 'NAT',
  'tuesday-fold': 'HIS',
  'yellow-ink': 'LAN',
  'lantern-drift': 'MAT',
  'two-routes': 'MAT',
  'paper-wings': 'ART',
  'third-bell': 'ART',
  'ten-bowls': 'HUM',
  'two-coppers': 'MAT',
  'dry-garden': 'POL',
  'dry-sleeve': 'NAT',
  'green-window': 'MAT',
  'no-queue': 'HUM',
  'old-singing': 'ART',
  'rolled-echo': 'ART',
  'blue-ribbon': 'NAT',
  'crate-sky': 'NAT',
  'cut-caveat': 'HIS',
  'night-ledger': 'POL',
};
// Each pair gives two defensible readings or uses of the same physical evidence.
const otherCases = {
  'claimbell.issue': [
    'theme:POL',
    'A porter can speak at the open bell and keep his wrist to himself.',
    'A worker on shift needs a token or another person to hold the turn.',
  ],
  'claimbell.weir.test': [
    'theme:LAN',
    'A chalk rubbing can wait in a slot after the keeper leaves.',
    'Three audible knocks need a listener who will enter them.',
  ],
  'claimbell.sign': [
    'theme:POL',
    'A signed slot leaves a mark a later keeper can check.',
    'A late hearing gives an unrecorded sound a witness.',
  ],
  'elbow.curtain': [
    'area:ART',
    'The intact sleeve reads clearly from the back row.',
    'A repaired hinge can give the other sister the opening.',
  ],
  'last-bell.council.reopened': [
    'theme:POL',
    'Households can choose how to be reached when the bell fails.',
    'Paired timed walks make two crossings easier to compare.',
  ],
  'rivernames.walks': [
    'area:HUM',
    'A reliable delivery route needs a walking time at this tide.',
    'A named landing keeps the receiving household in the account.',
  ],
};
export function buildAtlas(audit) {
  const registry = questionRegistry(audit);
  const members = inventory(audit, registry),
    known = new Set(members.map((x) => x.id));
  const activities = audit.activities.map((a) => ({
    ...a,
    chapter: chapters[a.world],
    questionIds: [
      ...new Set(
        [
          ...a.questions.map((k) => 'question:' + k),
          registry.ids.get(normalize(a.missionQuestion)),
        ].filter(Boolean),
      ),
    ],
  }));
  const byObjective = new Map(activities.map((a) => [a.id, a]));
  const reviews = validatedActions(audit, cognitiveActions);
  const beats = [],
    routes = [];
  function add(review, extra, { id, views, question, act, consequence } = {}) {
    const location = byObjective.get(review.objective);
    const ids = [
      ...new Set([
        ...(review.story ? ['story:' + review.story] : []),
        ...(review.game ? ['game:' + review.game] : []),
        ...review.dimensions,
        ...extra,
        ...location.questionIds,
      ]),
    ];
    const anchor = requirements(members, ids, {
      design: 'any',
      question: 'selected',
    });
    if (
      !anchor.valid ||
      ids.some((k) => !known.has(k)) ||
      views.length !== 2 ||
      new Set(views).size !== 2 ||
      views.some((v) => !v.trim())
    )
      throw Error(
        'Incomplete scene evidence in ' +
          review.objective +
          ': ' +
          JSON.stringify(anchor),
      );
    const beat = {
      id,
      objective: review.objective,
      actionId: review.actionId,
      world: review.world,
      chapter: chapters[review.world],
      map: review.map,
      target: review.target,
      bloom: review.bloom,
      dok: review.dok,
      members: ids,
      question: question ?? location.questionIds[0],
      views,
      act: act ?? review.demand,
      consequence: consequence ?? review.consequence,
      source: review.source,
      anchor: review.anchor,
    };
    beats.push(beat);
    return beat;
  }
  for (const s of stories) {
    const path = [];
    const send = reviews.find(
      (r) => r.objective === 'pocket.' + s.id + '.send',
    );
    const location = byObjective.get(send.objective);
    const key = theatreLens[s.id];
    const lens = location.areas.includes(key)
      ? 'area:' + key
      : location.themes.includes(key)
        ? 'theme:' + key
        : undefined;
    if (!lens) throw Error('Unresolved theatre lens for ' + s.id);
    const views = s.editions.map((e) => e.label + '. ' + e.immediate);
    const ids = [];
    for (const pane of [0, 1, 3, 2]) {
      const pieces = audit.proofs.filter(
        (p) =>
          p.patternPractice?.[0].case === s.id &&
          p.patternPractice[0].pane === pane,
      );
      if (!pieces.length) continue;
      const review = reviews.find(
        (r) =>
          r.objective === pieces[0].objective && r.anchor === pieces[0].anchor,
      );
      // All observations on this row must be visible on this exact setting.
      if (
        pieces.some(
          (p) =>
            !s.readings[pane].includes(p.anchor) ||
            p.elements.join('|') !== pieces[0].elements.join('|'),
        )
      )
        throw Error('Mismatched panes for ' + s.id);
      const beat = add(
        review,
        [...send.dimensions, lens, ...pieces.flatMap((p) => p.dimensions)],
        {
          id: s.id + '/pane-' + pane,
          views,
          act: pieces.map((p) => p.patternPractice[0].basis).join(' '),
          consequence: s.readings[pane],
        },
      );
      ids.push(beat.id);
    }
    path.push(...ids, add(send, [lens], { id: s.id + '/send', views }).id);
    routes.push({
      id: s.id,
      title: s.title,
      beats: path,
      source: 'tools/pocket-theatre-journey.mjs',
      note: 'Observed settings in the order used on the browser journey. The ending is issued after the final setting.',
    });
  }
  const bell = [];
  for (const [objective, [lens, ...views]] of Object.entries(otherCases)) {
    const r = reviews.find((r) => r.objective === objective);
    const beat = add(r, [lens], { id: objective, views });
    if (objective.startsWith('claimbell.')) bell.push(beat.id);
  }
  routes.push({
    id: 'claim-bell',
    title: 'The bell for a quiet claim',
    beats: bell,
    source: 'tests/claim-bell.test.ts',
    note: 'The well sends a rule to the weir before the weir can try and sign a successor.',
  });
  return {
    members,
    blooms: audit.bloomLevels,
    chapters,
    activities,
    beats,
    routes,
  };
}
export function lookup(
  atlas,
  ids,
  {
    order,
    world,
    chapter,
    bloom,
    dok,
    design = 'joint',
    question = 'context',
  } = {},
) {
  const rule = requirements(atlas.members, ids, { design, question });
  if (!rule.valid)
    return { ...rule, beats: [], routes: [], distinctActions: 0 };
  if (world && !Object.hasOwn(atlas.chapters, world))
    throw Error('Unknown world: ' + world);
  if (chapter && !Object.values(atlas.chapters).includes(Number(chapter)))
    throw Error('Unknown chapter: ' + chapter);
  if (bloom && !atlas.blooms.includes(bloom))
    throw Error('Unknown Bloom level: ' + bloom);
  if (dok && ![1, 2, 3, 4].includes(Number(dok)))
    throw Error('Choose a DOK from 1 to 4.');
  const eligible = (b) =>
    (!world || b.world === world) &&
    (!chapter || b.chapter === Number(chapter)) &&
    (!bloom || b.bloom === bloom) &&
    (!dok || b.dok === Number(dok));
  const beats = atlas.beats.filter(
    (b) => eligible(b) && ids.every((id) => b.members.includes(id)),
  );
  const byId = new Map(atlas.beats.map((b) => [b.id, b]));
  if (
    order &&
    (order.some((group) => !group.length) ||
      order.flat().some((id) => !ids.includes(id)) ||
      ids.some((id) => !order.flat().includes(id)))
  )
    throw Error('Ordered steps must cover the selected members.');
  const routes = order
    ? atlas.routes.filter((r) =>
        matchesOrder(
          order,
          r.beats.map((k) =>
            eligible(byId.get(k)) ? byId.get(k).members : [],
          ),
        ),
      )
    : [];
  return {
    ...rule,
    beats,
    routes,
    distinctActions: new Set(beats.map((b) => b.actionId)).size,
  };
}
