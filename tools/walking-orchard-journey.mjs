import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { strFromU8, unzipSync } from 'fflate';
export async function playWalkingOrchard({ page, engine, use, waitMap, close }) {
  const dialog = page.getByRole('dialog'),
    room = dialog.locator('.walking-orchard');
  const press = async (ctl) => {
    await ctl.waitFor({ state: 'visible' });
    await ctl.focus();
    await ctl.press('Enter');
  };
  const work = (id) => press(room.locator('[data-grove="' + id + '"]'));
  const option = (name) => press(dialog.getByRole('button', { name, exact: true }));
  const see = (pattern) => room.getByRole('status').filter({ hasText: pattern }).waitFor();
  const local = async (id) => {
    await use('walking-grove-' + id);
  };
  const walk = async (map) => waitMap(map);
  if (await dialog.isVisible()) await close();
  await page.evaluate(() => {
    const s = kg.controller.state;
    for (const step of ['forest.arrival', 'civic.arrival'])
      if (!s.objectivesDone.includes(step)) s.objectivesDone.push(step);
    kg.world.changeMap('forest.station', 22, 10);
  });
  await walk('forest.station');
  await local('fern-door');
  await walk('forest.walking-orchard');
  await use('grove-gresa-oker');
  await option('Take the weight while she turns the cart.');
  await dialog
    .getByText(/undressed by a tree/)
    .first()
    .waitFor();
  await close();
  await use('lantern-q46795');
  await option('Walk alongside the nursery crew.');
  await dialog.getByText(/Kenya/).first().waitFor();
  await close();
  await use('ink-q164797');
  await option('Hand the grower the shutter cord.');
  await dialog
    .getByText(/both ends of the cord/)
    .first()
    .waitFor();
  await close();
  await local('bed-kiln');
  await work('join-frost');
  await see(/same dated page/);
  for (const load of ['bare', 'leaf']) {
    await work('load-' + load);
    for (const shoe of ['hanging', 'tied']) {
      await work('boot-' + shoe);
      await work('roll');
      await see(shoe === 'hanging' ? /no heel/ : /one square heel/);
    }
  }
  await work(engine === 'firefox' ? 'account-open' : 'account-cart');
  for (const bed of ['kiln', 'steps', 'bath']) {
    if (bed !== 'kiln') {
      await close();
      await local('bed-' + bed);
    }
    await work('track');
    for (const season of ['ash', 'ribbon'])
      for (const date of ['planting', 'frost']) await work('peek-' + season + '-' + date);
  }
  await work('join-frost');
  await see(/from -2 to \+5/);
  await work('join-spade');
  await see(/12 planted tubs/);
  await work('join-poster');
  await close();
  await local('shade');
  await work('request-canvas');
  await work('light');
  await see(/12 slips/);
  for (const band of ['yard', 'hours', 'job']) await work('band-' + band);
  await work('light');
  await see(/1 slip matches/);
  await work('reserve-count');
  await see(/withheld detail/);
  await work('band-yard');
  await work('light');
  await see(/3 slips match/);
  await work(engine === 'webkit' ? 'reserve-closed' : 'reserve-count');
  await close();
  await local('lamp');
  const pane = engine === 'firefox' ? 'poster' : engine === 'webkit' ? 'spade' : 'frost',
    route = engine === 'firefox' ? 'shade' : engine === 'webkit' ? 'parade' : 'return';
  await work('hang-' + pane);
  await work('pledge-' + route);
  await see(/taking shape/);
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await walk('forest.walking-orchard');
  await option('Continue playing');
  await local('cartway');
  await walk('civic.grove-square');
  await local('installed-' + route);
  await work('answer-move');
  await see(/different things/);
  await work('walk-gresa');
  await work('walk-pella');
  const answer = engine === 'webkit' ? 'invite' : engine === 'firefox' ? 'keep' : 'move';
  await work('answer-' + answer);
  await see(/dancer|key|promise|date/i);
  await close();
  await use('lantern-q46795');
  await option('Follow him to the shared barrel.');
  await dialog
    .getByText(/photograph of planting day/)
    .first()
    .waitFor();
  await close();
  await use('ink-q164797');
  await option('Give the dancer the first turn.');
  await dialog
    .getByText(/mark.s? the curb|marks the curb/)
    .first()
    .waitFor();
  await close();
  await local('cartway-back');
  await walk('forest.walking-orchard');
  await local('nursery-back');
  await walk('forest.station');
  await page.keyboard.press('j');
  await dialog.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const files = unzipSync(new Uint8Array(await readFile(await download.path()))),
    doc = strFromU8(files['word/document.xml']),
    links = strFromU8(files['word/_rels/document.xml.rels']);
  assert.match(doc, /What a borrowed boot can explain/);
  assert.match(doc, /I promised to/);
  assert.match(doc, /The orchard takes a second turn/);
  assert.match(links, /greenbeltmovement.org/);
  assert.match(links, /freire.org/);
  assert.match(links, /nist.gov/);
  assert.doesNotMatch(doc, /"job":"carry"|"index":/);
  await close();
  console.log(
    'WALKING ORCHARD',
    engine,
    route,
    pane,
    answer,
    'Four barrow runs, all twelve dated views, protected counts, both historical returns, the cartway and the earned journal export passed.',
  );
}
