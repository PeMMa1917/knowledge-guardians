import {expect,it} from 'vitest';
import {fieldActivity} from '../src/domain/fieldActivities';
import forms from '../src/content/world-work/forms.json';

it('offers a distinct working instrument for each of the forty field game forms',()=>{
  expect(forms[0]).toHaveLength(40);
  const games=forms[0].map((_,i)=>fieldActivity(i,8,0));
  expect(new Set(games.map(g=>g.title)).size).toBe(40);
  expect(new Set(games.map(g=>g.prompt)).size).toBe(40);
  expect(games.every(g=>g.controls.length>=2 && g.help.length>0)).toBe(true);
});

it('keeps the same prism source under a filter and allows independent witnesses to support a source band',()=>{
  const bare=fieldActivity(32,3,0).move(0);
  const red=fieldActivity(32,3,bare.progress).move(1);
  expect(fieldActivity(32,3,red.progress).move(2)).toMatchObject({done:true,text:expect.stringContaining('filter')});
  const copied=fieldActivity(29,3,1).move(1);
  expect(fieldActivity(29,3,copied.progress).move(3).done).toBe(false);
  const porter=fieldActivity(29,3,copied.progress).move(2);
  expect(fieldActivity(29,3,porter.progress).move(3).done).toBe(true);
});

it('retains a chart observation through sailing, circuits through toggles, and both cooking orders',()=>{
  expect(fieldActivity(11,2,0).chart?.post).toBeUndefined();
  const surveyed=fieldActivity(11,2,0).move(4);
  expect(fieldActivity(11,2,surveyed.progress).chart).toEqual({cell:0,post:4});
  let p=0;for(const act of [0,1,1,0]){const move=fieldActivity(9,1,p).move(act);p=move.progress;}
  expect(p).toBe(12);
  for(let seed=0;seed<6;seed++){
    const start=fieldActivity(24,seed,0),first=start.move(0);
    expect(fieldActivity(24,seed,first.progress).move(0).progress).toBe(0);
  }
});

it('keeps a draft of an unsuitable forecast revisable, counts the actual knots and treats witness custody as a choice',()=>{
  expect(fieldActivity(30,6,0).move(4).done).toBe(false);
  expect(fieldActivity(30,6,5).move(2)).toMatchObject({done:false,progress:0});
  expect(fieldActivity(38,0,2).move(2).done).toBe(true);
  const first=fieldActivity(27,4,0).move(0),second=fieldActivity(27,4,0).move(1);
  expect(fieldActivity(27,4,first.progress).move(1).text).not.toBe(fieldActivity(27,4,second.progress).move(1).text);
});
