import probes from './pocket-theatre-traces.json';
import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import {
  edition,
  fittedPane,
  incomingSheet,
  panes,
  paneSeen,
  returnReceipt,
  theatreById,
  theatreEffects,
  theatreKey,
  theatreMap,
  theatreStops,
  theatreStories,
  type Side,
  type TheatreCommand,
  type TheatreStory,
} from '../src/domain/pocketTheatre';
import { artKeys } from '../src/ui/illustrations';
import { theatreProps } from '../src/ui/pocketTheatreArt';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { totalXP } from '../src/domain/permanent';
import { diaryQuestions } from '../src/domain/diaryReflection';
import type { CampaignState } from '../src/domain/types';
type Move = TheatreCommand extends infer C
  ? C extends TheatreCommand
    ? Omit<C, 'type' | 'story'>
    : never
  : never;
type State = Pick<CampaignState, 'mapId' | 'flags'>;
const sides = [0, 1] as const;
function move(s: State, story: TheatreStory, act: Move) {
  for (const e of theatreEffects(s, {
    ...act,
    type: 'WorkPocketTheatre',
    story: story.id,
  }))
    if ('setFlag' in e) s.flags[e.setFlag] = e.value;
}
function fixture(s: State, story: TheatreStory, side: Side) {
  const act = (c: Move) => move(s, story, c);
  act({ act: 'open' });
  act({ act: 'rehearse', side: 'wait' });
  for (const lever of sides) act({ act: 'fit', lever, side: 1 });
  act({ act: 'send', side });
}
describe('the travelling pocket theatre', () => {
  it('gives every chapter two independent streets and a real working sheet from another chapter', () => {
    const art = new Set(artKeys());
    expect(theatreStops).toHaveLength(15);
    expect(theatreStories).toHaveLength(30);
    expect(new Set(theatreStories.map((s) => s.title)).size).toBe(30);
    for (const [i, stop] of theatreStops.entries()) {
      const map = MAPS[stop.map];
      expect(
        map.interactables.filter((p) => p.id === 'travelling-pocket-theatre'),
      ).toHaveLength(1);
      expect(theatreStories.filter((s) => s.chapter === i + 1)).toHaveLength(2);
      const fixture = map.interactables.find(
        (p) => p.id === 'travelling-pocket-theatre',
      )!;
      expect(fixture.walkThrough).toBe(true);
      expect(art.has(fixture.art!)).toBe(true);
      expect(
        map.interactables.filter((p) => p.x === stop.x && p.y === stop.y),
      ).toHaveLength(1);
    }
    for (const story of theatreStories) {
      const peer = theatreById.get(story.peer)!;
      expect(peer.peer).toBe(story.id);
      expect(peer.chapter).not.toBe(story.chapter);
      expect(new Set(story.readings).size).toBe(4);
      expect(new Set(story.controls.flat()).size).toBe(4);
      expect(story.editions[0].immediate).not.toEqual(
        story.editions[1].immediate,
      );
      expect(story.deliveries[0].reading).not.toEqual(
        story.deliveries[1].reading,
      );
      expect(art.has(theatreProps[story.id])).toBe(true);
    }
  });
  it.each(probes)(
    'reaches the expected evidence at $story for $patterns',
    (probe) => {
      const story = theatreById.get(probe.story)!;
      const s: State = { mapId: theatreMap(story), flags: {} };
      move(s, story, { act: 'open' });
      move(s, story, { act: 'rehearse', side: 'wait' });
      move(s, story, { act: 'fit', lever: 0, side: (probe.pane & 1) as Side });
      move(s, story, { act: 'fit', lever: 1, side: (probe.pane >> 1) as Side });
      const seen = fittedPane(s, story.id);
      expect(paneSeen(s, story.id, seen)).toBe(true);
      expect(story.readings[seen]).toContain(probe.excerpt);
      expect(story.patterns).toEqual(expect.arrayContaining(probe.patterns));
      expect(probe.basis.length).toBeGreaterThan(20);
    },
  );
  it.each(theatreStories)(
    'can receive and return both editions of $title, change sides, and resume at the fitted scene',
    (story) => {
      const s: State = { mapId: theatreMap(story), flags: {} },
        peer = theatreById.get(story.peer)!;
      fixture(s, story, 0);
      expect(fittedPane(s, story.id)).toBe(3);
      expect(returnReceipt(s, story)).toBeUndefined();
      for (const side of sides) {
        s.mapId = theatreMap(story);
        move(s, story, { act: 'send', side });
        expect(edition(s, story.id)).toBe(side);
        s.mapId = theatreMap(peer);
        move(s, peer, { act: 'open' });
        expect(incomingSheet(s, peer)).toMatchObject({
          side,
          reading: peer.deliveries[side].reading,
        });
        expect(returnReceipt(s, story)).toBeUndefined();
        move(s, peer, { act: 'receive' });
        s.mapId = theatreMap(story);
        move(s, story, { act: 'return' });
        expect(returnReceipt(s, story)?.reading).toBe(
          peer.deliveries[side].reading,
        );
        expect(fittedPane(s, story.id)).toBe(3);
      }
    },
  );
  it.each(theatreStories)(
    'allows three first directions, four held comparisons and either public commitment at $id',
    (story) => {
      for (const first of [0, 1, 'wait'] as const)
        for (const last of sides) {
          const s: State = { mapId: theatreMap(story), flags: {} };
          const play = (c: Move) => move(s, story, c);
          play({ act: 'open' });
          expect(() => play({ act: 'send', side: last })).toThrow();
          play({ act: 'rehearse', side: first });
          expect(() => play({ act: 'rehearse', side: first })).toThrow();
          play({ act: 'fit', lever: 1, side: 1 });
          expect(fittedPane(s, story.id)).toBe(2);
          expect(() => play({ act: 'send', side: last })).toThrow();
          play({ act: 'fit', lever: 0, side: 1 });
          play({ act: 'send', side: last });
          expect(() => play({ act: 'margin' })).toThrow();
          play({ act: 'fit', lever: 1, side: 0 });
          play({ act: 'margin' });
          expect(panes.every((p) => paneSeen(s, story.id, p))).toBe(true);
          expect(s.flags[theatreKey(story.id, 'first')]).toBe(first);
          expect(edition(s, story.id)).toBe(last);
        }
    },
  );
  it('shows the signed order only in its reached view, and leaves the listening-room cutter’s intent open', () => {
    const d = new Driver();
    const paper = theatreById.get('tuesday-fold')!,
      reel = theatreById.get('rolled-echo')!;
    const play = (st: TheatreStory, m: Move) =>
      d.run({ ...m, type: 'WorkPocketTheatre', story: st.id });
    d.s.mapId = theatreMap(paper);
    play(paper, { act: 'open' });
    expect(() => play(reel, { act: 'open' })).toThrow();
    expect(() => play(paper, { act: 'receive' })).toThrow();
    play(paper, { act: 'rehearse', side: 0 });
    expect(JSON.stringify(d.s.adventureDiary)).not.toContain('look unbroken');
    play(paper, { act: 'fit', lever: 0, side: 1 });
    play(paper, { act: 'fit', lever: 1, side: 1 });
    expect(JSON.stringify(d.s.adventureDiary)).toContain('look unbroken');
    play(paper, { act: 'send', side: 1 });
    const xp = totalXP(d.p);
    play(paper, { act: 'send', side: 0 });
    expect(totalXP(d.p)).toBe(xp);
    expect(JSON.stringify(d.s.adventureDiary)).not.toContain(
      'POCKET-READING-INTENT',
    );
    play(paper, { act: 'fit', lever: 0, side: 0 });
    play(paper, { act: 'margin' });
    expect(JSON.stringify(d.s.adventureDiary)).toContain(
      'POCKET-READING-INTENT',
    );
    d.s.mapId = theatreMap(reel);
    play(reel, { act: 'open' });
    play(reel, { act: 'receive' });
    play(reel, { act: 'rehearse', side: 'wait' });
    play(reel, { act: 'fit', lever: 0, side: 1 });
    play(reel, { act: 'fit', lever: 1, side: 1 });
    expect(JSON.stringify(d.s.adventureDiary)).toContain(
      'cutter’s intention open',
    );
    d.s.mapId = theatreMap(paper);
    play(paper, { act: 'return' });
    expect(d.done(theatreKey(paper.id, 'return'))).toBe(true);
    const p = d.e.pack.missions.find((m) => m.id === 'KG-POCKET-TUESDAY-FOLD')!;
    for (const o of p.objectives)
      expect(d.e.pack.hints.filter((h) => h.objective === o.id)).toHaveLength(
        4,
      );
    expect(check(p.available, d.s)).toBe(true);
    expect(
      Object.values(
        diaryQuestions({
          id: 'pocket:tuesday-fold:open',
          title: paper.title,
          kind: 'experience',
        }),
      ),
    ).toEqual(paper.questions);
  });
});
