import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { strFromU8, unzipSync } from 'fflate';

export async function playTideClock({ page, engine, use, waitMap, close }, fromFerry = false) {
  const dialog = page.getByRole('dialog');
  const clock = dialog.locator('.quarter-clock');
  const press = async (control) => {
    await control.waitFor({ state: 'visible' });
    await control.focus();
    await control.press('Enter');
  };
  const work = (id) => press(clock.locator('[data-quarter="' + id + '"]'));
  const tab = (id) => press(clock.locator('[data-quarter-tab="' + id + '"]'));
  const feedback = (pattern) => clock.getByRole('status').filter({ hasText: pattern }).waitFor();
  const option = (name) => press(dialog.getByRole('button', { name, exact: true }));
  const flag = (key) => page.evaluate((k) => kg.controller.state.flags['tideclock.' + k], key);
  if (await dialog.isVisible()) await close();
  if (!fromFerry) {
    await page.evaluate(() => {
      const s = kg.controller.state;
      if (!s.objectivesDone.includes('island.arrival')) s.objectivesDone.push('island.arrival');
      s.flags['wire.everReceived'] = true;
      kg.world.changeMap('island.dock', 23, 9);
    });
  }
  await waitMap('island.dock');
  await use('quarter-door');
  await waitMap('island.quarter-house');
  await use('quarter-matel');
  await option('Hold the lantern while she turns the foot.');
  await dialog
    .getByText(/last stitch/)
    .first()
    .waitFor();
  await close();
  await use('ink-q7259');
  await option('Ask what else a strip of instructions might carry.');
  await dialog
    .getByText(/taps the same rhythm/)
    .first()
    .waitFor();
  await close();
  await use('quarter-clock');
  await work('stamp');
  await feedback(/tube/);
  await work('wait');
  await work('wait');
  await work('go-slip');
  await work('listen');
  await work('stamp');
  assert.equal(await flag('stamp.slip.2'), true);
  for (let i = 0; i < 3; i++) await work('wait');
  await work('go-rail');
  await work('listen');
  await work('stamp');
  await work('wait');
  await tab('card');
  await clock
    .getByText(/Both pilots can stop/)
    .first()
    .waitFor();
  await tab('moth');
  await work('early-stamp');
  await work('early-stamp');
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-foot')), 'stamp');
  await work('step');
  await feedback(/empty pad/);
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await waitMap('island.quarter-house');
  await option('Continue playing');
  await use('quarter-clock');
  await tab('moth');
  assert.equal(await flag('cursor'), 1);
  assert.equal(await flag('order'), 'stamp|walk|listen');
  if (engine === 'webkit') await work('reverse');
  await work('round');
  await feedback(/different place-and-time prints/);
  await close();
  await use('quarter-hidden-step');
  await waitMap('sea.listening-wheel');
  await use('quarter-sea-step');
  await waitMap('island.quarter-house');
  await use('quarter-clock');
  await tab('plan');
  await work('proposal-crew');
  await work('try-crew');
  await work('try-pilots');
  await work('trace-blue');
  await work('trace-rust');
  await work('promise-mark');
  await feedback(/same floor/);
  await work('proposal-pilots');
  await work('try-crew');
  await work('try-pilots');
  await work('trace-rust');
  for (const promise of ['rest', 'mark', 'shelter']) await work('promise-' + promise);
  await feedback(/Ivo asks/);
  await work(engine === 'firefox' ? 'proposal-pilots' : 'proposal-crew');
  if (engine === 'webkit') await work('set-horn-awning');
  await work(engine === 'firefox' ? 'set-bench-slip' : 'set-bench-rail');
  await work('try-crew');
  await work('issue');
  await feedback(/both shifts/);
  await work('try-pilots');
  await work('issue');
  await feedback(/waiting on the dock/);
  const layout = await flag('issued');
  await close();
  await use('quarter-back');
  await waitMap('island.dock');
  await use('quarter-dock-plan');
  await work('read-crew');
  const early = await clock.locator('[data-work-feedback]').innerText();
  await work('read-pilots');
  const late = await clock.locator('[data-work-feedback]').innerText();
  assert.notEqual(early, late);
  assert.equal(await flag('readPlan.crew'), layout);
  assert.equal(await flag('readPlan.pilots'), layout);
  await close();
  await use('ink-q7259');
  await option('Give the envelope to the deck crew.');
  await dialog
    .getByText(/initials the fold/)
    .first()
    .waitFor();
  await close();
  await page.keyboard.press('j');
  await dialog.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const manifest = unzipSync(new Uint8Array(await readFile(await download.path())));
  const doc = strFromU8(manifest['word/document.xml']),
    links = strFromU8(manifest['word/_rels/document.xml.rels']);
  assert.match(doc, /The floor plan reaches the island/);
  assert.match(doc, /The moth takes a whole watch/);
  assert.match(doc, /Two leaves under the same light/);
  assert.match(links, /computerhistory.org/);
  assert.match(links, /fourmilab.ch/);
  console.log(
    'QUARTER HOUSE',
    engine,
    layout,
    early,
    late,
    'Both visits, reordered moth, reload, hidden stair, signed pier and historical reading export passed.',
  );
}
