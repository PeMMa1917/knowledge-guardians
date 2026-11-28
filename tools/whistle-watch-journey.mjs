import assert from "node:assert/strict";

export async function playWhistleWatch({
  page,
  engine,
  button,
  use,
  close,
  waitMap,
}) {
  const places = {
    fern: ["forest.station", 17, 5],
    stage: ["stage.rehearsal", 6, 13],
    island: ["island.workshop", 23, 14],
  };
  const ctl = (id) => page.locator('[data-watch="' + id + '"]');
  const tap = async (id) => {
    await ctl(id).focus();
    await page.keyboard.press("Space");
  };
  async function visit(site) {
    const [map, x, y] = places[site];
    await page.evaluate((m) => kg.world.changeMap(...m), [map, x, y]);
    await waitMap(map);
  }
  async function help(site, offer) {
    await use("liri-pell");
    await button(offer ? "Offer to take a watch" : "Let Liri take this shift");
    await button("Close");
    await use("whistle." + site + ".table");
  }
  const hand = engine === "webkit" ? 1 : 0;
  await visit("fern");
  await help("fern", false);
  assert.equal(await ctl("fanmender").isDisabled(), true);
  await tap("lay0");
  await tap("fanmender");
  await page
    .getByRole("status")
    .filter({ hasText: "asks the walker to sign" })
    .waitFor();
  for (const key of ["fanwalker", "lay2", "lay1", "bootmender", "send" + hand])
    await tap(key);
  assert.equal(await ctl("relieve").count(), 0);
  await close();
  await visit("stage");
  await use("liri-pell");
  await button("other watch");
  await page
    .getByText(hand ? /Inviting somebody to the tray/ : /Two signers/)
    .first()
    .waitFor();
  await button("Close");
  await use("whistle.stage.table");
  for (const key of [
    "screen0",
    "front",
    "screen1",
    "rear",
    "screen2",
    "rear",
    "front",
  ])
    await tap(key);
  await page
    .getByRole("list", { name: "Slips returned" })
    .getByText(/Both names covered.*front heard two taps.*rear heard one/)
    .waitFor();
  assert.ok(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth - el.clientWidth <= 2),
  );
  if (process.env.KG_WHISTLE_SHOT)
    await page
      .getByRole("dialog")
      .screenshot({ path: process.env.KG_WHISTLE_SHOT });
  await tap("send" + (1 - hand));
  await close();
  await visit("island");
  await help("island", true);
  await tap("layer0");
  await tap("layer1");
  await tap("carry");
  await page
    .getByRole("status")
    .filter({ hasText: "lifts the local leaf back" })
    .waitFor();
  for (const key of ["layer2", "carry", "send0"]) await tap(key);
  await tap("relieve");
  await page
    .getByRole("status")
    .filter({ hasText: "two chipped cups" })
    .waitFor();
  await close();
  await use("liri-pell");
  await button("chipped ferry cup");
  await page
    .getByText(/saving for a flask/)
    .first()
    .waitFor();
  await button("Close");
  await use("whistle.day-ferry");
  await waitMap("island.dock");
  await visit("island");
  await use("whistle.island.table");
  await tap("recall");
  assert.equal(await ctl("send0").isDisabled(), true);
  await close();
  await use("liri-pell");
  await button("who recalled");
  await page
    .getByText(/She can be cross/)
    .first()
    .waitFor();
  await button("Close");
  await use("whistle.keep-table");
  await waitMap("island.margin");
  assert.equal(
    await page.evaluate(
      () => kg.controller.state.inventory["item.notched-whistle"],
    ),
    1,
  );
}
