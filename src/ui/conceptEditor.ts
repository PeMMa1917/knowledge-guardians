import { conceptTextNodes } from './conceptMarkup';
import './conceptEditor.css';

type ProseField = HTMLInputElement | HTMLTextAreaElement;
interface EditorHost extends HTMLElement {
  mount: () => void;
  unmount: () => void;
}

const tag = 'kg-concept-editor';
const refreshers = new WeakMap<ProseField, () => void>();

function makeHost(view: Window & typeof globalThis): EditorHost {
  if (!view.customElements.get(tag)) {
    view.customElements.define(tag, class extends view.HTMLElement {
      declare mount?: () => void;
      declare unmount?: () => void;
      connectedCallback(): void { this.mount?.(); }
      disconnectedCallback(): void { this.unmount?.(); }
    });
  }
  return view.document.createElement(tag) as EditorHost;
}

/** Call after assigning a field's value programmatically. Native editing emits its own input event. */
export function syncConceptEditor(field: ProseField): void {
  refreshers.get(field)?.();
}

/** The original control handles selection, input, scrolling, clipboard and composition. */
export function conceptEditor(field: ProseField): HTMLElement {
  const view = field.ownerDocument.defaultView;
  if (!view?.customElements || !view.ResizeObserver) return field;

  const host = makeHost(view);
  const ink = field.ownerDocument.createElement('div');
  ink.className = 'concept-editor-ink';
  ink.setAttribute('aria-hidden', 'true');
  ink.setAttribute('data-concept-skip', '');
  field.classList.add('concept-editor-control');
  host.append(ink, field);

  let composing = false;
  const scroll = () => {
    ink.scrollTop = field.scrollTop;
    ink.scrollLeft = field.scrollLeft;
  };
  const position = () => {
    if (!field.isConnected || !host.classList.contains('is-marked')) return;
    const style = view.getComputedStyle(field);
    Object.assign(ink.style, {
      top: `${field.clientTop}px`, left: `${field.clientLeft}px`,
      width: `${field.clientWidth}px`, height: `${field.clientHeight}px`,
      padding: style.padding, direction: style.direction, unicodeBidi: style.unicodeBidi, textAlign: style.textAlign,
      whiteSpace: field.tagName === 'INPUT' ? 'pre' : style.whiteSpace,
      overflowWrap: style.overflowWrap, tabSize: style.tabSize,
    });
    scroll();
  };
  const refresh = () => {
    const marks = composing ? [] : conceptTextNodes(field.value, field.ownerDocument);
    const marked = marks.some((part) => part.nodeType === 1);
    host.classList.toggle('is-marked', marked);
    // The last blank line must still contribute to the scrollbar height.
    if (marked && field.value.endsWith('\n')) marks.push(field.ownerDocument.createTextNode('\u200b'));
    ink.replaceChildren(...(marked ? marks : []));
    position();
  };

  const size = new view.ResizeObserver(position);
  host.mount = () => { refresh(); size.observe(field); };
  host.unmount = () => size.disconnect();
  field.addEventListener('input', refresh);
  field.addEventListener('focus', refresh);
  field.addEventListener('scroll', scroll, { passive: true });
  field.addEventListener('compositionstart', () => { composing = true; refresh(); });
  field.addEventListener('compositionend', () => { composing = false; refresh(); });
  refreshers.set(field, refresh);
  return host;
}
