import type { GameController } from '../app/controller';
import { DATE_REGISTER_CASES, dateRegisterStation, rangeCaption, type DateRegisterCase } from '../content/dateRegisterCases';
import { BROOKLYN_KHIPU_KEY, CODEX_RAIL_CM, DRESDEN_CODEX_KEY, KHIPU_RACK, REGISTER_EVENT_NAMES, codexRail, khipuRack, type RegisterRoute } from '../domain/dateRegister';
import { h } from './dom';
import { artURL } from './illustrations';
import './dateRegister.css';

const ROLE_NAMES: Record<RegisterRoute, string> = { porch: 'Eneth’s source porch', runner: 'Caren’s date roll' };

function figure(record: DateRegisterCase): HTMLElement {
  return h('figure', { class: 'register-picture' },
    h('img', { src: record.asset ? `${import.meta.env.BASE_URL}assets/${record.asset}` : artURL('big.register.codex-fold'),
      alt: record.asset ? `Collection view of ${record.alt}.` : record.alt }),
    h('figcaption', {}, `${record.title} · ${record.accession}`,
      record.key === BROOKLYN_KHIPU_KEY ? h('small', {}, ' · Brooklyn Museum photograph, CC BY 3.0') : null));
}

function objectSide(record: DateRegisterCase, compact = false): HTMLElement {
  return h('article', { class: 'register-face' },
    h('h3', {}, record.dateKind), h('p', { class: 'register-date' }, record.date),
    compact ? null : figure(record), h('p', {}, record.observed));
}

function eventSide(record: DateRegisterCase): HTMLElement {
  return h('article', { class: 'register-face' },
    h('h3', {}, REGISTER_EVENT_NAMES[record.eventKind]), h('p', { class: 'register-date' }, String(record.eventYear)),
    h('p', {}, record.eventLine), h('p', { class: 'fine' }, `${record.institution} · ${record.accession}`));
}

export function dateRegisterPanel(controller: GameController, id: string, refresh: () => void): HTMLElement {
  const shell = h('div', { class: 'date-register', tabindex: '-1' });
  const selected = dateRegisterStation(id);
  if (!selected) return shell;
  const flag = (record: DateRegisterCase, suffix: string) => controller.state.flags[`${record.flag}.${suffix}`];
  const activate = (node: string, option: number, name: string) => {
    controller.dispatch({ type: 'ChooseDialogueOption', node, index: option });
    refresh();
    render();
    const same = shell.querySelector<HTMLButtonElement>(`[data-register-action=${name}]:enabled`);
    (same ?? shell.querySelector<HTMLButtonElement>('button:enabled') ?? shell).focus();
  };
  const button = (title: string, name: string, node: string, option: number, disabled = false) => h('button', {
    type: 'button', 'data-register-action': name, disabled, onclick: () => activate(node, option, name),
  }, title);

  const work = (record: DateRegisterCase) => {
    const seen = controller.state.cards.includes(record.card);
    const paired = flag(record, 'paired') === true;
    const codex = record.key === DRESDEN_CODEX_KEY;
    const khipu = record.key === BROOKLYN_KHIPU_KEY;
    const railReady = flag(record, 'rail.strip') === true && flag(record, 'rail.pieces') === true;
    const mountReady = flag(record, 'mount.wide') === true && flag(record, 'mount.tall') === true;
    const ready = flag(record, 'face.object') === true && flag(record, 'face.event') === true && (!codex || railReady) && (!khipu || mountReady);
    const face = flag(record, 'face');
    const route = flag(record, 'route');
    const turn = record.nodes.work;
    const selectedRail = flag(record, 'rail');
    const rail = selectedRail === 'strip' || selectedRail === 'pieces' ? codexRail(selectedRail) : undefined;
    const selectedMount = flag(record, 'mount');
    const mount = selectedMount === 'wide' || selectedMount === 'tall' ? khipuRack(selectedMount) : undefined;
    const elements = [h('h2', {}, record.title),
      !seen ? h('p', {}, 'Inspect the numbered object beside this stand. The front and the second fold use its accession.') :
        h('p', { class: 'fine' }, `${record.institution} · ${record.accession}. Lift the two folds, then fasten them at this number.`),
      h('div', { class: 'row' },
        button('Lift the object face', 'object', turn, 0, !seen), button('Lift the other date face', 'event', turn, 1, !seen)),
      seen && paired ? h('div', { class: 'register-faces' }, objectSide(record), eventSide(record))
        : seen && face === 'object' ? objectSide(record)
          : seen && face === 'event' ? eventSide(record) : null,
      codex && seen ? h('section', { class: 'register-face' }, h('h3', {}, 'Practice display rail'),
        h('p', {}, `The keeper’s model rail is ${CODEX_RAIL_CM} cm wide. Use the two lengths reported by SLUB.`),
        h('div', { class: 'row' }, button('Try the full strip', 'strip', turn, 5), button('Try each conserved piece', 'pieces', turn, 6)),
        rail ? h('div', { class: 'register-model', role: 'status' },
          ...rail.spans.map((span) => h('div', { class: 'register-span', style: { width: `${Math.min(span / CODEX_RAIL_CM * 100, 100)}%` },
            'data-overhang': span > CODEX_RAIL_CM ? 'true' : null }, `${span} cm`)),
          h('p', {}, rail.clears ? 'Each piece fits on this rail individually. You can study one piece at a time.'
            : `The extended strip overhangs the rail by ${rail.spans[0] - CODEX_RAIL_CM} cm. Fold the guide to travel.`)) : null) : null,
      khipu && seen ? h('section', { class: 'register-face' }, h('h3', {}, 'Measured outline and display frame'),
        h('p', {}, `The model frame is ${KHIPU_RACK.width} by ${KHIPU_RACK.height} cm. Try the same measured outline turned both ways.`),
        h('div', { class: 'row' }, button('Fit the outline wide', 'wide', turn, 5), button('Fit the same outline tall', 'tall', turn, 6)),
        mount ? h('div', { class: 'register-outline', role: 'status' },
          h('span', { style: { width: `${Math.min(mount.width / KHIPU_RACK.width * 100, 100)}%`, aspectRatio: `${mount.width} / ${mount.height}` },
            'data-overhang': mount.clears ? null : 'true', 'aria-hidden': 'true' }),
          h('p', {}, mount.clears ? `${mount.width} by ${mount.height} cm. The tall outline clears the frame.`
            : `${mount.width} by ${mount.height} cm. The wide outline extends ${mount.width - KHIPU_RACK.width} cm past the frame.`)) : null) : null,
      paired ? h('p', { role: 'status' }, rangeCaption(record)) : null,
      paired ? h('p', { class: 'fine' }, record.limit) : null,
      paired ? h('p', {}, flag(record, 'filed') ? 'The reader signed the receipt. It can travel again.'
        : route === 'porch' ? 'Carry the folio to Eneth’s source porch.' : route === 'runner' ? 'Carry the folio to Caren’s date roll.'
          : 'Eneth has room for the picture and two dates. Caren’s roll opens on one dated event and leads back to the object.') : null,
      h('div', { class: 'row' },
        !paired ? button('Fasten both dates by the number', 'compare', turn, 2, !ready) : null,
        paired && !route ? button('Take the guide to the source porch', 'porch', turn, 3) : null,
        paired && !route ? button('Take the date line to the runner’s roll', 'runner', turn, 4) : null)];
    shell.replaceChildren(...elements.filter((element) => element !== null));
  };

  const seaDesk = (route: RegisterRoute) => {
    const folios = DATE_REGISTER_CASES.filter((record) => flag(record, 'route') === route);
    const porch = route === 'porch';
    shell.replaceChildren(h('h2', {}, ROLE_NAMES[route]), h('p', {}, porch
      ? 'There is room for the image and both date faces here. The object’s date stays near the picture.'
      : 'Only one date faces up in the roll. The accession and the object’s date remain on the back of each strip.'),
    ...(!folios.length ? [h('p', {}, 'The slot is empty. Visit the register room through the Lantern House date annex.')] : []),
    ...folios.map((record) => h('article', { class: 'register-receipt' }, h('h3', {}, `${record.title} · ${record.accession}`),
      porch ? h('div', { class: 'register-faces' }, objectSide(record), eventSide(record)) : eventSide(record),
      porch ? null : h('p', { class: 'fine' }, `Reverse · ${record.accession} · object date ${record.date}.`),
      h('p', {}, porch ? record.porchReply : record.runnerReply),
      button(flag(record, 'filed') ? 'Receipt signed' : porch ? 'Open the guide on the porch' : 'Send the dated strip to the log',
        record.slug, record.nodes[route], 0, flag(record, 'filed') === true || !controller.state.inventory[record.item]))));
  };

  const civic = () => {
    const received = DATE_REGISTER_CASES.filter((record) => flag(record, 'filed') && controller.state.inventory[record.item]);
    shell.replaceChildren(h('h2', {}, 'Elwen’s object guide and event register'),
      h('p', {}, 'The folio brings both dates from Lantern House. The signature tells Elwen which face its first reader used.'),
      ...received.map((record) => {
        const route = flag(record, 'route');
        const copied = flag(record, 'copy');
        const objectFirst = route === 'porch';
        return h('article', { class: 'register-receipt' }, h('h3', {}, `${record.title} · ${record.accession}`),
          objectFirst ? objectSide(record, true) : eventSide(record),
          h('p', { class: 'fine' }, objectFirst ? `Event on the back · ${record.eventYear}: ${REGISTER_EVENT_NAMES[record.eventKind]}.`
            : `Object on the back · ${record.date}.`),
          copied ? h('p', {}, copied === 'object' ? 'Filed in the object guide beside the picture reference.'
            : 'Filed in the event register beside its dated evidence.') : h('p', {}, record.civicQuestion),
          button(copied ? 'Already filed' : objectFirst ? 'Set the making date in the object guide' : 'Set the other date in the event register',
            record.slug, record.nodes.civic, objectFirst ? 0 : 1, !!copied));
      }));
  };

  function render() {
    if (selected === 'civic') civic();
    else if (selected === 'porch' || selected === 'runner') seaDesk(selected);
    else if (selected) work(selected);
  }
  render();
  return shell;
}
