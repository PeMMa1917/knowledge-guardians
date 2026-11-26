import type { GameController } from '../app/controller';
import { GLASS_RACK_CASES, GLASS_RACK_USES, glassRackStation, type GlassMount, type GlassMode, type GlassRecord } from '../content/glassRack';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import './glassRack.css';

function glassImage(record: GlassRecord, other = false): HTMLElement {
  const asset = other ? record.otherAsset : record.wholeAsset;
  const description = other ? record.other : record.whole;
  return h('figure', { class: 'glass-photo' },
    h('img', { src: `${import.meta.env.BASE_URL}assets/${asset}`, alt: description }),
    h('figcaption', {}, other ? 'Second photograph' : 'Whole view', h('p', {}, description)));
}

function glassSource(record: GlassRecord): HTMLElement {
  return h('div', { class: 'glass-source' }, h('p', {}, record.record), h('p', { class: 'fine' }, record.limit),
    h('a', { href: record.url, target: '_blank', rel: 'noopener noreferrer' }, `Collection record · ${record.accession}`));
}

export function glassRackPanel(controller: GameController, station: string, refresh: () => void): HTMLElement {
  const shell = h('div', { class: 'glass-rack', tabindex: '-1' });
  const selected = glassRackStation(station);
  const show = (...parts: (Node | null)[]) => shell.replaceChildren(...parts.filter((part): part is Node => part !== null));
  const state = (c: GlassRecord, flag: string) => controller.state.flags[`${c.flag}.${flag}`];
  const choose = (node: string, index: number, key: string) => {
    controller.dispatch({ type: 'ChooseDialogueOption', node, index });
    refresh();
    render();
    const next = shell.querySelector<HTMLButtonElement>(`button[data-glass="${key}"]:enabled`)
      ?? shell.querySelector<HTMLButtonElement>('button:enabled');
    (next ?? shell).focus();
  };
  const button = (label: string, key: string, node: string, index: number) =>
    h('button', { type: 'button', 'data-glass': key, onclick: () => choose(node, index, key) }, label);
  const pair = (c: GlassRecord) => h('div', { class: 'glass-pair' }, glassImage(c), glassImage(c, true));

  function work(c: GlassRecord) {
    const face = state(c, 'face');
    const compared = state(c, 'compared') === true;
    const mounted = state(c, 'mount');
    const ready = controller.state.cards.includes(c.card);
    const use = GLASS_RACK_USES[c.mode];
    show(
      h('h2', {}, c.title),
      h('p', { class: 'fine' }, `${c.accession} · ${c.date}`),
      !ready ? h('p', {}, 'Inspect the numbered case beside this window first.') :
        h('div', { class: 'glass-window' }, compared ? pair(c) : face ? glassImage(c, face === 'other') : h('p', {}, 'Quena’s window is empty.')),
      !ready ? null : h('div', { class: 'row' },
        !face ? button('Set the whole view', 'whole', c.nodes.work, 0) : null,
        face === 'whole' && !compared ? button(use.action, 'other', c.nodes.work, 1) : null,
        face === 'other' ? button('Return to the whole view', 'return', c.nodes.work, 2) : null,
        compared && !mounted ? button('Send both to the broad rail', 'rail', c.nodes.work, 3) : null,
        compared && !mounted ? button('Fit a hinged pocket', 'pocket', c.nodes.work, 4) : null),
      compared ? glassSource(c) : null,
      mounted ? h('p', { role: 'status' }, mounted === 'rail' ? 'Osyth is at the rail on the west side.' : 'Rennel is at the close desk on the east side.') : null,
    );
  }

  function reader(mount: GlassMount) {
    const isRail = mount === 'rail';
    const atStation = GLASS_RACK_CASES.filter((c) => state(c, 'mount') === mount);
    show(h('h2', {}, isRail ? 'Osyth’s broad rail' : 'Rennel’s hinged pocket'),
      atStation.length ? null : h('p', {}, 'Nothing has reached this reading space.'),
      ...atStation.map((c) => {
        const ready = state(c, 'heard') === mount;
        const flipped = state(c, 'flap') === true;
        return h('article', { class: 'glass-record' }, h('h3', {}, `${c.title} · ${c.accession}`),
          isRail ? pair(c) : h('div', { class: 'glass-window' }, glassImage(c, !ready && flipped)),
          isRail || flipped ? glassSource(c) : null,
          ready ? h('p', { role: 'status' }, isRail
            ? 'Osyth matched each picture to the same record at a glance. The case can now lend its specimen.'
            : 'Rennel used the hinge, closed the pocket and kept the case number beside it. The specimen can now travel.')
            : isRail ? button('Set both photos side by side and leave the source tab', c.slug, c.nodes.rail, 0)
              : flipped ? button('Close the flap and keep the case number', c.slug, c.nodes.pocket, 1)
                : button('Lift the pocket flap for the other view', c.slug, c.nodes.pocket, 0));
      }));
  }

  function revisit(mode: GlassMode) {
    const c = GLASS_RACK_CASES.find((record) => record.mode === mode && controller.check(specimenEquipped(record.key)));
    if (!c) {
      show(h('p', {}, 'Equip a specimen whose two views fit this station.'));
      return;
    }
    const use = GLASS_RACK_USES[mode];
    const whole = state(c, 'nile-whole') === true;
    const other = state(c, 'nile-other') === true;
    const placed = state(c, 'nile');
    show(h('h2', {}, `${c.title} · ${c.accession}`),
      h('p', {}, use.title[0].toLocaleUpperCase() + use.title.slice(1) + '.'),
      other ? pair(c) : whole ? glassImage(c) : null,
      other ? glassSource(c) : null,
      h('div', { class: 'row' },
        !whole ? button('Set the whole frame against the old board', 'whole', c.nodes.revisit, 0) : null,
        whole && !other ? button(use.work, 'other', c.nodes.revisit, 1) : null,
        other && !placed ? button('Leave both views on the board', 'board', c.nodes.revisit, 2) : null,
        other && !placed ? button('Keep the views at the desk', 'desk', c.nodes.revisit, 3) : null),
      placed ? h('p', { role: 'status' }, placed === 'board' ? 'The public board is ready by the south aisle.' : 'A whole view points to the second view at the south desk.') : null);
  }

  function readback(position: 'board' | 'desk') {
    const records = GLASS_RACK_CASES.filter((c) => position === 'board' ? !!state(c, 'nile') : state(c, 'nile') === 'desk');
    show(h('h2', {}, position === 'board' ? 'Both sides on the board' : 'The reading-desk views'),
      ...records.map((c) => {
        const pointer = position === 'board' && state(c, 'nile') === 'desk';
        return h('article', { class: 'glass-record' }, h('h3', {}, `${c.title} · ${c.accession}`),
          pointer ? glassImage(c) : pair(c), glassSource(c),
          h('p', {}, pointer ? 'The matching view waits at the reading desk, two steps east.' : `Marek: “${GLASS_RACK_USES[c.mode].response}”`));
      }));
  }

  function render() {
    if (station === 'board' || station === 'desk') readback(station);
    else if (selected === 'rail' || selected === 'pocket') reader(selected);
    else if (typeof selected === 'string') revisit(selected);
    else if (selected) work(selected);
  }

  render();
  return shell;
}
