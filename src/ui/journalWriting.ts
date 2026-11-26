import type { GameController } from '../app/controller';

interface PendingSave {
  timer: number | undefined;
  status?: HTMLElement;
}

const pending = new WeakMap<GameController, PendingSave>();

export function flushJournalWriting(controller: GameController): boolean {
  const save = pending.get(controller);
  if (!save) return true;
  window.clearTimeout(save.timer);
  save.timer = undefined;
  if (controller.suspend('Adventure journal')) {
    pending.delete(controller);
    if (save.status) save.status.textContent = '';
    return true;
  }
  if (save.status) save.status.textContent = 'Your writing is still open in this tab. Try saving again or export a copy.';
  return false;
}

/** Update the campaign on input, then combine short bursts into one Continue write. */
export function queueJournalWriting(controller: GameController, status?: HTMLElement): void {
  window.clearTimeout(pending.get(controller)?.timer);
  const timer = window.setTimeout(() => flushJournalWriting(controller), 600);
  pending.set(controller, { timer, status });
}

/** Keep native input, selection and composition intact while persisting completed text. */
export function bindJournalEditor(
  field: HTMLTextAreaElement, update: (value: string) => void, onBlur?: () => void,
): void {
  let composing = false;
  field.addEventListener('compositionstart', () => { composing = true; });
  field.addEventListener('compositionend', () => {
    composing = false;
    update(field.value);
  });
  field.addEventListener('keydown', (event) => {
    if (composing || event.isComposing || event.keyCode === 229) event.stopPropagation();
  });
  field.addEventListener('input', (event: Event) => {
    if (!composing && !(event as InputEvent).isComposing) update(field.value);
  });
  field.addEventListener('blur', () => {
    if (!composing) {
      update(field.value);
      onBlur?.();
    }
  });
}
