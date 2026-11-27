/** Exercise the result screens that change size with the crate labels and ferry prediction. */
export async function smokeFieldGames(browser, { button, press, until }) {
  async function checkPanel() {
    const problem = await browser.evaluate(() => {
      const panel = document.querySelector('[role="dialog"]');
      if (panel.scrollWidth > panel.clientWidth + 1) return 'The result requires horizontal scrolling';
      const close = panel.querySelector('.close').getBoundingClientRect();
      const title = document.createRange();
      title.selectNodeContents(panel.querySelector('h2'));
      const overlaps = [...title.getClientRects()].some((line) =>
        line.top < close.bottom && line.bottom > close.top && line.left < close.right && line.right > close.left);
      return overlaps ? 'Close overlaps a line of the title' : null;
    });
    if (problem) throw new Error(problem);
  }

  for (const width of [320, 390]) {
    await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await browser.evaluate(async () => {
      await document.fonts.ready;
      window.kg.settings.textScale = 1.75;
      document.documentElement.style.setProperty('--text-scale', '1.75');
      window.kg.ui.openFieldGame('doors');
      document.querySelector('.door-crate').focus();
    });
    await press(browser, 'Enter');
    await button(browser, 'Stay with crate 1');
    await checkPanel();
    const visibleCrates = await browser.evaluate(() => {
      const panel = document.querySelector('[role="dialog"]').getBoundingClientRect();
      const labels = [...document.querySelectorAll('.door-crate .door-show')];
      return labels.length === 3 && labels.every((label) => {
        const range = document.createRange();
        range.selectNodeContents(label);
        const crate = label.closest('button').getBoundingClientRect();
        return crate.left >= panel.left && crate.right <= panel.right &&
          [...range.getClientRects()].every((line) => line.left >= crate.left - 1 && line.right <= crate.right + 1);
      });
    });
    if (!visibleCrates) throw new Error('Crate or result text clipped at ' + width);
    await press(browser, 'Escape');

    for (const useMarker of [false, true]) {
      await browser.evaluate(() => window.kg.ui.openFieldGame('guests'));
      await checkPanel();
      if (useMarker) {
        await browser.evaluate(() => document.querySelector('.bench-panel input[type="range"]').focus());
        await press(browser, 'End');
        await until(() => browser.evaluate(() => document.querySelector('input[type="range"]').value === '200'), 'maximum ferry marker');
      }
      await button(browser, useMarker ? 'Set the marker and open the book' : 'Open the book for the first boat');
      await button(browser, 'Read the next twenty boats');
      await checkPanel();
      const readable = await browser.evaluate((marked) => {
        const chart = document.querySelector('.guest-chart');
        const bounds = chart.viewBox.baseVal;
        const boats = [...chart.querySelectorAll('rect')];
        const line = chart.querySelector('line.guess');
        const inside = [...chart.querySelectorAll('text')].every((text) => {
          const box = text.getBBox();
          return box.x >= bounds.x && box.y >= bounds.y &&
            box.x + box.width <= bounds.x + bounds.width && box.y + box.height <= bounds.y + bounds.height;
        });
        return boats.length === 20 && inside && Boolean(line) === marked &&
          (!marked || boats.every((boat) => Number(boat.getAttribute('y')) > Number(line.getAttribute('y1'))));
      }, useMarker);
      if (!readable) throw new Error('Ferry chart clipped or mis-scaled at ' + width + ', marker ' + useMarker);
      await press(browser, 'Escape');
    }
    console.log('PASS two field games, readable headings, three crate results and both ferry charts at ' + width + 'px and 175% text');
  }
}
