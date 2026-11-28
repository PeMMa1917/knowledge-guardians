import assert from 'node:assert/strict';

export async function playDiaryShelves({page, waitMap, use, close}) {
  const dialog = page.getByRole('dialog');
  const tab = name => dialog.getByRole('tab',{name,exact:true});
  const section = name => dialog.getByRole('group',{name:'Journal sections'}).getByRole('button',{name,exact:true});
  async function turn(map, x, y, site, key) {
    await page.evaluate(([id, x, y]) => kg.world.changeMap(id, x, y), [map, x, y]);
    await waitMap(map);
    await use('whistle.' + site + '.table');
    await dialog.locator('[data-watch="' + key + '"]').click();
    await close();
  }
  await turn('forest.station', 17, 5, 'fern', 'lay0');
  await turn('stage.rehearsal', 6, 13, 'stage', 'screen0');
  await page.keyboard.press('j');
  await tab('Diary').waitFor();
  assert.equal(await dialog.locator('.diary-words[open]').count(), 0);
  const watched = dialog.locator('.diary-feed > li').filter({hasText:'I left the name cards facing out.'}).first();
  const words = watched.locator('.diary-words');
  await words.getByText('Words for this moment').focus();
  await page.keyboard.press('Enter');
  const responsibility = words.locator(':scope > details').filter({has: page.locator('summary', {hasText: /^Responsibility$/i})});
  await responsibility.locator(':scope > summary').click();
  await responsibility.getByText(/Read alongside/).click();
  await responsibility.locator('blockquote').filter({hasText:'I fitted the walker’s tracing over the fan.'}).waitFor();
  await responsibility.getByText('Word history', {exact:true}).click();
  assert.match(await responsibility.getByRole('link',{name:'Dictionary entry'}).getAttribute('href'), /^https:/);
  assert.equal(await words.getByText(/nesting inset/).count(), 0);
  for (const name of ['Evidence','Me','Help','Story']) {
    await section(name).click();
    await page.waitForFunction(n => document.activeElement?.textContent === n, name);
  }
  await tab('Diary').focus();
  await page.keyboard.press('ArrowRight');
  await tab('My notes').waitFor();
  await page.waitForFunction(() => document.activeElement?.id === 'journal-tab-notes');
  await page.keyboard.press('End');
  await page.waitForFunction(() => document.activeElement?.id === 'journal-tab-letters');
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.activeElement?.id === 'journal-tab-diary');
  assert.equal(await tab('Afterwards').count(), 0);
  assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 2));
  await close();
}
