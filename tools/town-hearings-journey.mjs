import assert from "node:assert/strict";

export async function playTownHearings({ page, engine, button, use, waitMap }) {
  const dialog = page.getByRole("dialog");
  const sites = [
    ["preserved.archive", "empty-chair", "agate-vale", 8, 4],
    ["metalworks.yard", "missing-tooth", "agate-vale", 8, 4],
    ["copies.press", "dropped-verb", "agate-vale", 9, 5],
    ["market.square", "last-cup", "vesper-quill", 24, 21],
  ];
  const side = engine === "firefox" ? 1 : 0;
  const options = dialog.locator(".options button");
  async function visit([map, , , x, y]) {
    await page.evaluate(
      ([map, x, y]) => kg.world.changeMap(map, x, y),
      [map, x, y + 1],
    );
    await waitMap(map);
  }
  async function compare([, name], index) {
    const key = "hearing." + name;
    await use(key + ".work" + index);
    await options.nth(index).click();
    await button("Try the other position");
    await button("Take the two readings");
    await button("Close");
  }
  async function correction([, , host]) {
    await use(host === "vesper-quill" ? "agate-vale" : host);
    await button("Open the reply from");
    await button("Bring the two hearing decisions");
    await options.nth(side).click();
    await button("Close");
  }
  for (const [n, site] of sites.entries()) {
    const [, name, host] = site,
      key = "hearing." + name;
    await visit(site);
    for (const i of [0, 1]) await compare(site, i);
    await use(host);
    await button("Take a seat at the hearing");
    await dialog.locator(".options button").nth(side).click();
    const witness = dialog.getByLabel("Call a witness", { exact: true });
    const ids = await witness
      .locator("option")
      .evaluateAll((opts) => opts.map((o) => o.value).filter(Boolean));
    assert.equal(ids.length, 2);
    await witness.selectOption(ids[0]);
    await button("Concede the fair point");
    await witness.selectOption(ids[1]);
    const links = dialog.getByLabel("Challenge a link", { exact: true }),
      card = dialog.getByLabel("Card", { exact: true });
    // Change the proposed target before presenting evidence. Only the latest target should remain.
    await links.selectOption("link1");
    await links.selectOption("");
    assert.equal(await card.count(), 0);
    await links.selectOption("link1");
    await links.selectOption("link0");
    assert.equal(await card.count(), 1);
    assert.equal(
      await card.evaluate((el) => document.activeElement === el),
      true,
    );
    await card.selectOption("card." + key + ".1");
    assert.ok(
      !(await page.evaluate(
        (key) => kg.controller.state.objectivesDone.includes(key + ".checked0"),
        key,
      )),
    );
    for (const i of [0, 1]) {
      await links.selectOption("link" + i);
      await card.selectOption("card." + key + "." + i);
    }
    await button("Leave the square");
    await use(host);
    await button("Read what the town did");
    await button("Unfold the town");
    await options.nth(side).click();
    await button("Close");
    await use(key + ".chair" + side);
    await button("Close");
    if (n) {
      await correction(site);
      await use(key + ".repair" + side);
      await button("Close");
    }
    assert.deepEqual(
      await page.evaluate((key) => {
        const s = kg.controller.state;
        return [
          s.flags["sd." + key + ".outcome"],
          s.flags[key + ".seat"],
          s.flags[key + ".amended"] ?? null,
        ];
      }, key),
      ["won-over", side, n ? side : null],
    );
  }
  await visit(sites[0]);
  await correction(sites[0]);
  await use("hearing.empty-chair.repair" + side);
  await button("Close");
  await use("agate-vale");
  await button("Take a seat at the hearing");
  await options.first().click();
  await dialog
    .getByLabel("Call a witness", { exact: true })
    .selectOption("travelling-chair");
  await dialog
    .locator(".sd-log")
    .getByText(/two counts/)
    .waitFor();
}
