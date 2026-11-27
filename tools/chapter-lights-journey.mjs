import assert from 'node:assert/strict';

export async function playChapterLights({page, engine, posts, waitMap}) {
  const places = [posts[0], {id:'emberford',map:'aethelgard.emberford',at:[20,21]}, ...posts.slice(1)];
  const seen = new Set();
  const grades = new Set();
  for (const p of places) {
    await page.evaluate(p => kg.world.changeMap(p.map,p.at[0],p.at[1]+1),p);
    await waitMap(p.map);
    const painted = await page.evaluate(() => {
      const w = kg.world;
      return {world:w.map.world, tint:w.grade.fillColor, opacity:w.grade.alpha, visible:w.player.sprite.visible,
        width:w.game.canvas.clientWidth,height:w.game.canvas.clientHeight};
    });
    assert.ok(painted.visible && painted.opacity === 1 && painted.width > 200 && painted.height > 200);
    assert.ok(Number.isInteger(painted.tint));
    seen.add(painted.world);
    grades.add(painted.tint);
    if (process.env.KG_LIGHT_SHOT_DIR && ['archive','fern','stage','council'].includes(p.id))
      await page.screenshot({path:process.env.KG_LIGHT_SHOT_DIR+'/light-'+engine+'-'+p.id+'.png'});
  }
  assert.equal(seen.size,16);
  assert.ok(grades.size >= 12);
  // Apply the same saved-setting path as the game's checkbox. Each restart must keep the same room.
  for (const settings of [{highContrast:true,reducedEffects:false},{highContrast:false,reducedEffects:true},{highContrast:false,reducedEffects:false}]) {
    const previous = await page.evaluate(settings => {
      const world = kg.world;
      const previous = world.grade;
      window.kgLightRestarted = () => !!kg.world?.grade && kg.world.grade !== previous;
      Object.assign(kg.settings,settings);
      world.applySettings();
      return world.map.id;
    },settings);
    await page.waitForFunction(() => window.kgLightRestarted());
    await waitMap(previous);
    assert.equal(await page.evaluate(()=>kg.world.grade.alpha), settings.highContrast||settings.reducedEffects?0:1);
  }
}
