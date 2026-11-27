import type { CampaignState, ContentPack, Effect, Hint } from './types';
export const watches = {
  gate: {
    map: 'water.gatehouse',
    world: 'WORLD-12',
    chapter: 11,
    title: 'A bell for the empty cradle',
    opening:
      'Maro stuffed wool in the warning bell last night. “My father only sleeps between tides.” She takes it out again. “My sister is down on the steps.” Six tide strips lie in the cradle. Each carries the height at dusk and whether water reached the steps by midnight.',
    task: 'Slide the brass clip to two heights. The bell would sound at or above the clip. Read each night through both settings, then leave Maro one for tonight.',
    trials: ['Clip at 2 marks', 'Clip at 4 marks', 'Clip at 5 marks'],
    lead: 'Maro tucks a strip of wool under the knot. “Ro at Library Dispatch counted the lamps that answered. Ask her about the windows without one.”',
    question: 'Which mistake would the household upstairs notice, and which would the boat crew notice?',
  },
  dispatch: {
    map: 'civic.dispatch',
    world: 'WORLD-13',
    chapter: 12,
    title: 'The four windows that answered',
    opening:
      'The operator has chalked FULL HOUSE over the night rota. Four households sent back a light. Beside the other two addresses somebody has drawn curtains. “I used to live behind one,” says Ro. “We never had a lamp.”',
    task: 'Stretch the counting cord across each group. The list names six households. Four sent signals back. Give the next shift a way to find the other two.',
    trials: ['Stretch the cord over replies', 'Stretch the cord over the whole rota'],
    lead: 'Ro turns the rota over. A girl has scratched three little grooves on the back. “Try Wren’s hood in the Listening Room. She’s kept something for you.”',
    question: 'Whose experience disappears when the denominator changes?',
  },
} as const;
export type WatchSite = keyof typeof watches;
export type BellAction = { type: 'WorkNightWatch'; site: WatchSite; stage: 'try' | 'leave'; setting: number };
const nights = [
  { height: 2, flood: false },
  { height: 4, flood: true },
  { height: 3, flood: false },
  { height: 5, flood: true },
  { height: 2, flood: true },
  { height: 4, flood: false },
];
export function bellResult(setting: number) {
  const height = [2, 4, 5][setting];
  return nights.map(({ height: mark, flood }, i) => ({
    label: 'Night ' + (i + 1),
    mark,
    flood,
    outcome:
      mark >= height
        ? flood
          ? 'Warning in time'
          : 'Woke a dry house'
        : flood
          ? 'Steps flooded in silence'
          : 'Quiet, dry steps',
  }));
}
export function watchReading(site: WatchSite, setting: number) {
  if (site === 'dispatch')
    return setting === 0
      ? '4 of 4 reply lamps answered. Everyone who answered is on the sheet. The two dark windows are outside this count.'
      : '4 of 6 households answered. Two addresses are unconfirmed. Silence tells us nothing about what either family heard.';
  const rows = bellResult(setting);
  return (
    rows.filter((r) => r.outcome === 'Woke a dry house').length +
    ' dry-night calls and ' +
    rows.filter((r) => r.outcome === 'Steps flooded in silence').length +
    ' missed floods in the six recorded nights.'
  );
}
export function watchEnding(site: WatchSite, setting: number) {
  if (site === 'dispatch')
    return setting === 0
      ? 'Ro leaves the relay staffed and walks the two dark addresses after the last call. The lamps have a watcher while the households wait.'
      : 'Ro sends the lantern runner out now. Her partner leaves the return board for a moment to cover the far landing.';
  return [
    'Maro unplugs the low bell. Her sister can hear it before the tide reaches the steps. Upstairs, her father begins moving his bed.',
    'Maro ties the clapper at the middle mark. Her sister takes a chair near the steps on the nights below the clip.',
    'Maro saves the bell for the high mark. The house can sleep longer. She puts on her boots to watch the early water herself.',
  ][setting];
}
export function watchEffects(cmd: BellAction, state: CampaignState): Effect[] {
  const site = watches[cmd.site],
    key = 'night-watch.' + cmd.site;
  if (!site || site.map !== state.mapId || !Number.isInteger(cmd.setting))
    throw new Error('Find the night watch in its own room.');
  if (cmd.stage === 'try' && cmd.setting >= 0 && cmd.setting < site.trials.length)
    return [
      { setFlag: key + '.tested.' + cmd.setting, value: true },
      { setFlag: key + '.current', value: cmd.setting },
    ];
  const tested = site.trials.filter((_, i) => state.flags[key + '.tested.' + i] === true).length;
  if (
    cmd.stage !== 'leave' ||
    tested < 2 ||
    cmd.setting < 0 ||
    cmd.setting >= (cmd.site === 'gate' ? 3 : 2) ||
    (cmd.site === 'gate' && state.flags[key + '.tested.' + cmd.setting] !== true)
  )
    throw new Error('Try two settings before choosing what to leave on watch.');
  return [{ setFlag: key + '.left', value: cmd.setting }];
}
export function installWatches(pack: ContentPack) {
  for (const [id, site] of Object.entries(watches)) {
    const key = 'night-watch.' + id,
      objective = key + '.handover';
    pack.missions.push({
      id: 'KG-CH' + site.chapter + '-' + key,
      world: site.world,
      title: site.title,
      stake: site.opening,
      knowledgeQuestion: site.question,
      objectives: [
        {
          id: objective,
          title: site.task,
          essential: false,
          visible: { flag: key + '.current', in: [0, 1, 2] },
          done: { flag: key + '.left', in: [0, 1, 2] },
          weave: {
            concepts: ['evidence', 'responsibility', 'certainty', 'perspective', 'values', 'justification'],
            framework: ['methods-and-tools', 'perspectives', 'ethics'],
            atl: ['thinking', 'communication'],
            aoks: id === 'gate' ? ['MAT', 'HUM', 'NAT', 'TEC'] : ['MAT', 'HUM', 'POL'],
            subjects: ['math-ai', 'geography', 'physics'],
            minutes: 4,
            thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' },
          },
        },
      ],
    });
    const hints = [
      site.opening,
      'Find the receiving lamp in the ' + (id === 'gate' ? 'Gatehouse.' : 'Dispatch Hall.'),
      site.task,
      id === 'gate'
        ? 'Try the low clip, then the high clip. The two-mark night that flooded stays in both tables.'
        : 'Count the returning lights, then count the whole rota. Choose who will visit the dark windows.',
    ];
    hints.forEach((text, i) =>
      pack.hints.push({ id: 'h.' + key + '.' + i, objective, depth: (i + 1) as Hint['depth'], text }),
    );
  }
}
