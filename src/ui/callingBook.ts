import type { GameController } from '../app/controller';
import { callers, callingPage } from '../domain/callingBook';
import { encyclopediaForCharacter } from '../domain/encyclopedia';
import { mlaCitation } from '../domain/mla';
import { wikipediaLink } from './adventureEncyclopedia';
import { citationLine } from './adventureReferences';
import { h } from './dom';
import './callingBook.css';
import type { DialogueNode } from '../domain/types';

type RenderLine = (line: DialogueNode) => HTMLElement;

function showPage(c: GameController, id: string, render: RenderLine) {
  const page = callingPage(c.pack, c.engine.dialogueById, c.state, id);
  const body = h('section', { class: 'calling-page' });
  if (!page) return body;
  const { person, past, visits, sources } = page,
    article = encyclopediaForCharacter(person);
  body.append(
    h('h4', {}, person.name),
    h('p', { class: 'fine' }, person.role),
    article ? (wikipediaLink(article) ?? '') : '',
  );
  for (const visit of visits) {
    const box = h('section', { class: 'lore-entry' }, h('h5', {}, visit.place));
    if (visit.last)
      box.append(
        h('p', {}, 'Left at the bench · ' + visit.last.material.join(' → ')),
        h('p', {}, visit.last.request + '. ' + visit.last.response),
      );
    if (visit.active)
      box.append(
        h(
          'p',
          {},
          visit.active.material.length
            ? 'On the worktable · ' + visit.active.material.join(' → ')
            : 'The worktable is open.',
        ),
        h('p', {}, visit.active.next),
      );
    body.append(box);
  }
  if (past.length) {
    const heard = h('details', {}, h('summary', {}, 'Words I have heard (' + past.length + ')'));
    const list = h('div', {});
    let shown = 0;
    const more = h('button', { type: 'button', class: 'mini', onclick: showMore }, 'More from this person');
    function showMore(event?: Event) {
      const next = past.slice(shown, shown + 6).map(render);
      list.append(...next);
      shown += next.length;
      if (event && next.length) {
        next[0].tabIndex = -1;
        next[0].focus();
      }
      more.hidden = shown >= past.length;
    }
    heard.append(list, more);
    showMore();
    body.append(heard);
  }
  if (sources.length)
    body.append(
      h(
        'details',
        {},
        h('summary', {}, 'Read about this work'),
        h('ul', {}, ...sources.map((s) => h('li', {}, citationLine(mlaCitation(s))))),
      ),
    );
  return body;
}

/** Build the optional page only when its reader opens it. A new visit gets a freshly earned record. */
export function callingBook(c: GameController, render: RenderLine, person?: { id: string; name: string }) {
  const root = h('details', { class: 'calling-book' }),
    content = h('div', {});
  root.append(h('summary', {}, person ? 'My visits with ' + person.name : 'People I have met'), content);
  let filled = false;
  root.addEventListener('toggle', () => {
    if (!root.open || filled) return;
    filled = true;
    if (person) {
      content.append(showPage(c, person.id, render));
      return;
    }
    const entries = callers(c.pack, c.engine.dialogueById, c.state);
    if (!entries.length) {
      content.append(h('p', {}, 'A name goes into this book when you meet someone.'));
      return;
    }
    const page = h('div', {}),
      choose = h(
        'select',
        {
          'aria-label': 'Choose a person I have met',
          onchange: () => page.replaceChildren(showPage(c, choose.value, render)),
        },
        ...entries.map((e) => h('option', { value: e.id }, e.name)),
      );
    content.append(h('label', {}, 'Open a page for ', choose), page);
    page.append(showPage(c, choose.value, render));
  });
  return root;
}
