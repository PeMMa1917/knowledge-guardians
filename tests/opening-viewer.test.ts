import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function approach(d: Driver, id: string) {
  const prop = MAPS['nexus.archive'].interactables.find((item) => item.id === id);
  if (!prop?.node || !check(prop.visibleIf, d.s)) throw new Error(`Unable to approach ${id}`);
  expect(artKeys()).toContain(prop.art);
  return prop.node;
}

describe('The Hinged Reader', () => {
  it.each([
    ['detail', 'Put the detail at the front', 'Hang a turn-back tab'],
    ['sheet', 'Keep the full page at the front', 'Pin a transparent frame'],
  ])('trials both views and repairs the %s copy for the next reader', (view, post, fix) => {
    const d = new Driver();
    expect(approach(d, 'nexus-viewer-wait')).toBe('nexus.viewer.wait');
    expect(() => approach(d, 'nexus-viewer-start')).toThrow();
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' });
    d.walk(approach(d, 'nexus-viewer-start'), ['Slide the little reader']);
    expect(d.done('nexus.viewer.compared')).toBe(false);
    d.walk(approach(d, 'nexus-viewer-preview-detail'), ['Fold the reader back']);
    expect(d.done('nexus.viewer.compared')).toBe(true);
    d.walk(approach(d, 'nexus-viewer-preview-sheet'), [post]);
    expect(() => approach(d, 'nexus-viewer-preview-sheet')).toThrow();
    expect(() => approach(d, `nexus-viewer-fixed-${view}`)).toThrow();
    d.walk(approach(d, `nexus-viewer-${view}`), [fix]);
    expect(d.done('nexus.viewer.finished')).toBe(true);
    expect(d.e.node(approach(d, `nexus-viewer-fixed-${view}`)).text).toContain('392,046');
    expect(d.done('m01.o6.label')).toBe(false);
  });
});
