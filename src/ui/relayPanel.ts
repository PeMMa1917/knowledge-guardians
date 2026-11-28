/**
 * The Sketch Relay panel (chapter 7 signature game). Rules in ../domain/sketchRelay.ts.
 * Send a drawing with no key; see what the harbour reads. Paint a key on the towers and send again.
 * A second key can be added. Then say what carried the meaning; Lark or Mina replies. No step fails.
 */
import type { GameController } from '../app/controller';
import { COPYISTS, KEYS, MESSAGE, PARTS, PICK, TRUST, allThrough, harbourReads, reading, relay, type Fate, type KeyId } from '../domain/sketchRelay';
import { h } from './dom';

const FATE: Record<Fate, string> = { through: 'got through', partly: 'partly got through', lost: 'was lost', reversed: 'was turned around' };
const OUTCOME: Record<Fate, string> = {
  through: '', partly: '', lost: '',
  reversed: 'Two crews read the arrow as "go east" and sail out of the bay, straight across the storm’s path. They come back wet and angry.',
};

export function relayPanel(c: GameController, sfx: (key: string) => void, finish: () => HTMLElement, close: () => void): HTMLElement {
  const box = h('div', { class: 'relay' });
  let chosen: string[] = [];
  let keys: KeyId[] = [];
  let sends = 0;
  let stages: string[][] | null = null;
  let trust: string | null = null;
  let stage: 'draw' | 'result' | 'key' | 'trust' | 'done' = 'draw';
  const name = (id: string) => PARTS.find((p) => p.id === id)!.name;

  const draw = (): (HTMLElement | string)[] => [
    sends === 0
      ? h('p', {}, `Printer Lark hands you a chalk board at the first signal tower. 'The river towers pass messages by pictures only. No words: half the crews read different scripts. Send this: “${MESSAGE}” Choose ${PICK} marks.'`)
      : h('p', {}, `Send it again. Keys on every tower: ${keys.map((k) => KEYS.find((x) => x.id === k)!.text.replace(/^Paint on every tower: /, '')).join(' ')}`),
    h('div', { class: 'relay-marks', role: 'group', 'aria-label': 'Marks' }, ...PARTS.map((p) => h('button', {
      type: 'button', 'aria-pressed': String(chosen.includes(p.id)), disabled: !chosen.includes(p.id) && chosen.length >= PICK,
      onclick: () => { chosen = chosen.includes(p.id) ? chosen.filter((x) => x !== p.id) : [...chosen, p.id]; sfx('sfx.click'); render(); },
    }, p.name))),
    h('button', { type: 'button', class: 'primary', disabled: chosen.length !== PICK, onclick: send }, 'Send it down the river'),
  ];

  function send(): void {
    stages = relay(chosen, keys); sends += 1; stage = 'result'; sfx('sfx.page');
    c.dispatch({ type: 'SetFlag', flag: 'field.relay.sends', value: sends });
    render();
  }

  const result = (): (HTMLElement | string)[] => {
    const left = stages!.at(-1)!;
    const r = reading(left, keys);
    const ok = allThrough(left, keys);
    const outcome = Object.values(r).map((f) => OUTCOME[f]).filter(Boolean)[0];
    return [
      h('ol', { class: 'relay-stages' }, ...stages!.map((s, i) => h('li', {}, `${i === 0 ? 'You drew' : `${COPYISTS[i - 1]} copied`}: ${s.map(name).join(', ')}.`))),
      h('p', { class: 'clue-view fresh', role: 'status' }, `The harbour reads: “${harbourReads(left, keys)}”`),
      h('ul', { class: 'relay-fates' },
        h('li', {}, `The storm ${FATE[r.storm]}.`), h('li', {}, `“From the west” ${FATE[r.west]}.`), h('li', {}, `“Bring the boats in” ${FATE[r.boats]}.`)),
      outcome ? h('p', {}, outcome) : '',
      ok || keys.length >= 2
        ? h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'trust'; render(); } }, 'Talk it over with Lark and Mina')
        : h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'key'; render(); } },
          keys.length ? 'Add a second key' : 'Paint a key on the towers'),
    ];
  };

  const keyStage = (): (HTMLElement | string)[] => [
    h('p', {}, keys.length
      ? "Mina looks at the harbour's reading. 'One agreement helped. Will another? Each key is a thing every crew must learn.'"
      : "Lending Keeper Mina comes up the tower stairs. 'Every copyist drops the small marks. We cannot stop that. But we can agree, on every tower, what a mark means. Choose one key.'"),
    h('div', { class: 'row' }, ...KEYS.filter((k) => !keys.includes(k.id)).map((k) => h('button', { type: 'button', onclick: () => {
      keys = [...keys, k.id]; chosen = []; stage = 'draw'; sfx('sfx.page');
      c.dispatch({ type: 'SetFlag', flag: 'field.relay.keys', value: keys.join(',') });
      render();
    } }, k.text))),
  ];

  const trustStage = (): (HTMLElement | string)[] => [
    h('p', {}, "Lark wipes the chalk board. 'So. What carried the message down the river?'"),
    ...(trust
      ? [h('p', { class: 'clue-view fresh', role: 'status' }, TRUST.find((t) => t.id === trust)!.reply),
        h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => { stage = 'done'; render(); } }, 'Climb down the tower')]
      : [h('div', { class: 'row' }, ...TRUST.map((t) => h('button', { type: 'button', onclick: () => {
        trust = t.id; c.dispatch({ type: 'SetFlag', flag: 'field.relay.trust', value: t.id }); sfx('sfx.page'); render();
      } }, t.text)))]),
  ];

  const done = (): (HTMLElement | string)[] => [
    h('p', {}, keys.map((k) => KEYS.find((x) => x.id === k)!.line).join(' ')),
    finish(),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: close }, 'Close')),
  ];

  function render(): void {
    const parts = stage === 'draw' ? draw() : stage === 'result' ? result() : stage === 'key' ? keyStage() : stage === 'trust' ? trustStage() : done();
    box.replaceChildren(h('h2', {}, 'The Sketch Relay'), ...parts);
    (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
  }
  render();
  return box;
}
