/**
 * Runtime validation of content packs and saved campaign state.
 *
 * TypeScript types are erased at runtime, so JSON loaded from disk or storage
 * must be checked here (spec 23.2). A failure returns readable problems; the
 * caller shows a recoverable error and never silently resets progress.
 */
import type { Condition, ContentPack, Effect, Weave } from './types';
import { ATLS, CONCEPTS, DIARY_EVENT_KINDS, DIARY_EVENT_OUTCOMES, PROFILE } from './types';
import { SUBJECTS } from './curriculum';
import { dailyPrompts } from './dive';
import { chordFigure, panes, runSorter, runSurvey, sightBlock, translateLine, judgeFrame, shepardParts, brier } from './puzzles';
import { openCombinations } from './lock';
import { BLOOM, FINK, FRAMEWORK, SOLO } from './learningLevels';
import { STORY_MOTIFS } from './storyMotifs';
import { hasSpecimen, specimenToolId } from './specimenGear';

const MAX_TEXT = 2000;
const CLAIM_KINDS = ['observation', 'interpretation', 'value', 'simulation'];
const HIST_LABELS = ['documented', 'reconstruction', 'scholarly-interpretation', 'imagined-alternate', 'fictional-world'];

export function validateCampaign(s: any): string[] {
  const p: string[] = [];
  if (!s || typeof s !== 'object') return ['state is not an object'];
  const need: [string, string][] = [
    ['schema', 'number'], ['contentVersion', 'number'], ['mapId', 'string'], ['marks', 'number'], ['playSeconds', 'number'],
  ];
  for (const [k, t] of need) if (typeof s[k] !== t) p.push(`${k} must be a ${t}`);
  if (!s.player || typeof s.player.name !== 'string' || s.player.name.length > 40) p.push('player.name invalid');
  if (s.player && (typeof s.player.look !== 'string' || s.player.look.length > 80)) p.push('player.look invalid');
  const pr = s.player?.pronouns;
  if (!pr || !['subject', 'object', 'possessive'].every((k) => typeof pr[k] === 'string' && pr[k].length >= 1 && pr[k].length <= 16)) p.push('player.pronouns invalid');
  if (s.player && s.player.origin !== null && typeof s.player.origin !== 'string') p.push('player.origin invalid');
  if (!s.pos || typeof s.pos.x !== 'number' || typeof s.pos.y !== 'number') p.push('pos invalid');
  for (const k of ['flags', 'inventory', 'relations', 'forge', 'events']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) p.push(`${k} must be an object`);
  for (const k of ['journal', 'notes', 'cards', 'objectivesDone']) if (!Array.isArray(s[k])) p.push(`${k} must be a list`);
  const diary = s.adventureDiary;
  const isDate = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
  const noteKinds = ['note', 'reflection', 'question'];
  if (!Array.isArray(diary?.entries) || diary.entries.some((entry: any) =>
    !entry || !['quest', 'choice', 'experience'].includes(entry.kind) || !isDate(entry.at)
    || !['id', 'title', 'text', 'mapId'].every((key) => typeof entry[key] === 'string'))) p.push('adventure journal entries invalid');
  else if (new Set(diary.entries.map((entry: any) => entry.id)).size !== diary.entries.length || diary.entries.some(({ event }: any) =>
    event !== undefined && (!event || !DIARY_EVENT_KINDS.includes(event.kind) || typeof event.key !== 'string' || typeof event.ref !== 'string'
      || (event.completedObjective !== undefined && typeof event.completedObjective !== 'string')
      || (event.outcome !== undefined && !DIARY_EVENT_OUTCOMES.includes(event.outcome))
      || (event.sourceIds !== undefined && (!Array.isArray(event.sourceIds) || event.sourceIds.some((id: unknown) => typeof id !== 'string'))))))
    p.push('adventure journal event details invalid');
  if (!Array.isArray(diary?.noteDetails) || diary.noteDetails.length !== s.notes?.length || diary.noteDetails.some((note: any) =>
    !note || !noteKinds.includes(note.kind) || (note.at !== null && !isDate(note.at))
    || (note.mapId !== null && typeof note.mapId !== 'string') || typeof note.resolved !== 'boolean')) p.push('adventure journal note details invalid');
  const responses = diary?.reflectionResponses;
  if (!isObject(responses) || Object.values(responses).some((group) => !isObject(group)
    || Object.values(group).some((text) => typeof text !== 'string'))) p.push('adventure journal responses invalid');
  const draft = diary?.noteDraft;
  if (draft !== null && (!isObject(draft) || typeof draft.kind !== 'string' || !noteKinds.includes(draft.kind)
    || typeof draft.text !== 'string' || (draft.at !== undefined && !isDate(draft.at))
    || (draft.mapId !== undefined && typeof draft.mapId !== 'string'))) p.push('adventure journal draft invalid');
  const writing = diary?.portfolioWriting;
  if (!isObject(writing) || Object.values(writing).some((entry) => !isObject(entry) || typeof entry.title !== 'string'
    || typeof entry.text !== 'string' || typeof entry.mapId !== 'string' || !isDate(entry.at) || (entry.draft !== undefined && entry.draft !== true)))
    p.push('adventure journal portfolio writing invalid');
  if (Array.isArray(s.notes) && s.notes.some((note: unknown) => typeof note !== 'string')) p.push('adventure journal notes invalid');
  if (s.inventory) for (const [id, q] of Object.entries(s.inventory)) if (!Number.isInteger(q) || (q as number) < 0 || (q as number) > 999) p.push(`bad quantity for ${id}`);
  if (typeof s.marks === 'number' && (s.marks < 0 || s.marks > 1_000_000)) p.push('marks out of range');
  if (s.events && (!Array.isArray(s.events.seen) || typeof s.events.clock !== 'number')) p.push('events invalid');
  if (s.showdown !== null && (typeof s.showdown !== 'object' || typeof s.showdown?.id !== 'string')) p.push('showdown invalid');
  if (!s.rng || typeof s.rng.seed !== 'number' || typeof s.rng.state !== 'number') p.push('rng invalid');
  return p;
}

export function validateContent(pack: ContentPack): string[] {
  const p: string[] = [];
  const ids = new Set<string>();
  const dup = (kind: string, id: string) => {
    const key = `${kind}:${id}`;
    if (ids.has(key)) p.push(`duplicate ${kind} id ${id}`);
    ids.add(key);
  };
  const text = (where: string, t: string | undefined) => {
    if (typeof t !== 'string' || t.length === 0) p.push(`${where}: missing text`);
    else if (t.length > MAX_TEXT) p.push(`${where}: text too long`);
  };

  const sources = new Set(pack.sources.map((s) => s.id));
  const citationSources = new Set(pack.sources.filter((s) => s.mla).map((s) => s.id));
  const cards = new Set(pack.cards.map((c) => c.id));
  const items = new Set(pack.items.map((i) => i.id));
  const nodes = new Set(pack.dialogue.map((n) => n.id));
  const chars = new Set(pack.characters.map((c) => c.id));
  const criteria = new Set(pack.criteria.map((c) => c.id));
  const objectives = new Set(pack.missions.flatMap((m) => m.objectives.map((o) => o.id)));
  const journal = new Set(pack.journal.map((j) => j.id));
  const kits = new Set(pack.labelKits.map((k) => k.id));
  const mis = new Set(pack.misconceptions.map((m) => m.id));
  const pf = new Set(pack.portfolio.map((x) => x.id));
  const origins = new Set((pack.origins ?? []).map((o) => o.id));

  pack.sources.forEach((s) => {
    dup('source', s.id);
    if (!/^https:\/\//.test(s.url)) p.push(`source ${s.id}: url must be https`);
    if (!s.mla) return;
    text(`source ${s.id} MLA title`, s.mla.title);
    text(`source ${s.id} MLA container`, s.mla.container);
    if (s.mla.repository !== undefined) text(`source ${s.id} MLA repository`, s.mla.repository);
    if (!['page', 'artwork'].includes(s.mla.kind)) p.push(`source ${s.id}: unknown MLA source kind`);
    if (s.mla.kind === 'page' && s.mla.workDate) p.push(`source ${s.id}: an artwork date belongs to the artwork entry`);
    if (s.mla.showAccessDate && !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(s.accessed)) {
      p.push(`source ${s.id}: access date must use YYYY-MM-DD`);
    }
  });
  pack.cards.forEach((c) => {
    dup('card', c.id); text(`card ${c.id}`, c.text);
    if (!CLAIM_KINDS.includes(c.claimKind)) p.push(`card ${c.id}: bad claimKind`);
    if (!HIST_LABELS.includes(c.historicalLabel)) p.push(`card ${c.id}: bad historicalLabel`);
    if (c.historicalLabel === 'documented' && c.sources.length === 0) p.push(`card ${c.id}: documented card needs a source`);
    c.sources.forEach((s) => sources.has(s) || p.push(`card ${c.id}: unknown source ${s}`));
  });
  pack.exhibits.forEach((e) => {
    dup('exhibit', e.id); text(`exhibit ${e.id}`, e.summary); text(`exhibit ${e.id} alt`, e.altText);
    if (!cards.has(e.grantsCard)) p.push(`exhibit ${e.id}: unknown card ${e.grantsCard}`);
    if (e.historicalLabel === 'documented' && e.sources.length === 0) p.push(`exhibit ${e.id}: documented exhibit needs a source`);
    if (e.labelKit && !kits.has(e.labelKit)) p.push(`exhibit ${e.id}: unknown label kit ${e.labelKit}`);
    e.sources.forEach((s) => sources.has(s) || p.push(`exhibit ${e.id}: unknown source ${s}`));
    if (e.specimen) {
      const { key, institution, accession, source, objective, pixelAsset } = e.specimen;
      dup('specimen', key.trim().toLowerCase());
      if (!/^[a-z0-9-]+:[a-z0-9./_-]+$/.test(key) || !institution.trim() || !accession.trim()) {
        p.push(`exhibit ${e.id}: a specimen needs a stable key, institution and accession`);
      }
      if (e.historicalLabel !== 'documented' || !/\d/.test(e.dateText) || !e.dateKind.trim()) {
        p.push(`exhibit ${e.id}: a specimen needs a documented, bounded date`);
      }
      if (!e.sources.includes(source)) p.push(`exhibit ${e.id}: specimen source must be listed with the exhibit`);
      if (!objectives.has(objective)) p.push(`exhibit ${e.id}: unknown specimen use ${objective}`);
      for (const person of e.specimen.people ?? []) {
        if (!person.name.trim() || !person.role.trim() || !sources.has(person.source)) p.push(`exhibit ${e.id}: incomplete or unsourced person ${person.name}`);
      }
      if (pixelAsset && !/^specimens\/[a-z0-9][a-z0-9._-]*\.(png|webp|jpg)$/.test(pixelAsset)) {
        p.push(`exhibit ${e.id}: specimen image must be a local asset`);
      }
    }
  });
  pack.items.forEach((i) => dup('item', i.id));
  pack.characters.forEach((c) => {
    dup('character', c.id);
    c.talk.forEach((t) => { nodes.has(t.node) || p.push(`character ${c.id}: unknown node ${t.node}`); cond(t.if, `character ${c.id}`); });
  });
  pack.journal.forEach((j) => {
    dup('journal', j.id);
    text(`journal ${j.id}`, j.text);
    for (const reading of j.readings ?? []) {
      cond(reading.when, `journal ${j.id}`);
      text(`journal ${j.id}`, reading.text);
    }
  });
  // Origins (spec 35.1): each gives a starting Lens hint and a unique option in each world, never an advantage.
  (pack.origins ?? []).forEach((o) => {
    dup('origin', o.id); text(`origin ${o.id}`, o.background);
    if (!journal.has(o.journal)) p.push(`origin ${o.id}: unknown journal ${o.journal}`);
    const uses = pack.dialogue.flatMap((n) => n.options ?? []).filter((op) => JSON.stringify(op.if ?? {}).includes(`"origin":"${o.id}"`));
    if (uses.length < 2) p.push(`origin ${o.id}: needs a unique dialogue option in each world (found ${uses.length})`);
    if (uses.some((op) => (op.effects ?? []).some((e) => 'credit' in e || 'addMarks' in e || 'addCard' in e))) p.push(`origin ${o.id}: origin options must not give an advantage`);
  });
  pack.criteria.forEach((c) => { dup('criterion', c.id); if (!(c.maximum > 0 && c.maximum <= 100)) p.push(`criterion ${c.id}: maximum out of range`); });

  function cond(c: Condition | undefined, where: string): void {
    if (!c) return;
    if ('all' in c) return c.all.forEach((x) => cond(x, where));
    if ('any' in c) return c.any.forEach((x) => cond(x, where));
    if ('not' in c) return cond(c.not, where);
    if ('item' in c && !items.has(c.item)) p.push(`${where}: unknown item ${c.item}`);
    if ('card' in c && !cards.has(c.card)) p.push(`${where}: unknown card ${c.card}`);
    if ('objective' in c && !objectives.has(c.objective)) p.push(`${where}: unknown objective ${c.objective}`);
    if ('origin' in c && !origins.has(c.origin)) p.push(`${where}: unknown origin ${c.origin}`);
    const known = ['flag', 'flagSet', 'num', 'item', 'marks', 'card', 'objective', 'origin'];
    if (!Object.keys(c).some((k) => known.includes(k))) p.push(`${where}: unknown condition ${JSON.stringify(c)}`);
  }
  function eff(list: Effect[] | undefined, where: string): void {
    for (const e of list ?? []) {
      const k = Object.keys(e)[0];
      const known = ['setFlag', 'addNum', 'giveItem', 'takeItem', 'addMarks', 'addCard', 'journal', 'relation', 'companion', 'credit', 'checkpoint', 'signal', 'portfolio'];
      if (!known.includes(k)) { p.push(`${where}: unknown effect ${k}`); continue; }
      if ('giveItem' in e && !items.has(e.giveItem)) p.push(`${where}: unknown item ${e.giveItem}`);
      if ('takeItem' in e && !items.has(e.takeItem)) p.push(`${where}: unknown item ${e.takeItem}`);
      if ('addCard' in e && !cards.has(e.addCard)) p.push(`${where}: unknown card ${e.addCard}`);
      if ('journal' in e && !journal.has(e.journal)) p.push(`${where}: unknown journal ${e.journal}`);
      if ('credit' in e && !criteria.has(e.credit)) p.push(`${where}: unknown criterion ${e.credit}`);
      if ('relation' in e && !chars.has(e.relation)) p.push(`${where}: unknown character ${e.relation}`);
      if ('companion' in e && e.companion !== null && !chars.has(e.companion)) p.push(`${where}: unknown companion`);
      if ('signal' in e && !mis.has(e.signal)) p.push(`${where}: unknown misconception ${e.signal}`);
      if ('portfolio' in e && !pf.has(e.portfolio)) p.push(`${where}: unknown portfolio template ${e.portfolio}`);
    }
  }

  pack.dialogue.forEach((n) => {
    dup('node', n.id); text(`node ${n.id}`, n.text);
    if (n.citationSource && !citationSources.has(n.citationSource)) p.push(`node ${n.id}: unknown MLA source ${n.citationSource}`);
    if (n.motif !== undefined && !STORY_MOTIFS.includes(n.motif)) p.push(`node ${n.id}: unknown story motif ${n.motif}`);
    if (n.speaker !== 'narrator' && n.speaker !== 'player' && n.speaker !== 'lumen' && !n.speaker.startsWith('mentor:') && !chars.has(n.speaker)) p.push(`node ${n.id}: unknown speaker ${n.speaker}`);
    if (n.next && !nodes.has(n.next)) p.push(`node ${n.id}: unknown next ${n.next}`);
    eff(n.effects, `node ${n.id}`);
    openable(n.open, `node ${n.id}`);
    (n.options ?? []).forEach((o, i) => {
      text(`node ${n.id} option ${i}`, o.text);
      if (o.next && !nodes.has(o.next)) p.push(`node ${n.id} option ${i}: unknown next ${o.next}`);
      cond(o.if, `node ${n.id} option ${i}`); eff(o.effects, `node ${n.id} option ${i}`); openable(o.open, `node ${n.id} option ${i}`);
    });
  });
  pack.missions.forEach((m) => {
    dup('mission', m.id);
    if (m.caseVisits) {
      const optional = new Set(m.objectives.filter((o) => !o.essential).map(({ id }) => id));
      if (!m.caseVisits.length || m.caseVisits.some((visit) => !visit.length || new Set(visit).size !== visit.length || visit.some((id) => !optional.has(id)))) {
        p.push(`mission ${m.id}: every modeled case visit needs distinct optional objectives from that mission`);
      }
    }
    m.objectives.forEach((o) => {
      const ways = o.kq ? [o.kq, ...(o.questionWays ?? [])] : o.questionWays ?? [];
      for (const way of ways) if (!pack.questions.some((q) => q.id === way.id)) p.push(`objective ${o.id}: unknown knowledge question ${way.id}`);
      dup('objective', o.id); cond(o.done, `objective ${o.id}`); cond(o.visible, `objective ${o.id}`); eff(o.onComplete, `objective ${o.id}`); weave(o.weave, `objective ${o.id}`, true); });
  });
  pack.hints.forEach((h) => { dup('hint', h.id); if (!objectives.has(h.objective)) p.push(`hint ${h.id}: unknown objective`); cond(h.if, `hint ${h.id}`); });
  pack.awards.forEach((a) => {
    if (!['concept-award', 'skill-milestone', 'badge'].includes(a.kind)) p.push(`award ${a.id}: unknown kind ${a.kind}`);
    dup('award', a.id); cond(a.when, `award ${a.id}`);
    a.criteria.forEach((c) => criteria.has(c) || p.push(`award ${a.id}: unknown criterion ${c}`));
  });
  pack.offers.forEach((o) => { dup('offer', o.id); items.has(o.item) || p.push(`offer ${o.id}: unknown item`); cond(o.if, `offer ${o.id}`); eff(o.effects, `offer ${o.id}`); });
  pack.glossary.forEach((g) => {
    dup('glossary', g.id); text(`glossary ${g.id}`, g.text);
    if (!g.match.length || g.match.some((m) => m !== m.toLowerCase())) p.push(`glossary ${g.id}: match forms must be lower case`);
    g.examples.forEach((e, i) => cond(e.if, `glossary ${g.id} example ${i}`));
  });
  // Exhibition alcoves (SYM-001): symbols never light; every object can complete; no hidden right answer.
  (pack.alcoves ?? []).forEach((a) => {
    dup('alcove', a.id); text(`alcove ${a.id}`, a.prompt); weave(a.weave, `alcove ${a.id}`, true); eff(a.onComplete, `alcove ${a.id}`);
    if (a.symbols.length < 2) p.push(`alcove ${a.id}: needs at least two symbols (the Symbol Mirage lesson)`);
    a.objects.forEach((o) => {
      if (!cards.has(o.card)) p.push(`alcove ${a.id}: unknown card ${o.card}`);
      if (!o.links.some((l) => l.kind === 'specific')) p.push(`alcove ${a.id} ${o.card}: needs a specific link`);
      if (!o.links.some((l) => l.kind === 'checklist')) p.push(`alcove ${a.id} ${o.card}: needs a checklist link (Checklist Golem)`);
      if (o.implications.filter((i) => i.ok).length < 2) p.push(`alcove ${a.id} ${o.card}: needs two good implications (OPEN-001)`);
      if (!o.implications.some((i) => !i.ok)) p.push(`alcove ${a.id} ${o.card}: needs a 'so what?' trap (So-What Sphinx)`);
    });
  });
  const skillIds = new Set((pack.skills ?? []).map((k) => k.id));
  const domainIds = new Set((pack.skillDomains ?? []).map((d) => d.id));
  (pack.skills ?? []).forEach((k) => { dup('skill', k.id); if (!domainIds.has(k.domain)) p.push(`skill ${k.id}: unknown domain ${k.domain}`); });
  pack.missions.forEach((m) => m.objectives.forEach((o) => (o.skills ?? []).forEach((k) => skillIds.has(k) || p.push(`objective ${o.id}: unknown skill ${k}`))));
  (pack.puzzles ?? []).forEach((z) => {
    dup('puzzle', z.id); text(`puzzle ${z.id}`, z.intro); weave(z.weave, `puzzle ${z.id}`, true); eff(z.onComplete, `puzzle ${z.id}`);
    if (z.type === 'rounds') z.rounds.forEach((r, i) => { if (r.options.filter((o) => o.ok).length !== 1) p.push(`puzzle ${z.id} round ${i + 1}: needs exactly one correct option`); });
    else if (z.type === 'restore') {
      const ids = z.layers.map((l) => l.id);
      if (ids.length < 2 || new Set(ids).size !== ids.length) p.push(`puzzle ${z.id}: needs two or more layers with unique ids`);
      if (z.methods.length < 2) p.push(`puzzle ${z.id}: needs two or more methods`);
      z.methods.forEach((m) => {
        const all = [...m.keeps, ...m.loses];
        if (all.length !== ids.length || new Set(all).size !== all.length || !all.every((x) => ids.includes(x))) p.push(`puzzle ${z.id} method ${m.id}: keeps and loses must name every layer once`);
        if (!m.labels.some((l) => l.honest) || !m.labels.some((l) => !l.honest)) p.push(`puzzle ${z.id} method ${m.id}: needs an honest label and a label that is not`);
        m.labels.forEach((l, i) => { if (!l.why.trim()) p.push(`puzzle ${z.id} method ${m.id} label ${i + 1}: needs a reason`); });
      });
    }
    else if (z.type === 'survey') {
      const ids = new Set(z.people.map((x) => x.id));
      z.people.forEach((x) => x.group in z.groups || p.push(`puzzle ${z.id}: unknown group ${x.group}`));
      z.samples.forEach((sm) => sm.people.forEach((x) => ids.has(x) || p.push(`puzzle ${z.id} ${sm.id}: unknown person ${x}`)));
      if (!z.wordings.some((w) => w.id === z.fair.wording && w.lean === 'none') || !z.samples.some((sm) => sm.id === z.fair.sample)) p.push(`puzzle ${z.id}: the fair survey must use a plain question and a listed group`);
      else {
        const all = z.people.filter((x) => x.yes).length / z.people.length, fair = runSurvey(z, z.fair.wording, z.fair.sample);
        if (Math.abs(fair.yes / fair.total - all) > 0.15) p.push(`puzzle ${z.id}: the fair sample does not look like the whole town`);
      }
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'forecast') {
      if (z.days.length < 8) p.push(`puzzle ${z.id}: needs eight or more days`);
      if (!z.days.some((d) => d.rain) || !z.days.some((d) => !d.rain)) p.push(`puzzle ${z.id}: needs both wet and dry days`);
      if (!z.choices.length || z.choices.some((c) => !(c > 0 && c < 100))) p.push(`puzzle ${z.id}: chances must be between 0 and 100`);
      if (z.days.some((d) => !(d.almanac > 0 && d.almanac < 1))) p.push(`puzzle ${z.id}: almanac chances must be between 0 and 1`);
      else if (brier(z.days.map((d) => d.almanac), z.days.map((d) => d.rain)) >= 0.25) p.push(`puzzle ${z.id}: the clues must help (the almanac must beat 'always 50%')`);
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'shepard') {
      if (!(z.steps >= 6 && z.octaves >= 4 && z.base >= 20 && z.base * 2 ** z.octaves <= 20000)) p.push(`puzzle ${z.id}: steps, base and octaves must be sensible and audible`);
      else if (JSON.stringify(shepardParts(0, z.steps, z.base, z.octaves)) !== JSON.stringify(shepardParts(z.steps, z.steps, z.base, z.octaves))) p.push(`puzzle ${z.id}: the last step must match the first`);
      if (z.guesses.length < 2) p.push(`puzzle ${z.id}: needs two or more answers to 'what did you hear?'`);
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'frame') {
      const ids = z.items.map((i) => i.id);
      if (z.frame.w > z.scene.w || z.frame.h > z.scene.h) p.push(`puzzle ${z.id}: the frame is larger than the scene`);
      z.items.forEach((i) => { if (i.x < 0 || i.y < 0 || i.x + i.w > z.scene.w || i.y + i.h > z.scene.h) p.push(`puzzle ${z.id} item ${i.id}: outside the scene`); });
      z.briefs.forEach((b) => {
        [...b.need, ...b.avoid].forEach((x) => ids.includes(x) || p.push(`puzzle ${z.id} brief ${b.id}: unknown item ${x}`));
        let can = false;
        for (let x = 0; x + z.frame.w <= z.scene.w && !can; x++) for (let y = 0; y + z.frame.h <= z.scene.h && !can; y++) if (judgeFrame(z, b.id, x, y).ok) can = true;
        if (!can) p.push(`puzzle ${z.id} brief ${b.id}: no frame position works`);
      });
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'translate') {
      const needIds = z.parts.map((n) => n.id);
      z.words.forEach((w) => {
        if (w.choices.length < 2) p.push(`puzzle ${z.id} word ${w.id}: needs two or more renderings`);
        if (!z.source.includes(w.word)) p.push(`puzzle ${z.id} word ${w.id}: ${w.word} is not in the source`);
        if (!z.frame.includes(`{${w.id}}`)) p.push(`puzzle ${z.id} word ${w.id}: not in the frame`);
        w.choices.forEach((c) => c.keeps.forEach((k) => needIds.includes(k) || p.push(`puzzle ${z.id} word ${w.id}: unknown difference ${k}`)));
      });
      // Search every translation: more than one must keep everything within the word limit.
      let good = 0;
      const walk = (i: number, picks: number[]): void => {
        if (i === z.words.length) { const r = translateLine(z, picks); if (!r.over && !r.lost.length) good++; return; }
        z.words[i].choices.forEach((_, c) => walk(i + 1, [...picks, c]));
      };
      if (z.words.length && z.words.every((w) => w.choices.length)) {
        walk(0, []);
        if (good < 2) p.push(`puzzle ${z.id}: needs two or more translations that keep everything within ${z.budget} words`);
        const plain = translateLine(z, z.words.map(() => 0));
        if (!plain.lost.length) p.push(`puzzle ${z.id}: the first rendering of every word must lose something`);
      }
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'echo') {
      if (!(z.distance > 5 && z.speed > 100 && z.minTimes >= 2)) p.push(`puzzle ${z.id}: distance, speed and minTimes must be sensible`);
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'sorter') {
      const ids = new Set(z.fruits.map((f) => f.id));
      [...z.crate, ...z.basket, ...z.start].forEach((x) => ids.has(x) || p.push(`puzzle ${z.id}: unknown fruit ${x}`));
      z.fruits.forEach((f) => f.farm in z.farms || p.push(`puzzle ${z.id}: unknown farm ${f.farm}`));
      if (runSorter(z, z.start).right === z.basket.length) p.push(`puzzle ${z.id}: the starting examples must fail`);
      // Some choice of examples from the crate must sort the whole basket right.
      const crate = z.crate; let found = false;
      const pick = (from: number, chosen: string[]) => {
        if (found) return;
        if (chosen.length && runSorter(z, chosen).right === z.basket.length) { found = true; return; }
        if (chosen.length === z.slots) return;
        for (let i = from; i < crate.length; i++) pick(i + 1, [...chosen, crate[i]]);
      };
      pick(0, []);
      if (!found) p.push(`puzzle ${z.id}: no set of examples from the crate sorts the basket right`);
      if (z.diagnose.filter((r) => r.honest).length !== 1 || z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair diagnosis and one fair reflection`);
    }
    else if (z.type === 'mapmaker') {
      const ids = new Set(z.layers.map((l) => l.id));
      z.audiences.forEach((a) => {
        if (a.need.length > z.maxLayers) p.push(`puzzle ${z.id} ${a.id}: needs more layers than the sheet holds`);
        a.need.forEach((n) => ids.has(n) || p.push(`puzzle ${z.id} ${a.id}: unknown layer ${n}`));
      });
      if (z.layers.length <= z.maxLayers) p.push(`puzzle ${z.id}: the sheet must be too small for every layer`);
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'conjecture') {
      if (new Set(z.angles.map((a) => ((a % 360) + 360) % 360)).size !== z.angles.length) p.push(`puzzle ${z.id}: points must be at different angles`);
      for (let n = 1; n <= z.angles.length; n++) {
        const f = chordFigure(z.angles.slice(0, n));
        if (!f.general || 1 + f.chords + f.crossings !== panes(n)) p.push(`puzzle ${z.id}: the first ${n} points are not in general position`);
      }
      if (z.predictAt < 2 || z.predictAt > z.angles.length) p.push(`puzzle ${z.id}: predictAt must be a point the player can add`);
      if (z.reflect.filter((r) => r.honest).length !== 1) p.push(`puzzle ${z.id}: needs exactly one fair reflection`);
    }
    else if (z.type === 'sightlines') {
      const spots = new Map(z.spots.map((x) => [x.id, x]));
      let seen = 0, unseen = 0;
      z.witnesses.forEach((w) => w.claims.forEach((c, i) => {
        const sp = spots.get(c.spot);
        if (!sp) { p.push(`puzzle ${z.id} ${w.id} claim ${i + 1}: unknown spot ${c.spot}`); return; }
        const could = !sightBlock(z.blocks, w.x, w.y, sp.x, sp.y);
        if (could) seen++; else unseen++;
        if (!could && !c.heard) p.push(`puzzle ${z.id} ${w.id} claim ${i + 1}: cannot be seen, so say where the witness heard it`);
        if (could && c.heard) p.push(`puzzle ${z.id} ${w.id} claim ${i + 1}: can be seen, so remove 'heard'`);
      }));
      if (!seen || !unseen) p.push(`puzzle ${z.id}: needs claims that were seen and claims that were not`);
      const supported = z.reports.filter((report) => report.honest);
      if (!supported.length) p.push(`puzzle ${z.id}: needs a supported report`);
      if (supported.length > 1 && (supported.some((report) => !report.delivery)
        || new Set(supported.map((report) => report.delivery)).size !== supported.length)) {
        p.push(`puzzle ${z.id}: each supported report needs its own delivery`);
      }
    }
    else if (z.type === 'balance') z.rounds.forEach((r, i) => {
      // Every round must balance with the trusted weights alone.
      const ws = r.weights.filter((w) => !w.untrusted).map((w) => w.mass);
      let sums = new Set([0]);
      ws.forEach((m) => { sums = new Set([...sums, ...[...sums].map((x) => Math.round((x + m) * 1000) / 1000)]); });
      if (!sums.has(Math.round(r.load.mass * 1000) / 1000)) p.push(`puzzle ${z.id} round ${i + 1}: the trusted weights cannot balance the load`);
      text(`puzzle ${z.id} round ${i + 1}`, r.success);
    });
    else {
      const ids = new Set(z.tiles.map((t) => t.id));
      z.answer.forEach((a) => ids.has(a) || p.push(`puzzle ${z.id}: unknown tile ${a}`));
      if (z.tiles.length <= z.answer.length) p.push(`puzzle ${z.id}: needs at least one tile to leave out`);
    }
  });
  const specimenTools = new Set(pack.exhibits.filter(hasSpecimen).map(({ specimen }) => specimenToolId(specimen.key)));
  (pack.keepsakes ?? []).forEach((k) => {
    dup('keepsake', k.id); cond(k.if, `keepsake ${k.id}`); text(`keepsake ${k.id}`, k.text);
    if (!specimenTools.has(k.id) && !/^[a-z0-9-]{1,24}$/.test(k.id)) p.push(`keepsake ${k.id}: id must be short lowercase words with hyphens`);
    if (k.equip !== undefined) {
      text(`field tool ${k.id} method`, k.equip?.method);
      text(`field tool ${k.id} hint`, k.equip?.hint);
    }
  });
  (pack.memories ?? []).forEach((m) => {
    dup('memory', m.id); cond(m.if, `memory ${m.id}`); text(`memory ${m.id}`, m.line);
    if (!pack.characters.some((x) => x.id === m.character)) p.push(`memory ${m.id}: unknown character ${m.character}`);
    if (m.supersedes && !pack.memories?.some((fallback) =>
      fallback.id === m.supersedes && fallback.id !== m.id && fallback.character === m.character))
      p.push(`memory ${m.id}: invalid alternate line ${m.supersedes}`);
  });
  (pack.clueBoards ?? []).forEach((b) => {
    dup('clue board', b.id); text(`clue board ${b.id}`, b.intro); weave(b.weave, `clue board ${b.id}`, true); eff(b.onComplete, `clue board ${b.id}`);
    if (!pack.showdowns.some((x) => x.id === b.showdown)) p.push(`clue board ${b.id}: unknown showdown ${b.showdown}`);
  });
  // The story (Lamp Wall, study clues, keepsake talk): keepsakes must matter, so each one must be used.
  const ks = new Set((pack.keepsakes ?? []).map((k) => k.id));
  (pack.knots ?? []).forEach((k) => { dup('knot', k.id); cond(k.if, `knot ${k.id}`); text(`knot ${k.id}`, k.lit); });
  (pack.clues ?? []).forEach((c) => {
    dup('clue', c.id); text(`clue ${c.id}`, c.text); eff(c.onRead, `clue ${c.id}`);
    c.views.forEach((v) => { if (!ks.has(v.keepsake)) p.push(`clue ${c.id}: unknown keepsake ${v.keepsake}`); text(`clue ${c.id}`, v.text); eff(v.effects, `clue ${c.id}`); });
  });
  (pack.communities ?? []).forEach((m) => {
    dup('community', m.id); text(`community ${m.id}`, m.knows); text(`community ${m.id}`, m.checks);
    m.who.forEach((w) => { if (!pack.characters.some((x) => x.id === w)) p.push(`community ${m.id}: unknown character ${w}`); });
    m.gains.forEach((g, i) => cond(g.if, `community ${m.id} gain ${i + 1}`));
  });
  (pack.secrets ?? []).forEach((x) => { dup('secret', x.id); text(`secret ${x.id}`, x.text); });
  (pack.chronicle ?? []).forEach((b) => { dup('story beat', b.id); cond(b.if, `story beat ${b.id}`); text(`story beat ${b.id}`, b.text); });
  (pack.keepsakeTalks ?? []).forEach((t) => {
    dup('keepsake talk', t.id); cond(t.if, `keepsake talk ${t.id}`);
    if (!ks.has(t.keepsake)) p.push(`keepsake talk ${t.id}: unknown keepsake ${t.keepsake}`);
    if (!pack.characters.some((x) => x.id === t.character)) p.push(`keepsake talk ${t.id}: unknown character ${t.character}`);
    if (!pack.dialogue.some((x) => x.id === t.node)) p.push(`keepsake talk ${t.id}: unknown node ${t.node}`);
  });
  (pack.keepsakes ?? []).forEach((k) => {
    if (!k.use) p.push(`keepsake ${k.id}: needs a use text`);
    const used = (pack.clues ?? []).some((c) => c.views.some((v) => v.keepsake === k.id)) || (pack.keepsakeTalks ?? []).some((t) => t.keepsake === k.id);
    if (pack.clues?.length && !used && !k.equip) p.push(`keepsake ${k.id}: needs a clue, dialogue use or field tool method`);
  });
  (pack.fray ?? []).forEach((f) => { dup('fray', f.id); text(`fray ${f.id}`, f.pattern); text(`fray ${f.id}`, f.weakness); });
  pack.showdowns.forEach((sd) => (sd.testimony?.contradictedBy ?? []).forEach((cid) => pack.cards.some((x) => x.id === cid) || p.push(`showdown ${sd.id}: testimony names unknown card ${cid}`)));
  // Lorelings (spec 36.1): every wrong note option must name a sighting that shows it is wrong.
  (pack.lorelings ?? []).forEach((l) => {
    dup('loreling', l.id); text(`loreling ${l.id}`, l.intro); weave(l.weave, `loreling ${l.id}`, true); eff(l.onComplete, `loreling ${l.id}`);
    const sids = new Set(l.sightings.map((x) => x.id));
    if (l.sightings.length < l.minSightings || l.minSightings < 2) p.push(`loreling ${l.id}: needs at least 2 sightings to compare`);
    l.questions.forEach((q) => {
      if (!q.options.some((o) => o.id === q.answer)) p.push(`loreling ${l.id} ${q.id}: unknown answer`);
      q.options.filter((o) => o.id !== q.answer).forEach((o) => { if (!o.contradicts || !sids.has(o.contradicts)) p.push(`loreling ${l.id} ${q.id}.${o.id}: a wrong option must name the sighting that contradicts it`); });
    });
    if (!l.offer.options.some((o) => o.id === l.offer.answer)) p.push(`loreling ${l.id}: unknown offer answer`);
    l.skills.forEach((k) => skillIds.has(k) || p.push(`loreling ${l.id}: unknown skill ${k}`));
    if (!l.forms.length || l.forms.length > 3) p.push(`loreling ${l.id}: needs 1 to 3 forms`);
    if (!l.names.length) p.push(`loreling ${l.id}: needs suggested names`);
  });
  pack.locks.forEach((l) => {
    dup('lock', l.id); weave(l.weave, `lock ${l.id}`, true); eff(l.onOpen, `lock ${l.id}`);
    if (!SUBJECTS[l.subject]) p.push(`lock ${l.id}: unknown subject ${l.subject}`);
    // OPEN-001: more than one question must open the lock.
    if (openCombinations(l) < 2) p.push(`lock ${l.id}: at least two questions must open it`);
    l.parts.forEach((pt) => pt.options.forEach((o) => { text(`lock ${l.id} ${pt.id}.${o.id}`, o.text); if (!o.ok && !o.why) p.push(`lock ${l.id} ${pt.id}.${o.id}: a closed option needs a reason`); }));
  });
  pack.labelKits.forEach((k) => {
    dup('labelKit', k.id); weave(k.weave, `label kit ${k.id}`, true); eff(k.onHold, `label kit ${k.id}`);
    const subj = new Set(k.subjects.map((x) => x.id)), crit = new Set(k.criteria.map((x) => x.id));
    k.criteria.forEach((c) => { if (c.signal && !mis.has(c.signal)) p.push(`label kit ${k.id}: unknown signal ${c.signal}`); });
    k.supports.forEach((x) => {
      if (!subj.has(x.subject) || !crit.has(x.criterion)) p.push(`label kit ${k.id}: support for unknown part ${x.subject}/${x.criterion}`);
      x.cards.forEach((c) => cards.has(c.card) || p.push(`label kit ${k.id}: unknown card ${c.card}`));
      if (x.signal && !mis.has(x.signal)) p.push(`label kit ${k.id}: unknown signal ${x.signal}`);
    });
    if (!k.limits.some((l) => l.lower === 0)) p.push(`label kit ${k.id}: needs a "no limit" option`);
    // OPEN-001: at least two different criteria must be able to hold.
    const holding = new Set(k.supports.filter((x) => {
      const f = k.criteria.find((c) => c.id === x.criterion)!.force;
      const best = Math.max(...k.limits.map((l) => l.lower));
      return x.cards.reduce((a, c) => a + c.weight, 0) + best >= f;
    }).map((x) => x.criterion));
    if (holding.size < 2) p.push(`label kit ${k.id}: fewer than two criteria can hold (hidden correct answer)`);
  });
  pack.showdowns.forEach((sd) => {
    dup('showdown', sd.id); weave(sd.weave, `showdown ${sd.id}`, true);
    if (!chars.has(sd.opponent)) p.push(`showdown ${sd.id}: unknown opponent`);
    const allCards = [...sd.opponentClaim.links.flatMap((l) => l.weakTo), ...sd.opponentClaim.counterexamples.map((c) => c.card), ...sd.playerClaims.flatMap((c) => c.supports.map((x) => x.card))];
    allCards.forEach((c) => cards.has(c) || p.push(`showdown ${sd.id}: unknown card ${c}`));
    sd.playerClaims.forEach((c) => { if (c.signal && !mis.has(c.signal)) p.push(`showdown ${sd.id}: unknown signal ${c.signal}`); });
    if (sd.dodgeSignal && !mis.has(sd.dodgeSignal)) p.push(`showdown ${sd.id}: unknown dodge signal ${sd.dodgeSignal}`);
    sd.witnesses.forEach((w) => cond(w.if, `showdown ${sd.id} witness ${w.id}`));
    sd.script.forEach((m) => { if (m.move === 'point' && !sd.fairPoints.some((f) => f.id === m.point)) p.push(`showdown ${sd.id}: unknown fair point ${m.point}`); });
    for (const [k, o] of Object.entries(sd.outcomes)) { text(`showdown ${sd.id} outcome ${k}`, o.text); eff(o.effects, `showdown ${sd.id} outcome ${k}`); }
    if (sd.playerClaims.length < 2) p.push(`showdown ${sd.id}: needs at least two claims (bold and qualified)`);
  });
  pack.threads.forEach((t) => {
    dup('thread', t.id); weave(t.weave, `thread ${t.id}`, true); text(`thread ${t.id} limit`, t.limit);
    t.nodes.forEach((n) => { if (n.card && !cards.has(n.card)) p.push(`thread ${t.id}: unknown card ${n.card}`); });
    if (!t.nodes.some((n) => n.id === t.gap.after)) p.push(`thread ${t.id}: gap after unknown node`);
  });
  pack.moments.forEach((m) => { dup('moment', m.id); cond(m.when, `moment ${m.id}`); if (!PROFILE.includes(m.attribute)) p.push(`moment ${m.id}: bad attribute`); });
  pack.misconceptions.forEach((m) => {
    dup('misconception', m.id);
    for (const k of ['signal', 'worldResponse', 'reflection', 'teacherMove'] as const) text(`misconception ${m.id} ${k}`, m[k]);
    m.concepts.forEach((c) => CONCEPTS.includes(c) || p.push(`misconception ${m.id}: bad concept ${c}`));
  });
  pack.portfolio.forEach((x) => { dup('portfolio', x.id); weave(x.weave, `portfolio ${x.id}`, false); });
  pack.events.forEach((e) => {
    dup('event', e.id); cond(e.when, `event ${e.id}`); text(`event ${e.id} calm`, e.calm);
    if (!nodes.has(e.node)) p.push(`event ${e.id}: unknown node ${e.node}`);
    // WEAVE-018: a course link, or a marked lucky break.
    if (!e.luck && (!e.weave.concepts.length)) p.push(`event ${e.id}: needs a course link or luck: true`);
    weave(e.weave, `event ${e.id}`, false);
  });

  function openable(o: string | undefined, where: string): void {
    if (!o) return;
    const [kind, id] = o.split(':');
    const ok = kind === 'forge' || kind === 'assay'
      || (kind === 'showdown' && pack.showdowns.some((x) => x.id === id))
      || (kind === 'label' && kits.has(id))
      || (kind === 'lock' && pack.locks.some((x) => x.id === id))
      || (kind === 'thread' && pack.threads.some((x) => x.id === id));
    if (!ok) p.push(`${where}: cannot open "${o}"`);
  }
  function weave(w: Weave | undefined, where: string, needAtl: boolean): void {
    if (!w) { if (needAtl) p.push(`${where}: missing weave (ATL ribbon, WEAVE-016)`); return; }
    w.concepts.forEach((c) => CONCEPTS.includes(c) || p.push(`${where}: bad concept ${c}`));
    w.atl.forEach((a) => ATLS.includes(a) || p.push(`${where}: bad ATL ${a}`));
    if (needAtl && !w.atl.length) p.push(`${where}: needs at least one ATL category (WEAVE-016)`);
    (w.subjects ?? []).forEach((x) => x in SUBJECTS || p.push(`${where}: unknown subject ${x}`));
    if (w.framework !== undefined && (!Array.isArray(w.framework) || w.framework.some((part) => !FRAMEWORK.includes(part)))) {
      p.push(`${where}: unknown knowledge framework part`);
    }
    if (w.minutes !== undefined && (!Number.isFinite(w.minutes) || w.minutes <= 0)) p.push(`${where}: invalid duration`);
    if (w.thinking !== undefined) {
      const tag = w.thinking;
      if (!tag || ![1, 2, 3, 4].includes(tag.dok) || !BLOOM.includes(tag.bloom) || !FINK.includes(tag.fink) || !SOLO.includes(tag.solo)) {
        p.push(`${where}: invalid thinking levels`);
      }
    }
  }
  // RECUR-035 (start): every misconception has at least one place in play that can signal it.
  const { misconceptions: _m, ...rest } = pack;
  const used = new Set([...JSON.stringify(rest).matchAll(/"(?:signal|dodgeSignal)":"(MIS-\d+)"/g)].map((x) => x[1]));
  pack.misconceptions.forEach((m) => { if (!used.has(m.id)) p.push(`misconception ${m.id}: nothing in play can signal it`); });
  // NONEWS-001: no news source types.
  pack.sources.forEach((src) => { if (/\bnews\b|newspaper|gazette/i.test(src.title)) p.push(`source ${src.id}: news sources are not allowed (NONEWS-001)`); });
  // Every objective needs four hint depths (spec 16.3).
  for (const o of objectives) {
    const depths = new Set(pack.hints.filter((h) => h.objective === o).map((h) => h.depth));
    for (const d of [1, 2, 3, 4] as const) if (!depths.has(d)) p.push(`objective ${o}: missing hint depth ${d}`);
  }
  // The Deep Dive (spec 59): every prompt can be answered two or more ways; daily sets are balanced.
  const dps = pack.divePrompts ?? [], dis = pack.diveItems ?? [];
  const tags = new Set(dps.map((x) => x.tag));
  dis.forEach((it) => it.facets.forEach((f) => { if (!tags.has(f.tag)) p.push(`dive item ${it.id}: unknown tag ${f.tag}`); if (![1, 2, 3].includes(f.rarity)) p.push(`dive item ${it.id}: rarity must be 1, 2 or 3`); }));
  dps.forEach((d) => { if (dis.filter((it) => it.facets.some((f) => f.tag === d.tag)).length < 2) p.push(`dive prompt ${d.id}: needs two or more possible answers`); });
  dis.forEach((it) => { if ('card' in it.if && !pack.cards.some((c) => c.id === (it.if as { card: string }).card)) p.push(`dive item ${it.id}: unknown card`); });
  if (dps.length >= 7) for (let k = 0; k < 40; k++) {
    const day = `2026-12-${String((k % 28) + 1).padStart(2, '0')}`;
    const set = dailyPrompts(dps, day);
    if (new Set(set.map((x) => x.concept)).size < 4 || new Set(set.map((x) => x.aok)).size < 3) { p.push(`dive: the set for ${day} is not balanced`); break; }
  }
  return p;
}
