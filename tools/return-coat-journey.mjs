import assert from 'node:assert/strict';
export async function playReturnCoat({ page, engine, use, waitMap, close }) {
  const panel = page.getByRole('dialog');
  const click = async (name) => {
    const b = panel.getByRole('button', { name, exact: false }).first();
    await b.focus();
    await b.press('Enter');
  };
  const end = async () => {
    await click('Close');
    await panel.waitFor({ state: 'hidden' });
  };
  const move = async (map, x, y) => {
    await page.evaluate(
      ([map, x, y]) => kg.world.changeMap(map, x, y),
      [map, x, y],
    );
    await waitMap(map);
  };
  await move('nexus.archive', 11, 14);
  await use('return-coat-hook-first');
  await click('Continue');
  await click('Let the wet cuff');
  await end();
  await use('return-coat-hook-work');
  await click('Take the short walk');
  await end();
  // The accessible no-collectible path must be playable before any inventory fixture.
  await use('return-coat-hook-work');
  await click('Decide how');
  await click('Leave the dry peg');
  await click('Continue');
  await end();
  await use('return-coat-hook-pass');
  await waitMap('nexus.coat-lining');
  await use('coat-inside-cuff');
  await click('Pull the loop');
  await end();
  await use('indoor-rain-rig');
  const cue = async (v) => {
    const b = panel.locator('[data-rain="' + v + '"]');
    await b.focus();
    await b.press('Enter');
  };
  for (const v of ['c', 's', 't', 's', 'stalls', 'keep', 'wings', 'wonder'])
    await cue(v);
  assert((await panel.innerText()).includes('named bow'));
  await close();
  await use('coat-inside-back');
  await waitMap('nexus.archive');
  await page.evaluate(() => {
    kg.controller.state.flags['puzzle.timeline-door.done'] = true;
    kg.controller.dispatch({
      type: 'ReadClue',
      clue: 'returned-coat.hook.clue',
    });
    kg.world.refreshWorld();
  });
  await use('return-coat-hook-lining');
  await click('Slide the brass plate');
  assert((await panel.innerText()).includes('soft loop'));
  await close();
  await move('stage.foyer', 13, 14);
  await use('indoor-rain-rig');
  await cue('receive');
  for (const v of [
    'stalls',
    'keep',
    'clear',
    's',
    's',
    'p',
    's',
    'stalls',
    'wings',
  ])
    await cue(v);
  assert((await panel.innerText()).includes('very same sound'));
  await cue('hands');
  await close();
  await move('council.hall', 12, 11);
  await use('return-coat-council-first');
  await click('Continue');
  await click('measurement of the inside latch');
  assert((await panel.innerText()).includes('sitting down'));
  await end();
  for (const [old, choice] of [
    ['hook', 'Put a named guarantor'],
    ['book', 'Give the wardrobe'],
  ]) {
    await use('return-coat-council-' + old);
    await click('Decide how');
    await click(choice);
    await click('Continue');
    await end();
  }
  await use('return-coat-council-stage');
  await click('Hear the two');
  await click('Work the rain');
  await click('Continue');
  await end();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: /^Continue\b/ })
    .first()
    .click();
  await waitMap('council.hall');
  await page
    .getByRole('button', { name: /Continue playing/ })
    .first()
    .click();
  assert(
    await page.evaluate(
      () =>
        kg.controller.state.flags['returned-coat.council.worked.stage'] ===
          true &&
        kg.controller.state.flags['returned-coat.reply.door-key'] === true &&
        kg.controller.state.flags['returned-coat.rain.stage.bill'] ===
          'hands' &&
        kg.controller.state.flags['returned-coat.rain.lining.invitation'] ===
          'csts',
    ),
  );
  console.log(
    'RETURN COAT',
    engine,
    'all three settlements, a physical hidden passage and return, the key-plate conversation across two worlds and a continued save.',
  );
}
