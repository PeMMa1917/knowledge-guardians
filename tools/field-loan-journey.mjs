import assert from "node:assert/strict";

export async function playFieldLoans({
  page,
  engine,
  use,
  waitMap,
  close,
  button,
}) {
  const dialog = page.getByRole("dialog"),
    alternate = engine === "webkit";
  const mapOf = {
    press: "copies.landing",
    stage: "stage.foyer",
    dispatch: "civic.dispatch",
    fern: "forest.station",
  };
  const targets = {
    press: ["copies.archive", "copies.press"],
    stage: ["stage.rehearsal", "stage.gallery"],
    dispatch: ["civic.steps", "civic.canal"],
    fern: ["forest.trail", "forest.community"],
  };
  const pairings = [
    { key: "met:2023.133a-k", stops: ["press", "dispatch"] },
    { key: "cma:1990.185", stops: ["fern", "stage"] },
  ];
  const visit = async (map) => {
    await page.evaluate((map) => kg.world.changeMap(map, 12, 12), map);
    await waitMap(map);
  };
  await page.evaluate(() => {
    kg.settings.reducedMotion = true;
    kg.settings.reducedEffects = true;
  });
  for (const { key, stops } of pairings) {
    // Begin this return journey with a completed home commission. Claim and fit through the same engine as the object stand.
    await page.evaluate((key) => {
      const c = kg.controller,
        ex = c.pack.exhibits.find((r) => r.specimen?.key === key);
      c.state.objectivesDone.push(ex.specimen.objective);
      c.dispatch({ type: "InspectExhibit", exhibit: ex.id });
      for (const cmd of [
        { type: "ClaimSpecimen", exhibit: ex.id },
        { type: "EquipPerspective", keepsake: "specimen." + key },
      ]) {
        const error = c.dispatch(cmd).find((e) => e.kind === "error");
        if (error) throw Error(error.message);
      }
    }, key);
    const order = alternate ? [...stops].reverse() : stops;
    for (const [index, stop] of order.entries()) {
      await visit(mapOf[stop]);
      const prefix = "field-loan." + stop;
      await use(prefix + ".bench");
      const root = dialog.locator(".loan-work"),
        panel = root.locator(".loan-sample");
      await root.waitFor();
      if (index === 1)
        await root
          .getByText(/fast slip from|desk at .* kept the full account/)
          .waitFor();
      if (stop === "press") {
        const slider = root.getByRole("slider");
        await slider.focus();
        await slider.press("ArrowRight");
      }
      if (stop === "stage")
        await root.getByRole("button", { name: "Advance one beat" }).click();
      if (stop === "dispatch")
        await root
          .getByRole("button", { name: "Record date on strap" })
          .click();
      if (stop === "fern")
        await root.getByRole("button", { name: "Fold seam outwards" }).click();
      const choices = root
        .getByRole("group", { name: "Give a reader an edition" })
        .getByRole("button");
      assert.equal(await choices.nth(0).isEnabled(), false);
      const test = root
        .getByRole("group", {
          name: /Pull the little|Try the cue|Send the bag|Draw the practice/,
        })
        .getByRole("button");
      await test.nth(0).click();
      const first = await panel.innerText();
      await test.nth(1).click();
      assert.notEqual(first, await panel.innerText());
      await test.nth(2).click();
      await root
        .locator("summary")
        .filter({ hasText: "A letter from the next reader" })
        .click();
      const letters = root
        .getByRole("group", { name: "Answer the reader" })
        .getByRole("button");
      assert.equal(await letters.nth(2).isEnabled(), false);
      await letters.nth(0).click();
      await letters.nth(alternate ? 1 : 2).click();
      const layout = await root.evaluate((el) => ({
        fits: el.scrollWidth <= el.clientWidth + 1,
        image: el.querySelector(".loan-sample img").naturalWidth,
      }));
      assert.ok(layout.fits && layout.image > 0, JSON.stringify(layout));
      const selected = (index + (alternate ? 1 : 0)) % 2,
        edition = selected ? "keep" : "carry";
      await choices.nth(selected).click();
      const way = await root.getByRole("status").innerText();
      assert.match(way, /beside the bench/);
      if (process.env.KG_LOAN_SHOT && index === 1 && stop === order.at(-1))
        await page.screenshot({
          path: process.env.KG_LOAN_SHOT.replace(".png", "-" + stop + ".png"),
        });
      await close();
      await use(prefix + ".way." + edition);
      await waitMap(targets[stop][selected]);
      await use(prefix + ".reader." + edition);
      await dialog
        .getByRole("button")
        .filter({
          hasText:
            /Ask him to sew|Give her the first|Leave a beat|Move the reflecting|Loop a quiet|Mark a next|Tie a second|Hang a reader/,
        })
        .click();
      await close();
      const stored = await page.evaluate(
        (k) => kg.controller.state.flags[k],
        prefix + ".heard",
      );
      assert.equal(stored, edition);
      console.log(engine, key, stop, edition, "reader reached");
    }
  }
}
