import {classNames} from './classNames';
import {hostedScoreBoard} from '../ui/leaderboard';
import '../ui/conceptMarkup.css';
import {conceptTextNodes} from '../ui/conceptMarkup';
import { signIn } from '../classroom/forms';
import { request } from '../classroom/request';
import { clear, h } from '../ui/dom';

type Group = { id: string; title: string };
type RecordRow = {
  student: string;
  updated: string | null;
  entries: { kind: string; title: string; text: string }[];
};
const labels: Record<string, string> = {
  note: 'Saved note',
  reflection: 'Saved reflection',
  question: 'Saved question',
  'draft-note': 'Draft · note',
  'draft-question': 'Draft · question',
  'draft-reflection': 'Draft · reflection',
};
export function classWriting() {
  const panel = h('section', { class: 'panel wide class-writing no-print', 'data-concept-paper':true }, h('h2', {}, 'Class writing'));
  const view = h('div', {});
  panel.append(view);
  let refresh: (() => Promise<void>) | undefined;
  const login = () => {
    refresh = undefined;
    clear(view);
    view.append(
      signIn<{ id: string; display: string }>('teacher', async (teacher) => {
        const account = new URLSearchParams({ account: teacher.id });
        const groups = await request<Group[]>('teacher/classes?' + account);
        if (!view.isConnected) return;
        clear(view);
        const list = h(
          'select',
          { 'aria-label': 'Your class' },
          ...groups.map((g) => h('option', { value: g.id }, g.title)),
        );
        const entries = h('div', { 'aria-live': 'polite' });
        const board = h('div',{});
        const names = h('div',{});
        const showBoard=()=>{
          const chosen=groups.find(g=>g.id===list.value);
          const roster=chosen && classNames(teacher.id,chosen.id,()=>{
            void load();
            const refreshBoard=board.querySelector<HTMLButtonElement>('.class-score-board[open] [data-refresh-scores]');
            refreshBoard?.click();
          });
          names.replaceChildren(...(roster?[roster]:[]));
          board.replaceChildren(...(chosen?[hostedScoreBoard({role:'teacher',account:teacher.id,classId:chosen.id,className:chosen.title})]:[]));
        };
        let version = 0;
        const load = async () => {
          const seq = ++version;
          clear(entries);
          if (!list.value) {
            entries.textContent = 'No assigned classes.';
            return;
          }
          entries.textContent = 'Loading writing…';
          try {
            const rows = await request<RecordRow[]>(
              'teacher/writing?' + new URLSearchParams({ account: teacher.id, class: list.value }),
            );
            if (seq !== version || !entries.isConnected) return;
            clear(entries);
            for (const row of rows)
              entries.append(
                h(
                  'section',
                  {},
                  h('h3', {}, row.student),
                  row.updated ? h('p', {}, 'Last synced ' + new Date(row.updated).toLocaleString()) : null,
                  ...row.entries.map((e) =>
                    h(
                      'article',
                      {},
                      h('strong', {}, labels[e.kind]),
                      e.title ? h('p', {}, ...conceptTextNodes(e.title)) : null,
                      h('p', {}, ...conceptTextNodes(e.text)),
                    ),
                  ),
                  row.entries.length ? null : h('p', {}, 'No synced writing yet.'),
                ),
              );
            if (!rows.length) entries.textContent = 'No approved students in this class.';
          } catch (e) {
            if (seq === version)
              entries.textContent = e instanceof Error ? e.message : 'Could not load writing.';
          }
        };
        refresh = load;
        list.onchange = ()=>{showBoard();void load();};
        showBoard();
        view.append(
          h('p', {}, 'Signed in as ' + teacher.display + '. Drafts are still in progress.'),
          list,
          h('button', { onclick: load }, 'Refresh writing'),
          h(
            'button',
            {
              onclick: async () => {
                ++version;
                login();
                try {
                  await request('teacher/logout', 'POST');
                } catch {
                  /* A fresh sign-in is required here. */
                }
              },
            },
            'Sign out',
          ),
          names,entries,board,
        );
        await load();
      }),
    );
  };
  window.addEventListener('pagehide', login);
  window.addEventListener('focus', () => {
    if (document.visibilityState === 'visible') void refresh?.();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void refresh?.();
  });
  login();
  return panel;
}
