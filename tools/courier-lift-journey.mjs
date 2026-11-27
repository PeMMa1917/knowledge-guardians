import assert from 'node:assert/strict';

export async function playCourierLift({page,engine,use,close,waitMap,records}) {
  const dialog=page.getByRole('dialog'), panel=dialog.locator('.courier-panel');
  async function hit(label) {
    const action=dialog.getByRole('button',{name:label,exact:typeof label==='string'}).first();
    await action.focus(); await action.press('Enter');
  }
  async function go(map,x=12,y=12) {
    await page.evaluate(({map,x,y})=>{
      if(kg.world.map.id!==map) kg.world.changeMap(map,x,y);
    },{map,x,y});
    await waitMap(map);
  }
  async function leaveDesk() {
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>{
      const box=document.querySelector('[role=dialog]');
      return !box || box.classList.contains('two-replies');
    });
    const neighbours=page.locator('[role=dialog].two-replies');
    if(await neighbours.isVisible()) await close();
  }
  async function inspect(id) {
    await use(id);await dialog.waitFor();
    if(id==='nexus-fold-green') await hit('Read the text');
    await leaveDesk();
  }
  async function take(id,record) {
    assert.equal(await page.evaluate(o=>kg.controller.state.objectivesDone.includes(o),record.objective),true,'Earned original job '+record.objective);
    await use(id);await hit('Take this object');await leaveDesk();
    await page.keyboard.press('i');
    await hit('Use '+record.title);
    await close();
  }
  // Start after initial label training and arrival in Emberford. Both original earning jobs are played below.
  await page.evaluate(()=>{
    kg.settings.reducedMotion=true;kg.settings.reducedEffects=true;
    kg.controller.state.objectivesDone.push('m01.o6.label','m02.o1.arrive');
    kg.world.refreshWorld();
  });
  const books=records.slice(0,2);
  await go('nexus.archive');
  await inspect('nexus-fold-century');await inspect('nexus-fold-green');
  await inspect('nexus-fold-porch'); await inspect('nexus-fold-receipt');
  await take('nexus-fold-century',books[0]);
  const order=engine==='webkit'?['theatre','market']:['market','theatre'];
  for (let n=0;n<2;n++) {
    const book=books[n],land=order[n];
    if(n===1) {
      await go('aethelgard.emberford',20,14);
      await use('ember-drawer-cases');
      for (let i=0;i<6;i++) {
        const flap=dialog.locator('button[data-face]').nth(i);
        await flap.focus();await flap.press('Enter');
      }
      await close();
      await take('ember-bertrand',book);
    }
    await go('nexus.specimen-vault',10,9);
    await use('courier-cradle');await panel.waitFor();
    const send=land==='market'?'Address the market counter':'Address the theatre door';
    assert.equal(await panel.getByRole('button',{name:send}).isDisabled(),true);
    await hit(book.handles[0].name);await hit(book.handles[2].name);await hit(send);
    assert.ok((await panel.innerText()).includes('waiting for delivery'));
    await close();
    await go(land==='market'?'market.square':'stage.foyer');
    await use('courier-'+land);
    await hit(land==='market'?'Let the carrier speak first':'Give the first line to the witness');
    assert.ok((await panel.innerText()).includes(book.handles[2].callback));
    await close();
    if(n===0){
      await page.reload({waitUntil:'domcontentloaded'});
      const resume=page.getByRole('button',{name:/^Continue\b/}).first();
      await resume.focus();await resume.press('Enter');
      await waitMap(land==='market'?'market.square':'stage.foyer');
      await hit('Continue playing');
      await use('courier-'+land);
      assert.ok((await panel.innerText()).includes(book.limit));await close();
    }
    await go('nexus.specimen-vault');
    await use('courier-cradle');await hit(book.handles[1].name);await hit(send);
    assert.ok((await panel.innerText()).includes('waiting for delivery'));
    assert.equal(await panel.locator('img').evaluate(im=>im.complete && im.naturalWidth>0),true);
    assert.ok(await panel.evaluate(p=>p.scrollWidth<=p.clientWidth+1));
    await close();
    await go(land==='market'?'market.square':'stage.foyer');
    await use('courier-'+land);
    await hit(land==='market'?'Open the crate for the clerk':'Put the object in the light first');
    assert.ok((await panel.innerText()).includes(land==='market'?book.west:book.east));
    await close();
  }
  await go('nexus.specimen-vault');
  await use('courier-hatch');await waitMap('nexus.counterweight');
  await use('courier-pella');await hit('Turn over the old schedule.');
  const bell=engine==='firefox';
  await hit(bell?/Knot a second cord/:/Put the three fees/);
  await close();
  await go(order[1]==='market'?'market.square':'stage.foyer');
  await use('courier-'+order[1]);
  assert.ok((await panel.innerText()).includes(bell?'cord':'envelope') || (await panel.innerText()).includes('Nemi'));
  const diary=await page.evaluate(keys=>{
    const s=kg.controller.state;
    return {coins:s.flags['courier.family'],owned:keys.map(k=>s.inventory['item.specimen.'+k]),
      sources:[...new Set(s.adventureDiary.entries.filter(e=>e.event?.key.startsWith('courier:')).flatMap(e=>e.event.sourceIds))].sort()};
  },books.map(r=>r.key));
  assert.deepEqual(diary,{coins:bell?'bell':'receipt',owned:[1,1],sources:books.map(r=>r.source).sort()});
  console.log('COUNTERWEIGHT',engine,books.map(r=>r.accession),order,diary);
}
