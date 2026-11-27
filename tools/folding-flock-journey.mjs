import assert from "node:assert/strict";

export async function playFoldingFlock({
  page,
  engine,
  button,
  use,
  waitMap,
  close,
}) {
  const alt = engine === "firefox",
    side = alt ? "west" : "east",
    dialog = page.getByRole("dialog");
  const visit = async (map, x, y) => {
    await page.evaluate(
      ([map, x, y]) => kg.world.changeMap(map, x, y),
      [map, x, y],
    );
    await waitMap(map);
  };
  await visit("sea.harbour", 12, 12);
  await use("birdside.model");
  assert.equal(
    await dialog.getByRole("button", { name: "Take this object" }).count(),
    0,
  );
  assert.ok(
    await dialog.getByRole("link", { name: /Wikipedia.*Hōkūleʻa/ }).count(),
  );
  await close();
  await use("birdside.folder");
  for (const [title, who] of alt
    ? [
        ["crew’s voyage", "Mau Piailug"],
        ["learner’s account", "Nainoa Thompson"],
      ]
    : [
        ["learner’s account", "Nainoa Thompson"],
        ["crew’s voyage", "Mau Piailug"],
      ]) {
    await button(title);
    await dialog
      .getByRole("link", { name: "Wikipedia · " + who, exact: true })
      .waitFor();
    await button("back into the pocket");
  }
  await button("Renna printed");
  await button("voyage dates");
  await button("Try the account");
  await button("learner’s pencil");
  await button("second learning place");
  await button(alt ? "blank line" : "question about");
  await button("back into the pocket");
  await button("who else");
  await button("pencil lesson");
  await button("who sailed");
  await button("voyage record");
  await button("back into the pocket");
  await button("Leave the pockets");
  await use("birdside.cloth");
  const peg = "Peg the " + side + " ledge";
  await button("First light");
  await button(peg);
  await dialog
    .getByRole("status")
    .getByText(/leaves the east ledge/)
    .waitFor();
  await button("Last light");
  await button(peg);
  await dialog
    .getByRole("status")
    .getByText(/returns to the west ledge/)
    .waitFor();
  await button("Rain watch");
  await button(peg);
  await dialog
    .getByRole("status")
    .getByText(/still hides both landings/)
    .waitFor();
  const layout = await dialog.locator(".flock-table").evaluate((section) => {
    const box = section.getBoundingClientRect();
    const strip = section.querySelector(".flock-strip");
    return { width: box.width, view: innerWidth, fits: section.scrollWidth <= section.clientWidth + 1,
      picture: getComputedStyle(strip).backgroundImage.startsWith('url("data:image/') };
  });
  assert.ok(layout.fits && layout.width <= layout.view && layout.picture, JSON.stringify(layout));
  if (process.env.KG_FLOCK_SHOT)
    await page.screenshot({ path: process.env.KG_FLOCK_SHOT });
  await close();
  await use("birdside.folder");
  await button("Fit a guide");
  await button(alt ? "turning lamp" : "a board");
  await button("back into the pocket");
  await button("Leave the pockets");
  await use("birdside.model");
  await button("Take this object");
  await dialog.getByText("In your satchel.", { exact: true }).waitFor();
  await close();
  await page.evaluate(() => kg.ui.openBag());
  await button("Use Hōkūleʻa");
  await dialog.getByRole("button", { name: /Put away Hōkūleʻa/ }).waitFor();
  await close();
  await visit("stage.gallery", 11, 12);
  await use("birdside.projector");
  await button("stock silhouette");
  await button("Slide the glass");
  await button(alt ? "two voyages" : "launch record");
  await button("Expose");
  await button("Every navigator");
  await button("Move the edge");
  await button(alt ? "next historian" : "one learner");
  await button("Close");
  await use(alt ? "birdside.crew-slide" : "birdside.dated-slide");
  await close();
  await visit("island.dock", 7, 10);
  await use("birdside.return");
  await button(alt ? "two-person" : "two-row");
  await button(alt ? "Walk the two" : "Wait at the rail");
  await button("Close");
  await use(alt ? "birdside.pier-walk" : "birdside.second-watch");
  await waitMap(alt ? "island.workshop" : "island.margin");
  await visit("sea.harbour", 12, 12);
  await use("birdside.folder");
  await button("returned key");
  await button(alt ? "chalk footprints" : "second hand");
  await dialog
    .getByText(/She kept the key/)
    .first()
    .waitFor();
  await close();
  const got = await page.evaluate(() => ({
    owned: kg.controller.state.inventory["item.specimen.pvs:hokulea-1975"],
    goals: kg.controller.state.objectivesDone.filter((id) =>
      id.startsWith("birdside."),
    ).length,
  }));
  assert.deepEqual(got, { owned: 1, goals: 8 });
  console.log(
    engine,
    alt
      ? "lamp, two voyages, a new historian, pier walk"
      : "board, launch day, named learner, shared wait",
    "and the returned key",
  );
}
