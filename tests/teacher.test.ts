import {matchingWork,type ChapterFilters} from '../src/teacher/chapterMap';
import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { teacherContentFrom } from '../src/teacher/content';
import { latestPerStudent, readProgress, subjectCsv, summarise, type ProgressFile } from '../src/teacher/report';

const campaign = buildPack();
const pack = teacherContentFrom(campaign);
const file = (player: string, over: Partial<ProgressFile> = {}): ProgressFile => ({
  format: 'knowledge-guardians-progress', version: 1, exportedAt: '2026-11-20T10:00:00Z', player, content: 'chapter-1 v2',
  objectivesDone: [], awards: [], conceptXP: {}, totalXP: 0, moments: {},
  met: { concepts: {}, atl: {}, subjects: {}, aoks: {} }, misconceptions: [], portfolio: [], ...over,
});

describe('teacher view (spec 94, 95)', () => {
  it('keeps the same chapter and activity index in the reporting projection', () => {
    expect(pack.missions.map((mission) => mission.id)).toEqual(campaign.missions.map((mission) => mission.id));
    expect(pack.missions.flatMap(({ objectives }) => objectives.map(({ id, essential }) => ({ id, essential }))))
      .toEqual(campaign.missions.flatMap(({ objectives }) => objectives.map(({ id, essential }) => ({ id, essential }))));
    expect(Object.keys(pack).sort()).toEqual(['awards', 'misconceptions', 'missions', 'returnVisits', 'skillDomains', 'skills', 'strands']);
  });
  it('places each public return visit in its real chapter and joins filters on the same action',()=>{
    const f: ChapterFilters={chapter:'',concept:'',area:'',framework:'',subject:'',dok:'',bloom:'',fink:'',solo:''};
    const all=matchingWork(pack,f);
    const first=all.find(row=>row.id==='m01.o6.label')!;
    expect(first.tags.thinking?.dok).toBe(3);
    const chapters=new Set<number>();
    for(const visit of pack.returnVisits){
      const row=all.find(row=>row.id===visit.objective)!;
      expect(row.chapter).toBe(Math.max(1,visit.world-1));
      expect(row.tags.subjects?.length).toBeGreaterThan(0);
      expect(row.tags.framework?.length).toBeGreaterThan(0);
      expect(row.tags.thinking).toBeDefined();
      expect(campaign.missions.flatMap(m=>m.objectives).find(o=>o.id===row.id)?.essential).toBe(true);
      chapters.add(row.chapter);
    }
    expect(chapters.size).toBe(15);
    const chosen={...f,chapter:'7',concept:'interpretation',subject:'economics',framework:'methods-and-tools',area:'HIS',dok:'3',bloom:'evaluate',fink:'integration',solo:'relational'};
    const works=matchingWork(pack,chosen);
    expect(works.some(row=>row.id==='mill-shift.press.estimate')).toBe(true);
    expect(works.every(row=>row.chapter===7 && row.tags.subjects?.includes('economics') && row.weave.concepts.includes('interpretation'))).toBe(true);
    expect(matchingWork(pack,{...chosen,chapter:'17'})).toEqual([]);
    expect(pack.missions.find(m=>m.id==='KG-MILL-YARD')?.chapter).toBe(6);
  });
  it('rejects files that are not progress files, with a reason', () => {
    expect(readProgress({ hello: 1 }).ok).toBe(false);
    expect(readProgress({ ...file('A'), version: 9 })).toEqual({ ok: false, reason: expect.stringMatching(/another version/) });
    expect(readProgress(file('A')).ok).toBe(true);
  });
  it('keeps only the latest file per student', () => {
    const a1 = file('Ana'), a2 = file('Ana', { exportedAt: '2026-11-24T10:00:00Z', totalXP: 50 });
    expect(latestPerStudent([a2, a1, file('Ben')]).map((f) => [f.player, f.totalXP])).toEqual([['Ana', 50], ['Ben', 0]]);
  });
  it('counts students per concept and lists the least-met concepts as gaps', () => {
    const s = summarise([file('A', { met: { concepts: { evidence: 2 }, atl: {}, subjects: {}, aoks: {} } }), file('B')], pack);
    expect(s.concepts.evidence).toEqual({ total: 2, students: 1 });
    expect(s.gaps).not.toContain('evidence');
  });
  it('gives learner-profile moments as class totals only (PROFILE-001)', () => {
    const s = summarise([file('A', { moments: { 'PM-01': { attribute: 'inquirer', at: 'x' } } }), file('B', { moments: { 'PM-10': { attribute: 'inquirer', at: 'x' } } })], pack);
    expect(s.profile).toEqual({ inquirer: 2 });
  });
  it('raises a class alert at 30% of the class, and a teacher can dismiss it (MISC-001)', () => {
    const hit = { id: 'MIS-29', title: 'x', count: 3, level: 'watch' as const };
    const files = [file('A', { misconceptions: [hit] }), file('B'), file('C')];
    const s = summarise(files, pack);
    expect(s.alerts[0]).toMatchObject({ id: 'MIS-29', students: 1, classLevel: true });
    expect(summarise(files, pack, ['MIS-29']).alerts).toEqual([]);
  });
  it('counts students per Skill Atlas stage, and older files without skills still work', () => {
    const s = summarise([file('A', { skills: { 'sk.x': 'seen' } }), file('B', { skills: { 'sk.x': 'practised', 'sk.y': 'seen' } }), file('C')], pack);
    expect(s.skills).toEqual({ 'sk.x': { seen: 1, practised: 1 }, 'sk.y': { seen: 1 } });
    expect(readProgress({ ...file('D'), skills: 'bad' }).ok).toBe(false);
  });
  it('writes subject links as CSV', () => {
    expect(subjectCsv([file('Ana', { met: { concepts: {}, atl: {}, subjects: { history: 3 }, aoks: {} } })])).toBe('"student","subject","times met"\n"Ana","history","3"');
  });
});
