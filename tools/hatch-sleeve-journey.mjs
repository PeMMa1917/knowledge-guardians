import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { strFromU8, unzipSync } from 'fflate';

export async function playHatchSleeve({ page, engine, use, waitMap, close }) {
  const d = page.getByRole('dialog'),
    panel = d.locator('.hatch-sleeve');
  const custody = { chromium: 'rail', firefox: 'desk', webkit: 'round' }[engine];
  const sleeve = { chromium: 'words', firefox: 'method', webkit: 'round' }[engine];
  const packet = { chromium: 'print', firefox: 'read', webkit: 'pair' }[engine];
  const companion = { chromium: 'kip-arden', firefox: null, webkit: 'smith-hesper' }[engine];
  const press = async (loc) => {
    await loc.waitFor({ state: 'visible' });
    await loc.focus();
    await loc.press('Enter');
  };
  const say = async (re) => press(d.getByRole('button', { name: re }).first());
  const act = async (key) => press(panel.locator('[data-hatch="' + key + '"]'));
  const note = async (re) => panel.getByRole('status').filter({ hasText: re }).waitFor();
  const flags = (key) => page.evaluate((k) => kg.controller.state.flags[k], key);
  const travel = async (map, x, y) => {
    await page.evaluate(([m, x, y]) => kg.world.changeMap(m, x, y), [map, x, y]);
    await waitMap(map);
  };
  // Stage the previous market hearing. One route sees Kip stop following in the same visit.
  await page.evaluate(
    ({ companion, engine }) => {
      const s = kg.controller.state;
      s.companion = companion;
      if (engine === 'webkit') s.flags['sd.corvan.outcome'] = 'narrowed';
      kg.world.changeMap('aethelgard.emberford', 18, 22);
    },
    { companion, engine },
  );
  await waitMap('aethelgard.emberford');
  await page.evaluate(() => {
    kg.controller.dispatch({ type: 'SetFlag', flag: 'sd.corvan.outcome', value: 'narrowed' });
    kg.world.refreshWorld();
  });
  await page.bringToFront();
  await page.waitForFunction(() => {
    const w = kg.world,
      a = w.npcs.filter((n) => n.id === 'kip-arden');
    return a.length === 1 && a[0].sprite.x === 21 * 16 + 8 && a[0].sprite.y === 23 * 16 + 12;
  }, undefined, {polling: 100, timeout: 90000}).catch(async error => {
    const post = await page.evaluate(() => ({
      facing:kg.world.player.facing, actors:kg.world.npcs.filter(n=>n.id==='kip-arden').map(n=>[n.sprite.x,n.sprite.y]),
      follower:kg.world.follower?.id, modal:document.querySelector('[role=dialog]')?.getAttribute('aria-label'),
      hidden:document.hidden, map:kg.world.map.id, outcome:kg.controller.state.flags['sd.corvan.outcome'],
    }));
    throw new Error('Kip did not reach his post: '+JSON.stringify(post), {cause:error});
  });
  if (companion !== 'kip-arden')
    assert.equal(await page.evaluate(() => kg.world.follower?.id ?? null), companion);
  await use('kip-arden');
  await say(/Go on|Continue ▸/);
  await say(/Go on|Continue ▸/);
  if (engine === 'webkit') await say(/tiny seal/);
  await say(engine === 'firefox' ? /Put the hour inside/ : /take it to Ise/);
  await close();
  await travel('nexus.archive', 12, 12);
  await use('warden-ise');
  await say({ rail: /public hatch/, desk: /staffed desk/, round: /shift changes/ }[custody]);
  await close();
  assert.equal(await flags('hatch.custody'), custody);
  if (custody === 'round') await travel('aethelgard.emberford', 16, 21);
  await use('hatch-' + custody + '-reply');
  await say({ rail: /Sew the ridge/, desk: /Keep her seat/, round: /Wait on this step/ }[custody]);
  await close();
  // The room is entered after earlier lamp work. The actual exposed letter and catch are used.
  await page.evaluate(() => {
    kg.controller.dispatch({ type: 'SetFlag', flag: 'study.desk', value: true });
    kg.world.changeMap('aethelgard.study', 9, 10);
  });
  await waitMap('aethelgard.study');
  await use('clue-letter');
  await d
    .getByText(/I stood on the steps/)
    .first()
    .waitFor();
  await close();
  await use('hatch-cricket');
  await act('clip-' + sleeve);
  await note(/Open both folded lines/);
  await act('lay');
  await note(engine === 'firefox' ? /closing bell/ : /which edge was up/);
  await act('unfold-elsbet');
  await act('unfold-orrin');
  await act('strike');
  await note(/cricket felt the board/);
  await act('brass');
  await act('table');
  await act('strike');
  await note(/could miss a caller/);
  await act('tooth');
  await act('strike');
  await note(/clear ring/);
  await act('probe-apron');
  await act('probe-boot');
  await act('reveal');
  await note(/Who checked/);
  await act('clip-' + sleeve);
  await close();
  await page.evaluate((packet) => {
    kg.controller.dispatch({ type: 'SetFlag', flag: 'nile.dispatch', value: packet });
    kg.controller.dispatch({ type: 'SetFlag', flag: 'nile.returned', value: true });
    kg.world.changeMap('nexus.archive', 32, 15);
  }, packet);
  await waitMap('nexus.archive');
  await use('hatch-readers');
  await act('receive');
  await act('visitor');
  await page.keyboard.press('Escape');
  const neighbours = d.filter({hasText: 'Keep walking'});
  await neighbours.waitFor();
  assert.equal(await neighbours.locator('.two-replies-row .two-reply').count(), 2);
  await press(neighbours.getByRole('button', { name: 'Keep walking' }));
  await d.waitFor({ state: 'hidden' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await press(page.getByRole('button', { name: /^Continue\b/ }).first());
  await waitMap('nexus.archive');
  await say(/Continue playing/);
  await use('hatch-readers');
  assert.equal(await flags('hatch.delivered'), sleeve);
  assert.equal(await flags('hatch.packet'), packet);
  await close();
  await page.keyboard.press('j');
  await d.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    d.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const doc = strFromU8(
    unzipSync(new Uint8Array(await readFile(await download.path())))['word/document.xml'],
  );
  for (const words of [
    /The cricket in the sleeve/,
    /lifted both cloths/,
    /I brought the sleeve/,
    /I stayed for the caller/,
  ])
    assert.match(doc, words);
  console.log(
    'HATCH',
    engine,
    companion,
    custody,
    sleeve,
    packet,
    'found a single Kip, carried the market wrapper, tested the catch, recovered both readers and exported the diary',
  );
}
