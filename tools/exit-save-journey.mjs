import assert from "node:assert/strict";

/** Local fictional profile. Check both event orders, one-event exits and a real browser reload. */
export async function playExitSave({ page, waitMap, button }) {
  await page.evaluate(() => kg.world.changeMap("stage.rehearsal", 13, 13));
  await waitMap("stage.rehearsal");
  const outcomes = await page.evaluate(() => {
    const c = kg.controller,
      results = [];
    // Simulate a document being hidden without requiring a second foreground browser window.
    function signal(name) {
      if (name === "hidden") {
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          value: "hidden",
        });
        try {
          document.dispatchEvent(new Event("visibilitychange"));
        } finally {
          delete document.visibilityState;
        }
      } else {
        window.dispatchEvent(new Event(name));
      }
    }
    for (const order of [
      ["pagehide"],
      ["hidden"],
      ["pagehide", "hidden"],
      ["hidden", "pagehide"],
    ]) {
      signal("pageshow");
      c.dispatch({
        type: "SetFlag",
        flag: "exit-journey",
        value: order.join("."),
      });
      const before = c.pair.revision;
      for (const name of order) signal(name);
      const pair = JSON.parse(JSON.parse(localStorage.getItem("kg.slots")).body);
      results.push({
        delta: c.pair.revision - before,
        value: pair.continue.state.flags["exit-journey"],
        map: pair.continue.state.mapId,
      });
    }
    signal("pageshow");
    const original = c.suspend;
    let tries = 0;
    c.suspend = function (label) {
      if (tries++ === 0) return false;
      return original.call(this, label);
    };
    try {
      c.dispatch({ type: "SetFlag", flag: "exit-journey", value: "recovered" });
      signal("pagehide");
      signal("hidden");
    } finally {
      c.suspend = original;
    }
    const recover = c.pair.continue.state.flags["exit-journey"];
    signal("pageshow");
    c.dispatch({ type: "SetFlag", flag: "exit-journey", value: "real reload" });
    return { results, tries, recover };
  });
  assert.deepEqual(
    outcomes.results.map((r) => r.delta),
    [1, 1, 1, 1],
  );
  assert.deepEqual(
    outcomes.results.map((r) => r.value),
    ["pagehide", "hidden", "pagehide.hidden", "hidden.pagehide"],
  );
  assert.ok(outcomes.results.every((r) => r.map === "stage.rehearsal"));
  assert.equal(outcomes.tries, 2);
  assert.equal(outcomes.recover, "recovered");
  await page.reload({ waitUntil: "domcontentloaded" });
  await button("Continue");
  await waitMap("stage.rehearsal");
  assert.equal(
    await page.evaluate(() => kg.controller.state.flags["exit-journey"]),
    "real reload",
  );
}
