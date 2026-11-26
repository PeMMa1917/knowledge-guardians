import type { GameController } from '../app/controller';
import { DATE_PEG_CASES, DATE_PEG_DOCK, DATE_PEG_MARKET, datePegStation, type DatePegCase, type DatePegRoute } from '../content/datePegCases';
import { onDatePeg, pegYear, pegWindow } from '../domain/datePeg';
import { h } from './dom';
import './datePeg.css';

function timeline(record: DatePegCase, year: number | undefined): HTMLElement {
  const start = Math.min(...record.docs.map((item) => item.first));
  const stop = Math.max(...record.docs.map((item) => item.last), ...record.pegs);
  const scale = (date: number) => ((date - start) / Math.max(1, stop - start)) * 100;
  return h('div', { class: 'date-peg-timeline' },
    ...record.docs.map((item) => h('div', { class: 'date-peg-row' },
      h('h3', {}, `${item.title} · ${item.accession}`),
      h('p', { class: 'fine' }, `Catalogue date ${item.date}. Search limits ${pegWindow(item)}.`),
      h('div', { class: 'date-peg-track', 'aria-hidden': 'true' },
        h('span', { class: 'date-peg-range', style: { left: `${scale(item.first)}%`, width: `${scale(item.last) - scale(item.first)}%` } }),
        year === undefined ? null : h('span', { class: 'date-peg-marker', style: { left: `${scale(year)}%` } })),
      year === undefined ? null : h('p', { class: 'fine' }, onDatePeg(item, year)
        ? `${pegYear(year)} lies within this search interval.`
        : `${pegYear(year)} lies outside this search interval.`))));
}

export function datePegPanel(controller: GameController, station: string, refresh: () => void): HTMLElement {
  const panel = h('div', { class: 'date-peg-panel', tabindex: '-1' });
  const press = (node: string, index: number, key: string) => {
    controller.dispatch({ type: 'ChooseDialogueOption', node, index });
    refresh();
    render();
    const same = panel.querySelector<HTMLButtonElement>(`button[data-peg=${key}]:enabled`);
    (same ?? panel.querySelector<HTMLButtonElement>('button:enabled') ?? panel).focus();
  };
  const button = (key: string, text: string, action: () => void, disabled = false) => h('button', {
    type: 'button', 'data-peg': key, onclick: action, disabled,
  }, text);

  const receiver = (route: DatePegRoute) => {
    const market = route === DATE_PEG_MARKET;
    const guides = DATE_PEG_CASES.filter(({ flag }) => controller.state.flags[`${flag}.route`] === route);
    panel.replaceChildren(h('h2', {}, market ? 'Irven’s market bench' : 'Mireth’s dock roll'),
      h('p', {}, market
        ? 'Irven has room to show both object records at the same time.'
        : 'Mireth’s sleeve takes one illustrated sheet. The second source and its date are written on the reverse.'),
      ...(!guides.length ? [h('p', {}, 'The clip is empty. Try the date bench in the Lantern House annex.')] : []),
      ...guides.map((report) => {
        const done = controller.state.flags[`${report.flag}.received`] === route;
        return h('article', { class: 'date-peg-reply' }, h('h3', {}, report.title),
          h('div', { class: 'date-peg-sheets' }, ...(market ? report.docs : [report.docs[1], report.docs[0]]).map((item, index) => h('figure', {},
            market || index === 0 ? h('img', { src: `${import.meta.env.BASE_URL}assets/${item.asset}`, alt: `Collection view of ${item.alt}.` }) : null,
            h('figcaption', { class: 'fine' },
              `${market ? '' : index === 0 ? 'Face · ' : 'Reverse · '}${item.title} · ${item.accession} · ${item.date}`)))),
          h('p', {}, market ? report.marketReply : report.dockReply),
          button(report.slug, done ? 'Filed in the journal' : market ? 'Pass on the two dated sheets' : 'File the signed pocket sheet',
            () => press(report.nodes[route], 0, report.slug), done || !controller.state.inventory[report.item]));
      }));
  };

  const render = () => {
    const record = datePegStation(station);
    if (typeof record === 'string') { receiver(record); return; }
    if (!record) return;
    const flags = controller.state.flags;
    const sourcesSeen = record.docs.every(({ card }) => controller.state.cards.includes(card));
    const compared = record.pegs.every((_, index) => flags[`${record.flag}.tried.${index}`] === true);
    const route = flags[`${record.flag}.route`];
    const last = flags[`${record.flag}.year`];
    panel.replaceChildren(h('h2', {}, record.title),
      h('p', {}, 'Move the same peg across both search intervals. Each object keeps the date wording from its own catalogue.'),
      sourcesSeen ? timeline(record, typeof last === 'number' ? last : undefined) : h('p', {}, 'Inspect both collection cases beside this bench to bring their date strips here.'),
      h('div', { class: 'row' }, ...record.pegs.map((year, index) => button(`test-${index}`, `Move the peg to ${pegYear(year)}`,
        () => press(record.nodes.board, index, `test-${index}`), !sourcesSeen))),
      h('p', { class: 'fine', role: 'status' }, compared ? record.common
        ? `Shared search interval ${pegWindow(record.common)}. A possible overlap cannot establish when either object was made.`
        : 'The two search intervals have no year in common. The gap belongs to these two dated records.'
        : 'Try both peg positions before folding a guide.'),
      h('p', {}, flags[`${record.flag}.received`] ? 'The signed guide is with its reader.'
        : route === DATE_PEG_MARKET ? 'Carry the wide guide to Irven at the market bench.'
          : route === DATE_PEG_DOCK ? 'Carry the pocket guide to Mireth at the dock roll.'
          : 'A wide guide keeps both pictures together at Irven’s bench. Mireth can carry one picture in the covered dock roll, with the second source on the back.'),
      h('div', { class: 'row' },
        button('market', 'Take the wide guide', () => press(record.nodes.board, 2, 'market'), !compared || !!route),
        button('dock', 'Take the pocket guide', () => press(record.nodes.board, 3, 'dock'), !compared || !!route)));
  };
  render();
  return panel;
}
