import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { INK_LETTERS, INK_STATIONS, inkDiaryTopics, inkInvitation } from '../src/domain/inkPost';
import watermarks from '../src/content/ink-post-watermarks.json';
import { encyclopediaForDiaryEvent } from '../src/domain/encyclopedia';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { MAPS } from '../src/maps';
import { migrateCampaign } from '../src/domain/saves';
import { buildPack } from '../src/content';
import { Engine } from '../src/domain/engine';

const station = (id: string) => INK_STATIONS.find((s) => s.id === id)!;
const site = (id: string) => MAPS[station(id).map].interactables.find((item) => item.id === 'ink-post.' + id)!.node!;
const engine = new Engine(buildPack());

describe('The folded-wing post', () => {
  it('connects all 140 people to two distinct chapter roosts, an identified source, and a reciprocal story', () => {
    expect(INK_LETTERS).toHaveLength(140);
    expect(new Set(INK_LETTERS.map((l) => l.question)).size).toBe(140);
    expect(new Set(INK_LETTERS.map((l) => l.character)).size).toBe(140);
    expect(new Set(INK_STATIONS.map((s) => MAPS[s.map].world)).size).toBe(15);
    expect(new Set(watermarks.flatMap((w) => w.letters))).toEqual(new Set(INK_LETTERS.map((l) => l.id)));
    expect(watermarks.flatMap((w) => w.letters)).toHaveLength(140);
    for (const l of INK_LETTERS) {
      const home = station(l.station), away = station(home.to);
      expect(away.world).not.toBe(home.world);
      expect(engine.node(site(home.id)).speaker).toBe(home.host);
      expect(inkInvitation(home.host, home.map)?.node).toBe(site(home.id));
      expect(inkInvitation(home.host, away.map)).toBeUndefined();
      expect(engine.node(site(away.id)).speaker).toBe(away.host);
      expect(engine.node('ink.' + l.id).historicalLabel).toBe('imagined-alternate');
      const source = engine.node('ink.' + l.id + '.source');
      expect(engine.pack.sources.find((s) => s.id === source.citationSource)?.supports).toBe(l.context);
      const ref = 'ink.' + l.id;
      expect(encyclopediaForDiaryEvent(engine.pack, { kind: 'conversation', ref, key: 'conversation:' + ref })?.kind).toBe('article');
      expect(inkDiaryTopics(ref)!.areas!.length).toBeGreaterThan(1);
      const arrived = engine.pack.missions.flatMap((m) => m.objectives).find((o) => o.id === ref + '.landed');
      expect(arrived?.skills).toContain('SK-MICRO-' + String(l.practice).padStart(4, '0'));
      expect(l.folds[0].action).not.toBe(l.folds[1].action);
      expect(l.folds[0].arrival).not.toBe(l.folds[1].arrival);
    }
  });

  // Drive the ordinary map entry graph with the same condition and option
  // evaluations as the live UI. Cross every combination, including prior saves.
  it.each(INK_STATIONS)('delivers each fold from $place by both routes', (home) => {
    const away = station(home.to);
    const d = new Driver();
    const fresh = d.s;
    function pick(node: string, text: string) {
      const opt = engine.visibleOptions(node, d.s).find((o) => o.option.text === text);
      expect(opt, text + ' at ' + node).toBeDefined();
      return d.run({ type: 'ChooseDialogueOption', node, index: opt!.index }).nextNode!;
    }
    for (const l of INK_LETTERS.filter((r) => r.station === home.id)) {
      const id = 'ink.' + l.id;
      for (const fold of l.folds) for (const dest of away.deliveries) {
        d.s = fresh;
        expect(engine.visibleOptions(site(away.id), d.s).some((o) => o.option.next?.endsWith('.in'))).toBe(false);
        const out = pick(site(home.id), 'Unfold a bird from this roost');
        const open = pick(out, l.title + ' · ' + l.name);
        expect(engine.node(open).speaker).toBe(l.character);
        expect(pick(open, 'Read the name beneath the wax')).toBe(id + '.source');
        expect(engine.node(id + '.source').next).toBe(open);
        const sent = pick(open, fold.action);
        expect(engine.node(sent).text).toContain(away.place);
        expect(pick(sent, 'Refold it before the keeper acts')).toBe(open);
        const incoming = pick(site(away.id), 'Catch a bird from another chapter');
        const received = pick(incoming, l.title + ' · ' + l.name);
        expect(engine.node(received).text).toBe(fold.arrival);
        const handover = pick(received, 'Take the wing to the keeper here');
        expect(engine.node(pick(handover, dest.action)).text).toContain(home.place);
        expect(engine.visibleOptions(sent, d.s).some((o) => o.option.next === open)).toBe(false);
        const reply = pick(pick(site(home.id), 'Hear what came home'), l.title + ' · ' + l.name);
        expect(engine.node(reply).text).toBe(dest.reply);
        const match = pick(reply, 'Keep the reply with ' + l.name + '’s fold');
        expect(d.s.flags[id + '.kept']).toBe(true);
        const revisited = pick(match, 'Reopen the original wing');
        expect(pick(revisited, 'Read the name beneath the wax')).toBe(id + '.source');
        expect(engine.visibleOptions(revisited, d.s).some((o) => o.option.text === fold.action)).toBe(false);
        expect(engine.visibleOptions(match, d.s).some((o) => o.option.next === id + '.light')).toBe(false);
        const pair = watermarks.find((w) => w.letters.includes(l.id))!;
        const other = pair.letters.find((q) => q !== l.id)!;
        d.s = { ...d.s, flags: { ...d.s.flags, ['ink.' + other + '.delivery']: 'second', ['ink.' + other + '.ack']: 'second' } };
        expect(engine.node(pick(match, 'Fit the two finished wings against the light')).text).toBe(pair.watermark);
        d.s = { ...d.s, flags: { ...d.s.flags, ['ink.' + other + '.delivery']: 'first' } };
        expect(engine.visibleOptions(match, d.s).some((o) => o.option.next === id + '.light')).toBe(false);
      }
    }
  });

  it.each([
    ["ink.q41585", "Play out a short proof on the tiles", "A spectator can check each move. The line settles one claim about these rules."],
    ["ink.q83163", "Stitch in a small worked case", "The finder can check the first few terms before deciding whether to chase the rest."],
    ["ink.q381783", "Map ash against paths and walls", "One patch lies in a walking lane. That gives the crew a second explanation to examine."],
    ["ink.q7967775", "Let the child move the ball's shadow", "The little eclipse crosses the table. It explains the alignment while leaving real distances open."],
    ["ink.q7259", "Thread the same pattern through a music roll", "The mechanism repeats the arrangement as sound. It needs a musician to assign the pitches."],
    ["ink.q153761", "Give each shift a seal for repairs", "The clerk can see who noticed a leak. A visitor working between shifts needs somebody to vouch for her."],
  ])('carries the chosen observation to its reader in %s', (story, choice, observation) => {
    const d = new Driver(), l = INK_LETTERS.find((l) => 'ink.' + l.id === story)!;
    const action = d.e.visibleOptions(story, d.s).find((o) => o.option.text === choice)!;
    d.run({ type: 'ChooseDialogueOption', node: story, index: action.index });
    const inbox = site(station(l.station).to) + '.in';
    const receipt = d.e.visibleOptions(inbox, d.s).find((o) => o.option.text === l.title + ' · ' + l.name)!;
    const read = d.run({ type: 'ChooseDialogueOption', node: inbox, index: receipt.index }).nextNode!;
    expect(d.e.node(read).text).toBe(observation);
  });

  it.each([['mozi', 'q272411', 'mozi'], ['haytham', 'q11104', 'ibn-al-haytham']])(
    'gives the letter and the in-person %s quest one identity and remembers the returned fold', (quest, letter, character) => {
      const d = new Driver(), wing = 'ink.' + letter, at = 'thinker.' + quest + '.after';
      expect(engine.node(wing).speaker).toBe(character);
      expect(engine.node(at).speaker).toBe(character);
      expect(engine.visibleOptions(at, d.s).some((o) => o.option.next === wing)).toBe(true);
      for (const way of ['first', 'second']) {
        d.run({ type: 'SetFlag', flag: wing + '.fold', value: way });
        expect(engine.visibleOptions(at, d.s).some((o) => o.option.next === wing)).toBe(false);
        expect(engine.visibleOptions(at, d.s).some((o) => o.option.next?.includes('.wing.'))).toBe(false);
        d.run({ type: 'SetFlag', flag: wing + '.kept', value: true });
        const reply = engine.visibleOptions(at, d.s).find((o) => o.option.next?.includes('.wing.'))!;
        expect(reply.option.next).toBe('thinker.' + quest + '.wing.' + way);
        expect(engine.node(reply.option.next!).speaker).toBe(character);
        d.run({ type: 'SetFlag', flag: wing + '.kept', value: false });
      }
    });

  it('resumes a changed fold and keeps its actual speaker and reflection in the diary', () => {
    const d = new Driver(), l = INK_LETTERS[0], s = 'ink.' + l.id;
    d.run({ type: 'EnterNode', node: s });
    d.run({ type: 'ChooseDialogueOption', node: s, index: 0 });
    d.run({ type: 'ChooseDialogueOption', node: s, index: 1 });
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.s.flags[s + '.fold']).toBe('second');
    const inbox = site(station(l.station).to) + '.in';
    expect(d.e.visibleOptions(inbox, d.s).filter((o) => o.option.text.includes(l.name)).map((o) => o.option.next)).toEqual([s + '.read.second']);
    const row = d.s.adventureDiary.entries.find((e) => e.id === 'conversation:' + s)!;
    expect(encyclopediaForDiaryEvent(d.e.pack, row.event)?.name).toBe(l.name);
    expect(diaryQuestions(row).letter).toBe(l.question);
    expect(d.s.adventureDiary.entries.some((e) => e.event?.ref === s + '.read.first')).toBe(false);
  });
});

describe('working trials inside the letters', () => {
  it('can reverse both controls in each arrangement and carries exactly the filed observation to the other chapter', () => {
    const d = new Driver();
    for (const l of INK_LETTERS) {
      const story = 'ink.' + l.id;
      if (!engine.node(story).options?.some((o) => o.next === story + '.trial.0')) continue;
      for (const i of [0, 1, 2, 3]) {
        const id = story + '.trial.' + i;
        const [first, second] = engine.node(id).options!;
        expect(engine.node(first.next!).options![0].next).toBe(id);
        expect(engine.node(second.next!).options![1].next).toBe(id);
        d.run({ type: 'ChooseDialogueOption', node: id, index: 2 });
        expect(d.s.flags[story + '.trial']).toBe(i);
        const saved = engine.visibleOptions(story + '.read.first', d.s).filter((o) => o.option.text === 'Unfold my saved trial marks');
        expect(saved).toHaveLength(1);
        expect(engine.node(saved[0].option.next!).text).toBe(engine.node(id).text);
      }
    }
  });
});
