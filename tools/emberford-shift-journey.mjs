import assert from 'node:assert/strict';

export async function playEmberfordShift({ page, engine, use, button, close, waitMap, puzzles }) {
  const town = 'aethelgard.emberford';
  await page.evaluate((id) => kg.world.changeMap(id, 20, 21), town);
  await waitMap(town);
  const record = (id) => puzzles.find((p) => p.id === id);
  const press = (label) => page.getByRole('button', { name: label, exact: true }).click();
  const outcomes = [1, 2, 0];
  async function deliver(id, pos) {
    const job = record(id);
    for (const i of [3, pos]) {
      await press(job.handoffs[i].label);
      await page
        .getByText(job.handoffs[i].result + ' A reply is waiting on Emberford’s Lamp Wall.', { exact: true })
        .waitFor();
      assert.equal(
        await page.evaluate((id) => kg.controller.state.flags['puzzle.' + id + '.handoff'], id),
        i,
      );
    }
    await close();
  }
  await use('lamp-wall');
  assert.equal(await page.locator('.lamps-panel details').count(), 0);
  await close();
  await use('map-table');
  const maps = record('map-table');
  for (const person of maps.audiences) {
    await page.getByRole('tab', { name: person.name, exact: true }).click();
    for (const layer of person.need) await press(maps.layers.find((l) => l.id === layer).label);
    await press('Give this map to ' + person.name.split(',')[0]);
  }
  await deliver('map-table', outcomes[0]);

  await use('brass-sorter');
  const sorter = record('brass-sorter');
  await button("Run the sorter on today's basket");
  await press(sorter.inspections[0].label);
  for (const id of ['c-r1', 'c-r3', 'c-g1', 'c-g2', 'c-y1', 'c-y2']) {
    const item = sorter.fruits.find((f) => f.id === id);
    const label = item.size + ' ' + item.colour + ' fruit' + (item.bruised ? ', bruised' : '');
    await page.getByRole('button', { name: label, exact: true }).first().click();
  }
  await press('Teach the sorter and run the basket');
  await deliver('brass-sorter', outcomes[1]);

  await use('echo-bridge');
  await press('Open Idris’s timing slip');
  await page.getByText(/Returning claps in milliseconds/).waitFor();
  await press('Return to my own timing marks');
  assert.equal(await page.locator('[data-delivery]').count(), 0);
  await press('Open Idris’s timing slip');
  await deliver('echo-bridge', outcomes[2]);
  // Prepare the six other benches with ordinary domain actions. Inspect, change and
  // collect their handovers in the browser, including the window in the Archive.
  const rest = [
    ['toll-survey', 'survey-box', [{ type: 'PuzzleSurvey', wording: 'plain', sample: 'houses' }]],
    ['ferry-message', 'ferry-slate', [{ type: 'PuzzleTranslate', picks: [1, 1, 1, 1] }]],
    [
      'painters-frame',
      'easel',
      [
        ['guild', 0, 7],
        ['fund', 17, 2],
        ['council', 19, 6],
      ].map(([brief, x, y]) => ({ type: 'PuzzleFrame', brief, x, y })),
    ],
    [
      'bell-stair',
      'bell-rope',
      [
        { type: 'PuzzleListen', action: 'play' },
        { type: 'PuzzleListen', action: 'guess', index: 0 },
        { type: 'PuzzleListen', action: 'compare' },
      ],
    ],
    [
      'forecast-board',
      'forecast-board',
      record('forecast-board').days.map(() => ({ type: 'PuzzleForecast', chance: 50 })),
    ],
    [
      'round-window',
      'round-window',
      [
        ...Array.from({ length: 5 }, () => ({ type: 'PuzzleAddPoint' })),
        { type: 'PuzzlePredict', index: 0 },
        { type: 'PuzzleAddPoint' },
      ],
    ],
  ];
  for (const [id, prop, steps] of rest) {
    if (id === 'round-window') {
      await page.evaluate(() => kg.world.changeMap('nexus.archive', 15, 10));
      await waitMap('nexus.archive');
    }
    await page.evaluate(
      ({ id, steps }) => {
        for (const step of steps) {
          const errors = kg.controller.dispatch({ ...step, puzzle: id }).filter((e) => e.kind === 'error');
          if (errors.length) throw Error(errors[0].message);
        }
      },
      { id, steps },
    );
    await use(prop);
    await deliver(id, 1);
  }
  await page.evaluate((id) => kg.world.changeMap(id, 20, 21), town);
  await waitMap(town);
  await use('lamp-wall');
  const ids = ['map-table', 'brass-sorter', 'echo-bridge', ...rest.map(([id]) => id)];
  outcomes.push(...rest.map(() => 1));
  assert.equal(await page.locator('.lamps-panel summary').count(), ids.length);
  assert.equal(
    await page.evaluate(() => kg.controller.state.adventureDiary.entries.filter((e) => e.event?.ref.startsWith('field-reply.')).length),
    0,
  );
  for (const [n, id] of ids.entries()) {
    const selected = record(id).handoffs[outcomes[n]];
    assert.equal(
      await page.locator('.lamps-panel summary').filter({ hasText: record(id).handoffs[3].label }).count(),
      0,
    );
    await page.locator('.lamps-panel summary').filter({ hasText: selected.label }).click();
    await page.getByText(selected.reply, { exact: true }).waitFor();
    await page.waitForFunction(
      (key) => kg.controller.state.adventureDiary.entries.some((e) => e.event?.ref === key),
      'field-reply.' + id + '.' + outcomes[n],
    );
  }
  console.log(
    'PASS ' +
      engine +
      ' nine field handovers, revisions, independent timing record, physical replies and diary',
  );
}
