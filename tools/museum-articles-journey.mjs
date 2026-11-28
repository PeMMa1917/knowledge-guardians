import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { playRegisterDrawers } from './register-drawers-journey.mjs';

export async function playMuseumArticles(context) {
  const { page, engine, close } = context;
  const dialog = page.getByRole('dialog');
  async function diary() {
    await page.keyboard.press('j');
    await dialog.getByRole('tab', { name: 'Diary', exact: true }).click();
    const section = dialog.locator('details').filter({has: page.locator('summary', {hasText:'Wikipedia lookups from my encounters'})});
    await section.locator('summary').focus();
    await section.locator('summary').press('Enter');
    return section;
  }
  const before = await diary();
  assert.equal(await before.getByRole('link').count(), 0);
  await close();
  const index = context.works.findIndex(record => record.id === 182775);
  await playRegisterDrawers({...context, start:index, count:1});
  const resume = dialog.getByRole('button',{name:'Continue playing',exact:true});
  if (await resume.isVisible()) await resume.click();
  const after = await diary();
  const article = after.getByRole('link',{name:'Related Wikipedia article · catalogued artist · Nathaniel Hurd',exact:true});
  assert.equal(await article.getAttribute('href'),'https://en.wikipedia.org/wiki/Nathaniel_Hurd');
  assert.match(await after.textContent(),/Inspected · Harvard College Bookplate/);
  const [exported] = await Promise.all([page.waitForEvent('download'),dialog.getByRole('button',{name:'Download journal (.docx)'}).click()]);
  const content = unzipSync(new Uint8Array(await readFile(await exported.path())));
  const doc = strFromU8(content['word/document.xml']), links=strFromU8(content['word/_rels/document.xml.rels']);
  assert.match(doc,/catalogued artist · Nathaniel Hurd/);
  assert.match(links,/https:\/\/en.wikipedia.org\/wiki\/Nathaniel_Hurd/);
  assert.match(links,/art-object-page\.182775\.html/);
  assert.doesNotMatch(links,/Maurice_Prendergast|1954\.337/);
  console.log('MUSEUM-ARTICLE',engine,'earned Harvard bookplate, labelled artist and institutional citation recovered and exported');
}
