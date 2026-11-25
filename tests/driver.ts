/** Test driver: plays the game through the domain engine (no browser). */
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
  moves(...mv: ShowdownMove[]) { for (const m of mv) { if (this.s.showdown?.outcome) break; this.run({ type: 'ShowdownMove', move: m }); } }
  done(id: string) { return this.s.objectivesDone.includes(id); }
}
