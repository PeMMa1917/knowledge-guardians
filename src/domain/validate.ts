/**
 * Runtime validation of content packs and saved campaign state.
 *
 * TypeScript types are erased at runtime, so JSON loaded from disk or storage
 * must be checked here (spec 23.2). A failure returns readable problems; the
 * caller shows a recoverable error and never silently resets progress.
 */
import type { Condition, ContentPack, Effect, Weave } from './types';
import { ATLS, CONCEPTS, PROFILE } from './types';
import { SUBJECTS } from './curriculum';
import { openCombinations } from './lock';

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
  if (!s.pos || typeof s.pos.x !== 'number' || typeof s.pos.y !== 'number') p.push('pos invalid');
  for (const k of ['flags', 'inventory', 'relations', 'forge', 'events']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) p.push(`${k} must be an object`);
  for (const k of ['journal', 'notes', 'cards', 'objectivesDone']) if (!Array.isArray(s[k])) p.push(`${k} must be a list`);
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

  pack.sources.forEach((s) => { dup('source', s.id); if (!/^https:\/\//.test(s.url)) p.push(`source ${s.id}: url must be https`); });
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
  });
  pack.items.forEach((i) => dup('item', i.id));
  pack.characters.forEach((c) => {
    dup('character', c.id);
    c.talk.forEach((t) => { nodes.has(t.node) || p.push(`character ${c.id}: unknown node ${t.node}`); cond(t.if, `character ${c.id}`); });
  });
  pack.journal.forEach((j) => { dup('journal', j.id); text(`journal ${j.id}`, j.text); });
  pack.criteria.forEach((c) => { dup('criterion', c.id); if (!(c.maximum > 0 && c.maximum <= 100)) p.push(`criterion ${c.id}: maximum out of range`); });

  function cond(c: Condition | undefined, where: string): void {
    if (!c) return;
    if ('all' in c) return c.all.forEach((x) => cond(x, where));
    if ('any' in c) return c.any.forEach((x) => cond(x, where));
    if ('not' in c) return cond(c.not, where);
    if ('item' in c && !items.has(c.item)) p.push(`${where}: unknown item ${c.item}`);
    if ('card' in c && !cards.has(c.card)) p.push(`${where}: unknown card ${c.card}`);
    if ('objective' in c && !objectives.has(c.objective)) p.push(`${where}: unknown objective ${c.objective}`);
    const known = ['flag', 'flagSet', 'num', 'item', 'marks', 'card', 'objective'];
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
    m.objectives.forEach((o) => { dup('objective', o.id); cond(o.done, `objective ${o.id}`); cond(o.visible, `objective ${o.id}`); eff(o.onComplete, `objective ${o.id}`); weave(o.weave, `objective ${o.id}`, true); });
  });
  pack.hints.forEach((h) => { dup('hint', h.id); if (!objectives.has(h.objective)) p.push(`hint ${h.id}: unknown objective`); cond(h.if, `hint ${h.id}`); });
  pack.awards.forEach((a) => {
    dup('award', a.id); cond(a.when, `award ${a.id}`);
    a.criteria.forEach((c) => criteria.has(c) || p.push(`award ${a.id}: unknown criterion ${c}`));
  });
  pack.offers.forEach((o) => { dup('offer', o.id); items.has(o.item) || p.push(`offer ${o.id}: unknown item`); cond(o.if, `offer ${o.id}`); eff(o.effects, `offer ${o.id}`); });
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
  return p;
}
