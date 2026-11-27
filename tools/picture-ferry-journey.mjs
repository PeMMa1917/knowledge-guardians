import assert from 'node:assert/strict';

export async function playPictureFerry({ page, engine, use, waitMap, close }) {
  const dialog = page.getByRole('dialog'),
    panel = dialog.locator('.picture-ferry-work'),
    boat = 'sea.picture-ferry',
    shore = 'sea.harbour';
  const choose = (name) => panel.getByRole('button', { name, exact: true });
  const move = async (map, x, y) => {
    await page.evaluate(
      ([m, x, y]) => kg.world.changeMap(m, x, y),
      [map, x, y],
    );
    await waitMap(map);
    if (await dialog.isVisible()) await close();
  };
  const key = async (btn) => {
    await btn.focus();
    await btn.press('Enter');
  };
  const value = async (flag) =>
    page.evaluate((flag) => kg.controller.state.flags[flag] ?? null, flag);
  const resume = async (map) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await key(
      page.getByRole('button', { name: 'Continue', exact: true }).first(),
    );
    await waitMap(map);
    await key(
      page.getByRole('button', { name: 'Continue playing', exact: true }),
    );
    await dialog.waitFor({ state: 'hidden' });
  };
  const three = ['quai-stairs', 'lace-pillow', 'concorde-view'];
  // Stage the chapter entrance only. The three individual print rewards are earned at the real cases.
  await page.evaluate(() => {
    kg.controller.state.objectivesDone.push('civic.finish');
    kg.settings.reducedMotion = true;
  });
  await move('civic.callboard', 18, 34);
  for (const slug of three) {
    await use('callboard-case-' + slug);
    await close();
    await use('callboard-' + slug);
    await key(dialog.getByRole('button', { name: /visible detail/i }).first());
    await key(
      dialog.getByRole('button', { name: /clip the catalogue/i }).first(),
    );
    await key(
      dialog
        .getByRole('button', { name: /send both to the first bench/i })
        .first(),
    );
    await close();
    assert.equal(
      await page.evaluate(
        (slug) =>
          kg.controller.state.inventory['item.callboard.' + slug + '.print'],
        slug,
      ),
      1,
    );
  }
  await move(shore, 19, 13);
  await use('picture-ferry-gangway');
  await waitMap(boat);
  await use('picture-boy');
  await key(dialog.getByRole('button', { name: /supper ticket/i }));
  await close();
  for (const [i, slug] of three.entries()) {
    await use('picture-ferry-lamp');
    const choices = panel.getByRole('combobox', { name: 'Paper in the case' });
    assert.equal(await choices.locator('option').count(), 4);
    await choices.selectOption(slug);
    await key(choose('Fit this paper to the spindle'));
    if (i % 2) await key(choose('Reverse the sleeve'));
    else await key(choose('Turn one notch'));
    await key(choose('Stand at the rail'));
    assert.equal(await choose('Ring the sailing bell').isDisabled(), true);
    if (i === 0) {
      await resume(boat);
      await use('picture-ferry-lamp');
      assert.equal(
        await panel
          .getByRole('combobox', { name: 'Paper in the case' })
          .inputValue(),
        slug,
      );
      const fit = await panel.evaluate((el) => ({
        w: el.clientWidth,
        scroll: el.scrollWidth,
        windows: el.querySelectorAll('.ferry-window').length,
      }));
      assert.ok(
        fit.scroll <= fit.w + 1 && fit.windows === 2,
        JSON.stringify(fit),
      );
      const art = panel.locator('.ferry-spindle img');
      assert.ok(
        await art.evaluate((img) => img.complete && img.naturalWidth > 0),
      );
      if (process.env.KG_FERRY_SHOT)
        await page.screenshot({ path: process.env.KG_FERRY_SHOT });
    }
    await key(choose('Lie by the low bunk'));
    await key(
      choose(i % 2 ? 'Ring the sailing bell' : 'Tie up for the folded leaf'),
    );
    await close();
    await use('picture-ferry-back');
    await waitMap(shore);
    await use('picture-ferry-passenger');
    await key(
      choose(
        i % 2
          ? 'Listen to what the passenger remembers'
          : 'Open the folded leaf together',
      ),
    );
    assert.match(await panel.getByRole('status').innerText(), /Neris|Tova/);
    await close();
    await use('picture-ferry-gangway');
    await waitMap(boat);
  }
  await use('picture-ferry-bill');
  for (const [i, part] of ['call', 'ticket', 'afterword'].entries()) {
    await panel
      .getByRole('combobox', { name: 'Print to rehearse' })
      .selectOption(three[i]);
    await panel
      .getByRole('combobox', { name: 'Part of the show' })
      .selectOption(part);
    await key(choose('Hang this page in the show'));
  }
  await key(choose('Let the bunk open with its question'));
  await close();
  await use('picture-ferry-walk');
  await waitMap('stage.gallery');
  await use('picture-ferry-evening-show');
  await key(choose('Let Hari turn the next page'));
  assert.equal(await panel.locator('li').count(), 1);
  await resume('stage.gallery');
  await use('picture-ferry-evening-show');
  assert.equal(await panel.locator('li').count(), 1);
  await key(choose('Let Hari turn the next page'));
  await key(choose('Let Hari turn the next page'));
  assert.equal(await panel.locator('li').count(), 3);
  assert.equal(await value('picture-bill.heard'), true);
  assert.deepEqual(
    await page.evaluate(() =>
      kg.controller.state.adventureDiary.entries
        .filter((e) => e.event?.key.startsWith('picture-bill:heard:'))
        .flatMap((e) => e.event.sourceIds),
    ),
    ['HIS-CALL-concorde-view', 'HIS-CALL-quai-stairs', 'HIS-CALL-lace-pillow'],
  );
  console.log(
    'PICTURE-FERRY',
    engine,
    'three earned prints, two windows, both sailings, two audience handovers, two reloads, a three-act encore',
  );
}
