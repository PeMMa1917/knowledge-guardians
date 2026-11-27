import type { ShowdownOutcome, Weave } from "../../domain/types";

export interface HearingStation {
  title: string;
  art: string;
  speaker: string;
  opening: string;
  readings: [[string, string], [string, string]];
  card: string;
  limit: string;
  witness: string;
  claim: string;
  challenge: string;
  diagnosis: string;
  objection: string;
  reframe: string;
  chair: string;
  handover: string;
  nextTown: string;
}
export interface TownHearing {
  id: string;
  title: string;
  chapter: number;
  world: string;
  map: string;
  place: string;
  x: number;
  y: number;
  host: string;
  opening: string;
  claim: string;
  question: string;
  source: string;
  narrow: string;
  fair: string;
  concession: string;
  press: string;
  value: boolean;
  outcomes: Record<ShowdownOutcome, string>;
  stations: [HearingStation, HearingStation];
  weave: Weave;
  kq: string;
}
