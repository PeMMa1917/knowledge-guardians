import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
export async function playLensLoan({ page, engine, use, waitMap, close }) {
  const modal = page.getByRole('dialog'),
    panel = modal.locator('.optics-panel');
  const press = async (b) => {
    await b.focus();
    await b.press('Enter');
  };
  const choose = async (label) => press(modal.getByRole('button', { name: label, exact: true }));
  const ctrl = (id) => panel.locator('[data-optic-key="' + id + '"]');
  const act = (id) => press(ctrl(id));
  const expand = async (key) => {
    const d = panel.locator('details[data-fold="' + key + '"]').first();
    if (!(await d.evaluate((el) => el.open))) await press(d.locator(':scope > summary'));
  };
  const state = (key) => page.evaluate((k) => kg.controller.state.flags['optics.' + k], key);
  // Stage the ordinary earlier chapter arrivals. All fittings, tracings, records and reactions are obtained in play.
  await page.evaluate(() => {
    const c = kg.controller;
    c.state.flags['coast.arrived'] = true;
    if (!c.state.objectivesDone.includes('stage.arrival')) c.state.objectivesDone.push('stage.arrival');
    kg.world.changeMap('observatory.survey-depot', 21, 23);
  });
  await waitMap('observatory.survey-depot');
  if (await modal.isVisible()) await close();
  for (const id of ['depot-case-micro', 'depot-case-micro-case']) {
    await use(id);
    await modal.waitFor();
    await close();
  }
  await use('optics-up');
  await waitMap('observatory.loan-loft');
  await use('optics-nim');
  await choose('Take the weight of the hem.');
  await modal
    .getByText(/I do. Terribly/)
    .first()
    .waitFor();
  await close();
  await use('ink-q150526');
  await choose('Ask for the pencil instead.');
  await modal
    .getByText(/long before/)
    .first()
    .waitFor();
  await close();
  await use('lantern-q39599');
  await choose('Take a chalk board to a seat.');
  await modal
    .getByText(/narrower opening/)
    .first()
    .waitFor();
  await close();
  await use('optics-sled');
  await expand('clips');
  await act('clips');
  await panel
    .getByText(/Swift body 16616/)
    .first()
    .waitFor();
  await act('stage');
  await act('sleeve');
  await expand('stamps');
  await act('stamp-knot');
  await act('borrow');
  await act('amber');
  await act('blue');
  await act('blend');
  await panel
    .locator('.optics-feedback')
    .filter({ hasText: /two tracings/i })
    .waitFor();
  assert.equal(
    await panel
      .getByRole('status')
      .filter({ hasText: /two tracings/i })
      .count(),
    1,
    'A blocked move should be announced once.',
  );
  await act('turn');
  await act('blue');
  await act('blend');
  await act('amber');
  await act('cover');
  await act('blue');
  await act('blend');
  await act('isolate');
  assert.equal(await state('joined.holder'), true);
  await act('slide-fresh');
  await act('amber');
  await act('slide-petal');
  await act('blue');
  await act('blend');
  assert.equal(await state('compared.preparation'), true);
  await act('travel');
  const edition = await state('dispatch');
  await act('slide-marks');
  await act('amber');
  assert.equal(await state('dispatch'), edition);
  await close();
  await use('ink-q150526');
  await choose('Lay your matched fresh and pressed tracings under his page.');
  await modal
    .getByText(/little bracket/)
    .first()
    .waitFor();
  await close();
  await use('optics-wing-door');
  await waitMap('stage.rehearsal');
  await use('optics-rail');
  const entry = engine === 'webkit' ? 'window' : engine === 'firefox' ? 'space' : 'join';
  await act(entry);
  await act('side');
  await act('porter');
  await act('understudy');
  await act('project');
  await expand('projection');
  await panel
    .getByText(/single changes at the bench|sleeve still for one turn/i)
    .first()
    .waitFor();
  await expand('waves');
  const seat = engine === 'webkit' ? 'step' : 'wing';
  await act('seat-' + seat);
  for (const stop of ['broad', 'slit']) {
    await act('stop-' + stop);
    await act('drawing-rays');
    await act('drawing-fronts');
    await act('rehearse');
    await act('rehearse');
  }
  await act('cue');
  await act('test');
  assert.equal(await state('purpose'), 'test');
  await act('return');
  await close();
  await use('lantern-q39599');
  await choose('Leave him a second set of rehearsal slips.');
  await modal
    .getByText(/none the wiser/)
    .first()
    .waitFor();
  await close();
  await use('optics-second-seat');
  await modal
    .getByText(/two hooks for tomorrow/)
    .first()
    .waitFor();
  await close();
  await use('optics-back');
  await waitMap('observatory.loan-loft');
  await use('optics-sled');
  await expand('stamps');
  await act('recall-knot');
  await act('sleeve');
  await act('field');
  await expand('stamps');
  await act('stamp-star');
  await act('recall-star');
  await act('borrow');
  await act('slide-marks');
  await act('whole');
  for (let i = 0; i < 4; i++) await act('turn');
  await expand('turns');
  await act('unroll');
  await ctrl('starting-square').selectOption('21');
  await panel.getByText('C2 → F3 → E6 → B5 → C2', { exact: true }).waitFor();
  await close();
  await use('optics-wing-door');
  await waitMap('stage.rehearsal');
  await use('optics-rail');
  await expand('waves');
  await act('margin');
  assert.equal(await state('margins'), true);
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await waitMap('stage.rehearsal');
  await choose('Continue playing');
  await use('optics-rail');
  await expand('envelope');
  assert.equal(await state('dispatch'), edition);
  assert.equal(await state('purpose'), 'test');
  assert.equal(await state('preset.star'), 'stage+field');
  assert.equal(await state('preset.knot'), 'stage+sleeve');
  await close();
  await page.keyboard.press('j');
  await modal.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    modal.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const zip = unzipSync(new Uint8Array(await readFile(await download.path())));
  const doc = strFromU8(zip['word/document.xml']),
    links = strFromU8(zip['word/_rels/document.xml.rels']);
  assert.match(doc, /Two different reasons to trust a mark/);
  assert.match(doc, /The fittings reach the curtain/);
  assert.match(links, /article\/z408a\//);
  assert.match(links, /article\/z408j\//);
  assert.match(links, /Optical_microscope/);
  assert.match(links, /Scott_Polar_Research_Institute/);
  assert.match(links, /cajal\/biographical/);
  assert.match(links, /huygenss-principle/);
  assert.doesNotMatch(links, /article\/n115a/);
  console.log(
    'OPTIC-LOAN',
    engine,
    entry,
    seat,
    'two kit stamps recovered, two stage listeners, four turns, two Cambridge records and two models',
  );
}
