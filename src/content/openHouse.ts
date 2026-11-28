import type { Condition, ContentPack, DialogueNode, Hint, Objective } from '../domain/types';
import { housePorch, houseRoom, houseSites, houseTopics, type HouseCommand } from '../domain/openHouse';
export const doorPeople = {
  neska: 'door-neska',
  tover: 'door-tover',
  yilka: 'door-yilka',
  jane: 'lantern-q234335',
  zaha: 'ink-q47780',
} as const;
const { neska, tover, yilka, jane, zaha } = doorPeople;
const flag = (k: string): Condition => ({ flag: 'middlehouse.' + k, eq: true });
const gate = (id: string): Condition => ({ objective: id });
export const houseBuilt: Condition = { flagSet: 'middlehouse.floor' };
export const secondLanding = flag('ever.table');
export const houseFieldGates = {
  cart: { all: [houseBuilt, gate('m02.o1.arrive')] },
  light: { all: [houseBuilt, gate('sea.arrival')] },
  table: { all: [houseBuilt, gate('voices.arrival')] },
} satisfies Record<keyof typeof houseSites, Condition>;
function pick(text: string, next: string, condition?: Condition) {
  return { text, next: 'middlehouse.' + next, if: condition };
}
function say(
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
  citation?: string,
): DialogueNode {
  return {
    id: 'middlehouse.' + id,
    speaker,
    text,
    options,
    historicalLabel: speaker === jane || speaker === zaha ? 'imagined-alternate' : 'fictional-world',
    ...(citation ? { citationSource: citation } : {}),
  };
}
const voices = [
  say(
    'neska',
    neska,
    'Neska is lying on her back with one ear against the threshold. “Two knocks for supper. One long scratch for a bed. Something underneath has been doing both.” She lifts the mat. The floor below it is the size of your hand.',
    [
      pick('Lie down and listen through the boards.', 'neska.under'),
      pick('Ask who set the price of a bed.', 'neska.price'),
      pick('Tell her somebody has tried a real wheel.', 'neska.wheel', flag('ever.cart')),
    ],
  ),
  say(
    'neska.under',
    neska,
    'Scritch. Two knocks. Neska knocks back and something warm noses your knuckle through the gap. “I’ve been leaving the key under there for years. It never occurred to me to leave room for the person trying to give it back.”',
  ),
  say(
    'neska.price',
    neska,
    '“My mother charged one story. I charged two when strangers started coming. I thought I was buying time to know them.” She listens again. “Can you hear me giving that speech to a creature with a key between its teeth?”',
  ),
  say(
    'neska.wheel',
    neska,
    '“Was there more than one way through?” Her tea has gone cold. She tastes it anyway. “I told Tover every room was connected. I never said he could actually bring supper through it. I suppose I let him hear both.”',
  ),
  say(
    'tover',
    tover,
    'Tover fills the kettle with buttons before he puts it on the cart. “Water sulks. Buttons tell you when they’ve had a rough ride.” One of them bounces right into his pocket. He takes it out again.',
    [
      pick('Look at the groove underneath the little wheel.', 'tover.grain'),
      pick('Ask what the lost button would have bought.', 'tover.button'),
    ],
  ),
  say(
    'tover.grain',
    tover,
    'He moves a flat shoe over the middle sill. It glides across. His wheel catches when he comes at the grain from the side. “People hear me call it a bad corner. Then someone walks it and comes back to tell me what a lovely corner it is.”',
  ),
  say(
    'tover.button',
    tover,
    '“That button came off a coat the night my father carried a pot up three flights. I was supposed to be downstairs holding the door. Somebody had asked me to sing.” He balances it on the rim. “If somebody has to choose tonight, I want them to know what weighs what.”',
  ),
  say(
    'yilka',
    yilka,
    'Yilka makes the roof lamps for people who walk home after the choir. Her own front window has a blind she has never lifted. She leaves it tied in a bow you could undo with one finger.',
    [
      pick('Ask before touching the cord.', 'yilka.cord'),
      pick('Put the light on your side of the glass.', 'yilka.glass'),
    ],
  ),
  say(
    'yilka.cord',
    yilka,
    '“Keep it tied, please.” A neighbour can want a light to find their way home and a dark window when they get there. “The other lamp makers know. We build a little place for the knot.”',
  ),
  say(
    'yilka.glass',
    yilka,
    'Your reflection blots her out. Yilka waits until you notice before moving the lamp a handspan. “I used to think everybody in the dark could see what I was trying to show them.”',
  ),
  say(
    'jane',
    jane,
    'Jane Jacobs takes a long look at the diagram. Then she turns the page sideways and leans down to Tover’s level. “Show me where the kettle goes at supper.” Neska begins to point. Jacobs waits for the cart to move.',
    [
      pick('Walk with the kettle.', 'jane.walk'),
      pick('Stand where the person coming in can see you.', 'jane.window'),
    ],
    'HIS-HOUSE-JACOBS',
  ),
  say(
    'jane.walk',
    jane,
    'Tover takes the long way round because somebody likes to leave a chair outside at dusk. Three neighbours ask after the chair on that one short trip. Jacobs lets each of them change the walk a little.',
    [],
    'HIS-HOUSE-WALK',
  ),
  say(
    'jane.window',
    jane,
    'From the street that bright patch looks occupied. At the doorstep you see an empty chair in a pool of lamplight. “Somebody still has to answer the door,” she says. Neska comes down in one shoe.',
  ),
  say(
    'zaha',
    zaha,
    'Zaha Hadid draws one long line across the floor and asks you to walk it. Tover’s kettle falls off the edge of the paper. “Good,” says Yilka, catching the handle. “I could never see the edge until he got there.”',
    [
      pick('Follow the edge of the fire station in her sketchbook.', 'zaha.vitra'),
      pick('Fold the line around a corner.', 'zaha.fold'),
      pick('Look from the place the kettle fell.', 'zaha.low'),
    ],
    'HIS-HOUSE-HADID',
  ),
  say(
    'zaha.vitra',
    zaha,
    'One leaf in the sketchbook shows the Vitra Fire Station in Weil am Rhein, finished in 1993. The concrete planes seem to slide past one another as you tip the page. Hadid steadies the model with a fingertip. Tover tries the walk again from below.',
    [],
    'HIS-HOUSE-HADID',
  ),
  say(
    'zaha.fold',
    zaha,
    'Hadid props the folded paper up. The wall throws a shadow across her original line. One version makes movement easy to imagine. The other lets the kettle disappear before it reaches the door.',
    [],
    'HIS-HOUSE-HADID',
  ),
  say(
    'zaha.low',
    zaha,
    'From the floor, the drawn route goes straight into the lip of the paper. She gives you the pencil and holds the sheet at that angle until you finish. Neska leans in to see what changes when you stand back up.',
  ),
  say(
    'tover.cart',
    tover,
    'The coal yard has painted your nine rooms at full size. Tover has brought his kettle with a lid this time. A child in the gateway has brought a very clean spoon.',
    [
      pick('Try the wall before you push.', 'tover.wall'),
      pick('Put the first bowl down where the cart really stopped.', 'tover.soup', flag('ever.cart')),
    ],
  ),
  say(
    'tover.wall',
    tover,
    '“Chalk never stopped anybody walking. The yard crew put a low rail where your two ends missed. It stopped the wheel.” He slides his hands down the handles and leaves you room beside him.',
  ),
  say(
    'tover.soup',
    tover,
    'The child puts the spoon in the bowl, fishes something out and holds it up. A button. Tover turns both pockets inside out and the child laughs until her spoon falls in again.',
  ),
  say(
    'jane.cart',
    jane,
    'One person steps neatly over the grain. Another takes the kettle round three corners. Jacobs goes on both journeys and stops to hear why the yard crew need the corner clear.',
    [
      pick('Stand behind the wheel this time.', 'jane.cart.back'),
      pick('Trace the flat shoe journey with a finger.', 'jane.cart.chalk'),
    ],
    'HIS-HOUSE-JACOBS',
  ),
  say(
    'jane.cart.back',
    jane,
    'From behind the cart, a neighbour is part of the turn. He opens his door and catches the kettle handle for an instant. On the plan he occupies no room at all.',
  ),
  say(
    'jane.cart.chalk',
    jane,
    'Your fingertip goes straight through the middle. From the other end the child with a spoon calls across, “I could have done that one myself!” What a finger can carry is a smaller question.',
  ),
  say(
    'yilka.light',
    yilka,
    'Yilka has trimmed the wick so every hook gets the same light. The fishmonger opposite would like her to trim the smell as well. She sniffs once. “No. That’s his department.”',
    [
      pick('Follow her round the first blind turn.', 'yilka.turn'),
      pick('Ask her which hook gets to stay.', 'yilka.hook', flag('ever.light')),
    ],
  ),
  say(
    'yilka.turn',
    yilka,
    'Two steps ago you could see her face. Now you can hear her humming half the tune. “If I filled this corner with light would you know who’s trying to sleep above it?”',
  ),
  say(
    'yilka.hook',
    yilka,
    '“You may leave a lamp after you know where it won’t reach.” She empties a small tin. There is one hook inside. The other lamps stayed here just long enough to show what a change of place could do.',
  ),
  say(
    'zaha.light',
    zaha,
    'The beams in the harbour roof cross above Hadid like the strokes on a sheet of paper. Under one beam the broad band of light narrows to a little triangle. She marks the spot with her heel.',
    [
      pick('Walk outside the triangle.', 'zaha.dark'),
      pick('Look back at the opening you came through.', 'zaha.back'),
    ],
    'HIS-HOUSE-HADID',
  ),
  say(
    'zaha.dark',
    zaha,
    'You can still reach the step even after the light is out of sight. The same opening carries bodies and light for different distances. She draws both limits on the back of the slip.',
  ),
  say(
    'zaha.back',
    zaha,
    'Yilka stands framed in the door. When the fishmonger passes in front, the frame remains and Yilka vanishes. Hadid draws one short stroke where his basket breaks the band of light.',
  ),
  say(
    'neska.table',
    neska,
    'Neska puts three keys on the listening table. One is for a loft that costs a song. One is for a garden with room to be left alone. The smallest one is for a room where two people can eat without giving an account of themselves.',
    [
      pick('Pick up the keys together.', 'neska.keys'),
      pick('Look at her hands when she lets go.', 'neska.hands'),
    ],
  ),
  say(
    'neska.keys',
    neska,
    '“Three different offers. I used to think I had three doors.” The keys fit the same little lock. The person who takes the next turn has to say what the room is for.',
  ),
  say(
    'neska.hands',
    neska,
    'Her last finger stays hooked after the ring is gone. “I like being the person people come to. It makes it harder to hear the people who go home because they’d have to ask me.”',
  ),
  say(
    'neska.home',
    neska,
    'Someone is sitting in the room that used to be a line on the plan. Neska pulls her only chair out into the passage. “I need a moment to get used to hearing my own house from out here.”',
    [
      pick('Sit on the floor beside her.', 'neska.floor'),
      pick('Leave her the end of the corridor.', 'neska.silence'),
    ],
  ),
  say(
    'neska.floor',
    neska,
    'She asks you for the time and you give it to her. Then she asks how the floor feels. The answers have about as much to do with one another as the two knocks and the scratch. She laughs at her old tariff.',
  ),
  say(
    'neska.silence',
    neska,
    'From downstairs comes the sound of a spoon going round an empty bowl. Neska recognizes the hand doing it. She leaves the door just where it is.',
  ),
];
type Job = {
  id: string;
  title: string;
  act: HouseCommand['act'];
  finish: Condition;
  line: string;
  thinking: NonNullable<NonNullable<Objective['weave']>['thinking']>;
  h: string[];
};
const jobs: Job[] = [
  {
    id: 'guests',
    title: 'Leave somebody a place to come home to',
    act: 'hear',
    finish: { flagSet: 'middlehouse.heardGuest' },
    line: 'I left a place for a creature I had met already. Its belongings waited when it was out. When it came home I could sit and see what our shared work had left behind.',
    thinking: { dok: 2, bloom: 'understand', fink: 'human', solo: 'relational' },
    h: [
      'There are three places to sit in your quarters.',
      'Meet and befriend a creature at a chapter register.',
      'Invite it to a mat, sill or warm brick. A travelling friend leaves a place ready.',
      'Let it rest at a register or call a different companion. Listen when it gets home.',
    ],
  },
  {
    id: 'plan',
    title: 'See where a kettle and a shoe can go',
    act: 'issue',
    finish: houseBuilt,
    line: 'I tried a flat shoe and a loaded cart on the same nine rooms. Two connected door ends could still leave a raised sill that only the shoe could cross.',
    thinking: { dok: 3, bloom: 'create', fink: 'integration', solo: 'relational' },
    h: [
      'The little inn is close to the door of your quarters.',
      'At the middle mat, start with one neighbour’s sketch or turn individual rooms.',
      'Lay the shoe and the wheel on this exact arrangement. The wheel needs one outside stop and the mat needs its street entrance.',
      'Choose what the evening is for, then press the floor in wax. The other neighbours get a working copy.',
    ],
  },
  {
    id: 'cart',
    title: 'Get Tover’s kettle to an open door',
    act: 'park',
    finish: flag('ever.cart'),
    line: 'I pushed through a pair of open doors. The raised central sill still stopped a wheel from coming across its grain. I chose a place where the people waiting could actually pick the kettle up.',
    thinking: { dok: 3, bloom: 'apply', fink: 'application', solo: 'relational' },
    h: [
      'Take the pressed floor to Emberford.',
      'At the yard, push by one connected opening at a time.',
      'Try the route that the wheel traced in the house. Pull in chalk or return to the mat if you want to go another way.',
      'Park at an outside opening for the loft, tea table or garden. Tover records where you actually got to.',
    ],
  },
  {
    id: 'lamp',
    title: 'Find who sees Yilka’s lamp from two hooks',
    act: 'file',
    finish: flag('ever.light'),
    line: 'I could take the lamp around a bend that its light could never go around by itself. Lighting the room for one visitor left another around the corner.',
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
    h: [
      'At the Seagrass harbour stair there is one lantern on a long cord.',
      'Try a hook you can reach by foot. Light it and look at the straight lines.',
      'Try another hook with a different view.',
      'Return to a tried spot and leave the working lamp there.',
    ],
  },
  {
    id: 'night',
    title: 'Give someone the keys to the first evening',
    act: 'table',
    finish: secondLanding,
    line: 'I brought a real cart stop and a tried light into the meeting. The neighbours chose what the house should offer first. When I came home a room had opened behind our old diagram.',
    thinking: { dok: 4, bloom: 'evaluate', fink: 'caring', solo: 'extended' },
    h: [
      'The last meeting is in the Listening Room.',
      'Try the cart and the lamp on the most recently issued arrangement.',
      'The meeting can give the evening to a meal, a song or a quiet place.',
      'At home, find the open doorway behind the mat. The light and the kettle have left evidence in the new room.',
    ],
  },
];
export function installOpenHouse(pack: ContentPack) {
  pack.dialogue.push(...voices);
  const newCast = [
    [neska, 'Neska Vell', 'Night porter and former ballad caller', 'custom:brown.white.plum.sand.scarf.cyan'],
    [
      tover,
      'Tover Heth',
      'Soup carrier and part-time singer',
      'custom:deep.black.woad.olive.headband.gold.curls.darkframes.none',
    ],
    [
      yilka,
      'Yilka An',
      'Lamp trimmer and harbour roof keeper',
      'custom:light.auburn.teal.wine.scarf.rose.bun.none.none',
    ],
  ] as const;
  for (const [id, name, role, sprite] of newCast)
    pack.characters.push({
      id,
      name,
      role,
      sprite,
      mode: 'fictional',
      talk: [{ node: 'middlehouse.' + Object.entries(doorPeople).find(([, i]) => i === id)![0] }],
    });
  const greet = (id: string, visits: Record<string, string>) => {
    const npc = pack.characters.find((x) => x.id === id)!;
    npc.localGreeting = {
      ...npc.localGreeting,
      ...Object.fromEntries(Object.entries(visits).map(([room, node]) => [room, 'middlehouse.' + node])),
    };
  };
  greet(neska, { [houseRoom]: 'neska', [houseSites.table]: 'neska.table', [housePorch]: 'neska.home' });
  greet(tover, { [houseRoom]: 'tover', [houseSites.cart]: 'tover.cart' });
  greet(yilka, { [houseRoom]: 'yilka', [houseSites.light]: 'yilka.light' });
  greet(jane, { [houseRoom]: 'jane', [houseSites.cart]: 'jane.cart' });
  greet(zaha, { [houseRoom]: 'zaha', [houseSites.light]: 'zaha.light' });
  for (const [id, title, url, container, supports] of [
    [
      'JACOBS',
      'Jane Jacobs',
      'https://www.pps.org/article/jjacobs-2',
      'Project for Public Spaces',
      'The organisation describes Jacobs’s attention to sidewalks, mixed uses and how people act in real streets.',
    ],
    [
      'WALK',
      'About Us',
      'https://janeswalk.org/about-us/',
      'Jane’s Walk',
      'The present-day organisation describes free, community-led walking conversations inspired by Jacobs. The yard scene is original.',
    ],
    [
      'HADID',
      'Zaha Hadid',
      'https://www.pritzkerprize.com/laureates/2004',
      'The Pritzker Architecture Prize',
      'The 2004 laureate record documents drawings, built works and the Vitra Fire Station, Weil am Rhein, 1993. The paper inn and the people trying its doors are original.',
    ],
  ])
    pack.sources.push({
      id: 'HIS-HOUSE-' + id,
      title,
      url,
      locator: title,
      supports,
      accessed: '2026-11-28',
      mla: { kind: 'page', title, container },
    });
  const tape: Job = {
    id: 'tape',
    title: 'Measure a door that moves without changing neighbours',
    act: 'measure',
    finish: { flagSet: 'middlehouse.pairedTape' },
    line: 'I lengthened an east corridor while the same doors stayed joined. Counting which rooms I could get to and measuring the paces between them answered two different questions.',
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
    h: [
      'Look for the concertina seam under the nine rooms.',
      'Start with Tover’s supper floor and measure the cart journey to tea.',
      'Keep the tiles, traveller and stop fixed. Change only the east seam.',
      'Measure that same journey after opening or folding the seam. Compare the number of doors with the number of paces.',
    ],
  };
  const missions = [
    [
      'the-inn-with-no-middle-door',
      'The inn with no middle door',
      'WORLD-01',
      undefined,
      [...jobs.slice(0, 2), tape],
    ],
    ['the-button-in-the-soup', 'The button in the soup', 'WORLD-02', houseFieldGates.cart, [jobs[2]]],
    ['the-knot-in-the-lamp', 'The knot in the lamp', 'WORLD-09', houseFieldGates.light, [jobs[3]]],
    [
      'the-first-evening-under-the-mat',
      'The first evening under the mat',
      'WORLD-14',
      houseFieldGates.table,
      [jobs[4]],
    ],
  ] as const;
  for (const [id, title, world, available, group] of missions)
    pack.missions.push({
      id,
      title,
      world,
      available,
      stake:
        world === 'WORLD-01'
          ? 'Neska used to take a story for a bed. Somebody with the key to a smaller house has come up under her own mat.'
          : world === 'WORLD-02'
            ? 'Tover wants the bowl to reach a child who brought a spoon.'
            : world === 'WORLD-09'
              ? 'Yilka needs to light a walk home without lighting every upstairs window.'
              : 'The room can open for supper, a late singer or a guest who would like to stay alone.',
      knowledgeQuestion:
        world === 'WORLD-01'
          ? 'When does the line between two rooms count as a way through for the people who use them?'
          : world === 'WORLD-02'
            ? 'What does trying the same route with a different body or load reveal about the plan?'
            : world === 'WORLD-09'
              ? 'Who can see what has been made visible, and who can still reach it without seeing it?'
              : 'Which parts of an account of a shared house can tell us what its next evening should be for?',
      objectives: group.map((j) => ({
        id: 'middlehouse.' + j.id,
        title: j.title,
        done: j.finish,
        essential: false,
        visible: available,
        weave: { ...houseTopics(j.act), thinking: j.thinking, minutes: j.act === 'table' ? 4 : 3 },
        onComplete: [{ journal: 'j.middlehouse.' + j.id }],
      })),
    });
  for (const j of [...jobs, tape]) {
    pack.journal.push({ id: 'j.middlehouse.' + j.id, text: j.line, claimKind: 'observation' });
    j.h.forEach((text, i) =>
      pack.hints.push({
        id: 'h.middlehouse.' + j.id + '.' + i,
        objective: 'middlehouse.' + j.id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    );
  }
}
