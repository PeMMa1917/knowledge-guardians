import assert from 'node:assert/strict';

export async function playChapterLights({page, engine, posts, waitMap}) {
  const places = [posts[0], {id:'emberford',map:'aethelgard.emberford',at:[20,21]}, ...posts.slice(1)];
  const seen = new Set();
  const grades = new Set();
  for (const p of places) {
    await page.evaluate(p => kg.world.changeMap(p.map,p.at[0],p.at[1]+1),p);
    await waitMap(p.map);
    await page.waitForFunction(() => !kg.world.cameras.main.fadeEffect.isRunning);
    const painted = await page.evaluate(() => {
      const w = kg.world;
      return {world:w.map.world, tint:w.grade.fillColor, opacity:w.grade.alpha, visible:w.player.sprite.visible,
        width:w.game.canvas.clientWidth,height:w.game.canvas.clientHeight};
    });
    assert.ok(painted.visible && painted.opacity > 0 && painted.opacity <= 1 && painted.width > 200 && painted.height > 200);
    assert.ok(Number.isInteger(painted.tint));
    seen.add(painted.world);
    grades.add(painted.tint);
    // Two chalk pieces at floor level must stay distinguishable underneath the atmospheric layer.
    const contrast = await page.evaluate(async () => {
      const w = kg.world, cam = w.cameras.main;
      const x = Math.round(cam.width * .54), y = Math.round(cam.height * .56);
      const marks = [0xff1048, 0x10ef38].map((colour, i) => {
        const position = cam.getWorldPoint(x + i * 14, y);
        return w.add.rectangle(position.x, position.y, 9 / cam.zoom, 9 / cam.zoom, colour)
          .setDepth(190000);
      });
      try {
        const photo = await new Promise(resolve => w.photoSnap(resolve));
        if (!photo) throw Error('The scene did not return a rendered frame');
        const canvas = document.createElement('canvas');
        canvas.width = photo.width; canvas.height = photo.height;
        const g = canvas.getContext('2d', {willReadFrequently:true});
        g.drawImage(photo,0,0);
        const sample = px => g.getImageData(Math.round(px*photo.width/cam.width), Math.round(y*photo.height/cam.height),1,1).data;
        const red = sample(x), green = sample(x+14);
        return (red[0] - red[1]) - (green[0] - green[1]);
      } finally { marks.forEach(mark => mark.destroy()); }
    });
    assert.ok(contrast > 65, p.map + ' rendered two different pieces of chalk with a red/green separation of only ' + contrast);
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
    assert.equal(await page.evaluate(()=>kg.world.grade.alpha > 0), !settings.highContrast && !settings.reducedEffects);
  }
}
