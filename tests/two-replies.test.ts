import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { TWO_REPLIES, pendingTwoReplies, seenFlag } from '../src/domain/twoReplies';

const pack = buildPack();

describe('two replies after a key choice (decision X-008)', () => {
  it('uses two different real speakers and conditions that exist in the game', () => {
    const speakers = new Set(pack.characters.map((c) => c.id));
    const objectives = new Set(pack.missions.flatMap((m) => m.objectives.map((o) => o.id)));
    for (const e of TWO_REPLIES) {
      expect(e.replies, e.id).toHaveLength(2);
      expect(e.replies[0].speaker, e.id).not.toBe(e.replies[1].speaker);
      for (const r of e.replies) expect(speakers.has(r.speaker), `${e.id} ${r.speaker}`).toBe(true);
      if ('objective' in e.after) expect(objectives.has(e.after.objective), e.id).toBe(true);
    }
    expect(new Set(TWO_REPLIES.map((e) => e.id)).size).toBe(TWO_REPLIES.length);
  });
  it('never marks one reply as the better one', () => {
    for (const e of TWO_REPLIES) for (const r of e.replies) expect(r).not.toHaveProperty('best');
  });
  it('shows each entry once, after its condition is true', () => {
    const done = new Set<string>();
    const check = (c: any) => ('objective' in c ? done.has(c.objective) : false);
    expect(pendingTwoReplies({}, check)).toBeNull();
    done.add('m01.o6.label');
    expect(pendingTwoReplies({}, check)?.id).toBe('m01.label');
    expect(pendingTwoReplies({ [seenFlag('m01.label')]: true }, check)).toBeNull();
  });
});
