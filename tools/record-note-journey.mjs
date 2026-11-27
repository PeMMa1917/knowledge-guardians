import assert from 'node:assert/strict';

export async function playRecordNotes({page,engine,waitMap,use,close,button}){
 const popup=page.getByRole('dialog'), cases=[
   ['nexus.archive','nexus-fold-green','OBJ-DOOR-02'],
   ['civic.callboard','callboard-case-gage-mount','OBJ-CALL-gage-mount'],
   ['sea.proof-shelter','specimen-passage-yirrkala-dhuwa-exhibit','OBJ-PASSAGE-yirrkala-dhuwa'],
   ['sea.proof-shelter','specimen-passage-yirrkala-yirritja-exhibit','OBJ-PASSAGE-yirrkala-yirritja'],
   ['night-register.island','night-case-163365','OBJ-NIGHT-163365']
 ];
 const spawns={'nexus.archive':[12,17],'sea.proof-shelter':[18,23],'civic.callboard':[18,34],'night-register.island':[16,24],'nexus.specimen-vault':[10,12]};
 const visit=async map=>{if(await page.evaluate(()=>kg.world.map.id)!==map){
   await page.evaluate(({map,point})=>kg.world.changeMap(map,...point),{map,point:spawns[map]??[12,12]});await waitMap(map);
 }};
 await page.evaluate(()=>{kg.settings.reducedEffects=true;kg.settings.reducedMotion=true;
   // The fold opens after the main Archive label has been set.
   kg.controller.state.objectivesDone.push('m01.o6.label');});
 await visit('civic.quiet-records');await popup.getByRole('button',{name:'Go in'}).waitFor();
 await page.keyboard.press('Escape');await waitMap('civic.dispatch');
 await visit('civic.quiet-records');await button('Go in');
 assert.equal(await page.evaluate(()=>kg.controller.state.flags['note.medical-harm.tuskegee.seen']),true);
 await visit('civic.dispatch');await visit('civic.quiet-records');
 assert.equal(await page.getByRole('button',{name:'Go in'}).count(),0);
 const imageRequests=[]; page.on('request',r=>{if(r.url().endsWith('/specimens/night-register/163365.png'))imageRequests.push(r.url());});
 for(const [map,prop,id] of cases){
   await visit(map);
   // The first completed Archive label also has two witnesses. Hear their reply before the stand.
   if (await popup.filter({hasText:'Two views on your new label'}).isVisible()) await button('Keep walking');
   await use(prop);
   await popup.getByRole('button',{name:'Leave the record closed'}).waitFor().catch(async error=>{
     throw Error(prop+' '+JSON.stringify(await page.evaluate(()=>({dialog:document.querySelector('[role=dialog]')?.textContent?.slice(0,450),map:kg.world.map.id,target:kg.world.target?.obj?.id,paused:kg.world.paused}))),{cause:error});
   });
   assert.equal(await page.evaluate(id=>!!kg.controller.state.flags['inspected.'+id],id),false);
   if(map===cases[0][0])await page.keyboard.press('Escape');else await button('Leave the record closed');
   assert.equal(await page.evaluate(id=>!!kg.controller.state.flags['inspected.'+id],id),false);
   await use(prop);await button('Read the text');await popup.getByText(/^Text view ·/).waitFor();
   assert.equal(await popup.locator('.exhibit-grid figure .big-art').count(),0);
   if(id==='OBJ-NIGHT-163365'){
     await popup.getByRole('combobox',{name:'Choose a field tool'}).selectOption('left');await button('Try the selected tool');
     await popup.locator('.night-image-reading').filter({hasText:'outside this crop'}).waitFor();
     await button('Set the whole record beside the trial');await popup.locator('.night-image-reading').filter({hasText:'does not supply a count'}).waitFor();
     assert.equal(await popup.locator('.night-window img').count(),0);assert.equal(imageRequests.length,0);
     await popup.locator('.night-register .options button').first().click();
     await button('Take this object');
     await close();
     await page.reload({waitUntil:'domcontentloaded'});await button('Continue');await waitMap(map);
     await use(prop);await popup.getByText(/^Text view ·/).waitFor();
     assert.equal(imageRequests.length,0);
   }
   await close();await use(prop);await popup.getByText(/^Text view ·/).waitFor();
   await button('Choose text or illustration');await button('Open the illustrated record');await popup.locator('figure img.big-art').waitFor();
   if(id==='OBJ-NIGHT-163365')await page.waitForFunction(()=>document.querySelector('img.big-art')?.getAttribute('alt')?.includes('fortifications'));
   await button('Choose text or illustration');await button('Leave the record closed');
   await use(prop);await popup.getByRole('button',{name:'Read the text'}).waitFor();await close();
 }
 await visit('nexus.specimen-vault');await use('specimen-vault-display');
 await popup.getByRole('img',{name:'Closed picture sleeve'}).waitFor();
 await button('Put on display');
 await popup.getByRole('img',{name:'Closed picture sleeve'}).waitFor();
 await button('Put in satchel');await close();
 assert.ok(imageRequests.length>0);
 console.log(engine,'room return and reentry, five separate records, two styles of reading and the covered Taku print');
}
