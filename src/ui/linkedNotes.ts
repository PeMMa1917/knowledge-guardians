import type { GameController } from '../app/controller';
import { h } from './dom';
import { artURL } from './illustrations';

const SOURCES = [
  { key: 'issue', title: 'Issue reference', text: '7 Rainbell · Neran sent R-7 to the Study.', target: 'the loan book by the north wall' },
  { key: 'trace', title: 'Work reference', text: 'Press work · The Study used R-7 to align a fold.', target: 'the marked practice sheet by the east wall' },
] as const;

export function linkedNotes(
  site: 'study' | 'voices',
  controller: GameController,
  sound: (key: string) => void,
  refreshWorld: () => void,
): HTMLElement {
  const panel = h('div');
  const read = (key: string) => controller.state.flags[`linked.${key}`] === true;
  const set = (key: string, value: string | boolean = true) => {
    const result = controller.dispatch({ type: 'SetFlag', flag: `linked.${key}`, value });
    if (!result.length) refreshWorld();
    sound('sfx.page');
  };

  function drawStudy() {
    panel.replaceChildren(h('h2', { tabindex: '-1' }, 'The two-slot folio'),
      h('p', {}, 'The same tool number can lead to a loan date and to the job the tool did. Tuck both reference slips into one note.'));
    const bound = read('study.bound');
    const both = SOURCES.every(({ key }) => read(`study.clip.${key}`));
    for (const source of SOURCES) {
      const seen = read(`study.${source.key}`);
      const clipped = read(`study.clip.${source.key}`);
      panel.append(h('section', { class: 'clue-view' }, h('h3', {}, source.title),
        h('p', {}, seen ? source.text : `Look at ${source.target}.`),
        h('button', { type: 'button', disabled: !seen || clipped || bound, onclick: () => {
          set(`study.clip.${source.key}`);
          drawStudy();
          focusNext();
        } }, clipped ? 'Slip clipped' : `Clip the ${source.key === 'issue' ? 'issue date' : 'work trace'}`)));
    }
    if (!bound) {
      panel.append(h('button', { type: 'button', class: 'primary', disabled: !both, onclick: () => {
        set('study.bound');
        drawStudy();
        focusNext();
      } }, 'Bind the linked field note'));
    } else {
      const input = h('textarea', { id: 'straightedge-private-line', rows: 2, maxlength: 160 });
      const status = h('p', { class: 'fine', 'aria-live': 'polite' });
      input.placeholder = 'What will help you find R-7 next time?';
      const form = h('form', { class: 'diary-note-form', onsubmit: (event: SubmitEvent) => {
        event.preventDefault();
        if (!input.value.trim()) return;
        const result = controller.dispatch({ type: 'AddNote', text: input.value, kind: 'note' });
        if (result.some(({ kind }) => kind === 'error')) return;
        input.value = '';
        status.textContent = 'Private line saved in My Notes.';
        sound('sfx.page');
      } },
      h('label', { for: input.id }, 'A private line for yourself (optional)'), input,
      h('button', { type: 'submit' }, 'Save private line'), status);
      panel.append(h('p', { class: 'fine' }, 'The two references are linked under R-7. Wren can use those references when you reach the Listening Room.'), form);
    }
  }

  function drawVoices(message = '') {
    panel.replaceChildren(h('h2', { tabindex: '-1' }, 'Wren’s two-way filing bench'),
      h('div', { class: 'row wrap' }, h('img', { src: artURL('linked-note.ruler'), alt: '', width: 48, height: 32 }),
        h('p', {}, 'Wren needs R-7 for a loose page. Its signed issue and the shelf that holds it today use different index tabs.')));
    const indexed = read('voices.indexed');
    const entry = controller.state.flags['linked.voices.entry'];
    if (message) panel.append(h('p', { 'aria-live': 'polite', class: 'fine' }, message));
    if (!entry) {
      if (read('study.bound')) panel.append(h('button', { type: 'button', onclick: () => {
        set('voices.entry', 'carried');
        drawVoices('Wren recognizes Elsbet’s two reference tabs. The dated issue and the work name can each open a search.');
        focusNext();
      } }, 'Unclip the Study references for Wren'));
      if (read('voices.local')) panel.append(h('button', { type: 'button', onclick: () => {
        set('voices.entry', 'local');
        drawVoices('Wren opens the two searches using the spare reference tabs.');
        focusNext();
      } }, 'Unclip Wren’s local references'));
      if (!read('study.bound') && !read('voices.local')) panel.append(h('p', {}, 'Wren keeps spare reference tabs at the west wall.'));
      return;
    }
    const dated = read('voices.date');
    const bySubject = read('voices.subject');
    panel.append(
      lookup('date', 'Search the issue date', dated,
        'Look at the marked date drawer by the north wall.',
        '7 Rainbell · Issue of R-7 from Neran to the Study.'),
      lookup('subject', 'Search by room and job', bySubject,
        'Look at the marked press-work rack on the east side.',
        '21 Rainbell · R-7 checked in Wren’s mending tray.'),
    );
    if (!indexed) panel.append(h('button', { type: 'button', class: 'primary', disabled: !dated || !bySubject, onclick: () => {
      set('voices.indexed');
      drawVoices('The two searches now point to both records. The dated issue stays as written.');
      focusNext();
    } }, 'Link the dated issue and the current place'));
    else if (!controller.state.flags['linked.voices.layout']) panel.append(
      h('p', {}, 'Let the waiting mender use the straightedge now, or keep it in Wren’s cradle with a checked loan turn.'),
      h('div', { class: 'row wrap' },
        h('button', { type: 'button', onclick: () => place('open') }, 'Put it in the working tray'),
        h('button', { type: 'button', onclick: () => place('keeper') }, 'Set it in Wren’s signed cradle')));
    else panel.append(h('p', {}, controller.state.flags['linked.voices.layout'] === 'open'
      ? 'Look for the tool by the east seats to help the mender.'
      : 'Look for the tool by Wren’s west chair to set the next loan turn.'));
  }

  function lookup(key: 'date' | 'subject', title: string, found: boolean, location: string, receipt: string) {
    const opened = read(`voices.search.${key}`);
    return h('section', { class: 'clue-view' },
      h('button', { type: 'button', disabled: opened, onclick: () => {
        set(`voices.search.${key}`);
        drawVoices(location);
        focusNext();
      } }, title), found || opened ? h('p', {}, found ? receipt : location) : null);
  }

  function place(layout: 'open' | 'keeper') {
    set('voices.layout', layout);
    drawVoices();
    panel.querySelector<HTMLElement>('h2')?.focus();
  }

  function focusNext() {
    panel.querySelector<HTMLElement>('button:not([disabled]), textarea')?.focus();
  }

  if (site === 'study') drawStudy();
  else drawVoices();
  return panel;
}
