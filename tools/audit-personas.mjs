/**
 * Evidence for the multi-persona audit (docs/audit/).
 *
 * The audit asks many people (students, teachers, examiners, designers,
 * accessibility specialists and others) what they like, what worries them and
 * what they would change. Opinions are easier to check when they rest on the
 * same facts. This script measures every mission in the content pack:
 *
 * - loop shape: which kinds of action the objective titles ask for
 *   (compare, hand over to a reader, fetch, make, argue, play, explore);
 * - the "standard loop": compare two things, then leave a result where a
 *   reader uses it. Many personas say this loop repeats too often;
 * - reading load of the objective titles (words, long words, abstract words),
 *   which EAL, learning-support and low-confidence readers care about;
 * - stakes, knowledge questions and the spread of thinking levels.
 *
 * Run:  node tools/audit-personas.mjs            (summary table)
 *       node tools/audit-personas.mjs --md       (Markdown for docs/audit/EVIDENCE.md)
 *       node tools/audit-personas.mjs --json     (all rows)
 *
 * The heuristics are simple word rules. They are a first filter for a human
 * reviewer, not a judgement. Read the mission before you change it.
 */
import { createServer } from 'vite';

/** World id to chapter number, matching STATUS.md. WORLD-01 and WORLD-02 are chapter 1. */
export const WORLD_CHAPTER = {
  'WORLD-01': 1, 'WORLD-02': 1, 'WORLD-03': 2, 'WORLD-04': 3, 'WORLD-05': 4,
  'WORLD-06': 5, 'WORLD-07': 6, 'WORLD-08': 7, 'WORLD-09': 8, 'WORLD-10': 9,
  'WORLD-11': 10, 'WORLD-12': 11, 'WORLD-13': 12, 'WORLD-14': 13, 'WORLD-15': 14,
  'WORLD-16': 15,
};

const SHAPES = {
  compare: /\b(two|both|same|compare|each|either|side by side|against|pair|paired)\b/i,
  handover: /\b(leave|hand|post|set out|set the|send|give|install|hang|pin|put)\b/i,
  fetch: /\b(bring|take|carry|collect|deliver|fetch|return|get)\b/i,
  make: /\b(forge|build|make|craft|fit|repair|seat|pack|mount|draw|coin|paint)\b/i,
  argue: /\b(showdown|face|argue|debate|answer the|persuade)\b/i,
  play: /\b(play|roll|race|dig|clap|guess|rounds?|dice|cards?|music|sing|dance|time)\b/i,
  explore: /\b(follow|trace|walk|find|visit|search|watch|explore|look)\b/i,
};
const READER = /\b(reader|readers|visitor|visitors|next (person|reader|carrier|checker|crew)|someone)\b/i;
const ABSTRACT = new Set(['arrangement', 'account', 'record', 'records', 'display', 'layout', 'route', 'check',
  'checks', 'version', 'entry', 'slip', 'strip', 'handover', 'receipt', 'reading', 'readings', 'reference',
  'register', 'limit', 'limits', 'source', 'sources', 'trace', 'proof', 'proofs', 'docket', 'tag', 'order']);

function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  const groups = w.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function readingLoad(text) {
  const words = text.split(/\s+/).map((w) => w.replace(/[^\p{L}'’-]/gu, '')).filter(Boolean);
  const long = words.filter((w) => syllables(w) >= 3).length;
  const abstract = words.filter((w) => ABSTRACT.has(w.toLowerCase())).length;
  return { words: words.length, long, abstract };
}

export function shapeOf(text) {
  return Object.entries(SHAPES).filter(([, re]) => re.test(text)).map(([k]) => k);
}

export function measureMission(mission) {
  const titles = mission.objectives.map((o) => o.title ?? '');
  const all = titles.join(' ');
  const shapes = shapeOf(all);
  const load = titles.map(readingLoad);
  const words = load.reduce((a, b) => a + b.words, 0);
  const levels = new Set(mission.objectives.flatMap((o) => (o.weave?.thinking?.bloom ? [o.weave.thinking.bloom] : [])));
  return {
    id: mission.id,
    chapter: WORLD_CHAPTER[mission.world] ?? null,
    world: mission.world,
    title: mission.title,
    objectives: titles.length,
    essential: mission.objectives.filter((o) => o.essential).length,
    shapes,
    standardLoop: shapes.includes('compare') && shapes.includes('handover'),
    readerResponds: READER.test(all),
    meanWords: titles.length ? +(words / titles.length).toFixed(1) : 0,
    longShare: words ? +(load.reduce((a, b) => a + b.long, 0) / words).toFixed(2) : 0,
    abstractShare: words ? +(load.reduce((a, b) => a + b.abstract, 0) / words).toFixed(2) : 0,
    hasStake: Boolean(mission.stake),
    hasKQ: Boolean(mission.knowledgeQuestion),
    bloomLevels: [...levels],
  };
}

export function summarise(rows) {
  const by = new Map();
  for (const r of rows) {
    const k = r.chapter ?? 0;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(r);
  }
  return [...by.entries()].sort((a, b) => a[0] - b[0]).map(([chapter, rs]) => {
    const n = rs.length;
    const shapeCount = (s) => rs.filter((r) => r.shapes.includes(s)).length;
    return {
      chapter, missions: n,
      standardLoop: rs.filter((r) => r.standardLoop).length,
      share: +(rs.filter((r) => r.standardLoop).length / n).toFixed(2),
      fetch: shapeCount('fetch'), make: shapeCount('make'), argue: shapeCount('argue'),
      play: shapeCount('play'), explore: shapeCount('explore'),
      meanWords: +(rs.reduce((a, r) => a + r.meanWords, 0) / n).toFixed(1),
      longShare: +(rs.reduce((a, r) => a + r.longShare, 0) / n).toFixed(2),
      abstractShare: +(rs.reduce((a, r) => a + r.abstractShare, 0) / n).toFixed(2),
      stakes: rs.filter((r) => r.hasStake).length,
    };
  });
}

const WORK_WORDS = ['slip', 'bell', 'rail', 'strip', 'runner', 'peg', 'fold', 'receipt', 'tag', 'sleeve', 'rack', 'crate', 'docket', 'tally'];
const CORE_CAST = ['warden-ise', 'kip-arden', 'smith-hesper', 'scholar-sefa', 'rook-tamsin', 'vesper-quill', 'lumen'];

/** Texture of the dialogue: how much there is, which work words repeat, and who speaks. */
export function texture(pack) {
  const lines = pack.dialogue.map((d) => [d.text, ...(d.options ?? []).map((o) => o.text)].join(' '));
  const text = lines.join(' ').toLowerCase();
  const count = (w) => (text.match(new RegExp(`\\b${w}s?\\b`, 'g')) ?? []).length;
  const bySpeaker = new Map();
  for (const d of pack.dialogue) bySpeaker.set(d.speaker, (bySpeaker.get(d.speaker) ?? 0) + 1);
  const sorted = [...bySpeaker.entries()].filter(([s]) => s !== 'narrator').sort((a, b) => b[1] - a[1]);
  return {
    scenes: pack.dialogue.length,
    words: Math.round(text.split(/\s+/).length / 100) * 100,
    speakers: bySpeaker.size,
    workWords: WORK_WORDS.map((w) => [w, count(w)]).sort((a, b) => b[1] - a[1]),
    core: CORE_CAST.map((s) => [s, bySpeaker.get(s) ?? 0]),
    busiest: sorted.slice(0, 5),
  };
}

async function main() {
  const server = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false },
  });
  try {
    const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
    const pack = buildPack();
    if (process.argv.includes('--inventory')) {
      const {MAPS} = await server.ssrLoadModule('/src/maps/index.ts');
      const rooms=Object.values(MAPS);
      const placements=rooms.flatMap(room=>room.interactables.map(prop=>({room,prop})));
      const fields=placements.filter(({prop})=>prop.kind==='fieldgame' && prop.game);
      const puzzles=placements.filter(({prop})=>prop.kind==='puzzle' && prop.puzzle);
      console.log(JSON.stringify({missions:pack.missions.length, rooms:rooms.length, objectives:pack.missions.reduce((n,m)=>n+m.objectives.length,0),
        fieldGameTools:new Set(fields.map(({prop})=>prop.game)).size,fieldGameStands:fields.length,fieldGameRooms:new Set(fields.map(({room})=>room.id)).size,
        puzzleRecords:pack.puzzles.length,puzzleRooms:new Set(puzzles.map(({room})=>room.id)).size,showdowns:pack.showdowns.length},null,2));
      return;
    }
    const rows = pack.missions.map(measureMission);
    const table = summarise(rows);
    if (process.argv.includes('--json')) { console.log(JSON.stringify({ table, rows }, null, 2)); return; }
    const head = ['Chapter', 'Missions', 'Standard loop', 'Share', 'Fetch', 'Make', 'Argue', 'Play', 'Explore',
      'Words per step', 'Long words', 'Abstract words', 'With stake'];
    const lines = table.map((t) => [t.chapter || 'other', t.missions, t.standardLoop, t.share, t.fetch, t.make,
      t.argue, t.play, t.explore, t.meanWords, t.longShare, t.abstractShare, t.stakes]);
    if (process.argv.includes('--md')) {
      console.log(`| ${head.join(' | ')} |`);
      console.log(`| ${head.map(() => '---').join(' | ')} |`);
      for (const l of lines) console.log(`| ${l.join(' | ')} |`);
      console.log('\nHardest objective steps to read (most long and abstract words):\n');
      const hard = rows.filter((r) => r.chapter).sort((a, b) => (b.longShare + b.abstractShare) - (a.longShare + a.abstractShare)).slice(0, 15);
      for (const r of hard) console.log(`- Ch ${r.chapter} \`${r.id}\` ${r.title} (long ${r.longShare}, abstract ${r.abstractShare})`);
      const t = texture(pack);
      console.log(`\nDialogue: ${t.scenes} scenes, about ${t.words} words, ${t.speakers} speakers.\n`);
      console.log('Most frequent work words in dialogue (times used): ' + t.workWords.map(([w, n]) => `${w} ${n}`).join(', ') + '.\n');
      console.log('Scenes per speaker, core cast: ' + t.core.map(([s, n]) => `${s} ${n}`).join(', ') + '.\n');
      console.log('Scenes per speaker, five busiest: ' + t.busiest.map(([s, n]) => `${s} ${n}`).join(', ') + '.\n');
      console.log(`Showdowns: ${pack.showdowns.length}. Puzzles: ${pack.puzzles.length}.`);
    } else {
      console.log(head.join(' | '));
      for (const l of lines) console.log(l.join(' | '));
    }
  } finally {
    await server.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
