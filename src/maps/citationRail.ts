import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'citation.rail.';
const flag = (key: string, eq: boolean | string = true): Condition => ({ flag: prefix + key, eq });
const unset = (key: string): Condition => ({ not: { flagSet: prefix + key } });

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: prefix + id, node: prefix + id, kind: 'scene', x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

export const NEXUS_CITATION_RAIL: Interactable[] = [
  scene('nexus.request', 6, 10, 'Dace’s blank museum caption', 'preserved.slip', unset('nexus.started')),
  scene('nexus.drawer', 5, 9, 'the low drawer with the museum record', 'preserved.folder', flag('nexus.started')),
  scene('nexus.tray', 7, 11, 'the title and source tray', 'copies.press', { all: [flag('nexus.started'), unset('nexus.proof')] }),
  scene('nexus.proof', 7, 11, 'the full source-strip proof', 'copies.strip', { all: [flag('nexus.proof'), unset('nexus.layout')] }),
  scene('nexus.under', 9, 12, 'the Full Source Strip under the caption', 'copies.reprint',
    { all: [flag('nexus.layout', 'under'), unset('nexus.found')] }),
  scene('nexus.under-done', 9, 12, 'the checked Full Source Strip under the caption', 'preserved.display-records',
    { all: [flag('nexus.layout', 'under'), flag('nexus.found')] }),
  scene('nexus.tag', 9, 12, 'the Short Tag on the caption', 'copies.strip', flag('nexus.layout', 'shelf')),
  scene('nexus.shelf', 6, 16, 'the A606881 strip on the reading shelf', 'preserved.catalogue',
    { all: [flag('nexus.layout', 'shelf'), unset('nexus.found')] }),
  scene('nexus.shelf-done', 6, 16, 'the checked A606881 strip on the reading shelf', 'preserved.display-records',
    { all: [flag('nexus.layout', 'shelf'), flag('nexus.found')] }),
];

export const COPIES_PRESS_CITATION_RAIL: Interactable[] = [
  scene('copies.request', 3, 8, 'Lark’s rack with room for a source comb', 'preserved.folder', { all: [
    { flag: 'copies.arrived', eq: true }, { item: 'item.source-rail-comb' }, unset('copies.started'),
  ] }),
  scene('copies.object', 3, 8, 'the gallery identification plate', 'preserved.catalogue', flag('copies.started')),
  scene('copies.compare', 14, 4, 'the plate with the painted sky and the draft line', 'preserved.display-paired', flag('copies.started')),
  scene('copies.tray', 20, 11, 'the press tray for the sunset correction', 'copies.press',
    { all: [flag('copies.started'), unset('copies.layout')] }),
  scene('copies.sheet', 20, 13, 'the Full Sheet on the runner’s rail', 'copies.reprint',
    { all: [flag('copies.layout', 'sheet'), unset('copies.found')] }),
  scene('copies.sheet-done', 20, 13, 'the checked Full Sheet and the runner’s spare', 'preserved.display-records',
    { all: [flag('copies.layout', 'sheet'), flag('copies.found')] }),
  scene('copies.tag', 20, 13, 'the NG524 Card on the runner’s rail', 'copies.strip', flag('copies.layout', 'index')),
];

export const COPIES_ARCHIVE_CITATION_RAIL: Interactable[] = [
  scene('copies.index', 20, 13, 'the NG524 entry and separate gallery note', 'preserved.display-paired',
    { all: [flag('copies.layout', 'index'), unset('copies.found')] }),
  scene('copies.index-done', 20, 13, 'the NG524 comparison at the reading group’s table', 'preserved.display-records',
    { all: [flag('copies.layout', 'index'), flag('copies.found')] }),
];
