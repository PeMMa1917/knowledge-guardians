import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(map: string, id: string) {
  const found = MAPS[map]?.interactables.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown prop ${map} ${id}`);
  return found;
}

function displayed(d: Driver, id: string) {
  return check(prop('preserved.gallery', `preserved-gallery-${id}`).visibleIf, d.s);
}

function start() {
  const d = new Driver();
  d.s.objectivesDone.push('preserved.publish');
  d.s.mapId = 'preserved.gallery';
  d.s.flags['preserved.display'] = 'records';
  return d;
}

function mountCorePanels(d: Driver) {
  d.walk('gallery.panel.royal', ['custody record at the front']);
  d.walk('gallery.panel.coast', ['Open the context note']);
}

describe('A Rail with Room to Read', () => {
  it('opens independently after the first Cold Store display and needs both core panels to configure a layout', () => {
    const d = new Driver();
    const door = prop('preserved.archive', 'preserved-door-gallery');
    expect(door.to?.map).toBe('preserved.gallery');
    expect(check(door.openIf, d.s)).toBe(false);
    expect(check(door.openIf, start().s)).toBe(true);

    const gallery = start();
    expect(displayed(gallery, 'layout')).toBe(false);
    expect(gallery.e.visibleOptions('gallery.layout', gallery.s)).toHaveLength(1);
    gallery.walk('gallery.panel.royal', ['custody record at the front']);
    expect(displayed(gallery, 'layout')).toBe(false);
    gallery.walk('gallery.panel.coast', ['Open the context note']);
    expect(displayed(gallery, 'layout')).toBe(true);
    expect(gallery.done('gallery.o.panels')).toBe(true);
  });

  it('unlocks the two extra panels independently and keeps the core panel choices separate', () => {
    const d = start();
    mountCorePanels(d);
    expect(displayed(d, 'panel-xin')).toBe(false);
    expect(displayed(d, 'panel-copper')).toBe(false);
    expect(displayed(d, 'xin-space')).toBe(true);
    expect(displayed(d, 'copper-space')).toBe(true);

    d.s.objectivesDone.push('copper.o.display');
    expect(displayed(d, 'panel-xin')).toBe(false);
    expect(displayed(d, 'panel-copper')).toBe(true);
    d.walk('gallery.panel.copper', ['Hang the two evidence markers']);
    d.s.objectivesDone.push('xin.o.display');
    expect(displayed(d, 'panel-xin')).toBe(true);
    d.walk('gallery.panel.xin', ['Put the two dated records']);

    d.walk('gallery.panel.royal', ['temple and custody records side by side']);
    expect(d.s.flags['gallery.panel.royal']).toBe('temple');
    expect(d.s.flags['gallery.panel.coast']).toBe('conditions');
    expect(d.s.flags['gallery.panel.copper']).toBe('points');
    expect(d.s.flags['gallery.panel.xin']).toBe('source');
  });

  it.each([
    ['rooms', 'Open separate', 'Bring a large-print', 'copies'],
    ['rooms', 'Open separate', 'Set a chair', 'seat'],
    ['links', 'Connect the cases', 'What evidence survives', 'survival-link'],
    ['links', 'Connect the cases', 'Where does this record', 'gap-link'],
  ])('lets a visitor change the %s layout through %s and %s with neutral credit', (layout, arrange, respond, outcome) => {
    const d = start();
    const credit = { ...d.p.credit };
    mountCorePanels(d);
    d.walk('gallery.layout', [arrange]);
    expect(d.s.flags['gallery.layout']).toBe(layout);
    expect(displayed(d, `visitor-${layout}`)).toBe(true);
    expect(displayed(d, outcome)).toBe(false);
    d.walk(`gallery.visitor.${layout}`, [respond]);
    expect(displayed(d, outcome)).toBe(true);
    expect(d.done('gallery.o.reply')).toBe(true);
    expect(d.s.journal).toContain('j.gallery.reply');
    expect(d.p.moments['moment.gallery.reply']).toBeTruthy();
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['preserved.display']).toBe('records');

    d.walk('gallery.layout', [layout === 'rooms' ? 'Connect the cases' : 'Open separate']);
    expect(displayed(d, outcome)).toBe(false);
    d.walk('gallery.layout', [arrange]);
    expect(displayed(d, outcome)).toBe(true);
    expect(d.s.journal.filter((id) => id === 'j.gallery.reply')).toHaveLength(1);
  });
});
