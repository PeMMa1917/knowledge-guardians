import { playNotes } from "../app/ambience";
import type { GameController } from "../app/controller";
import {
  whistlePlaces,
  whistleRelief,
  whistleStories,
  whistleStops,
  type WhistleSite,
} from "../content/whistleWatch";
import {
  hearing,
  watchMark,
  watchNumber,
  whistleReady,
  whistleReport,
  whoSigned,
  type WhistleCommand,
} from "../domain/whistleWatch";
import { h } from "./dom";
type Move = WhistleCommand extends infer C
  ? C extends WhistleCommand
    ? Omit<C, "type" | "site">
    : never
  : never;
export function whistlePanel(
  c: GameController,
  site: WhistleSite,
  volume: () => number,
  refresh: () => void,
) {
  const story = whistleStories[site],
    place = whistlePlaces.find((p) => p.id === site)!;
  const root = h(
    "section",
    { class: "whistle-watch" },
    h("h2", {}, place.title),
    h("p", {}, story.opening),
  );
  const work = h("div", { class: "watch-bench" }),
    out = h("p", { role: "status" }),
    letters = h("div", { class: "watch-handover" });
  root.append(work, out, letters);
  let silence: (() => void) | undefined;
  function run(move: Move, id: string) {
    const cmd: WhistleCommand = { type: "WorkWhistle", site, ...move };
    const err = c.dispatch(cmd).find((e) => e.kind === "error");
    if (err) {
      out.textContent = err.message;
      return;
    }
    if (move.action === "hear") {
      silence?.();
      const taps = move.seat === "front" ? [0, 1] : [0];
      silence = playNotes(
        taps.map((at) => ({ f: 523.25, at, beats: 0.52 })),
        0.34,
        "pluck",
        volume(),
      );
    }
    draw();
    out.textContent = whistleReport(c.state, cmd);
    if (
      move.action === "send" ||
      move.action === "recall" ||
      move.action === "relieve"
    )
      refresh();
    (
      root.querySelector<HTMLButtonElement>(
        '[data-watch="' + id + '"]:not(:disabled)',
      ) ?? root.querySelector<HTMLButtonElement>("button:not(:disabled)")
    )?.focus({ preventScroll: true });
  }
  function key(
    id: string,
    label: string,
    m: Move,
    options: { on?: boolean; disabled?: boolean } = {},
  ) {
    const b = h(
      "button",
      {
        type: "button",
        "data-watch": id,
        disabled: options.disabled === true,
        onclick: () => run(m, id),
      },
      label,
    );
    if (options.on !== undefined)
      b.setAttribute("aria-pressed", String(options.on));
    return b;
  }
  function group(name: string, ...children: HTMLElement[]) {
    return h(
      "fieldset",
      {},
      h("legend", {}, name),
      h("div", { class: "row" }, ...children),
    );
  }
  function picture() {
    const s = c.state;
    const surface = h("canvas", {
      class: "watch-window",
      width: 160,
      height: 43,
      role: "img",
    });
    const g = surface.getContext("2d");
    if (!g) return null;
    const dark = "#26253d",
      ink = "#4c4053",
      paper = "#efd8aa",
      brass = "#efbc66",
      mud = "#b88f6a",
      cool = "#8bd1c9",
      plum = "#9a78aa",
      wood = "#845c42";
    function rect(
      x: number,
      y: number,
      w: number,
      height: number,
      colour: string,
    ) {
      g!.fillStyle = colour;
      g!.fillRect(x, y, w, height);
    }
    function line(
      x: number,
      y: number,
      tx: number,
      ty: number,
      colour: string,
      width = 1,
    ) {
      const n = Math.max(Math.abs(tx - x), Math.abs(ty - y));
      for (let i = 0; i <= n; i++)
        rect(
          Math.round(x + ((tx - x) * i) / (n || 1)),
          Math.round(y + ((ty - y) * i) / (n || 1)),
          width,
          width,
          colour,
        );
    }
    rect(0, 0, 160, 43, dark);
    let label = "";
    if (site === "fern") {
      const face = watchNumber(s, site, "face", 2, -1);
      rect(8, 4, 144, 35, mud);
      rect(10, 6, 140, 2, paper);
      for (const [x, y] of [
        [60, 14],
        [73, 9],
        [87, 14],
      ])
        line(74, 26, x, y, ink, 2);
      for (let i = 0; i < 3; i++) rect(83 + i * 4, 21 - i * 3, 6, 2, ink);
      rect(92, 15, 3, 4, ink);
      if (face === 0) {
        for (const [x, y] of [
          [60, 14],
          [73, 9],
          [87, 14],
        ])
          line(73, 26, x - 1, y, cool);
        line(53, 30, 89, 30, cool);
      }
      if (face === 1 || face === 2) {
        const dx = face === 1 ? -11 : 0,
          dy = face === 1 ? 4 : 0;
        for (let i = 0; i < 3; i++)
          rect(dx + 83 + i * 4, dy + 20 - i * 3, 6, 1, brass);
        rect(92 + dx, 14 + dy, 3, 1, brass);
        line(86 + dx, 25 + dy, 99 + dx, 16 + dy, paper);
      }
      label =
        face < 0
          ? "A fan shape crossed by tread marks in mud."
          : story.notes[face];
    } else if (site === "stage") {
      const cover = watchNumber(s, site, "cover", 2, -1);
      rect(4, 4, 151, 31, ink);
      rect(5, 5, 150, 2, brass);
      rect(17, 11, 28, 21, paper);
      rect(17, 17, 28, 3, wood);
      for (const [x, hidden] of [
        [52, cover === 2],
        [124, cover === 1 || cover === 2],
      ] as const) {
        rect(x, 11, 19, 14, hidden ? plum : paper);
        if (hidden) {
          for (let i = 2; i < 18; i += 4) rect(x + i, 13, 1, 10, ink);
        } else {
          line(x + 3, 19, x + 7, 15, wood);
          line(x + 7, 15, x + 10, 20, wood);
          rect(x + 11, 19, 5, 1, wood);
        }
      }
      const heard = watchMark(s, site, "last-seat");
      for (let i = 0; i < 2; i++) {
        const x = 55 + i * 37;
        rect(x, 30, 24, 4, wood);
        rect(x + 2, 34, 3, 6, wood);
        rect(x + 21, 34, 3, 6, wood);
        if (heard === ["front", "rear"][i]) {
          rect(x + 2, 25, 4, 4, cool);
          if (i === 0) rect(x + 11, 25, 4, 4, cool);
        }
      }
      label =
        cover < 0
          ? "Two listening seats and two uncovered name cards."
          : story.notes[cover] +
            (heard === "rear"
              ? " One audible tap at the rear."
              : heard === "front"
                ? " Two audible taps at the front."
                : "");
    } else {
      const bits = watchNumber(s, site, "work", 7),
        folded = watchMark(s, site, "folded") === true;
      rect(8, 4, 144, 35, paper);
      rect(25, 5, 10, 33, cool);
      rect(35, 19, 41, 6, cool);
      rect(72, 21, 9, 17, cool);
      if (bits & 1) {
        line(14, 32, 49, 12, wood, 2);
        line(49, 12, 103, 18, wood, 2);
        rect(12, 30, 4, 5, brass);
        rect(101, 16, 5, 5, brass);
      }
      if (bits & 2) {
        rect(109, 7, 39, 28, folded ? mud : plum);
        for (let j = 0; j < 4; j++) rect(111, 10 + j * 6, 2, 3, ink);
        if (!folded) {
          for (const [x, y] of [
            [125, 17],
            [134, 24],
            [129, 26],
          ])
            rect(x, y, 4, 2, paper);
        } else {
          line(112, 8, 144, 32, wood);
          line(144, 8, 112, 32, wood);
        }
      }
      label = !(bits & 1)
        ? "A linen map awaits the landing steps."
        : folded
          ? "The ferry turn remains visible and the nesting inset is folded shut."
          : bits & 2
            ? "The ferry route and local nesting marks can both be read at the keepers’ table."
            : "Two public steps mark the ferry turn.";
    }
    surface.setAttribute("aria-label", label);
    return surface;
  }
  function draw() {
    const s = c.state,
      bits = watchNumber(s, site, "work", 7),
      seen = (i: number) => Boolean(bits & (1 << i));
    work.replaceChildren();
    const window = picture();
    if (window) work.append(window);
    if (site === "fern") {
      const face = watchNumber(s, site, "face", 2, -1);
      work.append(
        group(
          "Impression tray",
          ...([0, 1, 2] as const).map((piece) =>
            key(
              "lay" + piece,
              story.moves[piece],
              { action: "lay", piece },
              { on: face === piece },
            ),
          ),
        ),
      );
      for (const part of ["fan", "boot"] as const) {
        const who = whoSigned(s, part);
        work.append(
          group(
            part === "fan" ? "Sign for the fan" : "Sign for the boot",
            ...(["walker", "mender"] as const).map((by) =>
              key(
                part + by,
                by === "walker" ? "Ask the bank walker" : "Ask the boot mender",
                { action: "sign", part, by },
                { on: by === who, disabled: !seen(part === "fan" ? 0 : 2) },
              ),
            ),
          ),
        );
      }
    } else if (site === "stage") {
      const cover = watchNumber(s, site, "cover", 2, -1);
      work.append(
        group(
          "Review curtains",
          ...([0, 1, 2] as const).map((n) =>
            key(
              "screen" + n,
              story.moves[n],
              { action: "screen", cover: n },
              { on: cover === n },
            ),
          ),
        ),
        group(
          "Listen from a seat",
          ...(["front", "rear"] as const).map((seat, i) =>
            key(
              seat,
              seat === "front"
                ? "Sit beside the whistle"
                : "Sit at the loose rear panel",
              { action: "hear", seat },
              {
                on: cover >= 0 && Boolean(hearing(s, cover) & (1 << i)),
                disabled: cover < 0,
              },
            ),
          ),
        ),
      );
      const record = h("ul", { "aria-label": "Slips returned" });
      for (const n of [0, 1, 2]) {
        const hMask = hearing(s, n);
        if (hMask)
          record.append(
            h(
              "li",
              {},
              ["Open review", "Listener covered", "Both names covered"][n] +
                " · " +
                [
                  hMask & 1 ? "front heard two taps" : "",
                  hMask & 2 ? "rear heard one tap" : "",
                ]
                  .filter(Boolean)
                  .join(", "),
            ),
          );
      }
      if (record.childElementCount) work.append(record);
    } else {
      work.append(
        group(
          "Chart frame",
          ...([0, 1, 2] as const).map((piece) =>
            key(
              "layer" + piece,
              story.moves[piece],
              { action: "layer", piece },
              {
                disabled:
                  (piece === 1 && !seen(0)) || (piece === 2 && !seen(1)),
              },
            ),
          ),
        ),
        key(
          "carry",
          "Try taking this frame to the ferry rail",
          { action: "carry" },
          { disabled: !seen(1) },
        ),
      );
    }
    letters.replaceChildren();
    if (whistleReady(s, site))
      letters.append(
        group(
          "Leave the shift with someone",
          ...([0, 1] as const).map((hand) =>
            key(
              "send" + hand,
              story.choice[hand],
              { action: "send", hand },
              {
                disabled:
                  site === "island" &&
                  hand === 0 &&
                  watchMark(s, site, "recalled") === true,
              },
            ),
          ),
        ),
      );
    else
      letters.append(
        h(
          "details",
          {},
          h("summary", {}, "Look at Liri’s work slip"),
          h("p", {}, whistleStops[site][3]),
        ),
      );
    if (
      watchMark(s, site, "together") === true &&
      watchNumber(s, site, "sent", 1, -1) >= 0
    ) {
      const favour = whistleRelief[site];
      letters.append(
        watchMark(s, site, "relieved") === true
          ? h("p", {}, favour.result)
          : h(
              "div",
              {},
              h("p", {}, favour.request),
              key("relieve", favour.action, { action: "relieve" }),
            ),
      );
    }
    if (
      site === "island" &&
      watchMark(s, site, "sent") === 0 &&
      watchMark(s, site, "recalled") !== true
    )
      letters.append(
        h(
          "p",
          {},
          "A later watch brings word from the bank. The walkers ask to suspend the circulating route during nesting season.",
        ),
        key("recall", "Ring for the ferry copy to come back", {
          action: "recall",
        }),
      );
    if (watchMark(s, site, "recalled") === true)
      letters.append(
        h(
          "p",
          {},
          "The outside copy has been called back. The visitors’ path still reaches the keepers’ table.",
        ),
      );
  }
  draw();
  return { root, dispose: () => silence?.() };
}
