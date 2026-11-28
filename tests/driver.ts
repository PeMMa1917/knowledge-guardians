/** Test driver: plays the game through the domain engine (no browser). */
import { PASSAGES } from '../src/domain/corridor';
import { Engine, newCampaign, type GameEvent } from '../src/domain/engine';
import { buildPack } from '../src/content';
import { newPermanent } from '../src/domain/permanent';
import type { CampaignState, PermanentRecord } from '../src/domain/types';
import type { ShowdownMove } from '../src/domain/showdown';

const pack = buildPack();

export class Driver {
  e = new Engine(pack);
  s: CampaignState = newCampaign(pack, 'Tester', 'player-a', 7);
  p: PermanentRecord = newPermanent();
  events: GameEvent[] = [];
  run(cmd: Parameters<Engine['dispatch']>[0]) {
    const o = this.e.dispatch(cmd, this.s, this.p);
    const err = o.events.find((x) => x.kind === 'error');
    if (err) throw new Error((err as any).message);
    this.s = o.state; this.p = o.permanent; this.events.push(...o.events);
    return o;
  }
  /** Talk to a character, choosing options whose text includes each pick in turn. */
  talk(who: string, ...picks: string[]) {
    const node: string | null = this.e.talkEntry(who, this.s);
    if (!node) throw new Error(`no entry for ${who}`);
    this.walk(node, picks);
  }
  walk(start: string, picks: string[] = []) {
    let node: string | null = start;
    while (node) {
      this.run({ type: 'EnterNode', node });
      const opts = this.e.visibleOptions(node, this.s);
      if (opts.length === 0) { node = this.e.node(node).next ?? null; continue; }
      const pick = picks.shift();
      const choice = pick ? opts.find((o) => o.option.text.includes(pick)) : opts[0];
      if (!choice) throw new Error(`option "${pick}" not found at ${node}: ${opts.map((o) => o.option.text).join(' | ')}`);
      node = this.run({ type: 'ChooseDialogueOption', node, index: choice.index }).nextNode ?? null;
    }
  }
  /** Seed a prepared return route without finishing the optional cases under test. */
  resumeAfter(...objectives: string[]) {
    const done = new Set([...this.s.objectivesDone, ...objectives]);
    for (const id of objectives) {
      const chapter = PASSAGES.findIndex(p => p.finish === id) + 1;
      let previous: number[] = [];
      if (chapter >= 3 && chapter <= 7) previous = [2];
      if (chapter === 8 || chapter === 9) previous = [2,3,5,6];
      if (chapter === 10) previous = [9];
      if (chapter === 12 || chapter === 13) previous = [11];
      if (chapter === 14) {
        previous = Array.from({length:13},(_,i)=>i+1);
        for (let i=1;i<=14;i++) this.s.flags['temple.gift.'+i]=true;
      }
      for (const n of previous) done.add(PASSAGES[n-1].finish);
    }
    this.s.objectivesDone = [...done];
  }
  moves(...mv: ShowdownMove[]) { for (const m of mv) { if (this.s.showdown?.outcome) break; this.run({ type: 'ShowdownMove', move: m }); } }
  done(id: string) { return this.s.objectivesDone.includes(id); }
}
