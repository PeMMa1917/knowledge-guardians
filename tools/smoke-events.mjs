/** Drives a real Calm invitation, browser reload, and ordinary event dialogue controls. */
export async function smokeEvents(browser, { button, press, until }) {
  const wait = (fn, description, data) => until(() => browser.evaluate(fn, data), description);
  async function confirmDeferred(resolved = 0) {
    await wait((completed) => {
      const { events, flags } = window.kg.controller.state;
      return !events.pending && events.seen.length === completed && Number(flags['count.events'] ?? 0) === completed
        && !document.querySelector('[role="dialog"]');
    }, 'Escape defers without counting', resolved);
  }
  async function reopenOffer(id) {
    // Select the named reward-bearing event in the fixture to exercise its entry effect.
    await browser.evaluate((id) => {
      const { controller } = window.kg;
      controller.state.events.pending = id;
      controller.suspend('Calm invitation pending');
    }, id);
    await browser.send('Page.reload', { ignoreCache: true });
    await until(() => browser.evaluate(() =>
      !!window.kg && [...document.querySelectorAll('button strong')].some(({ textContent }) => textContent === 'Continue'),
    ).catch(() => false), 'Continue on the reloaded title');
    await browser.evaluate(() => { window.kg.settings.calmMode = true; });
    await button(browser, 'Continue');
    await button(browser, 'Continue playing');
    await wait((event) => window.kg.controller.state.events.pending === event && !!document.querySelector('[role="dialog"].event'),
      'same saved event returns after the recap', id);
  }

  await browser.evaluate(() => {
    const { controller, settings } = window.kg;
    settings.calmMode = true;
    for (let i = 0; i < 16 && !controller.state.events.pending; i++) controller.dispatch({ type: 'Explore', seconds: 60 });
  });
  await wait(() => !!document.querySelector('[role="dialog"].event'), 'the exploration clock offers a Calm invitation');
  await press(browser, 'Escape');
  await confirmDeferred();

  const tokens = 'EV-N05';
  await reopenOffer(tokens);
  await button(browser, 'Now');
  await wait(() => window.kg.controller.state.marks === 5 && !!document.querySelector('[role="dialog"].dialogue'),
    'the reward node applies its five marks');
  await press(browser, 'Escape');
  await confirmDeferred();
  await wait(() => window.kg.controller.state.flags['event.resume.EV-N05'] === 'ev.tokens', 'the viewed dialogue node is remembered');

  await reopenOffer(tokens);
  await button(browser, 'Now');
  await wait(() => !!document.querySelector('[role="dialog"].dialogue') && window.kg.controller.state.marks === 5,
    'the original node resumes without duplicating its marks');
  await button(browser, 'Close');
  await wait((id) => {
    const { events, flags, marks } = window.kg.controller.state;
    return !events.pending && events.seen.length === 1 && events.seen[0] === id && flags['count.events'] === 1
      && marks === 5 && !flags['event.resume.' + id];
  }, 'normal dialogue resolves the saved event once', tokens);
  const correction = 'EV-N03';
  await reopenOffer(correction);
  await button(browser, 'Now');
  await wait(() => {
    const question = [...document.querySelectorAll('[role="dialog"].dialogue .options button')].find(
      (control) => control.textContent.includes('If an expert can be wrong'),
    );
    if (!question) return false;
    question.click();
    return true;
  }, 'choose a distinct event branch');
  const atReply = () => document.querySelector('[role="dialog"].dialogue')?.textContent.includes('Fair question.');
  await wait(atReply, 'Tull answers the chosen question');
  await press(browser, 'Escape');
  await confirmDeferred(1);
  await reopenOffer(correction);
  await button(browser, 'Now');
  await wait(atReply, 'reopen at the same reply, without replaying the earlier choice');
  await button(browser, 'Continue ▸');
  await button(browser, 'Close');
  await wait((event) => {
    const { events, flags } = window.kg.controller.state;
    return !events.pending && events.seen.includes(event) && flags['count.events'] === 2;
  }, 'the resumed second event resolves once', correction);
  console.log('PASS Calm Escape in invitation and dialogue, real browser reload and Continue, and one award of marks, and the exact chosen dialogue reply');
}
