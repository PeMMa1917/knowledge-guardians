import { describe, expect, it } from 'vitest';
import { OTHERS, TREES, VIEWS, collinear, paces, shapeOf, sides } from '../src/domain/threeTrees';

describe('The Three Trees', () => {
  it('the grove has at least one straight line of three trees, so the grove can push back', () => {
    let lines = 0;
    for (let i = 0; i < TREES.length; i++) for (let j = i + 1; j < TREES.length; j++) for (let k = j + 1; k < TREES.length; k++)
      if (collinear(TREES[i], TREES[j], TREES[k])) lines++;
    expect(lines).toBeGreaterThan(0);
  });

  it('names the shape a choice makes', () => {
    expect(shapeOf(['oak', 'ash'])).toBe('too-few');
    expect(shapeOf(['oak', 'ash', 'rowan'])).toBe('triangle');
    expect(shapeOf(['oak', 'alder', 'rowan'])).toBe('line');
    expect(shapeOf(['oak', 'yew', 'lime', 'pine'])).toBe('four-sided');
  });

  it("the other people's shapes are real shapes in the same grove", () => {
    expect(shapeOf(OTHERS[0].trees)).toBe('triangle');
    expect(shapeOf(OTHERS[1].trees)).toBe('four-sided');
  });

  it('a distance is the same from either end', () => {
    expect(paces('oak', 'ash')).toBe(paces('ash', 'oak'));
    expect(paces('oak', 'ash')).toBeGreaterThan(0);
    expect(sides(['a', 'b', 'c'])).toEqual([['a', 'b'], ['b', 'c'], ['c', 'a']]);
  });

  it('every view gets a reply (no hidden right answer)', () => {
    expect(VIEWS.length).toBe(3);
    for (const v of VIEWS) expect(v.reply.length).toBeGreaterThan(40);
  });
});
