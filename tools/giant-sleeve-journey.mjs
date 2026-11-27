import assert from 'node:assert/strict';

export async function playGiantSleeve({ page, engine, use, waitMap, close }) {
  const dialog = page.getByRole('dialog'),
    loft = 'stage.giants-elbow';
  const btn = (label) => dialog.getByRole('button', { name: label, exact: true });
  async function choose(label) {
    const b = btn(label);
    await b.focus();
    await b.press('Enter');
  }
  async function jump(map, x, y) {
    await page.evaluate(([m, x, y]) => kg.world.changeMap(m, x, y), [map, x, y]);
    await waitMap(map);
  }
  const state = () => page.evaluate(() => ({ ...kg.controller.state.flags }));
  async function restore(map) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    const b = page.getByRole('button', { name: /^Continue\b/ }).first();
    await b.focus();
    await b.press('Enter');
    await waitMap(map);
    await choose('Continue playing');
    await dialog.waitFor({ state: 'hidden' });
  }
  await jump('stage.foyer', 10, 7);
  await use('elbow-stairs');
  await waitMap(loft);
  await use('elbow-pip');
  await choose('Answer the knock.');
  await close();
  await use('elbow-vee');
  await choose('Let her hold the curtain while you take the spoon.');
  await close();
  await use('model-record-maker-stoppages');
  await choose('Watch what the curve does to the shadow.');
  await close();
  await use('elbow-patterns');
  await choose('Hang this pattern over Lantern Square');
  await dialog
    .locator('.work-feedback')
    .filter({ hasText: /winter and summer/ })
    .waitFor();
  await choose('Pip’s brass joint');
  await choose('Vee’s brass joint');
  await choose('Lower the sleeves');
  await choose('Unroll the summer cast');
  await choose('Lower the sleeves');
  assert.match(await dialog.getByRole('img').getAttribute('aria-label'), /Pip, Vee/);
  await choose('Hang this pattern over Lantern Square');
  await close();
  await use('elbow-stairs-back');
  await waitMap('stage.foyer');
  await jump('market.square', 19, 10);
  await use('elbow-lottery');
  await choose('Open the old hinge packet');
  await dialog
    .locator('.work-feedback')
    .filter({ hasText: /sealed/ })
    .waitFor();
  await choose('Peg a rise in lift');
  await choose('Open the old hinge packet');
  await dialog.getByLabel('Unclip a strip').selectOption('C');
  await dialog.getByLabel('Give its clip to').selectOption('D');
  await choose('Exchange the two clips');
  await choose('Restore the observed DEF draw');
  await restore('market.square');
  await use('elbow-lottery');
  await choose('Open the fine hinge packet');
  await choose('Rotate the stamp one notch');
  await choose('Exchange the two clips');
  await choose('Restore the observed DEF draw');
  await choose('Send both hinge readings to rehearsal');
  assert.equal((await state())['elbow.printed'], 'rise');
  await close();
  await jump('stage.rehearsal', 23, 10);
  await use('elbow-curtain');
  await choose('Show the printed words');
  await choose('Show the repair knots');
  await choose('Fit the fine hinge to the hand');
  await choose('Give Vee the first entrance');
  await close();
  await jump(loft, 8, 9);
  await use('elbow-pip');
  await choose('Ask what happened when Vee opened.');
  await close();
  await jump('market.square', 19, 10);
  await use('elbow-lottery');
  await choose('Peg a change either way');
  for (const name of ['Open the old hinge packet', 'Open the fine hinge packet']) {
    await choose(name);
    await choose('Restore the observed DEF draw');
    await choose('Rotate the stamp one notch');
    await choose('Rotate the stamp one notch');
  }
  await choose('Send both hinge readings to rehearsal');
  assert.equal((await state())['elbow.promise'], 'rise');
  await close();
  await jump('stage.rehearsal', 23, 10);
  await use('elbow-curtain');
  await choose('Show the repair knots');
  await choose('Show the printed words');
  await choose('Fit the old hinge to the hand');
  await choose('Let Pip give the first cue');
  await close();
  await restore('stage.rehearsal');
  const final = await state();
  assert.equal(final['elbow.performedFace'], 'writing');
  assert.equal(final['elbow.performedTail'], 'either');
  assert.equal(final['elbow.performedPattern'], 9);
  const notes = await page.evaluate(() =>
    kg.controller.state.adventureDiary.entries
      .filter((e) => e.event?.key.startsWith('giant-elbow:'))
      .map((e) => e.event.key),
  );
  for (const cue of ['first.seam.9.chalk-dust', 'last.writing.9.chalk'])
    assert.ok(notes.includes('giant-elbow:cue.' + cue));
  console.log(
    'GIANT-SLEEVE',
    engine,
    notes.length,
    'recorded experiments and decisions',
    final['elbow.promise'],
    final['elbow.performedTail'],
  );
}
