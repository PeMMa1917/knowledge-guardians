import assert from 'node:assert/strict';

export async function playMillShift({ page, engine, use, close, waitMap }) {
  const ctl = (key) => page.locator('[data-mill="' + key + '"]');
  const enter = async (site) => {
    await page.evaluate((site) => kg.world.changeMap('night-register.' + site, 9, 24), site);
    await waitMap('night-register.' + site);
    await use('mill-shift.' + site);
    await page.locator('.mill-work').waitFor();
    if (await ctl('arrive').count()) await ctl('arrive').click();
  };
  const dialog = page.getByRole('dialog');
  const press = async (key) => {
    const b = ctl(key);
    await b.focus();
    await page.keyboard.press('Space');
  };
  await enter('press');
  await ctl('bind-tooth').click();
  await ctl('frame1').click();
  await ctl('docket').click();
  assert.equal(await ctl('send0').count(), 0);
  await close();
  await enter('nile');
  await ctl('book1').click();
  assert.equal(await ctl('coin10').isDisabled(), true);
  await ctl('book0').click();
  await press('coin12');
  assert.equal(await ctl('coin12').evaluate((b) => b === document.activeElement), true);
  await press('settle');
  await dialog.getByText(/Sent to Bayette.*Tessel Fen 2/).waitFor();
  await close();
  await enter('yard');
  await ctl('turn').click();
  await ctl('undo').click();
  for (const k of ['feed', 'turn', 'turn', 'turn']) await ctl(k).click();
  for (const [gear, porter] of [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ]) {
    await ctl('gear' + gear).click();
    await ctl('porter' + porter).click();
    await ctl('stamp').click();
  }
  await dialog.getByText(/Hesper sets two fingers/).waitFor();
  const overflow = await dialog.evaluate((el) => el.scrollWidth - el.clientWidth);
  assert.ok(overflow <= 2, 'mill overflows horizontally by ' + overflow + 'px');
  if (process.env.KG_MILL_SHOT) await dialog.screenshot({ path: process.env.KG_MILL_SHOT });
  await close();
  await enter('press');
  await ctl('bind-rota').click();
  await press('estimate');
  await dialog.getByText(/wheel predicts 6.*rota predicts 3.*made 3/).waitFor();
  await ctl('frame0').click();
  await ctl('rehearsal').click();
  await press('send0');
  await close();
  await enter('yard');
  await press('reply');
  await close();
  await enter('press');
  await close();
  await use('mill-shift.workers-stair');
  await waitMap('night-register.yard');
  await enter('press');
  await ctl('frame2').click();
  await ctl('tomorrow').click();
  await ctl('send1').click();
  await close();
  await enter('nile');
  await press('reply');
  await close();
  await enter('press');
  await close();
  await use('mill-shift.letter-chute');
  await waitMap('night-register.nile');
  const result = await page.evaluate(() => ({
    proof: kg.controller.state.flags['mill-shift.nile.opened-leaf'],
    count: kg.controller.state.objectivesDone.filter((id) => id.startsWith('mill-shift.')).length,
  }));
  assert.equal(result.count, 10);
  assert.match(result.proof, /comes up tomorrow.*Tessel Fen 2.*3 notches/);
  console.log(
    engine,
    'settled six counters, tried the mill under four conditions, published two editions and took both earned passages.',
  );
}
