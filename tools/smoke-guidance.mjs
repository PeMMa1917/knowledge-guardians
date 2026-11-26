/** Check contextual clues and blocked-action feedback without leaving a real practice panel. */
export async function smokeGuidance(browser, { button, press, until }) {
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await browser.evaluate(() => {
    const { controller, world, settings } = window.kg;
    settings.textScale = 1.75;
    document.documentElement.style.setProperty('--text-scale', '1.75');
    controller.state.objectivesDone.push('island.arrival');
    controller.state.events.next = Number.MAX_SAFE_INTEGER;
    world.changeMap('island.model-records', 22, 8);
  });
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'island.model-records' && !window.kg.world.transitioning), 'Model Records Room');
  async function use(id) {
    await until(() => browser.evaluate((id) => {
      const { world, controller } = window.kg;
      const prop = world.map.interactables.find((candidate) => candidate.id === id && controller.check(candidate.visibleIf));
      if (!prop || world.blocked[prop.y + 1]?.[prop.x] !== false) return false;
      world.path = [];
      world.pendingInteract = null;
      world.player.sprite.setPosition(prop.x * 16 + 8, (prop.y + 1) * 16 + 12);
      world.player.facing = 'up';
      world.updateTarget();
      return world.target?.obj?.id === id;
    }, id), 'approach ' + id);
    await press(browser, 'e');
  }
  await use('model-record-case-theseus');
  await until(() => browser.evaluate(() => document.querySelector('[role="dialog"].exhibit')?.textContent.includes('2007.030.001')), 'inspect Theseus');
  await press(browser, 'Escape');
  await use('model-record-tool-theseus');
  await button(browser, 'Clear the route and release the mouse');
  await until(() => browser.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog?.querySelector('.model-record-trial')?.textContent.includes('10 moves') && !dialog.querySelector('.work-guide')?.open;
  }), 'first run remains visible next to folded assistance');
  await browser.evaluate(() => document.querySelector('.work-guide summary').click());
  await until(() => browser.evaluate(() => {
    const select = document.querySelector('.work-guide select');
    if (![...select?.options ?? []].some(({ value }) => value === 'model-record.theseus.handed')) return false;
    select.value = 'model-record.theseus.handed';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }), 'help for the selected case');
  await button(browser, 'Show a clue');
  for (let depth = 2; depth <= 4; depth++) await button(browser, 'A clearer clue');
  await until(() => browser.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog.querySelector('.work-guide [role="status"]').textContent.includes('hand over') &&
      dialog.querySelector('.model-record-trial').textContent.includes('10 moves') &&
      dialog.scrollWidth <= dialog.clientWidth + 1;
  }), 'four hints and an unchanged trial at 390 CSS pixels');
  const prior = await browser.evaluate(() => window.kg.controller.state.inventory['item.specimen.mit-museum:2007.030.001'] ?? 0);
  await browser.evaluate(() => window.kg.controller.dispatch({ type: 'ClaimSpecimen', exhibit: 'OBJ-MODEL-RECORD-theseus' }));
  await until(() => browser.evaluate((prior) => document.querySelector('[role="dialog"] .work-feedback')?.textContent.includes('quest first') &&
    (window.kg.controller.state.inventory['item.specimen.mit-museum:2007.030.001'] ?? 0) === prior, prior), 'blocked claim gives in-place feedback and preserves the satchel');
  await button(browser, 'Reconnect the saved route and release the mouse');
  await until(() => browser.evaluate(() => [...document.querySelectorAll('[role="dialog"] button')].some((control) =>
    control.textContent.trim() === 'Send the checked guide to the scale' && !control.disabled)), 'continue the same trial after help');
  console.log('PASS all four contextual Lumen clues, inline blocked-action feedback, 175% text at 390px, and successful continuation of the same trial. Island arrival staged.');
}
