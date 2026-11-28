import assert from 'node:assert/strict';

export async function playEastWell({ page, engine, use, waitMap, close }) {
  const dialog = page.getByRole('dialog');
  const trial = engine !== 'chromium';
  const late = engine === 'webkit';
  async function press(name) {
    const option = dialog.getByRole('button', { name }).first();
    await option.focus();
    await option.press('Enter');
  }
  async function read(who, words) {
    await use(who);
    await dialog.getByText(words).first().waitFor();
    await close();
  }

  await page.evaluate(() => kg.world.changeMap('aethelgard.emberford', 18, 22));
  await waitMap('aethelgard.emberford');
  await read('rope-west', /On the west stick/);
  await read('rope-east', /east stick has a small sun/);
  await use('well-keeper');
  await press(/What do you need/);
  await close();
  await read('fruit-seller', /I chalked the H/);
  await read('smith-hesper', /Two buckets from the west well/);
  await use('well-keeper');
  await press(trial ? /use less water/ : /Measure both wells/);
  await dialog.getByText(trial ? /hang the ladle upside down/ : /keep.*usual shifts/i).first().waitFor();
  await close();
  await use('well-keeper');
  await press(/not sure how much/);
  await close();
  await use('guildmaster-orrin');
  await press(trial ? /three short-draw days/ : /three dawn entries/);
  await dialog.getByText(trial ? /jar caught rain/ : /usual two buckets/).first().waitFor();
  await press(/Continue/);
  await press(/while I think/);
  assert.equal(await page.evaluate(() => kg.controller.state.flags['well.shared']), undefined);

  await use('guildmaster-orrin');
  await press(trial ? /three short-draw days/ : /three dawn entries/);
  await press(/Continue/);
  await press(late ? /porters/ : /soup kettle/);
  await press(late ? /Keep the closing/ : /Keep the dawn/);
  await dialog.locator('.two-reply').first().waitFor();
  assert.equal(await dialog.locator('.two-reply').count(), 2);
  await press(/Keep walking/);
  await use('well-keeper');
  await dialog.getByText(late ? /served the broth late/ : /porter turning the lid/).first().waitFor();
  await press(/change its bell/);
  await press(late ? /soup kettle/ : /porters/);
  await press(late ? /Keep the dawn/ : /Keep the closing/);
  const state = await page.evaluate(() => ({
    plan: kg.controller.state.flags['well.plan'],
    turn: kg.controller.state.flags['well.jug'],
    complete: kg.controller.state.objectivesDone.includes('well.o5.show'),
  }));
  assert.deepEqual(state, { plan: trial ? 'trial' : 'measure', turn: late ? 'dawn' : 'late', complete: true });
  console.log('EAST WELL', engine, state.plan, 'both dawn readings, deferred the jug and changed its turn to', state.turn);
}
