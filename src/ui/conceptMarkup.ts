import { CONCEPT_COLOURS, splitConceptText, type ConceptTextSegment } from '../domain/conceptText';

const SVG = 'http://www.w3.org/2000/svg';
const UNTOUCHED = 'input, textarea, select, option, script, style, template, noscript, [contenteditable], [data-concept-skip], .concept-term';

function styleConcept(mark: HTMLElement | SVGElement, concept: NonNullable<ConceptTextSegment['concept']>): void {
  const colour = CONCEPT_COLOURS[concept];
  mark.setAttribute('class', 'concept-term');
  mark.setAttribute('data-concept', concept);
  mark.style.setProperty('--concept-on-dark', colour.onDark);
  mark.style.setProperty('--concept-on-light', colour.onLight);
}

/** Plain text remains as text nodes. Accessible names and values can use the original string. */
export function conceptTextNodes(value: string, owner: Document = document): (Text | HTMLElement)[] {
  return splitConceptText(value).map(({ text, concept }) => {
    if (!concept) return owner.createTextNode(text);
    const mark = owner.createElement('span');
    styleConcept(mark, concept);
    mark.textContent = text;
    return mark;
  });
}

function skip(element: Element): boolean {
  return element.matches(UNTOUCHED) || (element.namespaceURI === SVG && ['title', 'desc', 'metadata'].includes(element.localName));
}

function decorateWordNodes(text: Text): void {
  if (text.length < 5 || !text.parentElement) return;
  const svg = text.parentElement.namespaceURI === SVG;
  if (svg && !text.parentElement.closest('text')) return;
  const parts = splitConceptText(text.data);
  if (!parts.some(({ concept }) => concept)) return;
  const owner = text.ownerDocument;
  const fragment = owner.createDocumentFragment();
  for (const part of parts) {
    if (!part.concept) {
      fragment.append(owner.createTextNode(part.text));
      continue;
    }
    const mark = svg ? owner.createElementNS(SVG, 'tspan') : owner.createElement('span');
    styleConcept(mark, part.concept);
    mark.textContent = part.text;
    fragment.append(mark);
  }
  text.replaceWith(fragment);
}

/** Format visible prose while preserving every surrounding element and event listener. */
export function decorateConceptText(root: Element | Text): void {
  const element = root.nodeType === 3 ? root.parentElement : root as Element;
  if (!element || element.closest(UNTOUCHED)) return;
  if (root.nodeType === 3) {
    if (!skip(element)) decorateWordNodes(root as Text);
    return;
  }
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === 3) return NodeFilter.FILTER_ACCEPT;
      return skip(node as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
    },
  });
  const text: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) text.push(node as Text);
  for (const child of text) decorateWordNodes(child);
}

/** Ordinary UI updates replace small subtrees. Only inspect their new text, even in a long journal. */
export function observeConceptText(root: Element): () => void {
  decorateConceptText(root);
  const observer = new MutationObserver((records) => {
    const changed = new Set<Element | Text>();
    for (const record of records) {
      if (record.type === 'characterData') changed.add(record.target as Text);
      else for (const added of record.addedNodes) {
        if (added.nodeType === 1 || added.nodeType === 3) changed.add(added as Element | Text);
      }
    }
    for (const node of changed) {
      if (!root.contains(node)) continue;
      let covered = false;
      for (let parent = node.parentElement; parent && parent !== root; parent = parent.parentElement) {
        if (changed.has(parent)) { covered = true; break; }
      }
      if (!covered) decorateConceptText(node);
    }
    // Ignore the inline spans just added by this observer. Future game updates get their own batch.
    observer.takeRecords();
  });
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => observer.disconnect();
}
