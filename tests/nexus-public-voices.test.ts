import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { NEXUS_PUBLIC_VOICES } from '../src/maps/publicVoices';
import { STAMPS } from '../src/scenes/art';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const index = 'nexus.public-index';
const welcome = 'nexus.public-welcome';
const map = MAPS['nexus.archive'];

function prop(d: Driver, node: string) {
  return NEXUS_PUBLIC_VOICES.find((entry) => entry.node === node && check(entry.visibleIf, d.s));
}

function visit(d: Driver, node: string, action?: string) {
  const target = prop(d, node);
  expect(target, node).toBeDefined();
  d.walk(target!.node!, action ? [action] : []);
}

describe('early public-record handoffs', () => {
  it('can be declined without changing the opening or exposing later collections', () => {
    const d = new Driver();
    visit(d, index + '.invite', 'Leave the records');
    visit(d, welcome + '.invite', 'Leave the clip');
    expect(d.s.flags[index + '.started']).toBeUndefined();
    expect(d.s.flags[welcome + '.started']).toBeUndefined();
    expect(prop(d, index + '.parliament')).toBeUndefined();
    expect(prop(d, welcome + '.fremont')).toBeUndefined();
    expect(d.done('m01.o1.look')).toBe(false);
    expect(d.done('m01.o6.label')).toBe(false);
    expect(d.done('passage.yirrkala.referral')).toBe(false);
    expect(d.done('welcome.copies.o.read')).toBe(false);
  });

  it.each([
    ['dates', 'Pin the dates', 'Hold the new date entries', '14 August under Dhuwa', 'centre'],
    ['centre', 'Put the Centre’s own account', 'Turn the slip', 'move my delivery marker', 'dates'],
  ])('keeps both attributed sources in the %s handoff and commits its readback once', (route, pick, action, line, alternate) => {
    const d = new Driver();
    visit(d, index + '.invite', 'Open Venn’s two records');
    expect(d.e.visibleOptions(index + '.board', d.s)).toHaveLength(1);
    visit(d, index + '.parliament', 'Clip the two attributions');
    expect(d.e.visibleOptions(index + '.board', d.s)).toHaveLength(1);
    visit(d, index + '.centre', 'Clip the Centre’s own name');
    expect(d.e.visibleOptions(index + '.board', d.s)).toHaveLength(3);
    visit(d, index + '.board', pick);
    expect(d.s.inventory[index + '.slip']).toBe(1);
    expect(prop(d, index + '.' + alternate + '.receive')).toBeUndefined();
    expect(d.done(index + '.received')).toBe(false);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    const credits = d.p.credit;

    visit(d, index + '.' + route + '.receive', 'Keep the slip');
    expect(d.s.inventory[index + '.slip']).toBe(1);
    visit(d, index + '.' + route + '.receive', action);
    expect(d.s.inventory[index + '.slip'] ?? 0).toBe(0);
    expect(d.s.flags[index + '.done']).toBe(route);
    expect(d.done(index + '.received')).toBe(true);
    expect(d.p.credit).toEqual(credits);
    expect(d.e.node(index + '.' + route + '.used').text).toContain(line);
    expect(prop(d, index + '.' + route + '.used')).toBeDefined();
    expect(prop(d, index + '.' + alternate + '.used')).toBeUndefined();
    expect(d.e.visibleOptions(index + '.' + route + '.receive', d.s)).toHaveLength(1);
    expect(d.s.journal).toContain('j.' + index + '.' + route);
    expect(d.done('passage.yirrkala.referral')).toBe(false);
    expect(d.s.objectivesDone.some((id) => id.startsWith('passage.yirrkala-'))).toBe(false);
  });

  it.each([
    ['notice', 'Clip the self-guided route', 'Move the tour line', 'finds the separate campus tour line', 'desk'],
    ['desk', 'Keep the two accounts', 'Open both accounts', 'keeps each leaf at its own clip', 'notice'],
  ])('leaves the %s welcome usable for the reader who needed it', (route, pick, action, line, alternate) => {
    const d = new Driver();
    visit(d, welcome + '.invite', 'Open the three visitor records');
    visit(d, welcome + '.abbey', 'Clip Saint Meinrad');
    visit(d, welcome + '.fremont', 'Clip the Fremont');
    expect(d.e.visibleOptions(welcome + '.board', d.s)).toHaveLength(1);
    visit(d, welcome + '.schedule', 'Keep the tour and prayer details');
    visit(d, welcome + '.board', pick);
    expect(d.s.inventory[welcome + '.slip']).toBe(1);
    expect(d.done(welcome + '.received')).toBe(false);
    expect(prop(d, welcome + '.' + alternate + '.receive')).toBeUndefined();
    const credits = d.p.credit;

    visit(d, welcome + '.' + route + '.receive', action);
    expect(d.s.inventory[welcome + '.slip'] ?? 0).toBe(0);
    expect(d.s.flags[welcome + '.done']).toBe(route);
    expect(d.done(welcome + '.received')).toBe(true);
    expect(d.p.credit).toEqual(credits);
    expect(d.e.node(welcome + '.' + route + '.used').text).toContain(line);
    expect(prop(d, welcome + '.' + route + '.used')).toBeDefined();
    expect(prop(d, welcome + '.' + alternate + '.used')).toBeUndefined();
    expect(d.s.journal).toContain('j.' + welcome + '.' + route);
    expect(d.done('welcome.copies.o.read')).toBe(false);
    expect(d.done('welcome.market.o.route')).toBe(false);
    expect(d.done('m01.o6.label')).toBe(false);
  });

  it('keeps every handoff on walkable floor with a separate painted centre and accessible art', () => {
    const art = new Set(artKeys());
    const walls = [...map.blocks, ...map.stamps.flatMap(({ stamp, x, y }) => {
      const rect = STAMPS[stamp].collide;
      return rect ? [[x + rect[0], y + rect[1], rect[2], rect[3]]] : [];
    })];
    const stable = map.interactables.filter(({ node }) => !node?.startsWith(index + '.') && !node?.startsWith(welcome + '.'));
    for (const entry of NEXUS_PUBLIC_VOICES) {
      const { x, y, art: icon } = entry;
      expect(art.has(icon!), entry.id).toBe(true);
      expect(map.floor(x, y), entry.id).toBeTruthy();
      expect(walls.some(([left, top, w, h]) => x >= left && x < left + w && y >= top && y < top + h), entry.id).toBe(false);
      expect(map.npcs.some((npc) => x === npc.x && y === npc.y), entry.id).toBe(false);
      // Canvas targets extend upward a tile. Older props have priority at overlapping points.
      expect(stable.some((prop) => x >= prop.x && x < prop.x + prop.w && y >= prop.y - 1 && y < prop.y + prop.h), entry.id).toBe(false);
      expect(stable.some((prop) => x >= prop.x && x < prop.x + prop.w && prop.y === y - 1), entry.id).toBe(false);
    }
  });

  it('links each public claim to the registry source and places themes on completed actions', () => {
    const pack = buildPack();
    const d = new Driver();
    for (const [suffix, source] of [
      [index + '.parliament', 'HIS-APH-YIRRKALA-CAPTION'], [index + '.centre', 'HIS-YIRRKALA-BUKU-HISTORY'],
      [welcome + '.fremont', 'REL-WELCOME-01'], [welcome + '.abbey', 'REL-WELCOME-02'],
      [welcome + '.schedule', 'REL-WELCOME-03'],
    ]) {
      expect(d.e.node(suffix)).toMatchObject({ historicalLabel: 'documented', claimKind: 'observation', citationSource: source });
      expect(pack.sources.find(({ id }) => id === source)?.url).toMatch(/^https:\/\//);
    }
    for (const [id, theme] of [[index + '.received', 'IND'], [welcome + '.received', 'REL']]) {
      const objective = pack.missions.flatMap((mission) => mission.objectives).find((row) => row.id === id);
      expect(objective?.essential).toBe(false);
      expect(objective?.weave?.aoks).toContain(theme);
      expect(pack.hints.filter((hint) => hint.objective === id).map((hint) => hint.depth)).toEqual([1, 2, 3, 4]);
    }
  });
});
