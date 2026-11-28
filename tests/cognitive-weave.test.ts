import { describe,expect,it } from 'vitest';
// @ts-expect-error audit tools run as native JS.
import { auditCognition,validatedActions } from '../tools/audit-cognitive-weave.mjs';
// @ts-expect-error independently counted source inventory.
import { reasoningRepertoire } from '../tools/reasoning-repertoire.mjs';

const audit={ worlds:[{id:'one'},{id:'two'},{id:'three'}], dimensions:[
  {id:'concept:evidence',kind:'concept'},{id:'subject:physics',kind:'subject'},{id:'bias:confirmation',kind:'bias'},
], elements:[{id:'story:1',number:1,kind:'story',status:'playable'},{id:'story:2',number:2,kind:'story',status:'excluded'},
  {id:'game:3',number:3,kind:'game',status:'playable'},{id:'game:4',number:4,kind:'game',status:'planned'}],
  bloomLevels:['remember','understand','apply','analyse','evaluate','create'],
  proofs:[{objective:'try',world:'one',actionId:'try',map:'home',target:'desk',anchor:'A',source:'tests/desk.test.ts',
    elements:['story:1'],dimensions:['concept:evidence']},{objective:'try',world:'one',actionId:'try',map:'home',target:'desk',anchor:'B',
    source:'tests/desk.test.ts',elements:['game:3'],dimensions:['concept:evidence']}],
};
const chapters={one:1,two:1,three:2};
const row={objective:'try',story:1,game:3,dimensions:['concept:evidence'],dok:3,bloom:'evaluate',demand:'Compare the two shutters.',consequence:'One reader can return.'};
describe('Bloom and depth in a single playable action',()=>{
  it('does not assemble a narrative and a mechanic from two different observations',()=>{
    expect(()=>validatedActions(audit,[row])).toThrow(/Unresolved/);
    expect(()=>validatedActions(audit,[{...row,game:undefined,anchor:'B'}])).toThrow(/Unresolved/);
    expect(validatedActions(audit,[{...row,game:undefined,anchor:'A'}])[0].actionId).toBe('try');
  });
  it('retains unreviewed, planned and excluded combinations in the population',()=>{
    const report=auditCognition(audit,chapters,[],{});
    expect(report.dimensions).toBe(2); expect(report.counts).toHaveLength(72);
    const first=report.counts.find((r:{mode:string})=>r.mode==='joint');
    expect(first).toMatchObject({possible:24,observed:0,atTarget:0,noReview:24});
    expect(auditCognition(audit,chapters,[],{scope:'all'}).dimensions).toBe(3);
  });
  it('requires ten distinct actions within the chosen unit, with exactly this joint demand',()=>{
    const rows=Array.from({length:10},(_,i)=>({...row,world:i<6?'one':'two',actionId:String(i)}));
    const opts={dimension:'concept:evidence',story:'1',game:'3',bloom:'evaluate',dok:'3'};
    const result=(unit:string)=>auditCognition(audit,chapters,[...rows,...rows],{...opts,unit}).counts[0];
    expect(result('world')).toMatchObject({observed:2,atTarget:0});
    expect(result('chapter')).toMatchObject({observed:1,atTarget:1,noReview:1});
    expect(result('campaign')).toMatchObject({observed:1,atTarget:1,noReview:0});
    expect(auditCognition(audit,chapters,rows,{...opts,dok:'4'}).counts[0].observed).toBe(0);
    expect(()=>auditCognition(audit,chapters,rows,{...opts,world:'one',chapter:'2'})).toThrow();
  });
  it('keeps common arguments distinct from the tendency and from a deliberate use',()=>{
    const ids=reasoningRepertoire.map((r:{id:string})=>r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(['bias:bandwagon','fallacy:popularity','deception:false-consensus',
      'fallacy:equivocation','deception:equivocation','fallacy:ignorance','fallacy:composition','fallacy:division']));
  });
});
