import { waiting, type VaultStation } from "../content/vaultNight";
import {
  firstPeg,
  flapCount,
  gateApart,
  gateMask,
  listeners,
  nextPeg,
  veil,
  waxSeen,
} from "../domain/vaultWork";
import type { CampaignState } from "../domain/types";
import { h } from "./dom";

type State = Pick<CampaignState, "mapId" | "flags">;

/** A live view of the actual cords, shutters, leaves and pegs on the work table. */
export function vaultWindow(s: State, who: VaultStation) {
  const surface = h("canvas", {
    width: 164,
    height: 43,
    class: "vault-window",
    role: "img",
  });
  const g = surface.getContext("2d");
  if (!g) return null;
  const ink = "#27243b",
    wood = "#674737",
    lightWood = "#af8057",
    paper = "#eed6a3",
    gold = "#f9cc73",
    water = "#7fc7c8",
    wax = "#bc6b65",
    steel = "#aba7bd",
    shadow = "#3f3a51";
  function box(x: number, y: number, w: number, h: number, fill: string) {
    g!.fillStyle = fill;
    g!.fillRect(x, y, w, h);
  }
  function steps(x: number, y: number, tx: number, ty: number, fill: string) {
    const n = Math.max(Math.abs(tx - x), Math.abs(ty - y));
    for (let j = 0; j <= n; j++)
      box(
        Math.round(x + ((tx - x) * j) / (n || 1)),
        Math.round(y + ((ty - y) * j) / (n || 1)),
        1,
        1,
        fill,
      );
  }
  function leaf(x: number, y: number, w: number, h: number) {
    box(x + 2, y + 2, w, h, shadow);
    box(x, y, w, h, paper);
    box(x + 2, y + 2, w - 6, 1, lightWood);
  }
  function peg(x: number, y: number, colour: string) {
    box(x, y, 2, 8, colour);
    box(x - 2, y - 2, 6, 4, colour);
    box(x - 1, y - 2, 2, 1, paper);
  }
  box(0, 0, 164, 43, ink);
  box(0, 37, 164, 6, wood);
  box(0, 37, 164, 1, lightWood);
  let description = "";
  switch (who) {
    case "many": {
      const felt = s.flags["vault-work.many.felt"] === true;
      const rung = s.flags["vault-work.many.ring"] !== undefined;
      const bells = [
        { x: 48, colour: felt ? shadow : gold },
        { x: 130, colour: water },
      ];
      for (const { x, colour } of bells) {
        box(x - 3, 6, 6, 2, steel);
        box(x - 6, 8, 12, 5, colour);
        box(x - 8, 13, 16, 2, colour);
        box(x - 1, 15, 2, 3, steel);
      }
      for (const x of [14, 48, 82]) {
        steps(48, 17, x, 22, lightWood);
        box(x, 22, 1, 10, lightWood);
        box(x - 2, 30, 5, 3, gold);
      }
      box(130, 17, 1, 15, water);
      box(128, 29, 5, 4, water);
      if (felt) {
        box(36, 7, 24, 6, steel);
        box(35, 12, 26, 5, shadow);
      }
      if (rung)
        for (const { x, colour } of bells.filter((b) => !felt || b.x === 130)) {
          box(x - 12, 8, 2, 6, colour);
          box(x + 11, 8, 2, 6, colour);
        }
      description = felt
        ? "One felt sleeve covers the bell shared by three cords. The short cord still rings its own bell."
        : "Three long cords join at one bell. A shorter cord hangs from a second bell.";
      break;
    }
    case "twogates": {
      const mask = gateMask(s);
      for (let i = 0; i < 3; i++) {
        const x = 12 + 52 * i,
          open = Boolean(mask & (1 << i));
        box(x, 5, 3, 32, lightWood);
        box(x + 32, 5, 3, 32, lightWood);
        box(x, 5, 35, 3, wood);
        const height = open ? 5 : 23;
        box(x + 3, 8, 29, height, shadow);
        for (let r = 0; r < height; r += 4) box(x + 3, 8 + r, 29, 2, steel);
        const y = 32;
        if (i === 0) {
          leaf(x + 10, y - 5, 13, 7);
          box(x + 16, y - 5, 1, 7, wood);
        }
        if (i === 1) {
          leaf(x + 12, y - 6, 12, 8);
          steps(x + 13, y, x + 17, y - 3, water);
          steps(x + 17, y - 3, x + 22, y + 1, water);
        }
        if (i === 2) {
          leaf(x + 11, y - 4, 14, 7);
          steps(x + 11, y - 4, x + 17, y, wood);
          steps(x + 17, y, x + 24, y - 4, wood);
        }
      }
      if (!gateApart(s))
        for (let x = 18; x < 146; x += 5) box(x, 4, 4, 2, gold);
      description =
        (gateApart(s)
          ? "Separate handles. "
          : "The shutters share one chain. ") +
        waiting
          .map(
            (w, i) =>
              w +
              (mask & (1 << i)
                ? " has an open shutter."
                : " waits outside a closed shutter."),
          )
          .join(" ");
      break;
    }
    case "chosen": {
      const view = s.flags["vault-work.chosen.window"];
      for (let i = 0; i < 6; i++) {
        const x = 8 + i * 25,
          green = [0, 2, 3].includes(i);
        const seen =
          view === "tabs"
            ? green
            : typeof view === "number" && i >= view && i < view + 3;
        if (seen) box(x - 2, 4, 23, 32, gold);
        leaf(x, 6, 19, 27);
        if (green) box(x + 10, 4, 6, 4, water);
        if (seen) {
          if (i === 5) {
            for (let j = 0; j < 5; j++)
              box(x + 1 + j * 3, 23 + (j % 2) * 2, 4, 10, ink);
          } else {
            box(x + 2, 21, 15, 2, wood);
            box(x + 4, 23, 2, 5, wood);
            const high = i === 1 || i === 4;
            for (let j = 0; j < 4; j++)
              box(x + 2 + j * 4, (high ? 18 : 27) + (j % 2), 4, 2, water);
          }
        } else box(x + 2, 15, 15, 2, lightWood);
      }
      description =
        view === "tabs"
          ? "The green tabs reveal three dry crossings."
          : typeof view === "number"
            ? "Three dated pages in the frame, starting on night " +
              (view + 1) +
              "."
            : "Six dated pages with green tabs at one, three and four.";
      break;
    }
    case "stamp": {
      const seen = waxSeen(s);
      for (let i = 0; i < 3; i++) {
        const x = 10 + i * 52;
        leaf(x, 8, 37, 24);
        if (seen & (1 << i)) {
          if (i === 0) {
            box(x + 10, 13, 17, 13, wax);
            box(x + 8, 16, 21, 7, wax);
            box(x + 15, 17, 8, 3, gold);
            box(x + 12, 25, 3, 6, wax);
          }
          if (i === 1) {
            steps(x + 4, 24, x + 14, 15, wood);
            steps(x + 14, 15, x + 18, 23, wood);
            steps(x + 18, 23, x + 23, 15, wood);
            box(x + 26, 22, 6, 1, wood);
          }
          if (i === 2) {
            for (let j = 0; j < 8; j++) box(x + 5 + j * 3, 15, 1, 7, wood);
            box(x + 4, 25, 27, 1, wood);
          }
        } else {
          box(x + 3, 12, 31, 13, shadow);
          box(x + 4, 14, 29, 1, steel);
        }
      }
      description = [
        "Keeper’s filing seal",
        "Mella’s watch slip",
        "Reverse with the watch time",
      ]
        .map(
          (name, i) =>
            name + (seen & (1 << i) ? " examined." : " still covered."),
        )
        .join(" ");
      break;
    }
    case "margin": {
      const flaps = flapCount(s);
      for (let i = 0; i < 2; i++) {
        const x = 57 + i * 26;
        leaf(x, 10, 24, 22);
        if (flaps & (1 << i)) {
          box(x + 2, 21, 19, 2, wood);
          for (let j = 0; j < 4; j++)
            box(x + 3 + j * 4, (i ? 18 : 27) + (j % 2), 5, 2, water);
        } else {
          steps(x, 10, x + 12, 22, wood);
          steps(x + 12, 22, x + 23, 10, wood);
        }
      }
      for (const [base, count, colour] of [
        [8, firstPeg(s), gold],
        [117, nextPeg(s), water],
      ] as const) {
        box(base, 26, 36, 6, lightWood);
        for (let i = 0; i < 3; i++) {
          const x = base + 5 + i * 12;
          box(x - 1, 27, 4, 2, ink);
          if (count === i) peg(x, 21, colour);
        }
      }
      description =
        "Forecast pegs on each side of two crossing records. " +
        [firstPeg(s), nextPeg(s)]
          .map(
            (v, i) =>
              (i ? "Next watch" : "First watch") +
              (v < 0 ? " has no peg." : " pegged " + v + " dry."),
          )
          .join(" ");
      break;
    }
    case "promise": {
      const mask = veil(s),
        ears = listeners(s);
      leaf(31, 5, 102, 28);
      for (let i = 0; i < 3; i++) {
        const x = 36 + 31 * i;
        for (let j = 0; j < 3; j++)
          box(x, 13 + j * 4, 23 - ((i + j) % 3) * 3, 1, wood);
      }
      if (!(mask & 1)) box(31, 5, 31, 28, lightWood);
      if (!(mask & 2)) box(101, 5, 32, 28, lightWood);
      for (const [x, n] of [
        [8, 1],
        [143, 2],
      ]) {
        box(x, 18, 3, 16, wood);
        box(x, 28, 14, 3, lightWood);
        box(x + 10, 30, 3, 7, wood);
        if (ears & n) box(x + 3, 24, 8, 4, gold);
      }
      description =
        (mask === 3
          ? "The complete letter is open. "
          : "A shutter still covers a section of the letter. ") +
        (ears === 3
          ? "Both chairs have been occupied."
          : "The chairs mark two places from which to listen.");
      break;
    }
  }
  surface.setAttribute("aria-label", description);
  return surface;
}
