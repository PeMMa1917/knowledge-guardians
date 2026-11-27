import {playRecordNotes} from './record-note-journey.mjs';
import {playFieldLoans} from './field-loan-journey.mjs';
import {playFoldingFlock} from './folding-flock-journey.mjs';
import { playTaskScore } from './task-score-journey.mjs';
import { playTownHearings } from './town-hearings-journey.mjs';
import {playChapterLights} from './chapter-lights-journey.mjs';
import {playDiaryShelves} from './diary-shelves-journey.mjs';
import {playWhistleWatch} from './whistle-watch-journey.mjs';
import { playExitSave } from './exit-save-journey.mjs';
import { playGuestChapters } from './guest-chapters-journey.mjs';
import { playVaultWatch } from './vault-watch-journey.mjs';
import { playMillShift } from './mill-shift-journey.mjs';
import { playMakerField } from './maker-field-journey.mjs';
import { playPocketCoat } from './pocket-coat-journey.mjs';
import { createRequire } from 'node:module';
import { playEmberfordShift } from './emberford-shift-journey.mjs';
import { playNightRegister } from './night-register-journey.mjs';
import { playLastBell } from './last-bell-journey.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const req = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url);
const pw = req('playwright');
const engine = process.argv[2] || 'chromium';
const browser = await pw[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : { headless: true, timeout: 50000 },
);
const page = await browser.newPage({
  viewport:
    engine === 'webkit'
      ? { width: 390, height: 844 }
      : engine === 'firefox'
        ? { width: 820, height: 1080 }
        : { width: 1280, height: 800 },
});
const quietGuestRun = process.argv.includes('--guest-route') && process.env.KG_GUEST_COMFORT === '1';
if (quietGuestRun) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    if (!localStorage.getItem('kg.settings')) localStorage.setItem('kg.settings', JSON.stringify({
      reducedMotion: true, reducedEffects: true, captions: true, musicVolume: 0, sfxVolume: 0,
    }));
  });
  console.log('Guest route uses reduced effects, reduced motion and sound captions.');
}
page.setDefaultTimeout(process.argv.includes('--guest-route') ? 60000 : 22000);
const faults = [];
page.on('pageerror', (e) => faults.push(String(e)));
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('favicon')) faults.push(r.status() + ' ' + r.url());
});
const button = (s) => page.getByRole('button', { name: s, exact: false }).first().click();
const close = async () => {
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
};
const waitMap = (id) =>
  page.waitForFunction((id) => window.kg?.world?.map.id === id && !kg.world.transitioning, id, { timeout: 60000 });
async function use(id) {
  const found = await page.evaluate((id) => {
    const w = kg.world,
      c = kg.controller;
    const p = w.map.interactables.find((p) => p.id === id) || w.map.npcs.find((p) => p.id === id);
    if (!p || (p.visibleIf && !c.check(p.visibleIf))) return;
    const sx = Math.floor(w.player.sprite.x / 16),
      sy = Math.floor(w.player.sprite.y / 16);
    const sides = [];
    const width = p.w ?? 1, height = p.h ?? 1;
    for (let col = p.x; col < p.x + width; col++) sides.push([col, p.y+height, 'up']);
    for (let row = p.y; row < p.y + height; row++) sides.push([p.x-1, row, 'right'], [p.x+width, row, 'left']);
    for (let col = p.x; col < p.x + width; col++) sides.push([col, p.y-1, 'down']);
    for (const [x, y, facing] of sides) {
      if (w.collides(x * 16 + 8, y * 16 + 12) || w.bfs(sx, sy, x, y) === null) continue;
      w.player.sprite.setPosition(x * 16 + 8, y * 16 + 12);
      w.player.facing = facing;
      w.updateTarget();
      if (w.target?.obj?.id === id || w.target?.actor?.id === id) return [x, y, facing];
    }
    return { failed: true, target: w.target?.obj?.id || w.target?.actor?.id, map: w.map.id };
  }, id);
  assert.ok(Array.isArray(found), JSON.stringify({ id, found }));
  await page.keyboard.press('e');
  console.log('interact', id, found);
}

const load = (n) => JSON.parse(fs.readFileSync(new URL('../src/content/' + n, import.meta.url), 'utf8'));
const sites = load('lamplight-stations.json'),
  posts = load('ink-post-stations.json');
const people = [...load('ink-post-letters.json'), ...load('lamplight-voices.json')];
const split = ['chromium', 'firefox', 'webkit'].indexOf(engine);
try {
  await page.goto(process.argv[3], { timeout: 90000, waitUntil: 'domcontentloaded' });
  await button('New game');
  await page.getByRole('button', {name: 'Begin', exact: true}).click({timeout: 90000});
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await close();
  await waitMap('nexus.archive');
  const bellOnly = process.argv.includes('--last-bell');
  const shiftOnly = process.argv.includes('--emberford-shift');
  const registerOnly = process.argv.includes('--night-register');
  const coatOnly = process.argv.includes('--shift-coat');
  const makerOnly = process.argv.includes('--maker-tools');
  const millOnly = process.argv.includes('--mill-shift');
  const vaultOnly=process.argv.includes('--vault-watch');
  const guestIndex=process.argv.indexOf('--guest-route');
  const exitOnly=process.argv.includes('--exit-save');
  const whistleOnly=process.argv.includes('--whistle-watch');
  const shelvesOnly = process.argv.includes('--diary-shelves');
  const lightsOnly = process.argv.includes('--chapter-lights');
  const hearingsOnly = process.argv.includes('--town-hearings');
  const birdOnly = process.argv.includes('--folding-flock');
  const scoreOnly = process.argv.includes('--task-score');
  const loanOnly=process.argv.includes('--field-loans');
  const notesOnly=process.argv.includes('--record-notes');
  if(notesOnly) await playRecordNotes({page,engine,waitMap,use,close,button});
  else if(loanOnly) await playFieldLoans({page,engine,waitMap,use,close,button});
  else if(birdOnly) await playFoldingFlock({page,engine,waitMap,use,close,button});
  else if(scoreOnly) await playTaskScore({page,engine,button,close,waitMap});
  else if(hearingsOnly) await playTownHearings({page,engine,button,use,waitMap});
  else if(lightsOnly) await playChapterLights({page,engine,posts,waitMap});
  else if(shelvesOnly) await playDiaryShelves({page,waitMap,use,close});
  else if(whistleOnly) await playWhistleWatch({page,engine,button,use,close,waitMap});
  else if(exitOnly) await playExitSave({page,waitMap,button});
  else if(guestIndex!==-1){
    const index=Number(process.argv[guestIndex+1]),guest=people[index];
    assert.ok(Number.isInteger(index)&&guest,'Pass a historical guest index from 0 to '+(people.length-1));
    await playGuestChapters({page,engine,guest,index,posts,sites,button,use,close,waitMap});
  }
  else if(vaultOnly) await playVaultWatch({page,engine,waitMap,use,close,button});
  else if(millOnly) await playMillShift({page,engine,waitMap,use,close});
  else if (makerOnly) await playMakerField({page,engine,waitMap,use,close});
  else if (coatOnly) await playPocketCoat({page,engine,posts,sites,people,waitMap,use,close,button});
  else if (registerOnly) await playNightRegister({page,engine,waitMap,use,close,button,posts,works:load('night-register.json'),trails:load('night-trails.json')});
  else if (shiftOnly) await playEmberfordShift({page,engine,waitMap,use,close,button,puzzles:load('puzzles.json').puzzles});
  else if (bellOnly) await playLastBell({page,engine,waitMap,use,close,button,sites,posts});
  else for (const [i, site] of sites.entries())
    if (i % 3 === split) {
      const post = posts.find((p) => p.id === site.id);
      if ((await page.evaluate(() => kg.world.map.id)) !== post.map) {
        await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), post);
        await waitMap(post.map);
      }
      for (const [j, id] of site.pair.guests.entries()) {
        const guest = people.find((p) => p.id === id);
        await use('ink-post.' + site.id);
        await button('call a guest to the lantern');
        await page.getByRole('searchbox').fill(guest.name);
        await button(guest.name + ' ·');
        await page.locator('[data-lantern-piece="' + j + '"]').click();
        await page.locator('[data-lantern-piece="2"]').click();
        await button(guest.folds[j].action);
        await close();
        await use('lamplight.' + site.id + '.bench');
        await button(guest.name + ' ·');
        await button(site.uses[j].action);
        await close();
      }
      await use('lamplight.' + site.id + '.bench');
      await button(people.find((p) => p.id === site.pair.guests[0]).name + '’s sheet');
      await button('Both sheets');
      await button(people.find((p) => p.id === site.pair.guests[1]).name + '’s sheet');
      for (const option of site.pair.choices) {
        await button(option.action);
        await page.getByText(option.reply, { exact: true }).first().waitFor();
      }
      if (site.id === 'gate' || site.id === 'dispatch') {
        const gate = site.id === 'gate';
        await page
          .locator('summary')
          .filter({ hasText: gate ? 'A bell for the empty cradle' : 'The four windows that answered' })
          .click();
        for (const choice of gate
          ? ['Clip at 2 marks', 'Clip at 5 marks', 'Leave the high clip']
          : [
              'Stretch the cord over replies',
              'Stretch the cord over the whole rota',
              'Send the runner to the dark windows now',
            ])
          await button(choice);
      }
      await close();
      console.log('PASS', engine, site.id, site.pair.title);
    }
  assert.deepEqual(
    faults.filter((s) => !s.includes('favicon')),
    [],
  );
  console.log(engine, browser.version(), notesOnly ? 'passed record invitations, photo cover and text-only participation' : loanOnly ? 'passed four receiving benches, two carried replies and four reader routes' : birdOnly ? 'passed the folding flock, gallery, Two-Tide Dock and Sora’s returned key' : scoreOnly ? 'passed registered panels, task music, feedback and mute' : hearingsOnly ? 'passed four town hearings, two witnesses in each and four cross-town amendments' : lightsOnly ? 'passed all sixteen world grades, high contrast and reduced effects' : shelvesOnly ? 'passed four diary shelves, word histories and earned cross-area memories' : whistleOnly ? 'passed Liri’s three watches, travelling sheet and recall' : exitOnly ? 'passed all four exit signal orders, retry and reload' : guestIndex!==-1 ? 'passed both encounters in all 15 chapters and restored the guest’s work' : vaultOnly ? 'passed the six vault instruments, weir and council handover' : millOnly ? 'passed the six-counter mill and both earned passages' : makerOnly ? 'passed three instruments and six handovers' : coatOnly ? 'passed the travelling coat and both endings' : registerOnly ? 'passed the night register journey' : shiftOnly ? 'passed the Emberford shift' : bellOnly ? 'passed the kitchen bell journey' : 'passed both endings at each of five physical stations');
} finally {
  await browser.close();
}
