// The catalogue, the same-action evidence and the observed order have separate provenance.
import { contextFamilies } from './combination-context.mjs';
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
  ...contextFamilies,
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
  return [...entries, ...audit.contexts];
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
  'optics.drawings': [['area:ART', 'area:NAT'], 'Nim needs a cue that works from the seat her audience uses.', 'A maker seeking an explanation needs a doorway where the two drawings predict different views.'],
  'rivernames.placename': [['area:HIS', 'theme:IND'], 'Emlet can preserve a particular morning by keeping his pin on his own sheet.', 'A walker can want a route she can change at high water. The published Nunavut example and the fictional river have different named sources.'],
  'returned-coat.hook.print': [
    'area:HIS',
    'The pear looks personal enough to let a friend recognise a cuff.',
    'The same mark transfers to a blank sleeve. A keeper needs a separate account of who wore it.',
  ],
  'returned-coat.hook.fare': [
    'area:HIS',
    'The name on the ticket identifies the person whose money was taken.',
    'The guarantee stroke identifies a different person who agreed to answer for a charge.',
  ],
  'returned-coat.market.cross': [
    'area:HUM',
    'Two fare marks can be a useful count of transactions.',
    'A borrower can pass the till twice with one coat and one body.',
  ],
  'returned-coat.market.awning': [
    'area:HUM',
    'The short route reaches the ferry sooner.',
    'The sheltered route keeps the sleeve dry. Hesper also carried a coat on somebody else’s behalf.',
  ],
  'returned-coat.stage.act': [
    'area:ART',
    'From the audience the cuff appears to rain when Nim enters.',
    'The sponge keeper can delay the shower, which leaves the earlier drop in the Nexus unexplained.',
  ],
  'returned-coat.stage.part': [
    'area:ART',
    'A cast list names a part the audience sees.',
    'A pay envelope and wardrobe book make work behind the curtain visible.',
  ],
  'returned-coat.rain.lining.twocauses': [
    'area:NAT',
    'A third-beat tap can come from the one drop the hem has held since the first beat.',
    'A direct squeeze at the third beat gives the borrower the same sound.',
  ],
  'returned-coat.rain.stage.twocauses': [
    'area:NAT',
    'The audience has a repeatable sound in the programme.',
    'The keeper can show two ways of making it with different hands.',
  ],
  'returned-coat.rain.lining': [
    'area:ART',
    'A named bow can keep the surprise for the waiting borrower.',
    'An open demonstration gives the worker a chance to teach the next company.',
  ],
  'returned-coat.rain.stage': [
    'area:ART',
    'The keeper’s bow can acknowledge her part and preserve the theatrical effect.',
    'Giving the keeper the demonstration lets the touring company learn from her directly.',
  ],
  'returned-coat.council.mask': [
    'theme:POL',
    'Both marks are enough to establish an extra fare for one crossing.',
    'The identity of the wearer remains open even after the fare can be refunded.',
  ],
  'returned-coat.council.hinge': [
    'theme:POL',
    'A standing keeper can reach the high hook.',
    'A seated borrower has a separate working route through the inside opening.',
  ],

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
  'last-bell.voices.sleeve': [
    ['area:HIS', 'framework:methods-and-tools'],
    'Wren can use the shelf number to retrieve the kitchen recording and its loan terms.',
    'The witness marked the same sleeve for private listening or unsigned wording. Finding it gives the guardian a specific permission to respect.',
  ],
  'optics.presets': [
    ['theme:TEC', 'concept:perspective'],
    'A maker can recall the star packing from its mark in the felt after returning the tools.',
    'A second reader can open the knot packing and see the comparison with its own pair of fittings.',
  ],
  'middlehouse.guests': [
    'area:HUM',
    'A traveller at the mat can use a resident’s directions to get the kettle around the house.',
    'A neighbour at the sill can ask the resident there for a sightline. The position changes what help they can give.',
  ],
  'last-bell.voices.left': [
    'theme:LAN',
    'A listener in Wren’s chair can hear the later grooves identify the stove bell.',
    'The ferry crew can read an unsigned statement together. The witness keeps her voice and the question about the tower stays open.',
  ],
  'elbow.fitting': [
    ['area:ART', 'concept:evidence'],
    'The tailor’s measure preserves how much cloth is available for a shared sleeve.',
    'The performers depend on where the elbow bends. The same length can put their hands too far apart.',
  ],
  'elbow.lottery': [
    'area:MAT',
    'The person running the draw can compare an unusual assignment with the other possible packets.',
    'A performer using the resulting sleeve still needs to know how much the difference changes their reach.',
  ],
  'middlehouse.night': [
    'theme:POL',
    'A neighbour who needs rest can use the tested cart route when choosing whom to give the evening key.',
    'A neighbour staging a performance can use the measured sightline to ask for the same room. The earlier invitation follows both of them to the table.',
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
  if (known.size !== members.length || members.some((m) => !m.name?.trim()))
    throw Error('Missing or duplicate catalogue member.');
  const prompts = new Map(
    audit.contexts
      .filter((m) => m.kind === 'exhibition')
      .map((m) => [m.question, m.id]),
  );
  const activities = audit.activities.map((a) => ({
    ...a,
    promptIds: a.questions
      .map((q) => prompts.get('question:' + q))
      .filter(Boolean),
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
    const questionIds = review.missionQuestion
      ? [registry.ids.get(normalize(review.missionQuestion))]
      : byObjective.get(review.objective).questionIds;
    const promptIds = review.missionQuestion ? [] : byObjective.get(review.objective).promptIds;
    const ids = [
      ...new Set([
        ...(review.story ? ['story:' + review.story] : []),
        ...(review.game ? ['game:' + review.game] : []),
        ...review.dimensions,
        ...extra,
        ...questionIds,
        ...promptIds,
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
      question: question ?? questionIds[0],
      ...(review.title ? { title: review.title } : {}),
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
  // Actors in these witnessed operations speak or handle the prop in that action.
  const coatSpeakers = new Map(
    data('src/content/return-coat-sites.json').flatMap((s) =>
      s.trials.map(([trial, , , speaker]) => [
        'returned-coat.' + s.id + '.' + trial,
        'character:' + speaker,
      ]),
    ),
  );
  const bell = [];
  for (const [objective, [lens, ...views]] of Object.entries(otherCases)) {
    const r = reviews.find((r) => r.objective === objective);
    const actor = coatSpeakers.get(objective);
    const anchors = Array.isArray(lens) ? lens : [lens];
    const beat = add(r, actor ? [...anchors, actor] : anchors, {
      id: objective,
      views,
      ...(r.reasoning?.length ? {
        act: [r.demand, ...r.reasoning.map(item => item.basis)].join(' '),
      } : {}),
    });
    if (objective.startsWith('claimbell.')) bell.push(beat.id);
  }
  for (const pair of audit.keepsakeActions) {
    for (const r of [pair.field, pair.handover]) add(r, [], { id: r.actionId, views: r.views });
    routes.push({
      id: 'carry-' + pair.id, title: pair.name,
      beats: [pair.field.actionId, pair.handover.actionId], source: pair.field.source,
      note: 'Use the earned object at the coat, restore a saved campaign, and select its observation at the receiving bench in another district.',
    });
  }
  routes.push({
    id: 'two-coats-ferry',
    title: 'From the wet sleeve to the fare window',
    beats: ['returned-coat.hook.print', 'returned-coat.hook.fare'],
    source: 'tools/return-coat-journey.mjs',
    note: 'The Guardian transfers the pear to a clean sleeve before following Kip to the ferry clerk. Two separate operations open the hearing with no keepsake required.',
  });
  routes.push({
    id: 'rain-score-foyer',
    title: 'From a second explanation to the keeper’s curtain call',
    beats: ['returned-coat.rain.stage.twocauses', 'returned-coat.rain.stage'],
    source: 'tools/return-coat-journey.mjs',
    note: 'The Guardian receives the first score from the coat rail, reproduces its sound with a different gesture in the foyer and issues the keeper’s working demonstration.',
  });
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
