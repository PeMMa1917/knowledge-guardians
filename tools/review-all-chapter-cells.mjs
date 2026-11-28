// Walk the paged family tables in the rendered document. Check the address on each real checkbox.
import assert from 'node:assert/strict';
export async function reviewAllChapterCells(browser, engine, url) {
  const context = await browser.newContext({ viewport: {width: engine === 'webkit' ? 390 : 1280, height: 820} });
  try {
    const page = await context.newPage();
    const base = ['story:11','game:22','concept:evidence','framework:ethics','theme:knower'];
    const query = new URLSearchParams({chapter: '1'});
    for (const member of base) query.append('member',member);
    await page.goto(url + '#review?' + query);
    await page.locator('html[data-review-ready="true"]').waitFor();
    const catalogue = await page.locator('#atlasData').evaluate(node => JSON.parse(node.textContent).members.map(m=>[m.kind, m.id]));
    const families = [...new Set(catalogue.map(([kind])=>kind))];
    await page.locator('#matrix > summary').click();
    let cells = 0, pages = 0;
    for(let chapter = 1; chapter <= 15; chapter++) {
      await page.selectOption('#chapter', String(chapter));
      let rowCount = 0;
      for (const kind of families) {
        await page.selectOption('#matrixKind', kind);
        const ids = catalogue.filter(([family])=>family === kind).map(([,id])=>id);
        const result = await page.evaluate(async ({ids,base,chapter}) => {
          const blooms = ['remember','understand','apply','analyse','evaluate','create'];
          const fail = (id, issue) => { throw Error('Chapter '+chapter+' '+id+' '+issue); };
          let offset = 0, pages = 0, cells = 0;
          do {
            const rows = document.querySelectorAll('#matrixTable tbody tr');
            if (!rows.length) fail(ids[offset], 'has no rendered members.');
            for (const row of rows) {
              const id = ids[offset++];
              if (!id || !row.querySelector('th button').textContent.endsWith(' · '+id))
                fail(id, 'has the wrong row heading.');
              const keys = [...new Set([...base,id])].sort();
              const boardKey = JSON.stringify([chapter,keys,null]);
              const boxes = row.querySelectorAll('input[type=checkbox]');
              if (boxes.length!==24) fail(id,'is missing a cognitive control.');
              for (let index=0; index<24; index++) {
                const bloom=blooms[Math.floor(index/4)], dok=1+(index%4), box=boxes[index];
                if (box.checked || box.disabled || box.getAttribute('aria-label')!==id+' '+bloom+' DOK '+dok ||
                    box.dataset.reviewCell!==JSON.stringify([boardKey,bloom,dok])) fail(id,'has the wrong status, target or accessible name for '+bloom+' at '+dok+'.');
                cells++;
              }
            }
            pages++;
            const next = document.getElementById('nextRows');
            if (next.disabled) break;
            if (offset>=ids.length) fail(ids.at(-1),'has an extra page.');
            next.click();
            if (pages % 16 === 0) await new Promise(resolve => setTimeout(resolve,0));
          } while (true);
          if (offset!==ids.length) fail(ids[offset],'was never shown.');
          return {cells,pages,rows:offset};
        }, {ids,base,chapter});
        rowCount+=result.rows; cells+=result.cells; pages+=result.pages;
      }
      assert.equal(rowCount,catalogue.length);
      console.log(JSON.stringify({engine,chapter,rows:rowCount,checkedPositions:rowCount*24,throughChapter:cells,pages}));
    }
    assert.equal(cells,catalogue.length*15*24);
  } finally { await context.close(); }
}
