import assert from 'node:assert/strict';

export async function playStreetAlmanac({ page, use, engine, close, waitMap }) {
  const modal = page.getByRole('dialog');
  const button = (name) => modal.getByRole('button', { name, exact: typeof name === 'string' }).first();
  async function press(name) {
    const b = button(name);
    await b.focus();
    await b.press('Enter');
  }
  async function jump(map, x, y) {
    await page.evaluate(([m, x, y]) => kg.world.changeMap(m, x, y), [map, x, y]);
    await waitMap(map);
  }
  async function leave() {
    await page.keyboard.press('Escape');
    await page.waitForFunction(
      () =>
        !document.querySelector('[role=dialog]') ||
        document.querySelector('[role=dialog]')?.classList.contains('two-replies'),
    );
    if (await modal.isVisible()) await close();
  }
  const musicRoom = 'nexus.almanac',
    copies = 'copies.archive';
  await page.evaluate(() => {
    kg.settings.reducedEffects = true;
    kg.settings.reducedMotion = true;
    kg.controller.dispatch({ type: 'SetFlag', flag: 'nile.returned', value: true });
    kg.world.refreshWorld();
  });
  await use('nile-stone-case');
  await modal.waitFor();
  await leave();
  await use('nile-badang-case');
  await modal.waitFor();
  await leave();
  await use('nile-stone-label');
  if (engine === 'firefox') {
    await modal.locator('input[value="story"]').check();
    await modal.locator('input[value="tradition"]').check();
  }
  await press(/Put up the label|Publish|Hang|Set the label/i);
  await modal
    .getByText(/The label holds/)
    .first()
    .waitFor();
  await leave();
  await use('nile-stone-case');
  await press('Take this object');
  await leave();
  await page.keyboard.press('i');
  await press(/^Use The National Museum of Singapore/);
  await close();
  await use('specimen-vault-door');
  await waitMap('nexus.specimen-vault');
  await use('street-music-door');
  await waitMap(musicRoom);
  await use('almanac-rix');
  await press('Tap the drum from behind the closed door.');
  await close();
  await use('almanac-bland');
  await press('Clip the old copy beside the broken edge.');
  await close();
  await use('street-score-desk');
  assert.equal(await button('Send this invitation').isDisabled(), true);
  for (const label of ['The break in the face', 'The undated leaf', 'The return journey']) await press(label);
  for (const [i, value] of [
    [1, '1'],
    [2, '2'],
    [6, '3'],
  ])
    await modal.getByLabel('Beat ' + i, { exact: true }).selectOption(value);
  await press('Stand with Rix on the stair');
  await press('Stand with Jori at the window');
  await press('Play the six beats');
  await modal.getByText(/Beat 1 · wooden drum/).waitFor();
  await press('Stop playback');
  await press('Send this invitation');
  await modal.getByText(/invitation slides under/).waitFor();
  await modal.getByLabel('Beat 1', { exact: true }).selectOption('0');
  await leave();
  await use('almanac-bland');
  await press('Trace the surviving boundary onto the invitation.');
  await close();
  await jump(copies, 12, 12);
  await use('almanac-bland');
  await press('Unfold the invitation with outline beside an early copy.');
  await close();
  await use('street-parade-window');
  assert.equal(await button('Open Jori’s blind first').isDisabled(), true);
  await press('Stand with Rix on the stair');
  await press('Stand with Jori at the window');
  await modal.getByText('Jori at the window receives a cue on 2, 6.', { exact: true }).first().waitFor();
  await press('Open Jori’s blind first');
  await press('Start with the street procession');
  await leave();
  await page.reload({ waitUntil: 'domcontentloaded' });
  const cont = page.getByRole('button', { name: /^Continue\b/ }).first();
  await cont.focus();
  await cont.press('Enter');
  await waitMap(copies);
  await press('Continue playing');
  await modal.waitFor({ state: 'hidden' });
  await use('street-parade-window');
  await modal.getByText(/Last performance · A child at the curb/).waitFor();
  const facts = await page.evaluate(() => {
    const s = kg.controller.state;
    return ['sentBar', 'playedBar', 'bar', 'sentBlock', 'block', 'show'].map((k) => s.flags['almanac.stone.' + k]);
  });
  assert.deepEqual(facts, ['120003', '120003', '020003', 1, 0, 'procession']);
  await leave();
  console.log(
    'STREET-ALMANAC',
    engine,
    'earned the Stone, chose two copyist blocks, issued a six-beat score, played both entrances and recovered distinct editions.',
  );
}
