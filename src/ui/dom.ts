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
  const sel = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea, summary, [tabindex]:not([tabindex="-1"])';
  // Phaser captures Space on the window. Keep the native press and release in the dialog.
  const keepSpace = (e: KeyboardEvent) => {
    if (e.key === ' ' && e.target instanceof HTMLElement && e.target.matches('button, summary, input')) e.stopPropagation();
  };
  const onKey = (e: KeyboardEvent) => {
    keepSpace(e);
    if (e.key !== 'Tab') return;
    const items = Array.from(container.querySelectorAll<HTMLElement>(sel)).filter((x) => x.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  container.addEventListener('keyup', keepSpace);
  setTimeout(() => {
    const f = container.querySelector<HTMLElement>('[data-autofocus]') ?? container.querySelector<HTMLElement>(sel);
    f?.focus();
  }, 0);
  return () => {
    container.removeEventListener('keydown', onKey);
    container.removeEventListener('keyup', keepSpace);
  };
}
