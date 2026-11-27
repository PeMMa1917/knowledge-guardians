import assert from 'node:assert/strict';

export async function playFieldInvitation({ page, engine, close, waitMap }) {
  const offer = page.getByRole('button', { name: 'Invitation', exact: true }),
    dialog = page.getByRole('dialog');
  const due = async (mode) =>
    page.evaluate((mode) => {
      kg.settings.calmMode = mode === 'calm';
      kg.settings.zenMode = mode === 'zen';
      kg.settings.reducedMotion = true;
      localStorage.setItem('kg.settings', JSON.stringify(kg.settings));
      // Advance the exploration clock to the next visit. Keep its normal eligibility rules and seeded selection.
      const c = kg.controller;
      for (let i = 0; i < 24 && !c.state.events.pending; i++)
        c.dispatch({ type: 'Explore', seconds: 60 });
      return c.state.events.pending;
    }, mode);
  const state = () =>
    page.evaluate(() => ({
      pending: kg.controller.state.events.pending,
      seen: kg.controller.state.events.seen,
    }));
  const first = await due('zen');
  assert.ok(first);
  await offer.waitFor();
  assert.equal(await dialog.count(), 0);
  await offer.focus();
  await page.evaluate(() =>
    kg.controller.dispatch({ type: 'Explore', seconds: 10 }),
  );
  assert.equal(
    await offer.evaluate((el) => el === document.activeElement),
    true,
  );
  await offer.press('Enter');
  await dialog.getByRole('button', { name: 'Later', exact: true }).click();
  assert.deepEqual(await state(), { pending: null, seen: [] });
  const second = await due('calm');
  await offer.waitFor();
  assert.ok(second);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const resume = page.getByRole('button', { name: /^Continue\b/ }).first();
  await resume.focus();
  await resume.press('Enter');
  await waitMap('nexus.archive');
  const continuePlaying = dialog.getByRole('button', {
    name: 'Continue playing',
    exact: true,
  });
  await continuePlaying.focus();
  await continuePlaying.press('Enter');
  await offer.waitFor();
  assert.equal(await dialog.count(), 0);
  assert.equal((await state()).pending, second);
  await offer.focus();
  await offer.press('Enter');
  await dialog.getByRole('button', { name: 'Now', exact: true }).click();
  assert.ok((await dialog.locator('p').count()) > 0);
  await close();
  assert.equal((await state()).pending, null);
  const third = await due('zen');
  const next = await page.evaluate((id) => {
    const ev = kg.controller.pack.events.find((row) => row.id === id);
    const room = [
      'market.square',
      'council.gallery',
      'stage.foyer',
      'water.gatehouse',
    ].find((map) => !ev.maps.includes(map));
    kg.world.changeMap(room, 12, 12);
    return room;
  }, third);
  await waitMap(next);
  assert.equal((await state()).pending, null);
  assert.equal((await state()).seen.includes(third), false);
  console.log(
    'FIELD-INVITATION',
    engine,
    'focus, deferral, reload, voluntary encounter and departure',
    first,
    second,
    third,
  );
}
