import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

export async function playPocketTheatre({ page, use, waitMap, close, engine }) {
  const load = (name) =>
    readFile(
      new URL(
        '../src/content/pocket-theatre-' + name + '.json',
        import.meta.url,
      ),
      'utf8',
    ).then(JSON.parse);
  const [stories, stops] = await Promise.all([load('cases'), load('stops')]);
  const dialog = page.getByRole('dialog');
  const control = (id) => dialog.locator('[data-pocket="' + id + '"]');
  async function press(id) {
    const b = control(id);
    await b.focus();
    await b.press('Enter');
  }
  async function travel(story) {
    const stop = stops[story.chapter - 1];
    await page.evaluate(
      ({ map, x, y }) => kg.world.changeMap(map, x, y + 1),
      stop,
    );
    await waitMap(stop.map);
    await use('travelling-pocket-theatre');
  }
  let receipts = 0;
  for (const [index, story] of stories.entries()) {
    await travel(story);
    await press(story.id);
    await control('story-title').waitFor();
    assert.equal(await control('story-title').innerText(), story.title);
    const side = (index + (engine === 'webkit' ? 1 : 0)) % 2;
    await press(engine === 'firefox' ? 'first-wait' : 'first-' + (1 - side));
    await press('send-' + side);
    await dialog
      .getByRole('status')
      .filter({ hasText: 'Change one part' })
      .waitFor();
    await press('lever-0-1');
    await press('lever-1-1');
    await press('lever-0-0');
    assert.equal(
      await dialog.locator('.pocket-stage p').innerText(),
      story.readings[2],
    );
    await press('send-' + side);
    await press('margin');
    assert.equal(
      (await dialog.getByRole('link').last().getAttribute('href')) !== null,
      true,
    );
    if (await control('receive').count()) {
      await press('receive');
      receipts++;
    }
    if (index === 1) {
      // Check the normal narrow layout after both rows of controls and a source link are present.
      const overflow = await dialog.evaluate(
        (d) => d.scrollWidth > d.clientWidth + 2,
      );
      assert.equal(overflow, false);
    }
    await close();
  }
  // Visit each desk again once its partner has issued a sheet; both directions remain playable.
  for (const story of stories) {
    await travel(story);
    await press(story.id);
    await press('receive');
    if (await control('return').count()) await press('return');
    await close();
  }
  const final = stories.find((s) => s.id === 'tuesday-fold');
  await travel(final);
  await press(final.id);
  await press('return');
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: /^Continue\b/ })
    .first()
    .click();
  await waitMap(stops[final.chapter - 1].map);
  await page
    .getByRole('button', { name: /Continue playing/ })
    .first()
    .click();
  await use('travelling-pocket-theatre');
  await press(final.id);
  assert.equal(await control('margin').count(), 1);
  await press('return');
  assert.equal(await dialog.locator('.pocket-receipt').count(), 2);
  await close();
  const result = await page.evaluate(() => ({
    sent: Object.keys(kg.controller.state.flags).filter(
      (k) => k.startsWith('pocket.') && k.endsWith('.sent'),
    ).length,
    received: Object.keys(kg.controller.state.flags).filter(
      (k) => k.startsWith('pocket.') && k.endsWith('.received'),
    ).length,
  }));
  assert.deepEqual(result, { sent: 30, received: 30 });
  console.log(
    'POCKET THEATRE',
    engine,
    '30 public endings, 30 incoming working sheets, 15 districts, continued save and a returned Tuesday sheet;',
    receipts,
    'early exchanges.',
  );
}
