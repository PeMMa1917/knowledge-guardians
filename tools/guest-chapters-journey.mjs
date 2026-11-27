import assert from "node:assert/strict";

/** One save follows the same historical guest through every chapter using the post and the receiving workbench. */
export async function playGuestChapters({
  page,
  engine,
  guest,
  index,
  posts,
  sites,
  button,
  use,
  close,
  waitMap,
}) {
  let previous, oldReceipt;
  const dialog = page.getByRole("dialog");
  // Rotate the starting chapter and route so each engine exercises different workshop orders and editions.
  const offset =
    (index + ["chromium", "firefox", "webkit"].indexOf(engine) * 5) %
    sites.length;
  const journey = [...sites.slice(offset), ...sites.slice(0, offset)];
  const who = guest.id;
  for (const [step, site] of journey.entries()) {
    const post = posts.find((p) => p.id === site.id);
    if ((await page.evaluate(() => kg.world.map.id)) !== post.map) {
      await page.evaluate(
        (p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1),
        post,
      );
      await waitMap(post.map);
    }
    const ref = "lamplight." + site.id + "." + who;
    const trace = (index + step + offset) % 2,
      recipient = (index + Math.floor(step / 2) + offset) % 2;
    await use("ink-post." + site.id);
    await button("call a guest to the lantern");
    await dialog.getByRole("searchbox").fill(guest.name);
    await button(guest.name + " ·");
    if (previous) {
      await dialog
        .getByText("Unpack a tracing from another chapter", { exact: true })
        .click();
      await button("Set the pieces from " + previous.place);
      const outside = [0, 1, 2].find(
        (p) => !oldReceipt.slice(2).includes(String(p)),
      );
      await dialog.locator('[data-lantern-piece="' + outside + '"]').click();
    } else {
      for (const piece of [(index + offset) % 3, (index + offset + 1) % 3])
        await dialog.locator('[data-lantern-piece="' + piece + '"]').click();
    }
    await button(guest.folds[trace].action);
    await close();
    await use("lamplight." + site.id + ".bench");
    await button(guest.name + " ·");
    await button(site.uses[recipient].action);
    const stamp = await page.evaluate(
      ({ ref, prev, who }) => {
        const s = kg.controller.state;
        const entry = s.adventureDiary.entries.findLast(
          (e) => e.event?.ref === ref,
        );
        return {
          receipt: s.flags[ref + ".receipt"],
          compared: s.flags[ref + ".compared"],
          previous: prev
            ? s.flags["lamplight." + prev + "." + who + ".receipt"]
            : undefined,
          reference: entry?.event?.sourceIds?.[0],
          observed: entry?.text,
        };
      },
      { ref, prev: previous?.id, who },
    );
    assert.match(stamp.receipt, /^[01]{2}[012]{2}$/);
    assert.equal(stamp.receipt.slice(0, 2), String(trace) + recipient);
    assert.ok(
      stamp.reference?.endsWith(who),
      "the journal should identify this historical guest",
    );
    assert.ok(stamp.observed?.length > 10);
    if (previous) {
      assert.equal(stamp.compared, true);
      assert.equal(stamp.previous, oldReceipt);
    }
    await close();
    console.log("GUEST", engine, who, site.id, stamp.receipt, stamp.reference);
    previous = post;
    oldReceipt = stamp.receipt;
  }
  // Exercise ordinary cross-session recovery with the same fictional save and the same guest.
  // Store only map IDs and save revisions for diagnosing browser lifecycle differences.
  await page.evaluate(() => {
    const record = (type) => {
      const pair = kg.controller.pair;
      const history = JSON.parse(
        sessionStorage.getItem("guest-route-exit") || "[]",
      );
      history.push({
        type,
        world: kg.world?.map?.id,
        revision: pair.revision,
        location: pair.continue?.state?.mapId,
      });
      sessionStorage.setItem("guest-route-exit", JSON.stringify(history));
    };
    sessionStorage.removeItem("guest-route-exit");
    document.addEventListener("visibilitychange", () =>
      record(document.visibilityState),
    );
    window.addEventListener("pagehide", () => record("pagehide"));
    record("before-reload");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await button("Continue");
  try {
    await waitMap(previous.map);
  } catch (err) {
    const where = await page.evaluate(() => ({
      map: window.kg?.world?.map.id,
      state: window.kg?.controller?.state?.mapId,
      saved: window.kg?.controller?.pair?.continue?.location,
      heading: document.querySelector('[role="dialog"] h2')?.textContent,
      exit: sessionStorage.getItem("guest-route-exit"),
      saves: Object.keys(localStorage).map((k) => [
        k,
        localStorage.getItem(k)?.length,
      ]),
    }));
    throw new Error(
      "Restoring " +
        guest.name +
        " expected " +
        previous.map +
        "; " +
        JSON.stringify(where),
      { cause: err },
    );
  }
  const restored = await page.evaluate(
    ({ ids, who }) =>
      ids.map(
        (id) =>
          kg.controller.state.flags["lamplight." + id + "." + who + ".receipt"],
      ),
    { ids: sites.map((s) => s.id), who },
  );
  assert.ok(
    restored.every(
      (value) => typeof value === "string" && /^[01]{2}[012]{2}$/.test(value),
    ),
  );
  console.log("GUEST-RECOVERED", engine, who, restored.length);
}
