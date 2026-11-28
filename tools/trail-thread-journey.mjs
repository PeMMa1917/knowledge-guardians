import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';

export async function playTrailThread({ page, engine, close, waitMap }) {
  const dialog = page.getByRole('dialog'),
    tab = (name) => dialog.getByRole('tab', { name, exact: true });
  const ribbon = dialog.locator('.trail-thread'),
    toggle = ribbon.locator('summary');
  async function openRibbon() {
    await page.keyboard.press('j');
    await tab('Open quests').click();
    await toggle.focus();
    await toggle.press('Enter');
    await ribbon.getByLabel('Step to return to').waitFor();
  }
  await openRibbon();
  const step = ribbon.getByLabel('Step to return to');
  const id = await step.inputValue(),
    title = await step.locator('option:checked').textContent();
  assert.ok(id && title);
  await ribbon.getByLabel('Side of the ribbon').selectOption('voice');
  await ribbon.getByRole('button', { name: 'Tie this ribbon' }).click();
  await ribbon.getByRole('status').filter({ hasText: title }).waitFor();
  assert.equal(await page.evaluate(() => kg.controller.state.flags['diary.thread.step']), id);
  await close();
  const map = await page.evaluate(() => kg.world.map.id);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const resume = page.getByRole('button', { name: /^Continue\b/ }).first();
  await resume.focus();
  await resume.press('Enter');
  await waitMap(map);
  await dialog.getByText('You marked this for your return. ' + title, { exact: true }).waitFor();
  const play = dialog.getByRole('button', { name: 'Continue playing' });
  await play.focus();
  await play.press('Enter');
  await openRibbon();
  assert.equal(await step.inputValue(), id);
  assert.equal(await ribbon.getByLabel('Side of the ribbon').inputValue(), 'voice');
  await ribbon.getByLabel('Side of the ribbon').selectOption('thing');
  await ribbon.getByRole('button', { name: 'Tie this ribbon' }).click();
  await ribbon.getByRole('button', { name: 'Untie my ribbon' }).click();
  assert.equal(await page.evaluate(() => kg.controller.state.flags['diary.thread.step']), false);
  await tab('Diary').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const xml = strFromU8(
    unzipSync(new Uint8Array(await readFile(await download.path())))['word/document.xml'],
  );
  assert.match(xml, /I slipped my ribbon/);
  assert.match(xml, /Whose account do I want to hear/);
  assert.match(xml, /Which detail would I look for/);
  console.log(
    'TRAIL-THREAD',
    engine,
    id,
    'class-safe saved flags, two sides, resume note, removal and Word download',
  );
}
