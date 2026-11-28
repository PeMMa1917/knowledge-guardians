import assert from 'node:assert/strict';

export async function playCallingBook({ page, engine, posts, sites, people, button, use, close, waitMap }) {
  const d = page.getByRole('dialog');
  const named = engine === 'chromium' ? 'Vera Rubin' : engine === 'webkit' ? 'Zaha Hadid' : 'Wangari Maathai';
  const person = people.find((p) => p.name === named);
  assert.ok(person, named);
  const unknown = people.find((p) => p.id !== person.id && p.name !== 'Jane Jacobs');
  const chosen = [sites[0], sites[engine === 'firefox' ? 2 : engine === 'webkit' ? 4 : 6]].map((site) => ({
    ...site,
    place: posts.find((post) => post.id === site.id).place,
  }));
  async function book() {
    await page.keyboard.press('j');
    await d.getByRole('tab', { name: 'Conversations' }).click();
    await d.locator('summary').filter({ hasText: 'People I have met' }).click();
    const book = d.locator('.calling-book'),
      picker = book.getByRole('combobox');
    assert.equal(await picker.locator('option').filter({ hasText: unknown.name }).count(), 0);
    await picker.selectOption(person.character);
    return book;
  }
  for (const [i, site] of chosen.entries()) {
    const post = posts.find((p) => p.id === site.id);
    if (i) {
      await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), post);
      await waitMap(post.map);
    }
    await use('ink-post.' + site.id);
    await button('call a guest to the lantern');
    await d.getByRole('searchbox').fill(person.name);
    await button(person.name + ' ·');
    await d.locator('[data-lantern-piece="1"]').click();
    await d.locator('[data-lantern-piece="2"]').click();
    await button(person.folds[i].action);
    await close();
    if (i === 0) {
      await use('lamplight.' + site.id + '.bench');
      await button(person.name + ' ·');
      await button(site.uses[1].action);
      await close();
    } else {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page
        .getByRole('button', { name: /^Continue\b/ })
        .first()
        .click();
      await waitMap(post.map);
      await button('Continue playing');
    }
    const received = await book();
    await received.getByText(chosen[0].uses[1].reply, { exact: false }).first().waitFor();
    await received
      .getByRole('link', { name: /Wikipedia/i })
      .first()
      .waitFor();
    if (i === 0) {
      assert.equal(await received.getByText(chosen[1].place, { exact: true }).count(), 0);
    } else {
      await received
        .getByText('The tracing is ready for ' + site.bench + ' in ' + site.place + '.', { exact: true })
        .waitFor();
    }
    await close();
  }
  // The ordinary conversation can open just the current person's page while the full journal retains both visits.
  await page.evaluate(() => kg.world.changeMap('nexus.archive', 8, 10));
  await waitMap('nexus.archive');
  await use('warden-ise');
  await d
    .locator('summary')
    .filter({ hasText: /My visits with/ })
    .click();
  await d
    .locator('.calling-page')
    .getByText(/Words I have heard/)
    .waitFor();
  console.log(
    'CALLING BOOK',
    engine,
    named,
    'remembered a signed workshop, recovered a second open tracing, and kept untouched people out of the book.',
  );
}
