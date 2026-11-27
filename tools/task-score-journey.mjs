import assert from "node:assert/strict";

export async function playTaskScore({ page, engine, waitMap, close, button }) {
  // Select a real placement for each panel from the same source snapshot as the production build.
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true, watch: null, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  let sites;
  try {
    const { MAPS } = await server.ssrLoadModule("/src/maps/index.ts");
    const { fieldGamePanels, fieldStationPanel } = await server.ssrLoadModule(
      "/src/ui/fieldGamePanels.ts",
    );
    sites = new Map();
    for (const m of Object.values(MAPS))
      for (const prop of m.interactables) {
        if (prop.kind !== "fieldgame") continue;
        const id = prop.game,
          fixed = fieldGamePanels.get(id),
          family = fieldStationPanel(id);
        if (!fixed && !family) continue;
        const group = fixed ? id : id.split(":")[0] + ":";
        if (!sites.has(group))
          sites.set(group, {
            map: m.id,
            x: m.spawn.x,
            y: m.spawn.y,
            id,
            title: (fixed ?? family).title,
          });
      }
    assert.equal(sites.size, 32);
  } finally {
    await server.close();
  }
  const which = ["chromium", "firefox", "webkit"].indexOf(engine);
  const jobs = [...sites.values()].filter((_, i) => i % 3 === which);
  const dialog = page.getByRole("dialog");
  const active = () =>
    page.evaluate(() => {
      const playback = kg.world.soundtrack;
      return {
        mode: playback.mode,
        layer: playback.layer?.key ?? null,
        keys: [...playback.trialKeys],
        context: kg.world.sound.context?.state,
        locked: kg.world.sound.locked,
        original: playback.active?.key ?? null,
        request: playback.request?.key,
        base: playback.active?.volume,
        music: kg.settings.musicVolume,
      };
    });
  async function waitFor(predicate, ...arg) {
    await page.waitForFunction(predicate, ...arg);
  }
  async function visit(map, x, y) {
    if ((await page.evaluate(() => kg.world.map.id)) === map) return;
    await page.evaluate(
      ([map, x, y]) => kg.world.changeMap(map, x, y),
      [map, x, y],
    );
    await waitMap(map);
  }
  await page.evaluate(() => {
    kg.settings.musicVolume = 0.4;
    kg.settings.sfxVolume = 0.45;
    kg.settings.captions = true;
    kg.world.playMusic();
  });
  for (const job of jobs) {
    await visit(job.map, job.x, job.y);
    await page.evaluate((id) => kg.ui.openFieldGame(id), job.id);
    await page.getByRole("dialog", { name: job.title, exact: true }).waitFor();
    assert.equal(
      await dialog.getByText("Lumen’s help", { exact: true }).count(),
      1,
    );
    const during = await active();
    assert.ok(["work", "listen"].includes(during.mode), JSON.stringify(during));
    await close();
    assert.equal((await active()).mode, "roam");
  }
  await visit("preserved.archive", 8, 5);
  await page.evaluate(() => kg.ui.openShowdown("hearing.empty-chair"));
  await dialog.getByRole("button", { name: /Force 2/ }).click();
  await waitFor(() => kg.world.soundtrack.mode === "hearing");
  const hearing = await active();
  const synthesized =
    hearing.context === "running" &&
    !hearing.locked &&
    hearing.request?.startsWith("music.campaign.");
  if (synthesized) {
    assert.match(hearing.layer, /\.hearing$/);
    assert.ok(Math.abs(hearing.base - 0.4 * 0.37) < 0.001);
  }
  await button("Rest my case");
  await page
    .locator("#captions")
    .getByText(/short bell marks the handover/)
    .waitFor();
  if (hearing.context === "running" && !hearing.locked)
    assert.ok((await active()).keys.includes("trial.handed-on"));
  await button("Leave the square");
  const after = await active();
  assert.equal(after.mode, "roam");
  assert.equal(after.layer, null);
  if (synthesized) assert.ok(Math.abs(after.base - 0.4) < 0.001);
  await visit("stage.rehearsal", 5, 12);
  await page.evaluate(() => kg.ui.openFieldGame("whistle-watch"));
  await dialog.getByRole("button").first().waitFor();
  const listener = await active();
  assert.equal(listener.mode, "listen");
  assert.equal(listener.layer, null);
  await close();
  await page.evaluate(() => {
    kg.settings.musicVolume = 0;
    kg.world.playMusic();
    kg.ui.openFieldGame("ladder");
  });
  await dialog.waitFor();
  const muted = await active();
  assert.equal(muted.layer, null);
  if (muted.base !== undefined) assert.equal(muted.base, 0);
  await close();
  console.log(
    engine,
    jobs.length,
    "real panel placements, work/listen/hearing transitions, caption and mute",
    JSON.stringify(hearing),
  );
}
