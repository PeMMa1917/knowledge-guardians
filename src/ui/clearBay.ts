import type { GameController } from '../app/controller';
import { CLEAR_BAY_DIALOGUE, CLEAR_BAY_TRIALS, clearanceReading, type BayTrial } from '../domain/clearBay';
import { h } from './dom';
import { localGuide } from './localGuide';
import './clearBay.css';

function caption(trial: BayTrial): string {
  const { width, needed, fits } = clearanceReading(trial);
  const gate = trial.gate === 'north' ? 'North' : 'West';
  return `${gate} has ${width} clear squares. This setup needs ${needed}${trial.handler ? ' with the handler' : ' for the cart alone'}. ${fits ? 'It passes.' : 'The handler’s square hits the post.'}`;
}

export function clearBayPanel(controller: GameController, refreshWorld: () => void, sound: (key: string) => void): HTMLElement {
  const flag = (key: string) => controller.state.flags['clearbay.' + key];
  let preview: BayTrial | undefined = CLEAR_BAY_TRIALS.find(({ id }) => id === flag('preview'));
  const diagram = h('div', { class: 'bay-diagram', 'aria-hidden': 'true' });
  const result = h('p', { role: 'status', class: 'bay-result', tabindex: '-1' });
  const trace = h('ul', { class: 'bay-traces', 'aria-label': 'Tested approaches' });
  const paper = h('div', { class: 'bay-paper' });
  const next = h('div', { class: 'bay-actions' });

  const tryButtons = CLEAR_BAY_TRIALS.map((trial, index) => h('button', { type: 'button', onclick: () => {
    if (!flag('trial.' + trial.id) && !choose(CLEAR_BAY_DIALOGUE.trials, index)) return;
    preview = trial;
    result.textContent = caption(trial);
    render();
  } }, trial.action));

  const shell = h('section', { class: 'clear-bay' },
    h('p', {}, 'Tarin has a cart and one parcel at the relay. The bay strips use the current gate widths. Slide the model loads into each marked approach.'),
    h('div', { class: 'bay-controls', role: 'group', 'aria-label': 'Loads on the measured approach' }, ...tryButtons),
    diagram, result, trace, paper, next,
    localGuide(controller, 'WORLD-04', () => controller.state.objectivesDone.includes('clearbay.compare') ? 'clearbay.use' : 'clearbay.compare'));
  result.textContent = preview ? caption(preview) : 'The measured bay is ready for a load.';
  render();
  return shell;

  function choose(node: string, index: number): boolean {
    const error = controller.dispatch({ type: 'ChooseDialogueOption', node, index }).find((event) => event.kind === 'error');
    if (error) { result.textContent = error.message; return false; }
    refreshWorld();
    sound(node === CLEAR_BAY_DIALOGUE.trials ? 'sfx.click' : 'sfx.page');
    return true;
  }

  function render() {
    tryButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(preview === CLEAR_BAY_TRIALS[index])));
    const reading = preview ? clearanceReading(preview) : undefined;
    diagram.replaceChildren(...Array.from({ length: 4 }, (_, i) => h('span', {
      'data-floor': reading && i >= reading.width ? 'post' : 'clear',
      'data-load': !preview ? undefined : i < preview.load ? 'cart' : preview.handler && i === preview.load ? 'hand' : undefined,
    }, preview && i < preview.load ? '■' : preview?.handler && i === preview.load ? '●' : '·')));
    trace.replaceChildren(...CLEAR_BAY_TRIALS.filter(({ id }) => flag('trial.' + id)).map((trial) =>
      h('li', {}, caption(trial))));
    const heading = flag('aligned') ? 'Two views of Year 11’s first bell' : 'Copies from the work rack';
    paper.replaceChildren(...[h('h3', {}, heading),
      h('div', { class: 'bay-copies' },
        h('p', {}, flag('duty') ? 'Duty book · Year 11. North first bell belongs to the handling crew. Wide deliveries use the second bell.'
          : 'The duty book is beside the inner curtain.'),
        h('div', {}, h('p', {}, flag('request') ? 'Visitor stub · Year 11. One hand parcel entered West at first bell. A cart waited.'
          : 'The visitor stub is on the west review shelf.'),
          flag('request') ? h('p', { class: 'bay-margin', 'data-folded': String(Boolean(flag('folded'))) },
            flag('folded') ? 'Name covered · kept on the archive copy' : 'Private loan margin · Sova Del') : null)),
      flag('aligned') ? h('p', {}, 'Year 19 · West’s post moved inward. The older entries tell us who used the routes then. The floor strips show today’s widths.') : null,
      flag('chalked') ? h('p', {}, 'Chalked now · North carries the cart with its helper. West admits the hand parcel with its helper.') : null,
      flag('folded') ? h('p', {}, 'Published copy · The visitor’s wait is visible. The borrowed name remains in the sleeve.') : null]
      .filter((part) => part !== null));
    const layout = flag('layout');
    if (layout) {
      next.replaceChildren(h('h3', {}, layout === 'north' ? 'North’s wide rail is staffed at the second bell' : 'West’s hand relay opens at the first bell'),
        h('p', {}, flag('checked') ? 'Tarin has used the notice and left the checked receipt.'
          : layout === 'north' ? 'Join Tarin at the north rail to bring the wide cart through.'
            : 'Join Tarin at the west relay to pass the hand parcel through and tag the cart.'));
      return;
    }
    const prepared = controller.state.objectivesDone.includes('clearbay.compare');
    const useNode = prepared ? CLEAR_BAY_DIALOGUE.publish : CLEAR_BAY_DIALOGUE.prepare;
    next.replaceChildren(
      ...(prepared ? [h('p', {}, 'One crew can attend the wide rail at second bell. Keeping West open early needs a volunteer and a hand relay for large loads.')] : []),
      ...controller.engine.visibleOptions(useNode, controller.state).map(({ index, option }) => h('button', {
        type: 'button', onclick: () => {
          if (!choose(useNode, index)) return;
          result.textContent = useNode === CLEAR_BAY_DIALOGUE.publish ? 'Marret has posted the notice.' : option.text;
          render();
          result.focus();
        },
      }, option.text)));
  }
}
