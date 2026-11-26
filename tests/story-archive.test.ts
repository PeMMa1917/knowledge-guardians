import { describe, expect, it } from 'vitest';
import { STORY_FRAMES, frameReady, frameViewed, type StoryFrame } from '../src/content/storyArchive';
import { frameViews, openFrameView } from '../src/domain/storyFrames';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function mapProp(d: Driver, id: string) {
  const found = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id);
  expect(found, id).toBeDefined();
  return found!;
}

function visible(d: Driver, id: string) {
  return check(mapProp(d, id).visibleIf, d.s);
}

function cross(d: Driver, id: string) {
  const door = mapProp(d, id);
  expect(visible(d, id) && check(door.openIf, d.s), id).toBe(true);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to!.map;
}

function arr() {
  const d = new Driver();
  expect(visible(d, 'stage-door')).toBe(false);
  d.s.objectivesDone.push('sea.finish');
  cross(d, 'stage-door');
  cross(d, 'stage-gallery-path');
  cross(d, 'story-archive-entrance');
  return d;
}

function inspect(d: Driver, record: StoryFrame) {
  const prop = mapProp(d, `story-frame-case-${record.key}`);
  expect(prop.kind).toBe('exhibit');
  d.run({ type: 'InspectExhibit', exhibit: prop.exhibit! });
}

function scene(d: Driver, id: string, choice: string) {
  expect(visible(d, id), id).toBe(true);
  d.walk(mapProp(d, id).node!, [choice]);
}

const [board, cycle] = STORY_FRAMES;

describe('The Story Archive', () => {
  it('keeps the Brooklyn object and separate public Met context distinct', () => {
    const d = new Driver();
    const ex = d.e.pack.exhibits.find(({ id }) => id === board.exhibit)!;
    expect(ex.specimen).toMatchObject({ key: 'brooklyn:76.20.4', accession: '76.20.4', source: board.sources[0] });
    expect(ex.dateText).toEqual('Late 19th or early 20th century');
    const records = board.sources.map((id) => d.e.pack.sources.find((source) => source.id === id)!);
    expect(records[0]).toMatchObject({ url: 'https://www.brooklynmuseum.org/objects/102210' });
    expect(records[1]).toMatchObject({ url: 'https://www.metmuseum.org/art/collection/search/690570' });
    expect(records[1].locator).toContain('separate Luba memory board');
    expect(board.variants[1].lines[0]).toContain('76.20.4');
    expect(board.variants[1].lines[1]).toContain('1977.467.3');
    expect(ex.specimen?.pixelAsset).toBeUndefined();
  });

  it('credits Nobuo and keeps receipt date, event date, and the reported remembrance distinct', () => {
    const d = new Driver();
    const ex = d.e.pack.exhibits.find(({ id }) => id === cycle.exhibit)!;
    expect(ex.specimen).toMatchObject({ key: 'hpmm:1105-0001', accession: '1105-0001', source: cycle.sources[0] });
    expect(ex.dateKind).toContain('museum receiving date');
    const records = cycle.sources.map((id) => d.e.pack.sources.find((source) => source.id === id)!);
    expect(records[0].url).toContain('data_id=19519');
    expect(records[0].supports).toContain('6 September 1985');
    expect(records[1].supports).toContain('attributes to Shinichi’s father');
    for (const variant of cycle.variants) {
      expect(variant.lines.join(' ')).toMatch(/6 August 1945/);
      expect(variant.lines.join(' ')).toMatch(/6 September 1985/);
      expect(variant.lines.join(' ')).toMatch(/Nobuo/);
    }
  });

  it('tracks two previews separately across reopens', () => {
    expect(frameViews('3')).toBe(0);
    expect(frameViews(7)).toBe(0);
    const right = openFrameView(frameViews(undefined), 1);
    expect(right).toBe(2);
    expect(openFrameView(right, 1)).toBe(right);
    expect(openFrameView(right, 0)).toBe(3);
  });

  it.each(STORY_FRAMES)('checks both $title handoffs at their different physical Gallery sites', (record) => {
    const credits = [];
    const bench = `story-frame-bench-${record.key}`;
    for (const [i, route] of record.variants.entries()) {
      const d = arr();
      expect(visible(d, bench)).toBe(false);
      inspect(d, record);
      expect(visible(d, bench)).toBe(false);
      for (const [index, stamp] of record.stamps.entries()) {
        scene(d, `story-frame-${record.key}-stamp-${stamp.name}`, stamp.action);
        expect(check(frameReady(record), d.s)).toBe(index === 1);
      }
      expect(visible(d, bench)).toBe(true);
      expect(check(frameViewed(record), d.s)).toBe(false);
      const position = i === 0 ? 0 : 1;
      const before = openFrameView(0, position);
      d.run({ type: 'SetFlag', flag: `${record.flag}.views`, value: before });
      expect(check(frameViewed(record), d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.views`, value: openFrameView(before, position === 0 ? 1 : 0) });
      expect(check(frameViewed(record), d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: `${record.flag}.ready`, value: route.key });
      expect(d.done(record.objective)).toBe(false);
      cross(d, 'story-archive-back');
      const id = `story-frame-${record.key}-${route.key}`;
      const other = `story-frame-${record.key}-${record.variants[1 - i].key}`;
      expect(visible(d, id)).toBe(true);
      expect(visible(d, other)).toBe(false);
      scene(d, id, 'Leave the caption');
      expect(d.done(record.objective)).toBe(false);
      scene(d, id, route.action);
      expect(d.done(record.objective)).toBe(true);
      expect(visible(d, `${id}-done`)).toBe(true);
      expect(visible(d, id)).toBe(false);
      expect(d.s.journal).toContain(`j.${record.flag}`);
      expect(d.e.node(mapProp(d, `${id}-done`).node!).text).toBe(route.result);
      expect(d.done(record === board ? cycle.objective : board.objective)).toBe(false);
      credits.push({ ...d.p.credit });
    }
    expect(credits[0]).toEqual(credits[1]);
  });
});
