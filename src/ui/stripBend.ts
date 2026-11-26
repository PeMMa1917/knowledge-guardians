import type { GameEvent } from '../domain/engine';
import type { GameController } from '../app/controller';
import { BEND_PLANS, BEND_TRIALS, SITE_TRIALS, bendComparisonReady, bendLayout, bendRecord,
  canUseBendBoard, stripReading, type BendPlan, type BendSite, type BendTrial } from '../domain/stripBend';
import { h } from './dom';
import './stripBend.css';

type Swing = 'resting' | 'loaded' | 'lifted';
const markCount = (marks: number) => `${marks} ${marks === 1 ? 'mark' : 'marks'}`;
const isError = (event: GameEvent): event is Extract<GameEvent, { kind: 'error' }> => event.kind === 'error';

export function stripBendPanel(controller: GameController, site: BendSite, sound: (key: string) => void, refresh: () => void): HTMLElement {
  const panel = h('section', { class: 'bend-panel' });
  if (!canUseBendBoard(controller.state, site)) return panel;

  let strip: 'spring' | 'stiff' = 'spring';
  let reach: 'near' | 'far' = 'near';
  let receiving: BendTrial = 'worn';
  let swing: Swing = 'resting';
  const trial = (): BendTrial => site === 'nile' ? `${strip}-${reach}` : receiving;
  const checked = (option: BendTrial) => controller.state.flags[bendRecord(option)] === true;
  const plan = () => controller.state.flags[bendLayout(site)] as BendPlan | undefined;
  const intro = site === 'nile'
    ? 'Marek: “The Mine Map marks routes and rock colours. It gives me no reading for this rail. Try the same practice weight at both stops. My seated reader can work with a shift of one mark. My runner needs room for the wide bundle.”'
    : controller.state.flags[bendLayout('nile')] === 'reading'
      ? 'Mina: “Your card kept the line in reach of a seated reader. Our short rail still droops even after I moved the weight to the near stop. Check where it starts before we set up today’s return.”'
      : 'Mina: “Your card helped the runner keep the wide bundle in place. Here someone left a stiff strip at the far stop under the weight. I have moved it near. Watch where it starts before we hang another bundle.”';

  const diagram = h('div', { class: 'bend-rail', 'aria-hidden': 'true' },
    h('div', { class: 'bend-grid' }), h('div', { class: 'bend-clamp' }),
    h('div', { class: 'bend-strip' }), h('div', { class: 'bend-weight' }),
    h('div', { class: 'bend-ticks' }, Array.from({ length: 7 }, (_, index) => h('span', {}, String(index)))));
  const reading = h('p', { class: 'bend-reading', role: 'status', 'aria-atomic': 'true' });
  const history = h('ul', { class: 'bend-readbacks' });
  const feedback = h('p', { class: 'bend-reply', role: 'status' });

  function picker<Value extends string>(
    label: string, entries: readonly (readonly [Value, string])[], selected: () => Value,
    select: (value: Value) => void, blocked: (value: Value) => boolean = () => false,
  ) {
    const buttons = entries.map(([value, title]) => h('button', { type: 'button', onclick: () => {
      if (swing === 'loaded' || blocked(value)) return;
      select(value);
      swing = 'resting';
      render();
    } }, title));
    return {
      group: h('div', { class: 'row', role: 'group', 'aria-label': label }, buttons),
      render() {
        entries.forEach(([value], index) => {
          buttons[index].disabled = swing === 'loaded' || blocked(value);
          buttons[index].setAttribute('aria-pressed', String(selected() === value));
        });
      },
    };
  }

  const controls = site === 'nile' ? [
    picker('Practice strip', [['spring', 'Spring strip'], ['stiff', 'Stiff strip']], () => strip, (value) => { strip = value; }),
    picker('Weight stop', [['near', 'Near stop'], ['far', 'Far stop']], () => reach, (value) => { reach = value; }),
  ] : [
    picker<BendTrial>('Landing setups', [
      ['worn', 'Check the used strip'],
      ['short', 'Fit a fresh strip at the near stop'],
      ['long', 'Fit a spring strip at the far stop'],
    ], () => receiving, (value) => { receiving = value; }, (value) => value !== 'worn' && !checked('worn')),
  ];

  const weight = h('button', { type: 'button', onclick: () => {
    if (swing === 'resting') {
      swing = 'loaded';
      sound('sfx.click');
    } else if (swing === 'loaded') {
      const error = controller.dispatch({ type: 'RecordBendTrial', trial: trial() }).find(isError);
      if (error) {
        feedback.textContent = error.message;
        return;
      }
      swing = 'lifted';
      sound('sfx.page');
      refresh();
    } else {
      swing = 'resting';
      sound('sfx.click');
    }
    render();
  } });
  const plans: Partial<Record<BendPlan, { label: string; result: string }>> = BEND_PLANS[site];
  const post = Object.entries(plans).map(([key, choice]) => h('button', { type: 'button', onclick: () => {
    if (swing === 'loaded' || !bendComparisonReady(controller.state, site) || plan()) return;
    const focused = document.activeElement === document.getElementById('bend-post-' + key);
    const error = controller.dispatch({ type: 'FileBendPlan', plan: key as BendPlan }).find(isError);
    if (error) {
      feedback.textContent = error.message;
      return;
    }
    sound('sfx.page');
    render();
    refresh();
    if (focused) feedback.focus();
  }, id: 'bend-post-' + key }, choice.label));
  feedback.tabIndex = -1;

  function render() {
    const setup = BEND_TRIALS[trial()];
    const marks = stripReading(trial());
    const position = swing === 'resting' ? marks.start : swing === 'loaded' ? marks.loaded : marks.released;
    diagram.style.setProperty('--bend-drop', String(position));
    diagram.dataset.reach = setup.reach;
    diagram.dataset.loaded = String(swing === 'loaded');
    diagram.dataset.strip = setup.strip;
    const summary = swing === 'resting'
      ? `Before loading · ${markCount(position)} below the line.`
      : swing === 'loaded'
        ? `Weight on · ${markCount(position)} below the line. Lift the weight to compare.`
        : `Weight lifted · ${position === 0 ? 'back at the line' : `still ${markCount(position)} below the line`}. Reading filed.`;
    reading.textContent = `${setup.name}. ${summary}`;
    controls.forEach((control) => control.render());
    weight.textContent = swing === 'resting' ? 'Put the practice weight on' : swing === 'loaded'
      ? 'Lift the practice weight' : 'Reset this trial';
    history.replaceChildren(...SITE_TRIALS[site].map((option) => {
      const { start, loaded, released } = stripReading(option);
      const text = checked(option) ? `Before ${start} · on ${loaded} · lifted ${released} marks` : 'No lift reading yet';
      return h('li', {}, h('strong', {}, BEND_TRIALS[option].name), h('span', {}, text));
    }));
    const choice = plan();
    post.forEach((button) => { button.disabled = swing === 'loaded' || !bendComparisonReady(controller.state, site) || Boolean(choice); });
    const outcome = choice ? plans[choice] : undefined;
    if (outcome) feedback.textContent = outcome.result;
  }

  panel.append(h('p', {}, intro),
    h('p', { class: 'fine' }, site === 'nile'
      ? 'Use one weight and a fresh strip for each trial. The marks belong to this modern practice rail.'
      : 'Lift the weight from the used strip first. Then try both fresh setups. These marks belong to this modern practice rail.'),
    ...controls.map(({ group }) => group), diagram, reading, weight,
    h('h3', {}, 'Filed lift readings'), history, h('div', { class: 'row', role: 'group', 'aria-label': 'Where to use the checked strip' }, post),
    feedback);
  render();
  return panel;
}
