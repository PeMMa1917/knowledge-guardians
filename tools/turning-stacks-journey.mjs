import assert from 'node:assert/strict';
import { checkSelectPaint } from './select-paint-check.mjs';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';

export async function playTurningStacks({ page, engine, use, waitMap, close }) {
  const modal = page.getByRole('dialog');
  const panel = modal.locator('.turning-stacks');
  const press = async (role) => {
    await role.focus();
    await role.press('Enter');
  };
  const control = (id) => panel.locator('[data-stack-control="' + id + '"]');
  const act = (id) => press(control(id));
  const pick = (label) => press(modal.getByRole('button', { name: label, exact: true }));
  await page.evaluate(() => kg.world.changeMap('civic.canal', 4, 10));
  await waitMap('civic.canal');
  if (await modal.isVisible()) await close();
  await use('stacks-canal-door');
  await waitMap('civic.turning-stacks');
  await use('stacks-opal');
  await pick('Pick up the loose hinge.');
  await modal
    .getByText(/groove worn deep enough/)
    .first()
    .waitFor();
  await close();
  await use('stacks-tallis');
  await pick('Offer to carry the lamp.');
  await close();
  await use('stacks-floor');
  const firstShelf = panel.getByLabel('Leaf for the window shelf');
  await firstShelf.selectOption('eastern');
  console.log('SELECT-PAINT', engine, await checkSelectPaint(page, firstShelf));
  await panel.getByLabel('Leaf for the stair shelf').selectOption('absentee');
  const wheel = engine !== 'webkit';
  await panel.getByLabel('Opening in the middle screen').selectOption(wheel ? 'stair' : 'window');
  await act(wheel ? 'wheel' : 'lamp');
  const floor = control('floor');
  await floor.focus();
  await floor.press(wheel ? 'ArrowLeft' : 'ArrowRight');
  await panel
    .getByRole('status')
    .getByText(/screen is solid/)
    .waitFor();
  await floor.press('ArrowUp');
  assert.equal(
    await floor.locator('[data-here]').getAttribute('aria-label'),
    (wheel ? 'A2' : 'E2') + ' · aisle · visitor here',
  );
  if (process.env.KG_STACKS_IMAGE) {
    await floor.scrollIntoViewIfNeeded();
    await page.screenshot({ path: process.env.KG_STACKS_IMAGE });
  }
  const order = wheel ? ['window', 'stair'] : ['stair', 'window'];
  for (const side of order) {
    await act('guide-' + side);
    await act('read');
    if (side === 'window') {
      for (const [basis, percent] of [
        ['valid', '70.6'],
        ['returned', '68.0'],
        ['eligible', '42.6'],
      ]) {
        await act(basis);
        if (basis === 'valid') {
          await act('for');
          await panel
            .locator('.stack-receipt')
            .getByText(/show of support/)
            .waitFor();
          await act('against');
          await panel
            .locator('.stack-receipt')
            .getByText(/disagreement catches/)
            .waitFor();
        }
        await panel
          .getByText(new RegExp(percent.replace('.', '\\.') + '%'))
          .first()
          .waitFor();
      }
    }
  }
  await act('bind');
  const sent = await page.evaluate(() => kg.controller.state.flags['stacks.edition']);
  await panel.getByLabel('Leaf for the window shelf').selectOption('fort');
  assert.equal(await page.evaluate(() => kg.controller.state.flags['stacks.edition']), sent);
  await close();
  await use('stacks-rope');
  await waitMap('voices.quay');
  if (await modal.isVisible()) await close();
  await use('stacks-quay-book');
  for (const edge of ['street', 'inside']) {
    await act(edge);
    await act('glass-voices');
    await panel
      .locator('.stack-receipt')
      .getByText(/its own emblem/)
      .waitFor();
    await act('glass-years');
    await panel
      .locator('.stack-receipt')
      .getByText(/particular Eastern Shawnee amendment/)
      .waitFor();
    await act(edge === 'street' ? 'maker' : 'carrier');
    await close();
    await use(edge === 'street' ? 'stacks-boat-heading' : 'stacks-bench-heading');
    await modal
      .getByText(edge === 'street' ? /publisher’s name/ : /small print/)
      .first()
      .waitFor();
    await close();
    if (edge === 'street') await use('stacks-quay-book');
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await waitMap('voices.quay');
  await pick('Continue playing');
  await use('stacks-quay-book');
  await panel.getByText(/I took the hinge pin out myself/).waitFor();
  await panel.getByText(/I kept holding the plate/).waitFor();
  await close();
  async function exportDiary() {
    await page.keyboard.press('j');
    await modal.getByRole('tab', { name: 'Diary', exact: true }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      modal.getByRole('button', { name: 'Download journal (.docx)' }).click(),
    ]);
    const doc = unzipSync(new Uint8Array(await readFile(await download.path())));
    const body = strFromU8(doc['word/document.xml']),
      links = strFromU8(doc['word/_rels/document.xml.rels']);
    await close();
    return { body, links };
  }
  const before = await exportDiary();
  assert.match(before.body, /Two bylines lit together/);
  assert.match(before.body, /68\.0%/);
  assert.doesNotMatch(before.links, /estoo-nsn.gov\/media\/2551/);

  // Seed only the previous chapter endings. Every referral, folio, credit and object below is earned at its site.
  await page.evaluate(() => {
    const c = kg.controller;
    for (const id of ['civic.finish', 'water.finish'])
      if (!c.state.objectivesDone.includes(id)) c.state.objectivesDone.push(id);
    kg.world.changeMap('nexus.archive', 31, 12);
  });
  await waitMap('nexus.archive');
  async function enter(id, map) {
    await use(id);
    await waitMap(map);
    if (await modal.isVisible()) await close();
  }
  async function inspect(id) {
    await use(id);
    const text = modal.getByRole('button', { name: 'Read the text', exact: true });
    if (await text.isVisible()) await press(text);
    await close();
  }
  async function scene(id, start) {
    await use(id);
    await press(modal.getByRole('button', { name: start }).first());
    if (await modal.isVisible()) await close();
  }
  async function equip(pattern) {
    await page
      .getByRole('button', { name: /^Bag\b/ })
      .first()
      .click();
    await press(modal.getByRole('button', { name: pattern }).first());
    await close();
  }
  await enter('voices-door', 'voices.listening');
  await inspect('voices-edge-account-case');
  await enter('voices-walk-path', 'voices.walk');
  await inspect('voices-edge-treaty-case');
  await equip(/^Use Record-Edge Folio/i);
  await scene('voices-edge-treaty-stand', /Slide from the land line/);
  await enter('voices-walk-return', 'voices.listening');
  await scene('voices-edge-account-stand', /Set the marker’s date/);
  await scene('voices-edge-mount', /Open at Article 5/);
  await enter('voices-nexus-return', 'nexus.archive');
  await enter('civic-door', 'civic.dispatch');
  await inspect('civic-edge-wea-case');
  await scene('civic-edge-wea-stand', /Line up 30 September/);
  await enter('civic-steps-path', 'civic.steps');
  await inspect('civic-edge-eastern-case');
  await scene('civic-edge-eastern-stand', /Expose the full name/);
  await enter('civic-steps-return', 'civic.dispatch');
  await scene('civic-edge-place', /Hold the two dated/);
  await enter('civic-steps-path', 'civic.steps');
  await use('civic-edge-dates');
  await close();
  await use('civic-edge-eastern-case');
  await pick('Take this object');
  await close();
  await equip(/^Use .*Constitution of the Eastern Shawnee/i);
  await enter('civic-steps-return', 'civic.dispatch');
  await enter('civic-canal-path', 'civic.canal');
  await enter('stacks-canal-door', 'civic.turning-stacks');
  await use('stacks-signature');
  await pick('Light the three signature lines');
  await modal
    .getByRole('status')
    .getByText(/Lena Mae Elliott/)
    .waitFor();
  await pick('Light the date at the foot');
  await close();
  const earned = await exportDiary();
  assert.match(earned.links, /estoo-nsn.gov\/media\/2551/);
  assert.match(earned.links, /wikipedia.org\/wiki\/Eastern_Shawnee_Tribe_of_Oklahoma/);
  assert.match(earned.body, /Certificate of Results of Election/);
  assert.match(earned.body, /Lena Mae Elliott/);
  assert.doesNotMatch(earned.links, /peoriatribe.com\/204\/History/);
  console.log(
    'TURNING-STACKS',
    engine,
    sent,
    'both audiences, signed folio commission, equipped certificate and scoped exports before and after earning',
  );
}
