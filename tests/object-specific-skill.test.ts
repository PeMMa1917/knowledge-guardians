import { expect, it } from 'vitest';
import { BEARING_CASES } from '../src/content/bearingBay';
import { GLASS_RACK_CASES } from '../src/content/glassRack';
import { LOAD_CASES } from '../src/content/loadingBay';
import { microSkillId } from '../src/content/microSkillEvidence';
import { NUMBER_LEAVES } from '../src/content/numberLeaves';
import { SCRIPT_CASES, SCRIPT_DESTINATIONS, SCRIPT_DETAILS, scriptDelivery, scriptReady } from '../src/content/scriptRail';
import { STORY_FRAMES } from '../src/content/storyArchive';
import { bearingMove } from '../src/domain/bearingBay';
import { loadMove } from '../src/domain/loadingBay';
import { check } from '../src/domain/rules';
import { skillStage } from '../src/domain/skills';
import { openFrameView } from '../src/domain/storyFrames';
import { MAPS } from '../src/maps';
import { BEARING_ROOM } from '../src/maps/bearingBay';
import { COUNCIL_LOADING_BAY } from '../src/maps/loadingBay';
import { STORY_ARCHIVE } from '../src/maps/storyArchive';
import { NUMBER_LEAF_ROOM } from '../src/maps/numberLeaves';
import { Driver } from './driver';

it('earns a higher rank for eight exact-object source checks in a single campaign', () => {
  const d = new Driver();
  const skill = microSkillId(791);
  const set = (flag: string, value: boolean | string | number = true) => d.run({ type: 'SetFlag', flag, value });
  const inspect = (exhibit: string) => d.run({ type: 'InspectExhibit', exhibit });
  const stage = () => skillStage(d.p.skills[skill]);
  const records: string[] = [];
  const earned = (objective: string) => {
    records.push(objective);
    expect(d.done(objective), objective).toBe(true);
    expect(d.p.skills[skill].map((use) => use.split('|')[2])).toEqual(records);
  };
  const station = (id: string) => {
    const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
    if (!prop) throw new Error(`Unavailable station ${id}`);
    return prop;
  };
  const scene = (id: string, choice: string) => d.walk(station(id).node!, [choice]);
  const cross = (id: string) => {
    const door = station(id);
    expect(check(door.openIf, d.s)).toBe(true);
    if (door.flag) set(door.flag);
    d.s.mapId = door.to!.map;
  };

  // Stage chapter access. Use the game’s tool and dialogue commands for the eight linked objectives.
  d.s.objectivesDone.push('m01.o2.inspect');
  d.s.mapId = NUMBER_LEAF_ROOM.id;
  const leaf = NUMBER_LEAVES.find(({ slug }) => slug === 'bakhshali')!;
  inspect(leaf.exhibit);
  set(`${leaf.flag}.trial.a`);
  set(`${leaf.flag}.trial.b`);
  set(`${leaf.flag}.sent`, 'context');
  set(`${leaf.flag}.filed`, 'context');
  earned(leaf.objective);

  d.s.mapId = 'nexus.archive';
  scene('nexus-vind-case', 'Open the catalogue card');
  scene('nexus-vind-trace', 'Put the trace');
  scene('nexus-vind-earlier', 'Place the earlier slip');
  scene('nexus-vind-later', 'Place the later slip');
  scene('nexus-vind-place', 'Set an invitation caption');

  d.resumeAfter('preserved.publish');
  d.s.mapId = 'preserved.gallery';
  d.walk('gallery.panel.royal', ['custody record at the front']);
  d.walk('gallery.panel.coast', ['Open the context note']);
  earned('gallery.o.panels');

  d.s.objectivesDone.push('coast.arrival');
  d.s.mapId = BEARING_ROOM.id;
  const light = BEARING_CASES.find(({ slug }) => slug === 'eddystone-lighthouse')!;
  inspect(light.exhibit);
  for (const action of [
    { kind: 'read', post: 'west' }, { kind: 'read', post: 'east' }, { kind: 'send', route: 'quay' }, { kind: 'receive', route: 'quay' },
  ] as const) {
    if (action.kind === 'receive') {
      d.s.mapId = 'observatory.harbour';
      station('bearing-receiver-quay');
    }
    const effect = bearingMove(light.slug, d.s.flags, action)!;
    set(effect.setFlag, effect.value);
  }
  earned(light.objective);

  d.resumeAfter('forest.finish');
  d.s.mapId = 'nexus.archive';
  cross('metalworks-door');
  cross('metal-records-path');
  scene('metal-vind-fold', 'Fold the copy');
  cross('metal-yard-return');
  const witness = station('metal-vind-witness');
  expect(witness.text).toContain('person who sees the fit');
  d.run({ type: 'ReadWorldSign', id: witness.id, title: witness.label, text: witness.text!, readFlag: witness.flag });
  earned('vindolanda.hall.compare');

  d.s.objectivesDone.push('stage.arrival');
  d.s.mapId = STORY_ARCHIVE.id;
  const frame = STORY_FRAMES.find(({ key }) => key === 'board')!;
  inspect(frame.exhibit);
  for (const stamp of frame.stamps) d.walk(`${frame.flag}.stamp.${stamp.name}`, [stamp.action]);
  const frameRoute = frame.variants[0];
  set(`${frame.flag}.views`, openFrameView(0, 0));
  set(`${frame.flag}.views`, openFrameView(openFrameView(0, 0), 1));
  set(`${frame.flag}.ready`, frameRoute.key);
  d.s.mapId = 'stage.gallery';
  scene(`story-frame-${frame.key}-${frameRoute.key}`, frameRoute.action);
  earned(frame.objective);

  d.resumeAfter('stage.finish', 'council.arrival');
  d.s.mapId = COUNCIL_LOADING_BAY.id;
  const ship = LOAD_CASES.find(({ slug }) => slug === 'red-jacket')!;
  inspect(ship.exhibit);
  for (const action of [
    { type: 'measure', notch: -1 }, { type: 'measure', notch: 1 }, { type: 'mark', notch: -1 },
    { type: 'send', route: 'bench' }, { type: 'receive', route: 'bench' },
  ] as const) {
    if (action.type === 'receive') {
      d.s.mapId = 'council.hall';
      station('loading-receiver-bench');
    }
    const effect = loadMove(ship.slug, d.s.flags, action)!;
    set(effect.setFlag, effect.value);
  }
  earned(ship.objective);
  expect(records).toHaveLength(6);
  expect(stage()).toBe('practised');

  d.s.mapId = 'preserved.glass-rack';
  const pot = GLASS_RACK_CASES.find(({ slug }) => slug === '1972-9')!;
  expect(pot.record).toContain('modern replacement');
  expect(d.e.pack.sources.find(({ id }) => id === pot.source)?.url).toBe('https://clevelandart.org/art/1972.9');
  inspect(pot.exhibit);
  d.walk(pot.nodes.work, ['Set the whole view']);
  expect(d.e.visibleOptions(pot.nodes.work, d.s).map(({ option }) => option.text)).not.toContain('Fit a hinged pocket for the close desk.');
  d.walk(pot.nodes.work, ['Open the view of the parts']);
  d.walk(pot.nodes.work, ['Return to the whole view']);
  d.walk(pot.nodes.work, ['Fit a hinged pocket']);
  expect(d.e.visibleOptions(pot.nodes.rail, d.s)).toHaveLength(0);
  expect(d.p.skills[skill]).toHaveLength(6);
  d.walk(pot.nodes.pocket, ['Lift the pocket flap']);
  expect(d.p.skills[skill]).toHaveLength(6);
  d.walk(pot.nodes.pocket, ['Close the flap and link it']);
  earned(pot.earned);
  expect(pot.story.pocketDone).toContain('modern replacement');
  expect(stage()).toBe('practised');

  const genji = SCRIPT_CASES.find(({ slug }) => slug === 'genji-cloud')!;
  d.s.mapId = SCRIPT_DETAILS[genji.room].map;
  expect(genji.object.limit).toContain('later date than the story');
  expect(d.e.pack.sources.find(({ id }) => id === genji.source)?.url).toBe('https://www.clevelandart.org/art/1933.455');
  inspect(genji.exhibit);
  set(`${genji.flag}.preview.cue`);
  expect(check(scriptReady(genji), d.s)).toBe(false);
  set(`${genji.flag}.preview.catalogue`);
  expect(check(scriptReady(genji), d.s)).toBe(true);
  set(`${genji.flag}.sent`, 'catalogue');
  d.s.mapId = SCRIPT_DESTINATIONS.catalogue.map;
  expect(check(scriptDelivery(genji, 'cue'), d.s)).toBe(false);
  expect(check(scriptDelivery(genji, 'catalogue'), d.s)).toBe(true);
  expect(() => station(SCRIPT_DESTINATIONS.cue.prop)).toThrow('Unavailable station');
  station(SCRIPT_DESTINATIONS.catalogue.prop);
  expect(stage()).toBe('practised');
  expect(d.p.skills[skill]).toHaveLength(7);
  set(genji.objective, 'catalogue');
  earned(genji.objective);
  expect(genji.readbacks[1]).toContain('surviving copy from the original work');
  expect(records).toHaveLength(8);
  expect(new Set(d.p.skills[skill].map((use) => use.split('|')[0])).size).toBe(6);
  expect(stage()).toBe('confident');
});
