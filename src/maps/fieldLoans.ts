import {
  loanBench,
  loanStops,
  stops,
  type LoanStop,
} from "../content/loanCrews";
import { loanFitted } from "../content/fieldLoans";
import { loanSite } from "../domain/fieldLoan";
import type { Interactable } from "./types";

type Tile = readonly [number, number];
const benches: Record<LoanStop, Tile> = {
  press: [11, 13],
  stage: [13, 12],
  dispatch: [12, 13],
  fern: [11, 10],
};
const arrivals: Record<LoanStop, readonly [Tile, Tile]> = {
  press: [
    [12, 12],
    [11, 12],
  ],
  stage: [
    [12, 12],
    [11, 12],
  ],
  dispatch: [
    [12, 14],
    [5, 10],
  ],
  fern: [
    [4, 14],
    [12, 12],
  ],
};
const readers: Record<LoanStop, readonly [Tile, Tile]> = {
  press: [
    [12, 10],
    [12, 12],
  ],
  stage: [
    [12, 13],
    [8, 11],
  ],
  dispatch: [
    [13, 14],
    [5, 8],
  ],
  fern: [
    [5, 14],
    [13, 12],
  ],
};
const readerSigns: Record<LoanStop, readonly [string, string]> = {
  press: ["A mitten tied to the cart rail", "The reader who missed the cart"],
  stage: ["Two children trying the cue", "The usher and the reflecting card"],
  dispatch: [
    "A waiting caller at the outer hatch",
    "The canal messenger’s muddy shoe",
  ],
  fern: [
    "A watcher holding a strip to the light",
    "A reader’s peg under the awning",
  ],
};
export function fieldLoansAt(map: string): Interactable[] {
  const props: Interactable[] = [];
  for (const stop of stops) {
    const desk = loanStops[stop],
      site = loanSite(stop),
      [x, y] = benches[stop];
    if (map === desk.map) {
      props.push(
        {
          id: site + ".sign",
          kind: "scene",
          node: site + ".invite",
          x,
          y,
          w: 1,
          h: 1,
          art: "ledger",
          label: desk.person + "’s invitation",
        },
        {
          id: loanBench(stop),
          kind: "fieldgame",
          game: site,
          x: x + 1,
          y,
          w: 1,
          h: 1,
          art: desk.art,
          label: desk.title,
          visibleIf: loanFitted(stop),
        },
      );
    }
    for (const [i, choice] of (["carry", "keep"] as const).entries()) {
      const target = desk.targets[i],
        [tx, ty] = arrivals[stop][i],
        visibleIf = { flag: site + ".edition", eq: choice };
      if (map === desk.map)
        props.push({
          id: site + ".way." + choice,
          kind: "door",
          x: x + 2,
          y,
          w: 1,
          h: 1,
          walkThrough: true,
          art: i === 0 ? "road-post" : desk.art,
          label: desk.doors[i],
          to: { map: target, x: tx, y: ty },
          visibleIf,
        });
      if (map === target) {
        const [rx, ry] = readers[stop][i],
          node = site + ".reader." + choice;
        props.push({
          id: node,
          kind: "scene",
          node,
          x: rx,
          y: ry,
          w: 1,
          h: 1,
          walkThrough: true,
          art: desk.art,
          label: readerSigns[stop][i],
          visibleIf,
        });
      }
    }
  }
  return props;
}
