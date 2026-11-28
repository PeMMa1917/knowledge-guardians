import type { Settings } from '../app/settings';
import { h } from './dom';

/** The same reading preferences are available during the first download and at any time in play. */
export function readingControls(settings: Settings, change: () => void): HTMLLabelElement[] {
  function toggle(key: 'reducedMotion' | 'reducedEffects' | 'highContrast' | 'dyslexiaSpacing', label: string) {
    const input = h('input', { type: 'checkbox', checked: settings[key], onchange: () => {
      settings[key] = input.checked;
      change();
    } });
    return h('label', { class: 'check' }, input, ' ' + label);
  }
  const scale = h('select', { onchange: () => {
    settings.textScale = Number(scale.value);
    change();
  } }, ...[1, 1.25, 1.5, 1.75].map(value =>
    h('option', { value: String(value), selected: value === settings.textScale }, Math.round(value * 100) + '%')));
  return [
    h('label', { class: 'range' }, 'Text size ', scale),
    toggle('reducedMotion', 'Reduce motion (no camera fades, sway or flicker)'),
    toggle('reducedEffects', 'Reduce visual effects (lighting, glow, particles)'),
    toggle('highContrast', 'High-contrast interface'),
    toggle('dyslexiaSpacing', 'Wider letter and line spacing'),
  ];
}
