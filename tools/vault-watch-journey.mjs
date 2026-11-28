import assert from "node:assert/strict";

export async function playVaultWatch({
  page,
  engine,
  use,
  close,
  waitMap,
  button,
}) {
  const vault = "aethelgard.undercroft";
  const key = (id) => page.locator('[data-vault="' + id + '"]');
  const lamp = (id) => page.locator('[data-lamp="' + id + '"]');
  const side = engine === "firefox" ? 0 : 1;
  const take = async (id) => {
    await key(id).focus();
    await page.keyboard.press("Space");
  };
  const visit = async (id, x, y) => {
    await page.evaluate(({ id, x, y }) => kg.world.changeMap(id, x, y), {
      id,
      x,
      y,
    });
    await waitMap(id);
  };
  async function grate(x, closed) {
    const physical = await page.evaluate(
      ({ x }) => {
        const w = kg.world,
          sx = Math.floor(w.player.sprite.x / 16),
          sy = Math.floor(w.player.sprite.y / 16);
        const rows = [3, 4, 5, 6, 7].map((y) =>
          w.collides(x * 16 + 8, y * 16 + 12),
        );
        return { rows, cross: w.bfs(sx, sy, x + 1, 5) !== null };
      },
      { x },
    );
    assert.deepEqual(physical, { rows: Array(5).fill(closed), cross: !closed });
  }
  await visit(vault, 29, 7);
  assert.deepEqual(
    await page.evaluate(() => [
      Math.floor(kg.world.player.sprite.x / 16),
      Math.floor(kg.world.player.sprite.y / 16),
    ]),
    [8, 5],
  );
  await grate(9, true);
  await use("seal-many");
  assert.equal(await key("give0").count(), 0);
  await take("voices");
  await close();
  await use("seal-many");
  for (const id of ["latch", "felt", "give" + side, "onward"]) await take(id);
  await grate(9, false);
  await grate(17, true);
  await use("seal-twogates");
  assert.equal(await key("unhook").isDisabled(), true);
  for (const id of ["all", "none", "unhook", "gate1"]) await take(id);
  await page
    .getByRole("dialog")
    .getByText(/drawing goes through/)
    .first()
    .waitFor();
  if (process.env.KG_VAULT_SHOT)
    await page
      .getByRole("dialog")
      .screenshot({ path: process.env.KG_VAULT_SHOT });
  assert.ok(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth - el.clientWidth <= 2),
  );
  await take("give" + (1 - side));
  await take("onward");
  await grate(17, false);
  await grate(25, true);
  await use("seal-chosen");
  for (const id of ["tabs", "nights3", "give" + side, "onward"]) await take(id);
  await grate(25, false);
  await use("archivist");
  for (const id of [
    "wax1",
    "wax2",
    "wax0",
    "give" + (1 - side),
    "onward",
    "peg2",
    "leaf0",
  ])
    await take(id);
  assert.equal(await key("peg1").isDisabled(), true);
  await close();
  await use("archivist");
  assert.equal(await key("leaf0").getAttribute("aria-pressed"), "true");
  for (const id of [
    "leaf1",
    "peg0",
    "give" + side,
    "onward",
    "right",
    "left",
    "ear0",
    "ear1",
    "give" + (1 - side),
    "onward",
  ])
    await take(id);
  assert.equal(
    await page.evaluate(() => kg.controller.state.inventory["item.brass-lamp"]),
    1,
  );
  await use("vault-index");
  await page
    .getByText("A forecast in the margin", { exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByText(/My first peg marked 2.*next watch a peg at 0/)
    .waitFor();
  await close();
  await visit("water.gatehouse", 6, 11);
  await use("weir-lamp-table");
  await page
    .getByRole("dialog")
    .getByText(/I had pegged 2/)
    .waitFor();
  assert.equal(await lamp("overlay").count(), 0);
  await lamp("before").click();
  await lamp("after").click();
  await lamp("overlay").click();
  const to = side ? "inquiry" : "watch";
  await lamp(to).click();
  assert.equal(
    await page.evaluate(() => kg.controller.state.flags["weir-lamp.to"]),
    to,
  );
  await close();
  // Stage the unrelated main route, then speak to Vesper and use the earned evidence through the dialogue.
  await page.evaluate(() => {
    const c = kg.controller;
    if (!c.state.objectivesDone.includes("council.arrival"))
      c.state.objectivesDone.push("council.arrival");
    c.dispatch({ type: "SetFlag", flag: "harrowmere.found", value: true });
  });
  await visit("council.hall", 16, 12);
  await use("vesper-quill");
  await button("Hold Elsbet's brass lamp");
  await button(side ? "inquiry’s red line" : "margin the next watch");
  await page
    .getByText(side ? /a perfect warning/ : /They left room for a signature/)
    .first()
    .waitFor();
  await button("Continue");
  await page.getByRole("button", { name: /Correct the Nexus label/ }).waitFor();
  assert.equal(
    await page.evaluate(() => kg.controller.state.flags["ending.council"]),
    undefined,
  );
}
