import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';

export async function playFirstCup({ page, engine, use, waitMap, close }) {
  const dialog = page.getByRole('dialog'),
    panel = dialog.locator('.first-cup');
  const choose = async (name) => {
    const b = dialog.getByRole('button', { name, exact: true });
    await b.focus();
    await b.press('Enter');
  };
  const first = engine === 'webkit' ? 'steps' : 'weir',
    second = first === 'weir' ? 'steps' : 'weir';
  const street = { weir: 'water.gatehouse', steps: 'civic.steps' },
    stops = { weir: 'the Old Weir', steps: 'the North Steps' };
  const home = 'market.first-cup';
  await page.evaluate(() => kg.world.changeMap('market.square', 13, 17));
  await waitMap('market.square');
  if (await dialog.isVisible()) await close();
  await use('first-cup-stairs');
  await waitMap(home);
  await use('lantern-q233950');
  await choose('Turn the offers face down and draw seats.');
  await dialog.getByText(/puts his own second ticket back/).waitFor();
  await close();
  await use('cup-tversky');
  await choose('Keep the whole bundle tied by crew.');
  await close();
  await use('first-cup-jug');
  for (const n of [
    'Pour a warm scoop',
    'Pour a cool scoop',
    'Pour a cool scoop',
    'Pour a cool scoop',
    'Empty the last well',
    'Pour a warm scoop',
  ])
    await choose(n);
  await panel.getByText('4 of 4 scoops · estimated blend 36 °C.', { exact: true }).waitFor();
  await choose('Slip on the felt sleeve');
  await choose('Lift the rain flap');
  for (const name of ['Ticket marked 8', 'Empty ticket', 'Ticket marked 2']) await choose(name);
  await panel.getByText('Offered · 4 / 6 / 8', { exact: true }).waitFor();
  await panel.getByLabel('Crew whose saucers to open').selectOption('steps');
  for (const name of ['Ticket marked 2', 'Empty ticket', 'Ticket marked 8']) await choose(name);
  await panel.getByText('Offered · 1 / 4 / 4', { exact: true }).waitFor();
  const foot = panel
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: 'Turn over the runner’s tray' }) });
  await foot.locator('summary').focus();
  await foot.locator('summary').press('Enter');
  await choose('Trace the cup rings');
  await choose('Trace every invitation');
  await panel.getByText(/15 invitation marks. 6 have no cup ring/).waitFor();
  for (const [i, stop] of [first, second].entries()) {
    if (i === 1) {
      await use('first-cup-jug');
      await choose('Keep the copper bare');
    }
    await choose('Roll to ' + stops[stop]);
    await close();
    await use('first-cup-road-' + stop);
    await waitMap(street[stop]);
    if (await dialog.isVisible()) await close();
    await use('cup-tversky');
    await choose('Get the mill’s permission slips out of his damp coat.');
    await close();
    await use('lantern-q233950');
    await choose(i ? 'Leave him beside the sign and lend him a cup.' : 'Move his chair behind the cart.');
    await close();
    await use('first-cup-cart-' + stop);
    await choose('Unfold the shop reading');
    await choose('Read the street dial');
    const gauge = panel.locator('details').filter({ hasText: 'Set both thermometers in the shade' });
    if (i === 0) {
      await gauge.locator('summary').focus();
      await gauge.locator('summary').press('Enter');
      await choose('Slide the ring back two degrees');
      await choose('Read the street dial');
    }
    await choose('Chalk a starting price');
    await choose('Set out folded offers');
    await choose('Unfold the ticket marked 8');
    await choose('Unfold the ticket marked 2');
    await choose('Hang the corrected dial outside');
    await choose('Hang the two mill offers outside');
    assert.equal(await page.evaluate((stop) => kg.controller.state.flags['cup.facing.' + stop], stop), 'offers');
    await close();
    await use('first-cup-fold-' + stop);
    await dialog
      .getByText(/drawing of a wheel/)
      .first()
      .waitFor();
    await close();
    if (i === 0) {
      await use('first-cup-cart-' + stop);
      await choose('Bring the wheels home');
      await close();
      await use('first-cup-return-' + stop);
      await waitMap(home);
    }
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  const resume = page.getByRole('button', { name: /^Continue\b/ }).first();
  await resume.focus();
  await resume.press('Enter');
  await waitMap(street[second]);
  await choose('Continue playing');
  await page.keyboard.press('j');
  await dialog.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [out] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const file = unzipSync(new Uint8Array(await readFile(await out.path()))),
    doc = strFromU8(file['word/document.xml']),
    rels = strFromU8(file['word/_rels/document.xml.rels']);
  assert.match(doc, /The hand behind a folded offer/);
  assert.match(doc, /Two meanings of a slant/);
  assert.match(rels, /Amos_Tversky/);
  assert.match(rels, /Daniel_Kahneman/);
  console.log(
    'FIRST-CUP',
    engine,
    'two returns, both menus, two temperature readings, both voices and exported notes',
  );
}
