/**
 * Runtime validation of content packs and saved campaign state.
 *
 * TypeScript types are erased at runtime, so JSON loaded from disk or storage
 * must be checked here (spec 23.2). A failure returns readable problems; the
 * caller shows a recoverable error and never silently resets progress.
 */
import type { Condition, ContentPack, Effect } from './types';

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
  for (const k of ['flags', 'inventory', 'relations', 'board']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) p.push(`${k} must be an object`);
  for (const k of ['journal', 'notes', 'cards', 'objectivesDone']) if (!Array.isArray(s[k])) p.push(`${k} must be a list`);
  if (s.inventory) for (const [id, q] of Object.entries(s.inventory)) if (!Number.isInteger(q) || (q as number) < 0 || (q as number) > 999) p.push(`bad quantity for ${id}`);
  if (typeof s.marks === 'number' && (s.marks < 0 || s.marks > 1_000_000)) p.push('marks out of range');
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
  const claims = new Set(pack.claims.map((c) => c.id));

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
    e.sources.forEach((s) => sources.has(s) || p.push(`exhibit ${e.id}: unknown source ${s}`));
  });
  pack.items.forEach((i) => dup('item', i.id));
  pack.characters.forEach((c) => {
    dup('character', c.id);
    c.talk.forEach((t) => { nodes.has(t.node) || p.push(`character ${c.id}: unknown node ${t.node}`); cond(t.if, `character ${c.id}`); });
  });
  pack.journal.forEach((j) => { dup('journal', j.id); text(`journal ${j.id}`, j.text); });
  pack.claims.forEach((c) => dup('claim', c.id));
  pack.criteria.forEach((c) => { dup('criterion', c.id); if (!(c.maximum > 0 && c.maximum <= 100)) p.push(`criterion ${c.id}: maximum out of range`); });

  function cond(c: Condition | undefined, where: string): void {
    if (!c) return;
    if ('all' in c) return c.all.forEach((x) => cond(x, where));
    if ('any' in c) return c.any.forEach((x) => cond(x, where));
    if ('not' in c) return cond(c.not, where);
    if ('item' in c && !items.has(c.item)) p.push(`${where}: unknown item ${c.item}`);
    if ('card' in c && !cards.has(c.card)) p.push(`${where}: unknown card ${c.card}`);
    if ('objective' in c && !objectives.has(c.objective)) p.push(`${where}: unknown objective ${c.objective}`);
    const known = ['flag', 'flagSet', 'num', 'item', 'marks', 'card', 'objective', 'boardLinks'];
    if (!Object.keys(c).some((k) => known.includes(k))) p.push(`${where}: unknown condition ${JSON.stringify(c)}`);
  }
  function eff(list: Effect[] | undefined, where: string): void {
    for (const e of list ?? []) {
      const k = Object.keys(e)[0];
      const known = ['setFlag', 'addNum', 'giveItem', 'takeItem', 'addMarks', 'addCard', 'journal', 'relation', 'companion', 'credit', 'checkpoint'];
      if (!known.includes(k)) { p.push(`${where}: unknown effect ${k}`); continue; }
      if ('giveItem' in e && !items.has(e.giveItem)) p.push(`${where}: unknown item ${e.giveItem}`);
      if ('takeItem' in e && !items.has(e.takeItem)) p.push(`${where}: unknown item ${e.takeItem}`);
      if ('addCard' in e && !cards.has(e.addCard)) p.push(`${where}: unknown card ${e.addCard}`);
      if ('journal' in e && !journal.has(e.journal)) p.push(`${where}: unknown journal ${e.journal}`);
      if ('credit' in e && !criteria.has(e.credit)) p.push(`${where}: unknown criterion ${e.credit}`);
      if ('relation' in e && !chars.has(e.relation)) p.push(`${where}: unknown character ${e.relation}`);
      if ('companion' in e && e.companion !== null && !chars.has(e.companion)) p.push(`${where}: unknown companion`);
    }
  }

  pack.dialogue.forEach((n) => {
    dup('node', n.id); text(`node ${n.id}`, n.text);
    if (n.speaker !== 'narrator' && n.speaker !== 'player' && n.speaker !== 'lumen' && !chars.has(n.speaker)) p.push(`node ${n.id}: unknown speaker ${n.speaker}`);
    if (n.next && !nodes.has(n.next)) p.push(`node ${n.id}: unknown next ${n.next}`);
    eff(n.effects, `node ${n.id}`);
    (n.options ?? []).forEach((o, i) => {
      text(`node ${n.id} option ${i}`, o.text);
      if (o.next && !nodes.has(o.next)) p.push(`node ${n.id} option ${i}: unknown next ${o.next}`);
      cond(o.if, `node ${n.id} option ${i}`); eff(o.effects, `node ${n.id} option ${i}`);
    });
  });
  pack.missions.forEach((m) => {
    dup('mission', m.id);
    m.objectives.forEach((o) => { dup('objective', o.id); cond(o.done, `objective ${o.id}`); cond(o.visible, `objective ${o.id}`); eff(o.onComplete, `objective ${o.id}`); });
  });
  pack.hints.forEach((h) => { dup('hint', h.id); if (!objectives.has(h.objective)) p.push(`hint ${h.id}: unknown objective`); cond(h.if, `hint ${h.id}`); });
  pack.awards.forEach((a) => {
    dup('award', a.id); cond(a.when, `award ${a.id}`);
    a.criteria.forEach((c) => criteria.has(c) || p.push(`award ${a.id}: unknown criterion ${c}`));
  });
  pack.offers.forEach((o) => { dup('offer', o.id); items.has(o.item) || p.push(`offer ${o.id}: unknown item`); cond(o.if, `offer ${o.id}`); eff(o.effects, `offer ${o.id}`); });
  void claims;
  // Every objective needs four hint depths (spec 16.3).
  for (const o of objectives) {
    const depths = new Set(pack.hints.filter((h) => h.objective === o).map((h) => h.depth));
    for (const d of [1, 2, 3, 4] as const) if (!depths.has(d)) p.push(`objective ${o}: missing hint depth ${d}`);
  }
  return p;
}
