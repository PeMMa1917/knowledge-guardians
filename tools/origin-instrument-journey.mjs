import assert from 'node:assert/strict';

export const originLabels = {
  archive: 'Archive child',
  traveller: 'Traveller',
  harbour: 'Harbour runner',
  workshop: 'Workshop apprentice',
  singer: 'Village singer',
};
const jobs = {
  archive: {
    memory: "A maker sketched the seam on the back. The school name is still inside.",
    trace: "Find out where Mina’s envelope went.",
    who: 'cataloguer-bela',
    other: 'curator-dace',
    home: 'nexus.archive',
    away: 'preserved.archive',
    first: /find out why/,
    decision: /cross-reference card/,
    run: 'Open the visitor’s drawer',
    steps: ['Mina, who remembers giving it', 'Sol, who needs a pen model'],
    send: 'Wheel the cabinet out to the school steps',
    then: 'Give a model maker the first turn',
  },
  traveller: {
    memory: "The departure caller has pinned a small brass clock to its case.",
    trace: "See whose hands have marked the baton.",
    who: 'translator-lio',
    other: 'clerk-venn',
    home: 'nexus.archive',
    away: 'island.workshop',
    first: /ask Venn/,
    decision: /visitor how they read/,
    run: 'Pull that cord on the paper gate',
    steps: [
      'Before the gate opens',
      'First away',
      'At the finish',
      'Leading the tune',
    ],
    send: 'Pin the music cue to the bandstand',
    then: 'Raise the traveller’s departure pennant',
  },
  harbour: {
    memory: "The child learned to read a blank peg hole beside the signed receipt.",
    trace: "Turn the little boat over once more.",
    who: 'runner-tamar',
    other: 'fruit-seller',
    home: 'aethelgard.emberford',
    away: 'sea.harbour',
    first: /ask Mara/,
    decision: /say it back/,
    run: 'Float the tally boat across',
    steps: ['The loader', 'The family at the quay'],
    send: 'Keep a reader beside the market board',
    then: 'Give the dock child a turn as reader',
  },
  workshop: {
    memory: "The later sheet showed a different curl. Ren copied both batch names onto the envelope.",
    trace: "Look for the ticket Hesper carried home.",
    who: 'apprentice-ren',
    other: 'smith-hesper',
    home: 'aethelgard.emberford',
    away: 'metalworks.records',
    first: /ask Hesper/,
    decision: /Put damp paper/,
    run: 'Release the clips and read three edges',
    steps: ['Dry', 'Damp'],
    send: 'Keep one ticket from every packet for the next maker',
    then: 'Use the spare ticket to test another sheet',
  },
  singer: {
    memory: "The shared quiet in the foyer left room for one more person to hum.",
    trace: "Look under the stool for news of the traveller.",
    who: 'singer-teodora',
    other: 'scholar-sefa',
    home: 'aethelgard.emberford',
    away: 'stage.foyer',
    first: /ask Sefa/,
    decision: /older singers/,
    run: 'Play the four stools',
    steps: ['Hold a rest', 'Bring in the hill line'],
    send: 'Set it among the circle seats',
    then: 'Start with one full beat of shared quiet',
  },
};
export async function playOriginTour({
  page,
  engine,
  origin,
  use,
  close,
  waitMap,
}) {
  const d = page.getByRole('dialog'),
    j = jobs[origin];
  const hit = async (name) => {
    const b = d
      .getByRole('button', { name, exact: typeof name === 'string' })
      .first();
    await b.focus();
    await b.press('Enter');
  };
  const flag = (key) =>
    page.evaluate(
      (k) => kg.controller.state.flags[k] ?? null,
      'origin-work.' + origin + '.' + key,
    );
  const go = async (id) => {
    await page.evaluate((id) => {
      const w = kg.world;
      if (w.map.id !== id) w.changeMap(id, 12, 12);
    }, id);
    await waitMap(id);
  };
  await go(j.home);
  await use(j.who);
  await hit(j.first);
  await d.waitFor({ state: 'hidden' });
  await use(j.other);
  await d.waitFor();
  await close();
  await use(j.who);
  await hit(j.decision);
  await hit(j.run + '.');
  const bench = d.locator('.origin-instrument');
  await bench.waitFor();
  assert.equal(
    await bench.getByRole('button', { name: j.send }).isDisabled(),
    true,
  );
  for (const choice of j.steps) {
    await hit(choice);
    await hit(j.run);
  }
  await hit(j.send);
  const record = await flag('edition');
  assert.equal(typeof record, 'string');
  const fits = await bench.evaluate((e) => ({
    w: e.clientWidth,
    scroll: e.scrollWidth,
  }));
  assert.ok(fits.scroll <= fits.w + 1, JSON.stringify(fits));
  await page.reload({ waitUntil: 'domcontentloaded' });
  const cont = page.getByRole('button', { name: /^Continue\b/ }).first();
  await cont.focus();
  await cont.press('Enter');
  await waitMap(j.home);
  await hit('Continue playing');
  // A queued two-voice answer can follow the recap if the player left mid-conversation.
  const neighbours = page.locator('[role="dialog"].two-replies');
  await page.waitForFunction(() => {
    const dialog = document.querySelector('[role=dialog]');
    return !dialog || dialog.classList.contains('two-replies');
  });
  if (await neighbours.isVisible()) await close();
  await go(j.away);
  await use(j.who);
  await hit('Unpack the instrument we sent here.');
  await hit(j.then);
  assert.ok(await flag('returned'));
  assert.equal(await flag('edition'), record);
  assert.ok((await bench.locator('li').count()) >= 3);
  await close();
  await go('council.gallery');
  await use(j.who);
  await hit(j.memory);
  const choice =
    origin === 'archive'
      ? 'Put the envelope in the child’s travelling case'
      : origin === 'traveller'
        ? 'Pass the baton back through the whole band'
        : origin === 'harbour'
          ? 'Give the empty line to the person who counted the carts'
          : origin === 'workshop'
            ? 'Give Hesper the crossed-out notice to keep'
            : 'Give the traveller the fourth stool for their next stop';
  await hit(choice);
  await close();
  assert.equal(await flag('homecoming'), 'given');
  await go(j.home);
  await use(j.who);
  await hit(j.trace);
  await close();
  const goals = await page.evaluate(
    (o) =>
      kg.controller.state.objectivesDone.filter((id) =>
        id.startsWith('origin-tour.' + o),
      ),
    origin,
  );
  assert.deepEqual(goals, [
    'origin-tour.' + origin + '.pack',
    'origin-tour.' + origin + '.tour',
    'origin-tour.' + origin + '.homecoming',
  ]);
  console.log('ORIGIN-TOUR', engine, origin, j.away, record, goals.join(', '));
}
