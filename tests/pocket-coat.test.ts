import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import {
  coatEffects,
  coatKey,
  coatWitnesses,
  currentSetting,
  pocketEdition,
  pocketSender,
  type PocketCommand,
} from '../src/domain/pocketCoat';
import { pocketProof } from '../src/domain/pocketProof';
import { pocketStories } from '../src/content/pocketStories';
import coatSkills from '../src/content/microSkillsCoat.json';
import { MAPS } from '../src/maps';
import { microSkillId } from '../src/domain/skills';
import { migrateCampaign } from '../src/domain/saves';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { apply, emptyOutputs } from '../src/domain/rules';

type Move = PocketCommand extends infer T ? (T extends PocketCommand ? Omit<T, 'type'> : never) : never;
const cmd = (m: Move): PocketCommand => ({ type: 'WorkCoatPocket', ...m });
const run = (d: Driver, m: Move) => d.run(cmd(m));
const visit = (d: Driver, id: string) => {
  d.s.mapId = 'night-register.' + id;
};
const settings = [0, 1, 2, 3],
  sides = [0, 1] as const;
const sites = Object.keys(pocketStories);
const reroll = (d: Driver) => {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
};

describe('the coat with fifteen pockets', () => {
  it('has an operable coat and two independently changeable fittings in each register', () => {
    expect(sites).toHaveLength(15);
    for (const id of sites) {
      expect(
        MAPS['night-register.' + id].interactables.find((p) => p.id === 'night-register.' + id + '.coat')
          ?.kind,
      ).toBe('fieldgame');
      expect(pocketSender(pocketStories[id].to)).toBe(id);
      for (const setting of settings)
        for (const rail of sides)
          expect(pocketProof(id, setting)).not.toEqual(pocketProof(id, setting ^ (1 << rail)));
    }
  });
  it('requires a matched observation and treats both seams equally at all settings and destinations', () => {
    const initial = new Driver().s;
    for (const id of sites)
      for (const setting of settings)
        for (const rail of sides)
          for (const seam of sides) {
            let s = { ...initial, mapId: 'night-register.' + id };
            const move = (m: Move) => {
              s = apply(coatEffects(cmd(m), s), s, emptyOutputs());
            };
            const arrange = (value: number) => {
              for (const r of sides) move({ action: 'turn', rail: r, side: ((value >> r) & 1) as 0 | 1 });
            };
            arrange(setting);
            expect(() => move({ action: 'stitch', seam })).toThrow();
            move({ action: 'pull' });
            move({ action: 'pull' });
            expect(() => move({ action: 'stitch', seam })).toThrow();
            arrange(setting ^ 3);
            move({ action: 'pull' }); // A diagonal changes both fittings; it cannot isolate either.
            for (const r of sides) expect(s.flags[coatKey(id, 'compared' + r)]).toBeUndefined();
            arrange(setting ^ (1 << rail));
            move({ action: 'pull' });
            arrange(setting);
            move({ action: 'stitch', seam });
            expect(pocketEdition(s, id, 'sent')).toMatchObject({ setting, seam });
            expect(() => move({ action: 'read' })).toThrow();
            s = { ...s, mapId: 'night-register.' + pocketStories[id].to };
            expect(() => move({ action: 'recheck', rail })).toThrow();
            move({ action: 'read' });
            move({ action: 'recheck', rail });
            expect(pocketEdition(s, id, 'first')).toEqual(pocketEdition(s, id, 'sent'));
            expect(s.flags[coatKey(pocketStories[id].to, 'counter' + rail)]).toBe(1 + setting + 4 * seam);
          }
  });
  it('awards every documented contrast at its own worktable and once more when a receiving keeper tests the edition', () => {
    const d = new Driver();
    for (const id of sites) {
      visit(d, id);
      run(d, { action: 'pull' });
      expect(d.done(coatKey(id, 'compared0'))).toBe(false);
      run(d, { action: 'turn', rail: 0, side: 1 });
      run(d, { action: 'pull' });
      run(d, { action: 'turn', rail: 1, side: 1 });
      run(d, { action: 'pull' });
      run(d, { action: 'stitch', seam: 0 });
    }
    for (const id of sites) {
      visit(d, pocketStories[id].to);
      run(d, { action: 'read' });
      for (const rail of sides) {
        run(d, { action: 'recheck', rail });
        run(d, { action: 'recheck', rail });
      }
    }
    for (const s of coatSkills) {
      expect(d.p.skills[microSkillId(s.number)], s.name).toHaveLength(2);
      expect(new Set(d.p.skills[microSkillId(s.number)].map((v) => v.split('|')[0])).size).toBe(2);
    }
    for (let i = 1; i <= 35; i++) {
      const question = 'KQ-ROUTE-' + String(i).padStart(2, '0');
      expect(d.p.stones[question]?.length, question).toBeGreaterThan(0);
    }
    const read = d.s.adventureDiary.entries.find((e) => e.event?.key.startsWith('coat:press:recheck:'));
    expect(read?.text).toContain('The sewn reading said:');
  }, 30000);
  it('keeps received and revised versions, diary prompts and both signed outcomes through recovery', () => {
    const d = new Driver();
    for (const id of ['archive', 'voices', 'chart']) {
      visit(d, id);
      run(d, { action: 'pull' });
      run(d, { action: 'turn', rail: 0, side: 1 });
      run(d, { action: 'pull' });
      run(d, { action: 'stitch', seam: 0 });
      visit(d, pocketStories[id].to);
      run(d, { action: 'read' });
    }
    run(d, { action: 'finish', seam: 0 });
    const original = coatWitnesses(d.s, 0);
    expect(original).toHaveLength(3);
    visit(d, 'chart');
    run(d, { action: 'turn', rail: 1, side: 1 });
    expect(() => run(d, { action: 'stitch', seam: 1 })).toThrow();
    reroll(d);
    expect(currentSetting(d.s, 'chart')).toBe(3);
    run(d, { action: 'pull' });
    run(d, { action: 'stitch', seam: 1 });
    expect(pocketEdition(d.s, 'chart', 'read')?.seam).toBe(0);
    visit(d, 'gate');
    run(d, { action: 'read' });
    run(d, { action: 'recheck', rail: 1 });
    run(d, { action: 'finish', seam: 1 });
    expect(coatWitnesses(d.s, 1)).not.toEqual(original);
    reroll(d);
    run(d, { action: 'finish', seam: 0 });
    expect(coatWitnesses(d.s, 0)).toEqual(original);
    const e = d.s.adventureDiary.entries.find((e) => e.event?.key.startsWith('coat:chart:recheck:'));
    expect(e?.text).toContain('12 minutes (mean)');
    expect(Object.values(diaryQuestions(e!))).toContain(pocketStories.chart.question);
  });
  it('preserves the input quantities and the limits of the little models', () => {
    expect(pocketProof('chart', 0).face).toContain('12 minutes');
    expect(pocketProof('chart', 2).face).toContain('10 minutes');
    expect(pocketProof('chart', 1).marks).toEqual(pocketProof('chart', 0).marks);
    expect(pocketProof('gate', 3).traces.join(' ')).toContain('4 and 24');
    expect(pocketProof('island', 3).face).toContain('beat 8');
    expect(pocketProof('dispatch', 1).traces.join(' ')).toContain('average: 1 minute.');
    expect(pocketProof('archive', 3).traces[1]).toContain('last word fits');
    expect(pocketProof('voices', 3).traces[1]).toContain('like she said');
    expect(pocketProof('voices', 1).traces[1]).not.toContain('Blue');
  });
});
