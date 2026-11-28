import assert from 'node:assert/strict';

export async function playClaimBell({page,use,close,waitMap,engine}) {
  const dialog=page.getByRole('dialog');
  async function press(id) {
    const control=dialog.locator('[data-bell="'+id+'"]');
    await control.focus();
    await control.press('Enter');
  }
  async function both(channel,shift) {
    for(const id of [channel,shift,'first','second']) await press(id);
  }
  await page.evaluate(()=>{ kg.controller.dispatch({type:'SetFlag',flag:'well.shared',value:true}); kg.world.changeMap('aethelgard.emberford',29,20); });
  await waitMap('aethelgard.emberford'); await use('claim-bell-well');
  await press('turn'); await both('voice','dawn'); await both('token','late');
  await press('issue');
  await dialog.getByText(/Emberford’s sealed rule/).waitFor();
  await close();
  await page.evaluate(()=>kg.world.changeMap('water.council',11,10));
  await waitMap('water.council'); await use('claim-bell-weir');
  await press('turn'); await press('receive');
  await dialog.getByRole('status').filter({hasText:'Here someone claims the wheel is cracked'}).waitFor();
  await both('token','late');
  await dialog.getByText(/Her three knocks leave the slot/).last().waitFor();
  await both('voice','late');
  const final=engine==='webkit'?'runner':engine==='firefox'?'token':'voice';
  await both(final,'late'); await press('sign'); await close();
  await page.evaluate(()=>kg.world.changeMap('aethelgard.emberford',29,20));
  await waitMap('aethelgard.emberford'); await use('claim-bell-well');
  await press('home');
  assert.equal(await page.evaluate(()=>kg.controller.state.flags['claimbell.home']),final+'.late');
  assert.equal(await dialog.locator('.bell-plate').last().isVisible(),true);
  await close();
  console.log('CLAIM BELL',engine,'returned the spare pot rule via',final);
}
