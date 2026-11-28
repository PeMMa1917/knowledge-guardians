import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { strFromU8, unzipSync } from 'fflate';

export async function playOpenHouse({ page, engine, use, button, close, waitMap }) {
  const d = page.getByRole('dialog'),
    bench = d.locator('.middle-house'),
    flag = (key) => page.evaluate((k) => kg.controller.state.flags['middlehouse.' + k], key);
  const press = async (e) => {
    await e.waitFor({ state: 'visible' });
    await e.focus();
    await e.press('Enter');
  };
  const choose = (id) => press(bench.locator('[data-house="' + id + '"]'));
  const says = (pattern) => bench.getByRole('status').filter({ hasText: pattern }).waitFor();
  const place = async (map, goal, x, y) => {
    await page.evaluate(
      ({ map, goal, x, y }) => {
        if (goal && !kg.controller.state.objectivesDone.includes(goal))
          kg.controller.state.objectivesDone.push(goal);
        kg.world.changeMap(map, x, y);
      },
      { map, goal, x, y },
    );
    await waitMap(map);
  };
  // Earn the first friend at its own perch, then see it leave and return to the same seat.
  await use('night-register.archive.entrance');
  await waitMap('night-register.archive');
  await use('night-register.archive.perch');
  await button('Button · Margin hare');
  await button('Wait by Button');
  await button('Lower a shade at the left');
  await close();
  await use('night-register.archive.back');
  await waitMap('nexus.archive');
  await use('quarters-door');
  await press(d.locator('summary').filter({hasText:'Places for returning companions'}));
  await choose('seat-mat');
  await says(/place will be waiting/);
  assert.match(await d.locator('.room-canvas').getAttribute('aria-label'), /Button is travelling with you/);
  await close();
  await use('night-register.archive.entrance');
  await waitMap('night-register.archive');
  await use('night-register.archive.perch');
  await button('Button · Margin hare');
  await button('Rest at the perch');
  await close();
  await use('night-register.archive.back');
  await waitMap('nexus.archive');
  await use('quarters-door');
  await press(d.getByText('Places for returning companions', { exact: true }));
  await choose('hear-mat');
  await says(/route thread/);
  assert.match(await d.locator('.room-canvas').getAttribute('aria-label'), /Button at the rug/);
  await close();
  await use('middlehouse-under-mat');
  await waitMap('nexus.middle-door');
  await use('door-neska');
  await button('Ask who set the price of a bed.');
  await d
    .getByText(/buying time/)
    .first()
    .waitFor();
  await close();
  await use('lantern-q234335');
  await button('Walk with the kettle.');
  await d
    .getByText(/Three neighbours/)
    .first()
    .waitFor();
  await close();
  await use('ink-q47780');
  await button('Follow the edge of the fire station in her sketchbook.');
  await d
    .getByText(/Weil am Rhein/)
    .first()
    .waitFor();
  await close();
  await use('middlehouse-floor');
  const choice =
    engine === 'firefox'
      ? { layout: 'song', purpose: 'loft', steps: 'senn', stop: 'loft', hand: 'garden' }
      : engine === 'webkit'
        ? { layout: 'green', purpose: 'garden', steps: 'ness', stop: 'garden', hand: 'tea' }
        : { layout: 'lunch', purpose: 'tea', steps: 'sennes', stop: 'tea', hand: 'loft' };
  await choose('layout-' + choice.layout);
  await choose('issue-' + choice.purpose);
  await says(/Walk this plan/);
  if (process.argv.includes('--measure-seam')) {
    await press(bench.getByText('The concertina seam and Tover’s tape', { exact: true }));
    await choose('measure-wheel-tea');
    await says(/doors in .* paces/);
    await choose('stretched');
    await choose('measure-wheel-tea');
    await says(/east seam is stretched/);
    await choose('folded');
  }
  await choose('tile-1');
  await choose('right');
  await choose('left');
  await choose('chalk-foot');
  await choose('chalk-wheel');
  await choose('issue-' + choice.purpose);
  await says(/pressed floor/);
  const signed = await flag('floor');
  await close();
  await use('middlehouse-chairs');
  await choose('seat-sill');
  await choose('hear-sill');
  await says(/sightline tracing/);
  await choose('seat-hearth');
  await choose('hear-hearth');
  await says(/fold of your issued floor/);
  await close();
  await use('middlehouse-floor');
  await choose('layout-' + (choice.layout === 'green' ? 'song' : 'green'));
  await choose('unfold');
  assert.equal(await flag('sketch'), signed);
  await close();
  await place('aethelgard.emberford', 'm02.o1.arrive', 14, 21);
  await use('lantern-q234335');
  await button('Stand behind the wheel this time.');
  await d
    .getByText(/opens his door/)
    .first()
    .waitFor();
  await close();
  await use('middlehouse-cart');
  await choose('thread-' + choice.stop);
  await says(/Try .* first/);
  await choose('park');
  await says(/Push to/);
  for (const step of choice.steps) await choose('push-' + { s: 'south', e: 'east', n: 'north' }[step]);
  await choose('park');
  assert.equal(await flag('cart.stop'), choice.stop);
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await waitMap('aethelgard.emberford');
  await button('Continue playing');
  assert.equal(await flag('cart.stop'), choice.stop);
  await place('sea.harbour', 'sea.arrival', 11, 9);
  await use('ink-q47780');
  await button('Walk outside the triangle.');
  await d
    .getByText(/both limits/)
    .first()
    .waitFor();
  await close();
  await use('middlehouse-lamp');
  await choose('sight-garden');
  await says(/Light the actual lamp/);
  await choose('light');
  await choose('file');
  await says(/two hooks/);
  // Take two sightlines with distinct room sets, then file only the last hook actually tried.
  for (const tile of [5, 1, 7]) {
    await choose('tile-' + tile);
    await choose('light');
  }
  await choose('file');
  assert.equal(await flag('light.filed'), 7);
  await close();
  await place('voices.listening', 'voices.arrival', 8, 10);
  await use('door-neska');
  await button('Look at her hands when she lets go.');
  await d
    .getByText(/people who go home/)
    .first()
    .waitFor();
  await close();
  await use('middlehouse-keys');
  await choose('table-' + choice.hand);
  await says(/./);
  const ending = await flag('houseEcho');
  assert.ok(ending.length > 48);
  await close();
  await place('nexus.archive', null, 19, 5);
  await use('middlehouse-under-mat');
  await waitMap('nexus.middle-door');
  await use('middlehouse-to-porch');
  await waitMap('nexus.new-landing');
  await use('middlehouse-porch-' + choice.stop);
  await bench.getByText(ending, { exact: true }).waitFor();
  await close();
  await page.keyboard.press('j');
  await d.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    d.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const files = unzipSync(new Uint8Array(await readFile(await download.path()))),
    doc = strFromU8(files['word/document.xml']),
    rels = strFromU8(files['word/_rels/document.xml.rels']);
  assert.match(doc, /Somebody lives on the new landing/);
  assert.match(doc, /Button comes home/);
  for (const domain of ['pritzkerprize.com', 'janeswalk.org', 'pps.org'])
    assert.ok(rels.includes(domain), domain);
  console.log(
    'THE INN',
    engine,
    choice.layout,
    choice.stop,
    choice.hand,
    ending,
    'Earned companion, living quarters, two historical guests, wheel, light, return landing and sources passed.',
  );
}
