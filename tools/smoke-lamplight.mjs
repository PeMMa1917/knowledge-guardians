import {playReturnCoat} from './return-coat-journey.mjs';
import {playPocketTheatre} from './pocket-theatre-journey.mjs';
import {playClaimBell} from './claim-bell-journey.mjs';
import {playEastWell} from './east-well-journey.mjs';
import {playRiverNames} from './river-name-journey.mjs';
import {playHatchSleeve} from './hatch-sleeve-journey.mjs';
import {playCallingBook} from './calling-book-journey.mjs';
import {playSecondInk} from './second-ink-journey.mjs';
import {playWalkingOrchard} from './walking-orchard-journey.mjs';
import {playOpenHouse} from './open-house-journey.mjs';
import {playTideClock} from './tide-clock-journey.mjs';
import {playFerryRadio} from './ferry-radio-journey.mjs';
import {playLensLoan} from './lens-loan-journey.mjs';
import {playStreetAlmanac} from './street-almanac-journey.mjs';
import {playTrailThread} from './trail-thread-journey.mjs';
import { playCourierLift } from './courier-lift-journey.mjs';
import {playFieldInvitation} from './field-invitation-journey.mjs';
import {playGiantSleeve} from './giant-sleeve-journey.mjs';
import {playPetalHouse} from './petal-house-journey.mjs';
import {playOriginTour,originLabels} from './origin-instrument-journey.mjs';
import { playFirstPerches } from './first-chapter-perches-journey.mjs';
import { playPictureFerry } from './picture-ferry-journey.mjs';
import { playPlumOrchard } from './plum-orchard-journey.mjs';
import { playTurningStacks } from './turning-stacks-journey.mjs';
import { playFirstCup } from './first-cup-journey.mjs';
import { playMuseumArticles } from './museum-articles-journey.mjs';
import { playRegisterDrawers } from './register-drawers-journey.mjs';
import { playSupperShadow } from './supper-shadow-journey.mjs';
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
page.setDefaultTimeout(['--return-coat','--pocket-theatre','--claim-bell','--east-well','--river-names','--hatch-sleeve','--calling-book','--second-ink','--open-house','--walking-orchard','--tide-clock','--ferry-radio','--lens-loan','--turning-stacks','--first-cup','--museum-articles','--street-almanac','--ribbon','--giant-sleeve','--courier-lift','--guest-route','--first-perches','--picture-ferry','--petal-house','--origin-tour','--field-invitation','--register-drawers'].some(flag => process.argv.includes(flag)) ? 60000 : 22000);
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
  const newGame = page.getByRole('button', {name:/New game/}).first();
  await newGame.focus();
  await newGame.press('Enter');
  const originIndex = process.argv.indexOf('--origin-tour');
  const origin = process.argv[originIndex + 1];
  if (originIndex !== -1) {
    assert.ok(Object.hasOwn(originLabels, origin));
    await page.getByRole('radio', {name:new RegExp('^'+originLabels[origin])}).click();
  }
  await page.getByRole('button', {name: 'Begin', exact: true}).click({timeout: 90000});
  await page
    .getByRole('dialog')
    .getByText(/brass fish/)
    .first()
    .waitFor({timeout:90000});
  await close();
  await waitMap('nexus.archive');
  const bellOnly = process.argv.includes('--last-bell');
  const shiftOnly = process.argv.includes('--emberford-shift');
  const registerOnly = process.argv.includes('--night-register');
  const coatOnly = process.argv.includes('--shift-coat');
  const makerOnly = process.argv.includes('--maker-tools');
  const millOnly = process.argv.includes('--mill-shift');
  const vaultOnly=process.argv.includes('--vault-watch');
  const drawerIndex=process.argv.indexOf('--register-drawers');
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
  const supperOnly=process.argv.includes('--supper-shadow');
  if(process.argv.includes('--return-coat')) await playReturnCoat({page,engine,use,waitMap,close});
  else if(process.argv.includes('--pocket-theatre')) await playPocketTheatre({page,engine,use,waitMap,close});
  else if(process.argv.includes('--claim-bell')) await playClaimBell({page,engine,use,waitMap,close});
  else if(process.argv.includes('--east-well')) await playEastWell({page,engine,use,waitMap,close});
  else if(process.argv.includes('--river-names')) await playRiverNames({page,engine,use,waitMap,close});
  else if(process.argv.includes('--hatch-sleeve')) await playHatchSleeve({page,engine,use,waitMap,close});
  else if(process.argv.includes('--calling-book')) await playCallingBook({page,engine,posts,sites,people,button,use,close,waitMap});
  else if(process.argv.includes('--second-ink')) await playSecondInk({page,engine,use,close,waitMap});
  else if(process.argv.includes('--walking-orchard')) await playWalkingOrchard({page,engine,use,waitMap,close});
  else if(process.argv.includes('--open-house')) await playOpenHouse({page,engine,use,button,close,waitMap});
  else if(process.argv.includes('--tide-clock')) {
    const journey={page,engine,use,waitMap,close};
    const fromFerry=process.argv.includes('--ferry-radio');
    if(fromFerry) await playFerryRadio(journey);
    await playTideClock(journey,fromFerry);
  } else if(process.argv.includes('--ferry-radio')) await playFerryRadio({page,engine,use,waitMap,close});
  else if(process.argv.includes('--turning-stacks')) await playTurningStacks({page,engine,use,waitMap,close});
  else if(process.argv.includes('--lens-loan')) await playLensLoan({page,engine,use,waitMap,close});
  else if(process.argv.includes('--first-cup')) await playFirstCup({page,engine,use,waitMap,close});
  else if(process.argv.includes('--museum-articles')) await playMuseumArticles({page,engine,use,waitMap,close,button,posts,works:load('night-register.json')});
  else if(process.argv.includes('--street-almanac')) await playStreetAlmanac({page,engine,use,waitMap,close});
  else if(process.argv.includes('--ribbon')) await playTrailThread({page,engine,close,waitMap});
  else if(process.argv.includes('--giant-sleeve')) await playGiantSleeve({page,engine,use,waitMap,close});
  else if(process.argv.includes('--courier-lift')) await playCourierLift({page,engine,use,close,waitMap,records:load('courier-case-records.json')});
  else if(process.argv.includes('--field-invitation')) await playFieldInvitation({page,engine,close,waitMap});
  else if(process.argv.includes('--petal-house')) await playPetalHouse({page,engine,use,waitMap,close});
  else if(originIndex!==-1) await playOriginTour({page,engine,origin,use,close,waitMap});
  else if(process.argv.includes('--first-perches')) await playFirstPerches({page,engine,use,button,waitMap,close});
  else if(process.argv.includes('--picture-ferry')) await playPictureFerry({page,engine,use,button,waitMap,close});
  else if(process.argv.includes('--plum-orchard')) await playPlumOrchard({page,engine,use,button,waitMap,close});
  else if(supperOnly) await playSupperShadow({page,engine,use,button,waitMap,close});
  else if(notesOnly) await playRecordNotes({page,engine,waitMap,use,close,button});
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
  else if(drawerIndex!==-1) await playRegisterDrawers({page,engine,start:Number(process.argv[drawerIndex+1]),count:Number(process.argv[drawerIndex+2]),posts,works:load('night-register.json'),waitMap,use,button,close});
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
  console.log(engine, browser.version(), process.argv.includes('--return-coat') ? 'passed both coats, three arrangements and the hidden landing' : process.argv.includes('--pocket-theatre') ? 'passed both streets in every chapter and resumed the returning case' : process.argv.includes('--claim-bell') ? 'passed both hearings and the return to the spare pot' : process.argv.includes('--east-well') ? 'passed both deliveries at the well' : process.argv.includes('--river-names') ? 'passed the two-address river walk' : process.argv.includes('--hatch-sleeve') ? 'passed the working hatch and the receiving sleeve' : process.argv.includes('--calling-book') ? 'passed the calling book’s signed and open visits' : process.argv.includes('--second-ink') ? 'passed the travelling moth and changing rival' : process.argv.includes('--open-house') ? 'passed the living inn and three field handovers' : process.argv.includes('--walking-orchard') ? 'passed the walking orchard, two historic guests and dated orchard reading export' : process.argv.includes('--tide-clock') ? 'passed the quarter house, hidden stair and two shifts' : process.argv.includes('--ferry-radio') ? 'passed the ferry studio and island broadcast' : process.argv.includes('--lens-loan') ? 'passed the loan loft, both stamp recoveries and stage lamp' : process.argv.includes('--turning-stacks') ? 'passed the suitcase floor, both lamps and the saved edition' : process.argv.includes('--first-cup') ? 'passed both cocoa stops, offers, gauges and sign faces' : process.argv.includes('--museum-articles') ? 'passed the earned bookplate and its two export links' : process.argv.includes('--street-almanac') ? 'passed the issued score and both entrances' : process.argv.includes('--ribbon') ? 'passed journal ribbon, resume and export' : process.argv.includes('--giant-sleeve') ? 'passed both fits, hinge packets, rigging choices and sisters’ entrances' : process.argv.includes('--courier-lift') ? 'passed two collection quests, both counterweight landings, revised receipts and the family stair' : process.argv.includes('--field-invitation') ? 'passed voluntary field invitations, focus and resume' : originIndex!==-1 ? 'passed the origin instrument, save recovery and returning keeper' : process.argv.includes('--petal-house') ? 'passed the flower windows, late watches, both audiences and Merian’s return' : process.argv.includes('--picture-ferry') ? 'passed the two-window performances and evening programme' : process.argv.includes('--first-perches') ? 'passed three moth homes, six receiver decisions, two bakery trays and the market correction' : process.argv.includes('--plum-orchard') ? 'passed the orchard workshop and four performance returns' : drawerIndex!==-1 ? 'passed drawer collection and recovery' : supperOnly ? 'Supper for a Shadow' : notesOnly ? 'passed record invitations, photo cover and text-only participation' : loanOnly ? 'passed four receiving benches, two carried replies and four reader routes' : birdOnly ? 'passed the folding flock, gallery, Two-Tide Dock and Sora’s returned key' : scoreOnly ? 'passed registered panels, task music, feedback and mute' : hearingsOnly ? 'passed four town hearings, two witnesses in each and four cross-town amendments' : lightsOnly ? 'passed all sixteen world grades, high contrast and reduced effects' : shelvesOnly ? 'passed four diary shelves, word histories and earned cross-area memories' : whistleOnly ? 'passed Liri’s three watches, travelling sheet and recall' : exitOnly ? 'passed all four exit signal orders, retry and reload' : guestIndex!==-1 ? 'passed both encounters in all 15 chapters and restored the guest’s work' : vaultOnly ? 'passed the six vault instruments, weir and council handover' : millOnly ? 'passed the six-counter mill and both earned passages' : makerOnly ? 'passed three instruments and six handovers' : coatOnly ? 'passed the travelling coat and both endings' : registerOnly ? 'passed the night register journey' : shiftOnly ? 'passed the Emberford shift' : bellOnly ? 'passed the kitchen bell journey' : 'passed both endings at each of five physical stations');
} finally {
  await browser.close();
}
