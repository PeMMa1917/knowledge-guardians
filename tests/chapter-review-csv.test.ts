import { describe, expect, it } from 'vitest';
// @ts-expect-error Standalone review tools also execute inside the offline HTML.
import { readChapterCSV, planChapterImport } from '../tools/chapter-review-csv.mjs';
const ids = ['story:11','game:22','concept:evidence','framework:ethics','theme:knower','micro:1'];
const members = ids.map(id => ({id, kind:id.split(':')[0]}));
const labels = ['Remember','Understand','Apply','Analyse','Evaluate','Create'].flatMap(level =>
  [1,2,3,4].map(depth => level + ' · DOK ' + depth));
const header = ['Element or action ID','Row type or family','Element or observed action','Narrative and game','Key concepts',
  'Knowledge framework','Areas and themes','Additional members or ordered steps','Knowledge questions',...labels,
  'Evidence / source / perspectives','Distinct action IDs','Chapter 03'];
function line() {
  return ['micro:1','micro','Take a turn','story:11, game:22','concept:evidence','framework:ethics','theme:knower','','',
    ...Array(24).fill(''),'',''];
}
function encode(rows: string[][], sep = ',') {
  return '\uFEFF' + rows.map(row => row.map(v=>'"' + v.replaceAll('"','""') + '"').join(sep)).join('\r\n');
}
describe('chapter workbook evidence exchanged with the offline checklist', () => {
  it('recovers different cognitive cells and order, including quotes, accents and multiline notes', () => {
    const r = line(); r[9]='Open'; r[18]='Reviewed';
    r[7]='Steps: concept:evidence, framework:ethics, theme:knower, story:11 > game:22, micro:1';
    r[33]='Remember · DOK 1\nMara said "wait, please."\n\nApply · DOK 2\nThe quay\nwas empty at marée basse.';
    r[34]='Apply · DOK 2\nquay.turn\nquay.turn\nquay.handover';
    const {chapter, observations} = readChapterCSV(encode([header,line(),r],';'),members);
    expect(chapter).toBe(3);
    const {additions} = planChapterImport(new Map(), observations);
    expect([...additions.values()]).toMatchObject([
      {bloom:'remember',dok:1,checked:false,evidence:'Mara said "wait, please."',board:{chapter:3,steps:[expect.any(Array),['game:22','micro:1']]}},
      {bloom:'apply',dok:2,checked:true,evidence:'The quay\nwas empty at marée basse.',actions:['quay.handover','quay.turn']},
    ]);
    expect(readChapterCSV(encode([header], '\t'),members).observations.size).toBe(0);
  });
  it('recognises one simultaneous ordered step and preserves private notes across an explicit status change', () => {
    const r=line(); r[9]='Reviewed'; r[33]='Keep both accounts.'; r[34]='a'; r[7]='Steps: '+ids.join(', ');
    const first=readChapterCSV(encode([header,r]),members);
    const current=planChapterImport(new Map(),first.observations).additions;
    expect([...current.values()][0].board.steps).toHaveLength(1);
    r[9]='Open'; r[33]='';r[34]='';
    const incoming=readChapterCSV(encode([header,r]),members).observations;
    expect(planChapterImport(current,incoming)).toMatchObject({differing:1,additions:new Map()});
    expect([...planChapterImport(current,incoming,true).additions.values()][0]).toMatchObject({checked:false,evidence:'Keep both accounts.',actions:['a']});
    expect(planChapterImport(current,first.observations).identical).toBe(1);
  });
  it('rejects contradictory rows, a misplaced chapter, ambiguous evidence and truncated continuations before applying changes', () => {
    const a=line();a[9]='Reviewed';const b=[...a]; b[9]='Open';
    expect(()=>readChapterCSV(encode([header,a,b]),members)).toThrow(/row 3/);
    expect(()=>readChapterCSV(encode([header,a]),members,2)).toThrow(/disagrees/);
    expect(()=>readChapterCSV(encode([header.slice(0,35),a]),members)).toThrow(/older/);
    expect(readChapterCSV(encode([header.slice(0,35),a]),members,4).chapter).toBe(4);
    a[11]='Reviewed';a[33]='Two separate claims.';expect(()=>readChapterCSV(encode([header,a]),members)).toThrow(/heading/);
    a[33]='Full value in Long entries, rows 2–5.';expect(()=>readChapterCSV(encode([header,a]),members)).toThrow(/complete text/);
    a[33]='';a[5]='';expect(()=>readChapterCSV(encode([header,a]),members)).toThrow(/framework/);
  });
});
