import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
export async function playFerryRadio({ page, engine, use, waitMap, close }) {
  const modal = page.getByRole('dialog'),
    panel = modal.locator('.wire-studio');
  const press = async (el) => {
    await el.waitFor({ state: 'visible' });
    await el.focus();
    await el.press('Enter');
  };
  const ctrl = (id) => panel.locator('[data-wire="' + id + '"]');
  const act = async (id) => {
    if (process.env.KG_STATION_TRACE) console.log('dial action', id);
    await press(ctrl(id));
  };
  const fold = async (id) => {
    const details = panel.locator('[data-wire-fold="' + id + '"]');
    if (!(await details.evaluate((el) => el.open))) await press(details.locator(':scope > summary'));
  };
  const status = () => panel.locator('[data-work-feedback]');
  const flags = (key) => page.evaluate((k) => kg.controller.state.flags['wire.' + k], key);
  const pick = async (band, aerial, mode) => {
    await fold('dial');
    await act('band-' + band);
    await act('aim-' + aerial);
    await act(mode);
    await act('listen');
  };
  await page.evaluate(() => {
    const s = kg.controller.state;
    for (const id of ['sea.arrival', 'island.arrival'])
      if (!s.objectivesDone.includes(id)) s.objectivesDone.push(id);
    kg.world.changeMap('sea.harbour', 18, 8);
  });
  await waitMap('sea.harbour');
  if (await modal.isVisible()) await close();
  await use('wire-studio');
  await waitMap('sea.listening-wheel');
  await use('wire-oda');
  await press(modal.getByRole('button', { name: 'Hold out your hand for the end of the spool.', exact: true }));
  await modal
    .getByText(/summer of quiet/)
    .first()
    .waitFor();
  await close();
  await use('ink-q158060');
  await press(modal.getByRole('button', { name: 'Ask whose names belong on a picture.', exact: true }));
  await modal
    .getByText(/students and other hands/)
    .first()
    .waitFor();
  await close();
  await use('wire-console');
  await fold('spool');
  await act('take-first');
  await status()
    .filter({ hasText: /open line/ })
    .waitFor();
  assert.equal(
    await panel
      .getByRole('status')
      .filter({ hasText: /open line/ })
      .count(),
    1,
  );
  await pick('wood', 'roof', 'open');
  assert.equal(await flags('last'), 'quiet');
  await status()
    .filter({ hasText: /paper moth/ })
    .waitFor();
  for (const [band, dir] of [
    ['reed', 'roof'],
    ['wood', 'water'],
    ['reed', 'water'],
    ['glass', 'roof'],
  ])
    await pick(band, dir, 'open');
  await act('prompt');
  await act('listen');
  await status()
    .filter({ hasText: /your way/ })
    .waitFor();
  await fold('log');
  await panel.locator('.wire-calls').filter({ hasText: 'The joist painter' }).first().waitFor();
  await fold('spool');
  await act('take-first');
  await act('take-second');
  assert.equal(await flags('reuse'), true);
  await fold('crowd');
  for (const frame of ['covered', 'open', 'balanced', 'pooled']) await act('frame-' + frame);
  await act('balance');
  await status()
    .filter({ hasText: /four points/ })
    .waitFor();
  await fold('edition');
  assert.equal(await panel.locator('[data-wire^="quote-siv"]').count(), 0);
  await act('quote-child-anonymous');
  const edition = engine === 'firefox' ? 'pause' : engine === 'webkit' ? 'relay' : 'chorus';
  await act('issue-' + edition);
  await close();
  await use('wire-line');
  await waitMap('island.dock');
  const landing = await page.evaluate(() => {
    const { world } = window.kg;
    const { x, y } = world.player.sprite;
    return { tile: [Math.floor(x / 16), Math.floor(y / 16)], clear: !world.collides(x, y) };
  });
  assert.deepEqual(landing, { tile: [18, 9], clear: true });
  await use('wire-horn');
  await fold('edition');
  await act('receive');
  assert.equal(await panel.locator('blockquote footer').innerText(), 'An unnamed listener');
  await act('runner');
  await act('singer');
  await fold('shift');
  await act('break');
  await act('file');
  assert.equal(await flags('filedShift'), 'break');
  await act('late');
  await act('file');
  await close();
  await use({ pause: 'wire-rest', chorus: 'wire-sheet', relay: 'wire-second' }[edition]);
  await modal.waitFor();
  await close();
  await use('ink-q158060');
  await press(modal.getByRole('button', { name: 'Read him the invitation for the next shift.', exact: true }));
  await modal
    .getByText(/time at which you called/)
    .first()
    .waitFor();
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await waitMap('island.dock');
  await press(modal.getByRole('button', { name: 'Continue playing', exact: true }));
  await use('wire-horn');
  await fold('edition');
  assert.equal(await flags('issued'), edition);
  assert.equal(await flags('filedShift'), 'late');
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
  assert.match(doc, /A voice for the programme/);
  assert.match(doc, /The time on Joss/);
  assert.match(doc, /private voice off my page/);
  assert.match(links, /du-bois-in-paris/);
  assert.match(links, /papress.com/);
  assert.match(links, /openstax.org/);
  console.log(
    'FERRY-RADIO',
    engine,
    edition,
    'heard the unconnected coil, compared prompts and crowd frames, tried both shifts, recovered the edition and three historical readings',
  );
}
