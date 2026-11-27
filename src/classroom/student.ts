import { ctx } from '../app/context';
import { classroom, ClassSave, notice, type Identity } from './client';
import { request } from './request';
import { choices, signIn } from './forms';
import { clear, h } from '../ui/dom';
export function classPanel(switchSave: (store?: ClassSave) => void) {
  const box = h('section', { class: 'class-connection' });
  const status = h('p', { role: 'status' });
  const update = async (who: Identity) => {
    const next = new ClassSave(who);
    const decision = await choices(box, notice(who), [
      ['open', 'Open my class adventure'],
      ['cancel', 'Back to local play'],
    ]);
    if (decision === 'cancel') {
      await request('student/logout', 'POST');
      switchSave();
      return;
    }
    clear(box);
    box.append(status);
    status.textContent = 'Opening class save…';
    try {
      if (
        await next.open((local, online) =>
          choices(
            box,
            'Both devices have changes. Choose which adventure to continue. The other version may contain different writing.',
            [
              ['local', 'Use this device · ' + local],
              ['online', 'Use online copy · ' + online],
              ['cancel', 'Decide later'],
            ],
          ),
        )
      ) {
        if (!box.isConnected) return;
        next.activate();
        switchSave(next);
      } else {
        clear(box);
        box.append(h('p', {}, 'Both copies are available. Sign in again when you are ready.'));
      }
    } catch (e) {
      clear(box);
      box.append(status);
      status.textContent = e instanceof Error ? e.message : 'Unable to open class save.';
    }
  };
  if (classroom) {
    const active = classroom;
    box.append(
      h('p', {}, notice()),
      h('p', { 'data-class-status': '', role: 'status' }, active.status),
      h('button', { onclick: () => active.sync() }, 'Retry class sync'),
      h(
        'button',
        {
          onclick: async () => {
            await active.leave();
            try {
              await request('student/logout', 'POST');
            } catch {
              /* Account selection is also cleared in this tab. */
            }
            switchSave();
          },
        },
        'Leave class adventure',
      ),
    );
  } else
    box.append(
      h('p', {}, 'School accounts have a separate adventure. Your local adventure stays here.'),
      signIn<Identity>('student', update),
    );
  return box;
}
export function writingNotice() {
  return h(
    'div',
    { class: 'fine class-writing-notice' },
    h('p', {}, notice()),
    classroom ? h('p', { 'data-class-status': '', role: 'status' }, classroom.status) : null,
  );
}

export function sceneEditor(field: HTMLInputElement | HTMLTextAreaElement, id: string, title: string) {
  const store = classroom;
  if (!store) return () => {};
  field.value = store.sceneDraft(id);
  let composing = false;
  const save = () => {
    try {
      store.storeScene(id, title, field.value, ctx.controller.state?.mapId);
    } catch {
      field.setCustomValidity('This device could not save this draft. Keep a copy of your writing.');
      field.reportValidity();
    }
  };
  field.addEventListener('compositionstart', () => {
    composing = true;
  });
  field.addEventListener('compositionend', () => {
    composing = false;
    save();
  });
  field.addEventListener('input', () => {
    field.setCustomValidity('');
    if (!composing) save();
  });
  return () => store.storeScene(id, title, '');
}
