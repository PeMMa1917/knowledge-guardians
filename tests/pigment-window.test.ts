import { expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { EMBERFORD_PIGMENT_WINDOW, LANDING_PIGMENT_WINDOW } from '../src/maps/pigmentWindow';
import { Driver } from './driver';

const props = [...EMBERFORD_PIGMENT_WINDOW, ...LANDING_PIGMENT_WINDOW];
function use(d: Driver, id: string, pick?: string) {
  const prop = props.find((item) => item.id === `pigment-window.${id}`)!;
  expect(check(prop.visibleIf, d.s), id).toBe(true);
  if (prop.node) d.walk(prop.node, pick ? [pick] : []);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  return prop.text;
}

it.each(['lamp', 'hatch'] as const)('controls the lamp and custody comparisons and prepares the %s proof', (choice) => {
  const d = new Driver();
  d.run({ type: 'SetFlag', flag: 'reached.emberford', value: true });
  use(d, 'stand', 'warm lamp');
  expect(use(d, 'warm')).toContain('brightness 3');
  use(d, 'stand', 'intact strip under the cool lamp');
  expect(use(d, 'cool')).toContain('brightness 5');
  expect(d.done('pigment-window.controlled')).toBe(false);
  use(d, 'stand', 'both custody strips');
  expect(use(d, 'start')).toContain('Covered strip 5. Open strip 5.');
  use(d, 'stand', 'Advance the model');
  expect(use(d, 'later')).toContain('Covered strip 5. Open strip 2.');
  expect(d.done('pigment-window.controlled')).toBe(true);
  expect(check(props.find((item) => item.id === 'pigment-window.copy')?.visibleIf, d.s)).toBe(false);
  use(d, 'carry', 'Tuck the paired');
  expect(d.s.inventory['item.pigment-window.strip']).toBe(1);
  use(d, 'copy', choice === 'lamp' ? 'fixed lamp' : 'a hatch marker');
  expect(d.done('pigment-window.received')).toBe(false);
  use(d, choice);
  expect(d.done('pigment-window.received')).toBe(true);
});
