import { describe, expect, it } from 'vitest';
import { ISLAND_ROUTES } from '../src/domain/islandPlan';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const upperChoices = {
  ridge: 'Put the ridge cart on the upper-landing plan',
  ferry: 'Load the ferry from the upper landing',
  marsh: 'Send the first pair by the marsh path',
};
const lowerChoices = {
  ridge: 'Put the ridge cart on the revised sheet',
  ferry: 'Keep the ferry and record the smaller loads',
  marsh: 'Start the revised run by the marsh path',
};

function visit(d: Driver, id: string): void {
  const door = MAPS[d.s.mapId].interactables.find((item) => item.kind === 'door' && item.id === id);
  if (!door?.to || !check(door.visibleIf, d.s) || !check(door.openIf, d.s)) throw new Error(`Cannot use ${id} here`);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function read(d: Driver, id: string): void {
  const item = MAPS[d.s.mapId].interactables.find((prop) => prop.kind === 'sign' && prop.id === id);
  if (!item?.flag || !check(item.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function visible(d: Driver, id: string): boolean {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return !!prop && check(prop.visibleIf, d.s);
}

describe('The Eight Crates', () => {
  const routes = ISLAND_ROUTES.flatMap((upper) => ISLAND_ROUTES.map((lower) => ({ upper, lower })));

  it.each(routes)('keeps the $upper upper sheet when publishing a $lower correction', ({ upper, lower }) => {
    const d = new Driver();
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH14-M01')).toBe(false);
    d.s.objectivesDone.push('voices.finish');
    const recall = upper === 'marsh' && lower === 'ferry';
    if (recall) d.s.flags['voices.revision'] = 'routes';
    visit(d, 'island-door');
    expect(d.done('island.arrival')).toBe(true);
    expect(visible(d, 'island-draft-plan')).toBe(true);
    expect(() => d.run({ type: 'RunIslandPlan', landing: 'low', route: 'ferry' })).toThrow(/lower landing/i);
    visit(d, 'island-dock-path');
    expect(visible(d, 'island-low-landing')).toBe(false);
    read(d, 'island-route-card');
    visit(d, 'island-dock-to-margin');
    read(d, 'island-quiet-strip');
    expect(d.done('island.sources')).toBe(true);
    expect(visible(d, 'island-listener-note')).toBe(false);
    visit(d, 'island-margin-return');

    const alternate = upper === 'ridge' ? 'marsh' : 'ridge';
    d.run({ type: 'RunIslandPlan', landing: 'high', route: upper === 'ferry' ? alternate : upper });
    expect(d.done('island.compare')).toBe(false);
    d.run({ type: 'RunIslandPlan', landing: 'high', route: 'ferry' });
    expect(d.done('island.compare')).toBe(true);
    const untested = ISLAND_ROUTES.find((route) => !d.s.flags[`island.plan.high.${route}`])!;
    expect(d.e.visibleOptions('island.dock.choose', d.s).some(({ option }) =>
      option.text.startsWith(upperChoices[untested]))).toBe(false);

    visit(d, 'island-dock-path');
    d.talk('island-dockhand', upperChoices[upper]);
    expect(d.done('island.publish')).toBe(true);
    const displayed = (prefix: string) => MAPS['island.dock'].interactables
      .filter((prop) => prop.id.startsWith(prefix) && check(prop.visibleIf, d.s))
      .map((prop) => prop.id);
    expect(displayed('island-result-')).toEqual([`island-result-${upper}`]);
    read(d, 'island-low-landing');
    visit(d, 'island-dock-return');

    if (upper !== 'ferry') {
      d.run({ type: 'RunIslandPlan', landing: 'low', route: alternate });
    }
    d.run({ type: 'RunIslandPlan', landing: 'low', route: 'ferry' });
    expect(d.done('island.retest')).toBe(false);
    expect(visible(d, 'island-draft-plan')).toBe(true);
    d.run({ type: 'RunIslandPlan', landing: 'low', route: upper === 'ferry' ? alternate : upper });
    expect(d.done('island.retest')).toBe(true);
    expect(visible(d, 'island-draft-plan')).toBe(false);
    expect(visible(d, 'island-checked-plan')).toBe(true);
    if (!d.s.flags[`island.plan.low.${lower}`]) {
      expect(d.e.visibleOptions('island.dock.revise', d.s).some(({ option }) =>
        option.text.startsWith(lowerChoices[lower]))).toBe(false);
      d.run({ type: 'RunIslandPlan', landing: 'low', route: lower });
    }

    visit(d, 'island-dock-path');
    expect(d.e.visibleOptions('island.dock.revise', d.s).some(({ option }) =>
      option.next === 'island.dock.voices')).toBe(recall);
    const revisedChoices = recall ? ['On Glass Walk we checked', lowerChoices[lower]] : [lowerChoices[lower]];
    d.talk('island-dockhand', ...revisedChoices);
    expect(d.done('island.finish')).toBe(true);
    expect(displayed('island-result-')).toEqual([`island-result-${upper}`]);
    expect(displayed('island-revised-')).toEqual([`island-revised-${lower}`]);
    expect(d.p.credit['credit.island.publish']).toBe(8);
    expect(d.p.credit['credit.island.finish']).toBe(8);

    visit(d, 'island-dock-to-margin');
    expect(visible(d, 'island-quiet-log')).toBe(false);
    read(d, 'island-listener-note');
    visit(d, 'island-margin-to-dock');
    d.talk('island-dockhand', 'Put a place-and-time log');
    expect(d.done('island.log')).toBe(true);
    visit(d, 'island-dock-to-margin');
    expect(visible(d, 'island-quiet-log')).toBe(true);
  });

  it.each([
    ['pair', 'Put the waiting line beside the square'],
    ['gloss', 'Keep the square clear and leave the guide at the shelter'],
  ])('checks the berth signal before posting the %s notice', (layout, choice) => {
    const d = new Driver();
    d.s.objectivesDone.push('voices.finish');
    visit(d, 'island-door');
    visit(d, 'island-dock-path');
    read(d, 'island-square-claim');
    read(d, 'island-signal-rail');
    const canCheck = () => d.e.visibleOptions('island.dock.card', d.s)
      .some(({ option }) => option.next === 'island.dock.signal');
    expect(canCheck()).toBe(false);
    read(d, 'island-signal-hand');
    expect(canCheck()).toBe(true);
    d.talk('island-dockhand', 'Check the square board with me', choice);
    expect(visible(d, 'island-signal-pair')).toBe(layout === 'pair');
    expect(visible(d, 'island-signal-gloss')).toBe(layout === 'gloss');
    expect(d.done('island.signal')).toBe(true);
    expect(d.done('island.publish')).toBe(false);
    expect(d.s.flags['island.lower.read']).toBeUndefined();
  });
});
