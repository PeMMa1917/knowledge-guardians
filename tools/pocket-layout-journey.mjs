/** Reflow, focus and dismissal through actual rendered controls. Dimensions are CSS pixels, including landscape. */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const pw = createRequire(process.env.KG_PLAYWRIGHT_PACKAGE || import.meta.url)('playwright');
const [engine = 'chromium', url = 'http://127.0.0.1:4173', range = 'full'] = process.argv.slice(2);
const sizes =
  range === 'small'
    ? [[320, 568]]
    : range === 'wide'
      ? [[1280, 800]]
      : [
          [320, 568],
          [360, 640],
          [390, 844],
          [412, 915],
          [568, 320],
          [667, 375],
          [768, 1024],
          [820, 1180],
          [1024, 768],
          [1280, 800],
          [1440, 900],
          [1920, 1080],
        ];
const sections = [
  'diary',
  'notes',
  'open-quests',
  'story',
  'conversations',
  'letters',
  'entries',
  'cards',
  'sources',
  'stones',
  'lore',
  'portfolio',
  'moments',
  'skills',
  'lorelings',
  'awards',
  'crossings',
  'atlas',
  'glossary',
  'views',
  'bestiary',
];
const faults = [],
  failures = [];
const browser = await pw[engine].launch(
  engine === 'chromium'
    ? {
        executablePath: process.env.KG_CHROMIUM || undefined,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      }
    : { headless: true },
);
try {
  const page = await browser.newPage({ viewport: { width: 820, height: 900 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => faults.push(String(e)));
  await page.addInitScript(() =>
    localStorage.setItem(
      'kg.settings',
      JSON.stringify({ reducedMotion: true, reducedEffects: true, zenMode: true, musicVolume: 0, sfxVolume: 0 }),
    ),
  );
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const press = async (b) => {
    await b.focus();
    await b.press('Enter');
  };
  await press(page.getByRole('button', { name: /New game/ }).first());
  await press(page.getByRole('button', { name: 'Begin', exact: true }));
  const dialog = page.getByRole('dialog');
  await dialog
    .getByText(/brass fish/)
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.kg?.world?.map?.id === 'nexus.archive' && !kg.world.transitioning);
  let count = 0;
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const scale of [1, 1.75]) {
      await page.evaluate((scale) => {
        kg.settings.textScale = scale;
        document.documentElement.style.setProperty('--text-scale', String(scale));
      }, scale);
      for (const screen of [...sections, '@frame', '@map']) {
        // Set only the location/page fixture. The assertions use the actual panel, text boxes and focus controls.
        await page.evaluate((screen) => {
          if (screen === '@frame') kg.ui.openPuzzle('painters-frame');
          else if (screen === '@map') kg.ui.openMap();
          else kg.ui.openJournal(screen);
        }, screen);
        await dialog.waitFor();
        // The map first opens with an unfolding notice while the game camera captures the floor.
        if (screen === '@map') await dialog.getByRole('button', { name: 'Mark this spot', exact: true }).waitFor();
        const result = await dialog.evaluate(async (el) => {
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const rect = el.getBoundingClientRect(),
            doc = document.documentElement;
          const hasSpace = (node) => {
            if (
              node.closest('[hidden], [inert]') ||
              !node.getClientRects().length ||
              getComputedStyle(node).visibility !== 'visible'
            )
              return false;
            for (
              let d = node.closest('details:not([open])');
              d;
              d = d.parentElement?.closest('details:not([open])')
            ) {
              if (!d.querySelector(':scope > summary')?.contains(node)) return false;
            }
            return true;
          };
          const controls = Array.from(
            el.querySelectorAll('button,summary,select,a[href],textarea,input:not([type="hidden"]),[tabindex]'),
          ).filter((node) => hasSpace(node) && !node.matches(':disabled') && node.tabIndex >= 0);
          const overflow = Math.max(0, el.scrollWidth - el.clientWidth, doc.scrollWidth - doc.clientWidth);
          const outside = rect.left < -2 || rect.right > innerWidth + 2;
          const neighbors =
            overflow > 2
              ? Array.from(el.querySelectorAll('*'))
                  .filter(
                    (node) =>
                      hasSpace(node) &&
                      node.getBoundingClientRect().right > rect.right + 2 &&
                      (!node.parentElement || node.parentElement.getBoundingClientRect().right <= rect.right + 2),
                  )
                  .slice(0, 4)
                  .map((node) =>
                    (node.className?.baseVal ?? node.className ?? node.tagName).toString().slice(0, 90),
                  )
              : [];
          // A tab strip or a two-dimensional map may own its own interior scroll. The dialogue itself must reflow.
          const target = controls.at(-1);
          if (target) target.focus();
          if (controls.length) {
            controls[0].setAttribute('data-layout-first', '');
            target.setAttribute('data-layout-last', '');
          }
          return {
            overflow,
            outside,
            neighbors,
            controls: controls.length,
            focus: !!target && document.activeElement === target,
          };
        });
        // Real Tab events must wrap in both directions even when the last entry contains a closed disclosure.
        await page.keyboard.press('Tab');
        const activeAfter = (marker) =>
          page.evaluate((marker) => {
            const box = document.querySelector('[role="dialog"]');
            const expected = box?.querySelector('[' + marker + ']');
            return {
              matches: Boolean(expected && document.activeElement === expected),
              marked: Boolean(expected),
              box: box?.getAttribute('aria-label'),
              active: document.activeElement?.textContent?.trim().slice(0, 45),
              activeTag: document.activeElement?.tagName,
              activeId: document.activeElement?.id,
            };
          }, marker);
        const afterTab = await activeAfter('data-layout-first');
        const wrapped = afterTab.matches;
        await page.keyboard.press('Shift+Tab');
        const afterReverse = await activeAfter('data-layout-last');
        const reversed = afterReverse.matches;
        if (!wrapped || !reversed) Object.assign(result, { afterTab, afterReverse });
        Object.assign(result, { wrapped, reversed });
        if (result.overflow > 2 || result.outside || !result.focus || !wrapped || !reversed) {
          const failure = { engine, width, height, scale, screen, ...result };
          failures.push(failure);
          console.log('POCKET-ISSUE', JSON.stringify(failure));
        }
        if (!wrapped || !reversed)
          await page.evaluate(() => document.querySelector('[role=dialog] button')?.focus());
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden', timeout: 8000 }).catch(async (error) => {
          console.log(
            'Dismissal failed',
            engine,
            width,
            height,
            scale,
            screen,
            await page.evaluate(() => document.querySelector('[role=dialog]')?.getAttribute('aria-label')),
          );
          throw error;
        });
        count++;
      }
      console.log('POCKET-SIZE', engine, width, height, scale, 'completed', count, 'issues', failures.length);
    }
  }
  console.log('POCKET-RESULT', engine, browser.version(), count, 'issues', failures.length, 'page errors', faults);
  assert.deepEqual(faults, []);
  assert.equal(failures.length, 0);
} finally {
  await browser.close();
}
