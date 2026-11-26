import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { PLAY_STYLES, playPath } from '../src/domain/learningPaths';
import { auditCourseFloor, courseTags, estimatedCourseEncounters, type CourseEncounter } from '../tools/tok-floor';

const concepts = ['evidence', 'truth', 'certainty', 'interpretation', 'objectivity', 'justification'];
const framework = ['scope', 'methods-and-tools'];

describe('rolling TOK opportunity floor', () => {
  it('separates 20 and 30 minutes at exact completion and expiry boundaries', () => {
    const evidence: CourseEncounter[] = [
      { id: 'apply a check', minute: 5, concepts, framework, aoks: ['HIS'] },
      { id: 'rewrite directions', minute: 24, concepts: ['interpretation'], framework: [], aoks: ['LAN'] },
    ];
    const report = auditCourseFloor(60, evidence);
    const [short, long] = report.rolling;
    expect(short.width).toBe(20);
    expect(short.gaps[0]).toEqual({ from: 20, until: 24, below: ['optionalThemes'] });
    expect(short.gaps[1]).toEqual({ from: 25, until: 44, below: ['concepts', 'framework', 'areas'] });
    expect(short.minutesWithGap).toBe(39);
    expect(long.width).toBe(30);
    expect(long.gaps[0]).toEqual({ from: 35, until: 54, below: ['concepts', 'framework', 'areas'] });
    expect(long.minutesWithGap).toBe(25);
    expect(report.firstHour.complete).toBe(true);
    expect(report.firstHour.present).toEqual({ concepts: expect.arrayContaining(concepts), framework, areas: ['HIS'], optionalThemes: ['LAN'] });
    expect(report.firstHour.present.concepts).toHaveLength(6);
  });

  it('reports invalid and absent metadata without promoting either to coverage', () => {
    const report = auditCourseFloor(30, [
      { id: 'untagged observation', minute: 3, concepts: ['truth', 'truth'], aoks: ['TEC', 'KNW', 'bogus'] },
      { id: 'no recorded outcomes', minute: 6, concepts: [], framework: [], aoks: [] },
      { id: 'silent walk', minute: 7 },
    ]);
    const opening = report.rolling[1].firstWindow!;
    expect(opening.present).toEqual({ concepts: ['truth'], framework: [], areas: [], optionalThemes: ['TEC'] });
    expect(opening.unknownEncounters).toEqual({ concepts: ['silent walk'], framework: ['untagged observation', 'silent walk'], topics: ['silent walk'] });
    expect(opening.unrecognisedTags.topics).toEqual(['KNW', 'bogus']);
    expect(report.rolling[1].gaps).toEqual([{ from: 30, until: null, below: ['concepts', 'framework', 'areas'] }]);
  });

  it('distinguishes a partial hour and a terminal failure with zero duration', () => {
    const evidence = [{ id: 'publish a bounded claim', minute: 1, concepts, framework, aoks: ['HIS', 'LAN'] }];
    const short = auditCourseFloor(19, evidence);
    expect(short.firstHour).toMatchObject({ minutes: 19, complete: false, present: { areas: ['HIS'] } });
    expect(short.rolling.every(({ firstWindow }) => firstWindow === null)).toBe(true);
    const terminal = auditCourseFloor(31, evidence).rolling[1];
    expect(terminal.firstWindow?.present.optionalThemes).toEqual(['LAN']);
    expect(terminal.gaps).toEqual([{ from: 31, until: null, below: ['concepts', 'framework', 'areas', 'optionalThemes'] }]);
    expect(terminal.minutesWithGap).toBe(0);
    expect(() => auditCourseFloor(0, evidence)).toThrow(RangeError);
  });

  it('uses the authored Nexus classifications and leaves registry topic labels unknown', () => {
    const pack = buildPack();
    const tags = courseTags(pack);
    const route = estimatedCourseEncounters(playPath(pack, 'story'), tags);
    const start = route.encounters.find(({ id }) => id === 'm01.o1.look')!;
    const trial = route.encounters.find(({ id }) => id === 'm01.o4.test')!;
    expect(start).toMatchObject({ minute: 3, framework: undefined, aoks: ['HIS'] });
    expect(trial).toMatchObject({ minute: 16, framework: ['methods-and-tools'], aoks: ['NAT', 'TEC'] });
    expect(tags.get('field:doors')?.aoks).toBeUndefined();
    expect(tags.get('field:doors')?.framework).toEqual(['methods-and-tools']);
    const first = auditCourseFloor(route.duration, route.encounters).firstHour;
    expect(first.unknownEncounters.framework).toContain('m01.o1.look');
    expect(first.present.areas).toContain('NAT');
    expect(first.present.optionalThemes).toContain('TEC');
    expect(first.present.optionalThemes).not.toContain('NAT');
  });

  it('covers the 20- and 30-minute opening floors on each modeled itinerary', () => {
    const pack = buildPack();
    const tags = courseTags(pack);
    const paths = [...PLAY_STYLES.map((style) => playPath(pack, style)), playPath(pack, 'explorer', 'all')];
    for (const path of paths) {
      const { duration, encounters } = estimatedCourseEncounters(path, tags);
      const report = auditCourseFloor(duration, encounters);
      for (const { firstWindow } of report.rolling) {
        expect(firstWindow?.present.concepts.length).toBeGreaterThanOrEqual(6);
        expect(firstWindow?.present.framework.length).toBeGreaterThanOrEqual(2);
        expect(firstWindow?.present.areas.length).toBeGreaterThanOrEqual(1);
        expect(firstWindow?.present.optionalThemes.length).toBeGreaterThanOrEqual(1);
      }
      expect(report.firstHour.present.concepts).toHaveLength(12);
      expect(report.firstHour.present.framework).toHaveLength(4);
    }
  });
});
