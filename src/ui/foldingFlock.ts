import type { GameController } from "../app/controller";
import {
  birdReading,
  watchStrips,
  wingPin,
  type Watch,
  type Berth,
} from "../domain/birdSide";
import { h } from "./dom";
import { artURL } from "./illustrations";

export function foldingFlock(
  c: GameController,
  sound: (key: string) => void,
): HTMLElement {
  const last = String(c.state.flags["birdside.last"] ?? "").split(".");
  let watch: Watch =
    last[0] === "dusk" || last[0] === "squall" ? last[0] : "dawn";
  let berth: Berth | undefined =
    last[1] === "east" || last[1] === "west" ? last[1] : undefined;
  const root = h("section", { class: "flock-table" });
  const feedback = h("p", { role: "status", "aria-live": "polite" });
  const hour = h("div", {
    class: "row",
    role: "group",
    "aria-label": "Turn the cloth to a watch",
  });
  const pins = h("div", {
    class: "row",
    role: "group",
    "aria-label": "Place a lookout on a ledge",
  });
  const strip = h("div", { class: "flock-strip", "aria-hidden": "true" });
  const description = h("p", {}),
    saved = h("p", { class: "fine" });
  const watches: Watch[] = ["dawn", "dusk", "squall"];
  for (const id of watches)
    hour.append(
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            watch = id;
            berth = undefined;
            feedback.textContent = "";
            paint();
            sound("sfx.page");
          },
        },
        watchStrips[id].label,
      ),
    );
  for (const side of ["west", "east"] as const)
    pins.append(
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            const events = c.dispatch({
              type: "PinBirdWatch",
              watch,
              berth: side,
            });
            if (events.some((e) => e.kind === "error")) return;
            berth = side;
            feedback.textContent = birdReading(watch, side);
            sound("sfx.click");
            paint();
          },
        },
        "Peg the " + side + " ledge",
      ),
    );
  function paint() {
    const sheet = watchStrips[watch];
    description.textContent = sheet.note;
    strip.dataset.watch = watch;
    strip.style.backgroundImage = 'url("' + artURL("birdside." + watch) + '")';
    const pier = (side: Berth) =>
      h(
        "span",
        { class: "flock-pier" + (berth === side ? " pinned" : "") },
        (side === "west" ? "W" : "E") +
          (berth ? " · " + (side === "west" ? sheet.left : sheet.right) : ""),
      );
    strip.replaceChildren(
      pier("west"),
      h("span", { class: "flock-birds" }, watch === "squall" ? "↔" : "←"),
      pier("east"),
    );
    for (const [i, btn] of [...hour.children].entries())
      btn.setAttribute("aria-pressed", String(watches[i] === watch));
    for (const [i, btn] of [...pins.children].entries())
      btn.setAttribute(
        "aria-pressed",
        String((i === 0 ? "west" : "east") === berth),
      );
    const rows = watches.flatMap((id) =>
      (["west", "east"] as const)
        .filter((side) => c.state.flags[wingPin(id, side)] === true)
        .map((side) => watchStrips[id].label + " / " + side),
    );
    saved.textContent = rows.length
      ? "Peg holes in the cloth · " + rows.join(" · ")
      : "Both ledges have a place for your peg.";
  }
  root.append(
    h("h2", {}, "The folding flock"),
    h(
      "p",
      {},
      "“Two crews at one buoy on different days. Both drew an arrow towards the west.” Sora shakes out the stitched cloth. “I left the hour off because the gulls could hardly read it. Now neither can my apprentice.”",
    ),
    hour,
    description,
    strip,
    pins,
    feedback,
    saved,
    h(
      "p",
      { class: "fine" },
      "The stitched watches are a harbour model. ",
      h(
        "a",
        {
          href: "https://archive.hokulea.com/navigate/land.html",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "How the Polynesian Voyaging Society describes bird signs",
      ),
    ),
  );
  if (berth) feedback.textContent = birdReading(watch, berth);
  paint();
  return root;
}
