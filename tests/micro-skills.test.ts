import { describe, expect, it } from 'vitest';
import gameTracker from '../docs/GAME_ELEMENTS.md?raw';
import storyTracker from '../docs/STORY_ELEMENTS.md?raw';
import { buildPack } from '../src/content';
import { MICRO_MODES, MICRO_SKILLS, MICRO_STYLES, microSkillId } from '../src/content/microSkillEvidence';
import { AUDIT_AXES, axisGroups, measureAxisGroups, microSkillRows, SUPPLIED_SKILL_IDS } from '../src/domain/microSkillAudit';
import { newPermanent } from '../src/domain/permanent';
import { restoreMicroSkillUses } from '../src/domain/skills';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function playableRows(tracker: string) {
  const lines = tracker.split('\n');
  return new Set(lines.flatMap((line) => {
    const columns = line.split('|').map((part) => part.trim());
    if (!/^\d+$/.test(columns[1] ?? '')) return [];
    return columns.includes('✓') || columns.includes('◐') ? [Number(columns[1])] : [];
  }));
}

describe('micro-skill links to played actions', () => {
  const pack = buildPack();
  const rows = microSkillRows(pack, MICRO_SKILLS);

  it('indexes the actual source numbers and attaches every link to an existing objective and RPG example', () => {
    expect(SUPPLIED_SKILL_IDS).toHaveLength(1000);
    expect(SUPPLIED_SKILL_IDS).toEqual(Array.from({ length: 1000 }, (_, i) => i + 1));
    expect(new Set(MICRO_SKILLS.map(({ number }) => number)).size).toBe(MICRO_SKILLS.length);
    expect(rows.length).toBe(MICRO_SKILLS.reduce((sum, { uses }) => sum + uses.length, 0));
    const games = playableRows(gameTracker);
    const stories = playableRows(storyTracker);
    for (const skill of MICRO_SKILLS) {
      expect(SUPPLIED_SKILL_IDS).toContain(skill.number);
      expect(skill.name.trim().length).toBeGreaterThan(0);
      expect(skill.uses.length).toBeGreaterThan(0);
      expect(new Set(skill.uses.map(({ objective }) => objective)).size).toBe(skill.uses.length);
      for (const use of skill.uses) {
        expect(use.action.trim().length).toBeGreaterThan(0);
        expect(use.styles.length).toBeGreaterThan(0);
        for (const style of use.styles) expect(MICRO_STYLES).toContain(style);
        expect(use.modes.length).toBeGreaterThan(0);
        for (const mode of use.modes) expect(MICRO_MODES).toContain(mode);
        expect(games.has(use.game), `skill ${skill.number}, game element ${use.game}`).toBe(true);
        expect(stories.has(use.story), `skill ${skill.number}, story element ${use.story}`).toBe(true);
      }
    }
  });

  it('uses evidence from each action for all combinations of axes instead of joining separate actions', () => {
    expect(axisGroups()).toHaveLength(247);
    const tagged = rows.filter(({ thinking }) => thinking);
    const full = measureAxisGroups(rows).find(({ axes }) => axes.length === AUDIT_AXES.length)!;
    expect(full.uses).toBe(tagged.length);
    expect(full.skillChapters).toBeLessThanOrEqual(full.uses);
    expect(full.combinations).toBeGreaterThanOrEqual(full.skillChapters);
  });

  it('records a real change of map viewpoint and restores completed history without adding marks', () => {
    const d = new Driver();
    d.s.mapId = 'nile.route';
    d.s.flags['nile.arrived'] = true;
    const sig = microSkillId(79);
    expect(d.p.skills[sig]).toBeUndefined();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    for (const id of ['nile-way-aisle-view', 'nile-way-shelf-view', 'nile-way-carrier-note']) {
      const prop = MAPS['nile.route'].interactables.find((item) => item.id === id)!;
      d.run({ type: 'SetFlag', flag: prop.flag!, value: true });
    }
    expect(d.p.skills[sig]).toBeUndefined();
    const board = MAPS['nile.route'].interactables.find(({ id }) => id === 'nile-way-board')!;
    d.walk(board.node!, ['Hold the room marks steady', 'Leave the sketch turned']);
    expect(d.p.skills[sig]).toEqual([expect.stringContaining('WORLD-03|game-13|nile.way.compare')]);
    const completedBefore = ['nile.way.compare', 'stage.access'];
    const fresh = newPermanent();
    const restored = restoreMicroSkillUses(fresh, pack, completedBefore);
    expect(restored.skills[sig]).toEqual(expect.arrayContaining([
      expect.stringContaining('WORLD-03|game-13|nile.way.compare'),
      expect.stringContaining('WORLD-10|game-234|stage.access'),
    ]));
    expect(restored.credit).toEqual({});
    expect(restoreMicroSkillUses(restored, pack, completedBefore)).toBe(restored);
  });
});
