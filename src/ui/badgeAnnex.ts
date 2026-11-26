import type { GameController } from '../app/controller';
import { BADGE_DEFINITIONS, BADGE_FAMILIES, badgeFamilyReady } from '../content/tokBadges';
import { ORACLE_BRIEFS, ORACLE_COPY, oracleRun, type OracleCall, type OracleRule, type OracleSupply } from '../domain/oraclePress';
import { h } from './dom';
import './badgeAnnex.css';

const verdict: Record<OracleCall, string> = {
  supported: 'Send as supported',
  unresolved: 'Keep open',
  defer: 'Ask the keeper',
};

function packet(supply: OracleSupply, rule: OracleRule, label: string) {
  const { notes, rows } = oracleRun(supply, rule);
  return h('article', { class: 'oracle-run' }, h('h3', {}, label),
    h('p', {}, 'Reader: ' + (rule === 'ink' ? 'wrapper ink' : 'outer stamp')),
    h('details', {}, h('summary', {}, 'Example slips in the press'),
      h('ul', {}, ...notes.map(({ heading, ink, stamp, receipt }) => h('li', {}, h('strong', {}, heading), ` · ${ink} ink, ${stamp} stamp. ${receipt}`)))),
    h('dl', {}, ...rows.flatMap(({ copy, call }) => [
      h('dt', {}, copy.heading),
      h('dd', { class: 'oracle-call' }, h('span', { class: 'oracle-tab', 'data-ink': copy.ink },
        `${copy.ink} ink · ${copy.stamp === 'named' ? 'named stamp' : 'blank stamp'}`), h('strong', {}, verdict[call])),
    ])));
}

function cabinet(controller: GameController, refresh: () => void) {
  const panel = h('section', { class: 'badge-cabinet' });
  const current = () => controller.state.flags['title.worn'];
  const wear = (name: string) => {
    controller.dispatch({ type: 'SetFlag', flag: 'title.worn', value: current() === name ? '' : name });
    refresh();
  };
  panel.append(h('h2', {}, 'The cabinet of deeds'),
    h('p', {}, 'The mended thing or changed route comes first. Brenna keeps a token here so you can find the work again.'));
  for (const family of BADGE_FAMILIES) {
    const earned = BADGE_DEFINITIONS.filter(({ id, family: member }) => member === family.id && controller.permanent.awards[id]);
    const group = h('details', { open: earned.length > 0 && family.id === 'pillars' }, h('summary', {}, family.name));
    const reason = h('p', {}, controller.check(badgeFamilyReady(family.id)) ? family.privilege
      : earned.length ? 'Wear one of these titles and the matching work station opens again.' : 'There is room for a token when this work finds you.');
    group.append(reason, ...earned.map(({ name, action }) => {
      const link = h('button', { type: 'button' });
      const reading = h('p', { class: 'fine' }, action);
      link.onclick = () => {
        wear(name);
        for (const button of panel.querySelectorAll<HTMLButtonElement>('button[data-badge-title]')) {
          const worn = button.dataset.badgeTitle === current();
          button.textContent = worn ? 'Take off this title' : 'Wear this title';
          button.setAttribute('aria-pressed', String(worn));
        }
        reason.textContent = controller.check(badgeFamilyReady(family.id)) ? family.privilege
          : 'Wear one of these titles and the matching work station opens again.';
      };
      link.dataset.badgeTitle = name;
      link.textContent = current() === name ? 'Take off this title' : 'Wear this title';
      link.setAttribute('aria-pressed', String(current() === name));
      return h('article', { class: 'badge-token' }, h('h3', {}, name), reading, link);
    }));
    panel.append(group);
  }
  return panel;
}

function press(controller: GameController, refresh: () => void) {
  const panel = h('section', { class: 'oracle-press', tabindex: '-1' });
  const node = controller.pack.dialogue.find(({ id }) => id === 'oracle.press')!;

  const choose = (index: number) => {
    controller.dispatch({ type: 'ChooseDialogueOption', node: node.id, index });
    refresh();
    render();
    (panel.querySelector<HTMLButtonElement>('button:not([disabled])') ?? panel).focus();
  };

  function render() {
    const state = controller.state.flags;
    const options = node.options ?? [];
    const controls = (start: number, end: number) => h('div', { class: 'row' }, ...options.slice(start, end).map((option, offset) =>
      controller.check(option.if) ? h('button', { type: 'button', 'data-oracle': start + offset, onclick: () => choose(start + offset) }, option.text) : null));
    const ranStamp = state['oracle.run.stamp'] === true;
    const checked = state['oracle.checked'] === true;
    const compared = state['oracle.trace.closed'] === true;
    const sent = state['oracle.route'];
    const held = [state['oracle.held.rail'], state['oracle.held.shelter']].filter(Boolean).length;
    const tools = [
      h('h2', {}, 'Nerin’s rule reader and press'),
      h('p', {}, 'One reader uses the ink. The other uses the stamp on the wrapper. Both make calls on the same four slips.'),
      controls(0, 3),
      h('section', { class: 'oracle-runs', 'aria-label': 'Example choices and press calls' },
        state['oracle.run.narrow'] === true ? packet('narrow', 'ink', 'First packet') : null,
        state['oracle.run.broad'] === true ? packet('broad', 'ink', 'Wider packet') : null,
        ranStamp ? packet('broad', 'stamp', 'Wider packet, stamp rule') : null),
      ranStamp ? h('section', { class: 'oracle-work' }, h('h3', {}, 'The keeper’s source check'),
        h('p', { role: 'status' }, checked ? 'The named handrail slip needs checking. The blank-stamp shelter has a signed source. The stamp reader sent both the wrong way.'
          : held === 2 ? 'Both sealed source slips are ready for your comparison.' : 'The sealed handrail and shelter records are on the trays beside this desk.'),
        controls(3, 4)) : null,
      checked ? h('section', { class: 'oracle-work' }, h('h3', {}, 'Two requests for one signed record'),
        controls(4, 6), h('div', { class: 'oracle-runs' }, ...(['direction', 'trace'] as const).map((mode) => {
          const example = ORACLE_BRIEFS[mode];
          return state[`oracle.brief.${mode}`] === true ? h('article', { class: 'oracle-run' },
            h('h4', {}, example.task), h('p', {}, example.draft), h('p', { class: 'fine' }, example.use)) : null;
        }))) : null,
      checked ? h('section', { class: 'oracle-work' }, h('h3', {}, 'The third-bell print'),
        compared ? h('div', { class: 'oracle-runs' },
          h('article', { class: 'oracle-run' }, h('h4', {}, 'Original'), ORACLE_COPY.source),
          h('article', { class: 'oracle-run' }, h('h4', {}, 'Polished cut'), ORACLE_COPY.cut),
          h('p', {}, ORACLE_COPY.log)) : h('p', {}, 'Open the original and the job docket behind the press.'),
        controls(6, 7)) : null,
      compared ? h('section', { class: 'oracle-work' }, h('h3', {}, 'The permission register and the next reader'),
        h('p', {}, sent === 'walk' ? 'The approved direction is ready at the west rail.' : sent === 'desk' ? 'The approved excerpt and source are ready for the east desk.'
          : state['oracle.permission'] === true ? 'The approved section can go to a walking reader or a staffed desk.' : 'The signed permission register waits beside Thessa.'),
        controls(7, 9)) : null,
    ];
    panel.replaceChildren(...tools.filter((part): part is HTMLElement => part !== null));
  }
  render();
  return panel;
}

export function badgeAnnexPanel(controller: GameController, station: string, refresh: () => void): HTMLElement {
  return station === 'press' ? press(controller, refresh) : cabinet(controller, refresh);
}
