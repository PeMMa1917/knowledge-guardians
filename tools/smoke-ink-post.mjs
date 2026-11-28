import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { strFromU8, unzipSync } from 'fflate';

// Exercise the real interaction, reflection editor, download and print paths on a new save.
export async function smokeInkPost(browser, { button, press, until }) {
  const folder = await mkdtemp(join(tmpdir(), 'kg-diary-export-'));
  try {
    await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: folder });
    await until(() => browser.evaluate(() => {
      const w = window.kg.world;
      const prop = w.map.interactables.find((p) => p.id === 'ink-post.archive');
      if (!prop || w.blocked[prop.y + 1]?.[prop.x] !== false || w.transitioning) return false;
      w.player.sprite.setPosition(prop.x * 16 + 8, (prop.y + 1) * 16 + 12);
      w.player.facing = 'up';
      w.updateTarget();
      return w.target?.obj?.id === prop.id;
    }), 'approach the Archive Hall post');
    await press(browser, 'e');
    async function choose(label) {
      await until(() => browser.evaluate((label) => {
        const choice = [...document.querySelectorAll('[role="dialog"] .options button')].find((b) => b.textContent.endsWith(label));
        choice?.click();
        return !!choice;
      }, label), 'choose ' + label);
    }
    await choose('Unfold a bird from this roost');
    await choose('The thread behind the ceiling · Gārgī Vāchaknavī');
    await choose('Follow one thread to its peg');
    await press(browser, 'Escape');
    await press(browser, 'j');
    const question = 'Which part of the ceiling could you still explain if the peg fell out?';
    const answer = 'I could explain the corner that fell when I pulled the peg.';
    await until(() => browser.evaluate(({ question, answer }) => {
      const label = [...document.querySelectorAll('.diary-reflection label')].find((l) => l.textContent === question);
      if (!label) return false;
      label.closest('details').open = true;
      const field = label.control;
      field.focus();
      field.value = answer;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.blur();
      return true;
    }, { question, answer }), 'answer the specific reflection');
    await button(browser, 'Download journal (.docx)');
    const name = await until(async () => (await readdir(folder)).find((n) => n.endsWith('.docx')), 'Word download');
    const files = unzipSync(await readFile(join(folder, name)));
    const xml = strFromU8(files['word/document.xml']);
    const links = strFromU8(files['word/_rels/document.xml.rels']);
    assert.ok(xml.includes(answer) && xml.includes(question) && xml.includes('Wikipedia'));
    const article = '/wiki/' + encodeURIComponent('Gārgī_Vāchaknavī');
    assert.ok(links.includes(article));
    assert.ok(!links.includes('/wiki/Brahmagupta'));

    // Keep the page available for Chromium's native PDF renderer in headless mode.
    await browser.evaluate(() => { window.print = () => window.dispatchEvent(new Event('beforeprint')); });
    await button(browser, 'Print or save as PDF');
    const printed = await browser.evaluate(() => {
      const copy = document.querySelector('.adventure-print');
      return { prose: copy.textContent, links: [...copy.querySelectorAll('a')].map((a) => a.href) };
    });
    assert.ok(printed.prose.includes(answer) && printed.prose.includes(question));
    assert.ok(printed.links.some((url) => url.endsWith(article)));
    assert.ok(!printed.links.some((url) => url.endsWith('/wiki/Brahmagupta')));
    const pdf = await browser.send('Page.printToPDF', { printBackground: true });
    assert.equal(Buffer.from(pdf.data, 'base64').subarray(0, 5).toString(), '%PDF-');
    console.log('PASS Archive Hall encounter, player-written reflection, encounter-limited article links in Word and print, and native Chromium PDF generation.');
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}
