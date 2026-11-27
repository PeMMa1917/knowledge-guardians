/**
 * The training gym panel (decision X-002). Outside the story: word cards, the exhibition bench and
 * practice titles. Rules and prompts live in ../domain/gym.ts. Progress is kept on this device only
 * (localStorage key `kg.gym`), never in the campaign save and never sent to a teacher.
 */
import type { GameController } from '../app/controller';
import { examplesFor } from '../domain/glossary';
import {
  BENCH_PROMPTS, BENCH_SIZE, GYM_NOTE, PRACTICE_TITLES, benchStatus, boxCounts, emptyGym, nextCard, normaliseGym,
  rateCard, toggleBenchObject, writeBenchNote, writePlan, type GymProgress, type TitlePlan,
} from '../domain/gym';
import { clear, h } from './dom';

const KEY = 'kg.gym';

function load(): GymProgress {
  try { return normaliseGym(JSON.parse(window.localStorage.getItem(KEY) ?? 'null')); } catch { return emptyGym(); }
}
function save(g: GymProgress): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(g)); } catch { /* storage blocked: progress lasts for this visit */ }
}

type Room = 'cards' | 'bench' | 'titles';

export function gymPanel(c: GameController, sfx: (key: string) => void): HTMLElement {
  let g = load();
  let room: Room = 'cards';
  const body = h('div', { class: 'gym-room' });
  const tabs = h('div', { class: 'gym-tabs', role: 'tablist', 'aria-label': 'Gym rooms' });
  const update = (next: GymProgress) => { g = next; save(g); };

  const tab = (id: Room, label: string) => h('button', {
    type: 'button', role: 'tab', 'aria-selected': String(room === id),
    onclick: () => { room = id; sfx('sfx.page'); render(); },
  }, label);

  // ---- Word cards -------------------------------------------------------
  const glossary = c.pack.glossary;
  const order = glossary.map((entry) => entry.id);
  let current: string | null = null;
  let turned = false;
  const cards = (): HTMLElement[] => {
    current ??= nextCard(order, g);
    const entry = glossary.find((e) => e.id === current);
    if (!entry) return [h('p', {}, 'No word cards yet.')];
    const counts = boxCounts(order, g);
    const examples = examplesFor(entry, c.state, (cond) => c.check(cond));
    const face = turned
      ? h('div', { class: 'gym-card back', 'aria-live': 'polite' },
        h('p', {}, entry.text), ...examples.slice(0, 2).map((ex) => h('p', { class: 'fine' }, ex)))
      : h('div', { class: 'gym-card front' }, h('p', { class: 'gym-term' }, entry.term), h('p', { class: 'fine' }, 'Say what it means, then turn the card.'));
    return [
      h('p', { class: 'fine' }, `Still learning ${counts[1]} · Getting there ${counts[2]} · Known well ${counts[3]}. Cards turned: ${g.turned}.`),
      face,
      h('div', { class: 'row' }, turned
        ? [h('button', { type: 'button', onclick: () => step(false) }, 'Not yet'), h('button', { type: 'button', class: 'primary', onclick: () => step(true) }, 'I knew it')]
        : h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { turned = true; sfx('sfx.page'); render(); } }, 'Turn the card')),
    ];
  };
  const step = (knew: boolean) => {
    if (!current) return;
    update(rateCard(g, current, knew));
    current = nextCard(order, g, current);
    turned = false;
    sfx(knew ? 'sfx.sparkle' : 'sfx.click');
    render();
  };

  // ---- Exhibition bench ---------------------------------------------------
  let prompt = BENCH_PROMPTS[0].id;
  const found = () => c.state.cards.filter((id) => c.pack.cards.some((card) => card.id === id));
  const bench = (): (HTMLElement | string)[] => {
    const p = BENCH_PROMPTS.find((x) => x.id === prompt)!;
    const plan = g.benches[prompt] ?? { objects: [], notes: {} };
    const mine = found();
    const pick = h('select', { 'aria-label': 'Practice prompt', onchange: (e: Event) => { prompt = (e.target as HTMLSelectElement).value; render(); } },
      ...BENCH_PROMPTS.map((x) => h('option', { value: x.id, selected: x.id === prompt }, x.text)));
    const note = (card: string, field: 'shows' | 'limit', label: string) => h('label', { class: 'gym-field' }, label,
      h('textarea', { rows: 2, oninput: (e: Event) => update(writeBenchNote(g, prompt, card, field, (e.target as HTMLTextAreaElement).value)) },
        plan.notes[card]?.[field] ?? ''));
    return [
      h('p', {}, 'Choose a practice prompt, then put three objects you found on the bench. For each one, say what it shows and what it does not show.'),
      pick, h('p', { class: 'fine' }, p.nudge),
      mine.length ? h('p', { class: 'fine', role: 'status' }, benchStatus(g, prompt)) : '',
      mine.length
        ? h('ul', { class: 'gym-objects' }, ...mine.map((id) => {
          const card = c.pack.cards.find((x) => x.id === id)!;
          const on = plan.objects.includes(id);
          return h('li', {}, h('button', {
            type: 'button', 'aria-pressed': String(on), disabled: !on && plan.objects.length >= BENCH_SIZE,
            onclick: () => { update(toggleBenchObject(g, prompt, id, mine)); sfx('sfx.click'); render(); },
          }, on ? `✓ ${card.title}` : card.title));
        }))
        : h('p', {}, 'You have not found any objects yet. Objects you find in the story appear here.'),
      ...plan.objects.map((id) => {
        const card = c.pack.cards.find((x) => x.id === id);
        return h('section', { class: 'gym-bench-object' }, h('h4', {}, card?.title ?? id),
          card?.limits ? h('p', { class: 'fine' }, `From the record: ${card.limits}`) : '',
          note(id, 'shows', 'What does this object show about the prompt?'),
          note(id, 'limit', 'What does it not show?'));
      }),
    ];
  };

  // ---- Practice titles ----------------------------------------------------
  let title = PRACTICE_TITLES[0].id;
  const titles = (): HTMLElement[] => {
    const t = PRACTICE_TITLES.find((x) => x.id === title)!;
    const plan: TitlePlan = g.plans[title] ?? { claim: '', counterclaim: '', examples: '' };
    const field = (key: keyof TitlePlan, label: string) => h('label', { class: 'gym-field' }, label,
      h('textarea', { rows: 3, oninput: (e: Event) => update(writePlan(g, title, key, (e.target as HTMLTextAreaElement).value)) }, plan[key]));
    return [
      h('p', {}, 'Practice titles to plan an argument. They are original practice, not real exam titles.'),
      h('select', { 'aria-label': 'Practice title', onchange: (e: Event) => { title = (e.target as HTMLSelectElement).value; render(); } },
        ...PRACTICE_TITLES.map((x) => h('option', { value: x.id, selected: x.id === title }, x.text))),
      h('p', { class: 'fine' }, t.nudge),
      field('claim', 'Your main claim'),
      field('counterclaim', 'The strongest counterclaim'),
      field('examples', 'Examples (from areas of knowledge, your DP subjects, or objects you found)'),
    ];
  };

  function render(): void {
    clear(tabs);
    tabs.append(tab('cards', 'Word cards'), tab('bench', 'Exhibition bench'), tab('titles', 'Practice titles'));
    clear(body);
    body.append(...(room === 'cards' ? cards() : room === 'bench' ? bench() : titles()));
  }
  render();
  return h('div', { class: 'gym' }, h('p', { class: 'fine gym-note' }, GYM_NOTE), tabs, body);
}
