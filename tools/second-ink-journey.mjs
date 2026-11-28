import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { strFromU8, unzipSync } from 'fflate';
const records = JSON.parse(await readFile(new URL('../src/content/second-ink.json', import.meta.url)));
export async function playSecondInk({ page, engine, use, close, waitMap }) {
  const tool = engine === 'webkit' ? 'slip' : engine === 'firefox' ? 'cord' : 'bell';
  const route =
    tool === 'cord'
      ? ['archive', 'cold', 'press']
      : tool === 'slip'
        ? ['archive', 'stage', 'coast']
        : ['archive', 'market', 'council'];
  const d = page.getByRole('dialog'),
    panel = d.locator('.second-ink');
  const press = async (id) => {
    const b = panel.locator('[data-ink="' + id + '"]');
    await b.focus();
    await b.press('Enter');
  };
  const summary = async (label) => {
    const b = panel.locator('summary').filter({ hasText: label });
    await b.focus();
    await b.press('Enter');
  };
  if (tool === 'slip') await page.setViewportSize({ width: 320, height: 630 });
  let lastItem;
  for (const [i, name] of route.entries()) {
    const k = records.find((o) => o.site === name),
      room = 'night-register.' + name;
    if (!i) {
      await use(room + '.entrance');
      await waitMap(room);
    } else {
      await page.evaluate((room) => kg.world.changeMap(room, 16, 24), room);
      await waitMap(room);
    }
    await use('agate-vale');
    await d.getByText(k.agate, { exact: false }).first().waitFor();
    await close();
    if (i === 2) {
      const guest = tool === 'cord' ? 'ink-q11621076' : tool === 'slip' ? 'ibn-al-haytham' : 'ink-q9372';
      await use(guest);
      await d
        .getByRole('button', { name: /Try the same light|Stand where Orren|Turn the minute/ })
        .click();
      await close();
    }
    await use('secondink.' + name + '.bench');
    await press(tool);
    if (i === 2) {
      await summary('Agate’s folded margin');
      await press('challenge');
    }
    async function trace(pos) {
      await press('p' + pos);
      if (tool === 'cord') {
        await press('pull');
        await press('pull');
      }
      await press('read');
      await panel.getByRole('status').filter({ hasText: 'Kept.' }).waitFor();
    }
    await trace(0);
    await trace(1);
    if (i > 0) {
      await summary('The moth pocket');
      await press('compare');
      await panel.getByRole('status').filter({ hasText: lastItem.title }).waitFor();
    }
    if (i === 2) {
      if (tool === 'cord') await trace(2);
      else {
        await press('turn');
        await press('read');
      }
      await press('answer');
      await panel.getByRole('status').filter({ hasText: 'Agate puts her mark' }).waitFor();
    }
    assert.ok(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'worktable width');
    const edition = ['exhibit', 'serve', 'entrust'][i];
    await press('sign-' + edition);
    await close();
    await use('secondink.' + name + '.' + edition);
    await press('visit');
    await panel.getByRole('status').filter({ hasText: k[edition] }).waitFor();
    await press('carry');
    await close();
    lastItem = k;
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: /^Continue\b/ })
    .first()
    .click();
  await waitMap('night-register.' + lastItem.site);
  await d.getByRole('button', { name: 'Continue playing' }).click();
  await use('secondink.' + lastItem.site + '.entrust');
  await panel.getByText(lastItem.entrust, { exact: true }).waitFor();
  await close();
  await page.keyboard.press('j');
  await d.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    d.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const unpack = unzipSync(new Uint8Array(await readFile(await file.path())));
  const xml = strFromU8(unpack['word/document.xml']);
  for (const name of route) assert.ok(xml.includes(records.find((k) => k.site === name).title));
  assert.ok(xml.includes('I accepted Agate'));
  assert.ok(xml.includes('I unfolded'));
  const rel = strFromU8(unpack['word/_rels/document.xml.rels']);
  assert.match(rel, /wikipedia.org/);
  await close();
  console.log(
    'SECOND INK',
    engine,
    route,
    tool,
    'played the counterproof from two earlier towns, three public consequences, recovery and Word.',
  );
}
