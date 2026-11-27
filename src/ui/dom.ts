/** Tiny DOM helpers. Text is always set with textContent (no HTML injection). */
export type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function clear(el: Element): void { while (el.firstChild) el.removeChild(el.firstChild); }

/** Move focus into a container and keep Tab inside it (modal focus trap). */
export function trapFocus(container: HTMLElement): () => void {
  const selector = 'button, a[href], input, select, textarea, summary, [tabindex]';
  const visible = (el: HTMLElement) => {
    if (el.closest('[hidden], [inert]') || !el.getClientRects().length || getComputedStyle(el).visibility !== 'visible') return false;
    // Some engines lay out the contents of a closed disclosure. Only its first summary can receive focus.
    for (let fold = el.closest('details:not([open])'); fold; fold = fold.parentElement?.closest('details:not([open])') ?? null) {
      if (!fold.querySelector(':scope > summary')?.contains(el)) return false;
    }
    return true;
  };
  const tabStops = () => Array.from(container.querySelectorAll<HTMLElement>(selector))
    .filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && visible(el));
  // The world captures its keys on the window. Let native controls handle them inside dialogs.
  let nativeSpaceDown = false;
  const keepSpaceRelease = (e: KeyboardEvent) => {
    if (e.key !== ' ') return;
    if (nativeSpaceDown) e.stopPropagation();
    nativeSpaceDown = false;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLElement && e.key !== 'Escape' && e.key !== 'Tab') {
      const editing = e.target.closest('input, select, textarea, [contenteditable="true"]');
      const activating = (e.key === 'Enter' || e.key === ' ') && e.target.closest('button, summary, a[href]');
      if (editing || activating) {
        if (activating && e.repeat) e.preventDefault();
        if (e.key === ' ') nativeSpaceDown = true;
        e.stopPropagation();
      }
    }
    if (e.key !== 'Tab') return;
    const items = tabStops();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  container.addEventListener('keyup', keepSpaceRelease);
  const focusTimer = setTimeout(() => {
    const preferred = container.querySelector<HTMLElement>('[data-autofocus]');
    const first = preferred && !preferred.matches(':disabled') && visible(preferred) ? preferred : tabStops()[0];
    first?.focus();
  }, 0);
  return () => {
    clearTimeout(focusTimer);
    container.removeEventListener('keydown', onKey);
    container.removeEventListener('keyup', keepSpaceRelease);
  };
}
