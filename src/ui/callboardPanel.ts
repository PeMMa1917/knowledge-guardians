import type { GameController } from '../app/controller';
import { CALLBOARD_CASES, GAGE, HEARTH, HEARTH_CREDITS, QUETZALECATZIN, callboardReturnCases, callboardStation, type CallboardCase } from '../content/callboardCases';
import { callboardLayout, type CallboardLayout } from '../domain/callboard';
import { specimenEquipped } from '../domain/specimenGear';
import { h } from './dom';
import { artURL } from './illustrations';
import './callboard.css';

function hearthRoles(): HTMLElement {
  return h('ul', {}, ...HEARTH_CREDITS.map(({ name, role }) => h('li', {}, h('strong', {}, name), ` · ${role}`)));
}

function proof(c: CallboardCase, content: 'view' | 'record'): HTMLElement {
  if (content === 'record') return h('article', { class: 'callboard-proof' },
    h('h3', {}, 'Catalogue support'), h('p', {}, c.record),
    c.key === HEARTH ? hearthRoles() : c.maker ? h('p', {}, `Collection credit names ${c.maker}.`) : null,
    h('p', { class: 'fine' }, c.limit));
  return h('article', { class: 'callboard-proof' }, h('h3', {}, 'Visible detail'),
    h('img', { src: c.asset ? `${import.meta.env.BASE_URL}assets/${c.asset}` : artURL('big.callboard.gage-mount'), alt: `View of ${c.alt}.` }),
    h('p', {}, c.view), h('p', { class: 'fine' }, `${c.institution} · ${c.accession} · ${c.date}`));
}

export function callboardPanel(controller: GameController, station: string, refresh: () => void): HTMLElement {
  const shell = h('div', { class: 'callboard-panel', tabindex: '-1' });
  const selected = callboardStation(station);
  if (!selected) return shell;
  const flag = (c: CallboardCase, part: string) => controller.state.flags[`${c.flag}.${part}`];
  const pick = (node: string, index: number, key: string) => {
    controller.dispatch({ type: 'ChooseDialogueOption', node, index });
    refresh(); render();
    const next = shell.querySelector<HTMLButtonElement>(`button[data-callboard=${key}]:enabled`) ?? shell.querySelector<HTMLButtonElement>('button:enabled');
    (next ?? shell).focus();
  };
  const button = (label: string, key: string, node: string, index: number, disabled = false) =>
    h('button', { type: 'button', 'data-callboard': key, onclick: () => pick(node, index, key), disabled }, label);

  const work = (c: CallboardCase) => {
    const inspected = controller.state.cards.includes(c.card);
    const view = flag(c, 'checked.view') === true, record = flag(c, 'checked.record') === true;
    const layout = flag(c, 'layout') as CallboardLayout | undefined;
    const hearth = c.key === HEARTH;
    const elements = [h('h2', {}, c.title), h('p', { class: 'fine' }, `${c.institution} · ${c.accession}`),
      !inspected ? h('p', {}, 'Inspect the numbered collection case before using its clips.') : null,
      h('div', { class: 'row' }, button('Place the visible detail', 'view', c.nodes.check, 0, !inspected),
        button('Clip the catalogue evidence', 'record', c.nodes.check, 1, !inspected)),
      !view && !record ? null : h('div', { class: 'callboard-clips' }, view ? proof(c, 'view') : null, record ? proof(c, 'record') : null),
      h('p', {}, layout === 'bench' ? 'Bring the two parts to the first reading bench.' : layout === 'separate'
        ? 'Show the view at the first bench. Take the source to the later desk.' : 'Choose the first bench for both pieces, or offer a quick picture read followed by time with the source.'),
      h('div', { class: 'row' }, button(hearth ? 'Send the image and credits together' : 'Send both to the first bench', 'bench', c.nodes.check, 2, !view || !record || !!layout),
        button(hearth ? 'Send the image first and call for the credits later' : 'Set two separate calls', 'separate', c.nodes.check, 3, !view || !record || !!layout))];
    shell.replaceChildren(...elements.filter((element) => element !== null));
  };

  const desk = (stop: 'first' | 'second') => {
    const guides = CALLBOARD_CASES.filter((c) => stop === 'first' ? !!flag(c, 'layout') : flag(c, 'layout') === 'separate' && flag(c, 'first') === true);
    shell.replaceChildren(h('h2', {}, stop === 'first' ? 'First reading bench' : 'Later source call'),
      h('p', {}, guides.length ? 'Each signed receipt stays with its guide and the exact object it refers to.' : 'There are no ready guides on this bench.'),
      ...guides.map((c) => {
        const layout = flag(c, 'layout') as CallboardLayout;
        const signed = !!flag(c, 'heard');
        const seen = stop === 'first' && layout === 'separate' && flag(c, 'first') === true;
        const pieces = callboardLayout(layout)[stop];
        const reply = c.key === HEARTH && (signed || seen)
          ? (stop === 'second' ? 'Neris clips three credits to the waiting image. The first reading is still marked as a look at the room.'
            : layout === 'separate' ? 'Neris can show the hearth now. The name rail stays empty at this bench. The source desk has a reserved clip.'
              : 'Neris lays out the image with the artist, printer and publisher. This bench stays occupied while the queue reads all three.')
          : null;
        return h('article', { class: 'callboard-guide' }, h('h3', {}, `${c.accession} · ${c.title}`),
          h('div', { class: 'callboard-clips' }, ...pieces.map((item) => proof(c, item))),
          button(signed ? 'Reading signed' : seen ? 'Picture heard. Visit the later desk.' : stop === 'first' && layout === 'separate' ? 'Give the first reading' : 'Sign the supported reading',
            c.slug, c.nodes[stop], stop === 'first' && layout === 'separate' ? 1 : 0, signed || seen),
          reply ? h('p', { role: 'status' }, reply) : null);
      }));
  };

  const returnDesk = (slot: 'claims' | 'maker' | 'return-view') => {
    const c = callboardReturnCases(slot).find(({ key }) => controller.check(specimenEquipped(key)));
    if (!c) return;
    const loc = c.key === QUETZALECATZIN, gage = c.key === GAGE, hearth = c.key === HEARTH;
    const view = flag(c, 'return.view') === true, record = flag(c, 'return.record') === true, done = flag(c, 'returned') === true;
    shell.replaceChildren(h('h2', {}, loc ? 'The two lines on a land record' : gage ? 'Three different names for this mount'
      : hearth ? 'Room for three print credits' : 'The earlier display with a second clip'),
      h('p', {}, loc ? 'The old route book can keep genealogy beside the represented claim. The two headings do different work.'
        : gage ? 'The sample ledger has an empty maker field. The name on the iron and the later museum entry each need their own clip.'
          : hearth ? 'The space under the next harbour print has one blank line. Use both clips to leave a place for the artist, printer and publisher.'
            : 'The same image fits the earlier stand. Add its exact source before keeping the wider claim.'),
      h('div', { class: 'row' }, button(loc ? 'Trace the ancestor line' : gage ? 'Lift the inscribed name' : 'Place the object detail', 'view', c.nodes.return, 0, done),
        button(loc ? 'Trace the recorded land claim' : gage ? 'Open the custody slip' : 'Clip the separate source', 'record', c.nodes.return, 1, done)),
      h('div', { class: 'callboard-clips' },
        view ? h('article', { class: 'callboard-proof' }, h('h3', {}, loc ? 'Ancestor' : gage ? 'Name on the inscription' : 'Visible detail'),
          h('p', {}, loc ? 'The 1480 leader Lord-11 Quetzalecatzin is shown as a family ancestor. The painter-scribes’ names remain open.'
            : gage ? 'The dated 1850 inscription names Phineas Gage. The museum’s provenance gives the maker as an unnamed Cavendish blacksmith.' : c.view)) : null,
        record ? h('article', { class: 'callboard-proof' }, h('h3', {}, loc ? 'Claim' : gage ? 'Museum return' : 'Source limits'),
          h('p', {}, loc ? 'John Hessler describes the de León family’s land claims in the 1570–1595 manuscript. The document records claims, with who presented them kept visible.'
            : gage ? 'Hannah Trussell Swetland Gage transferred the iron to Harlow in 1867. His later museum donation has its own dated entry in 1868.' : c.record),
          hearth ? hearthRoles() : null, h('p', { class: 'fine' }, c.limit)) : null),
      button(done ? 'Checked notice mounted' : hearth ? 'Fit a three-line credit guide' : 'Mount both evidence clips', 'mount', c.nodes.return, 2, !view || !record || done));
    if (hearth && done) shell.append(h('p', { role: 'status' }, 'Renna leaves three separate lines ready for the next print. Its maker details can wait for its own record.'));
  };

  function render() {
    if (selected === 'first' || selected === 'second') desk(selected);
    else if (typeof selected === 'string') returnDesk(selected);
    else if (selected) work(selected);
  }
  render();
  return shell;
}
