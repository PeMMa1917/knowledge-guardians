import {
  loanFamily,
  loanJobs,
  loanStops,
  pairedStop,
  type LoanEdition,
  type LoanStop,
} from "../content/loanCrews";
import {
  carriesSpecimen,
  hasSpecimen,
  PERSPECTIVE_FLAG,
  specimenFromTool,
  type SpecimenExhibit,
} from "./specimenGear";
import type {
  CampaignState,
  ContentPack,
  Effect,
  EvidenceCard,
  Weave,
} from "./types";

export type Setting = 0 | 1 | 2;
export type FieldLoanCommand = {
  type: "WorkFieldLoan";
  stop: LoanStop;
  key: string;
} & (
  | { mode: "adjust"; position: Setting }
  | { mode: "try"; setting: Setting }
  | { mode: "letter"; letter: Letter }
  | { mode: "issue"; edition: LoanEdition }
);
type Incoming = LoanEdition | "first";
export const setupLabels: Record<LoanStop, readonly [string, string, string]> =
  {
    press: [
      "Name at the left stop",
      "Accession at the left stop",
      "Date at the left stop",
    ],
    stage: ["House lights up", "First change", "Final beat"],
    dispatch: [
      "Object name on strap",
      "Record date on strap",
      "Collection address on strap",
    ],
    fern: ["Single sleeve", "Fold seam outwards", "Second sheet of wax"],
  };
function atStop(value: unknown): value is Setting {
  return value === 0 || value === 1 || value === 2;
}

export const loanSite = (stop: LoanStop) => "field-loan." + stop;
export const loanMark = (stop: LoanStop, key: string) =>
  loanSite(stop) + "." + key;
function edition(value: unknown): LoanEdition | undefined {
  return value === "carry" || value === "keep" ? value : undefined;
}

export function equippedLoan(
  pack: ContentPack,
  state: CampaignState,
  stop: LoanStop,
) {
  const site = Object.hasOwn(loanStops, stop) ? loanStops[stop] : undefined;
  if (!site || site.map !== state.mapId) return;
  const active = state.flags[PERSPECTIVE_FLAG];
  const key = typeof active === "string" ? specimenFromTool(active) : undefined;
  const family = key && loanFamily(key);
  if (!key || !family || !carriesSpecimen(state, key)) return;
  const peer = pairedStop(family, stop);
  if (!peer) return;
  const record = pack.exhibits.find(
    (e): e is SpecimenExhibit => hasSpecimen(e) && e.specimen.key === key,
  );
  if (!record) return;
  const card = pack.cards.find((c) => c.id === record.grantsCard);
  if (!card) return;
  const incoming: Incoming =
    edition(state.flags[loanMark(peer, key) + ".sent"]) ?? "first";
  const fixed = state.flags[loanMark(stop, key) + "." + incoming + ".position"];
  return {
    record,
    card,
    job: loanJobs[family],
    peer,
    incoming: incoming as Incoming,
    key,
    position: atStop(fixed) ? fixed : (0 as Setting),
  };
}
export type DeskLoan = NonNullable<ReturnType<typeof equippedLoan>>;
export function testedLoan(
  state: CampaignState,
  stop: LoanStop,
  loan: DeskLoan,
  setting: Setting,
) {
  return (
    state.flags[
      loanMark(stop, loan.key) +
        "." +
        loan.incoming +
        "." +
        loan.position +
        ".try" +
        setting
    ] === true
  );
}
export function selectedLoan(
  state: CampaignState,
  stop: LoanStop,
  loan: DeskLoan,
): Setting | undefined {
  const last =
    state.flags[
      loanMark(stop, loan.key) +
        "." +
        loan.incoming +
        "." +
        loan.position +
        ".last"
    ];
  return last === 0 || last === 1 || last === 2 ? last : undefined;
}
export const returnedLoan = (
  state: CampaignState,
  stop: LoanStop,
  key: string,
) => edition(state.flags[loanMark(stop, key) + ".sent"]);
export function workFieldLoan(
  pack: ContentPack,
  state: CampaignState,
  cmd: FieldLoanCommand,
): Effect[] {
  const loan = equippedLoan(pack, state, cmd.stop);
  if (!loan || loan.key !== cmd.key)
    throw new Error(
      "Fit this collected object from your satchel at its receiving bench.",
    );
  const site = loanSite(cmd.stop),
    mark = loanMark(cmd.stop, cmd.key),
    editionKey = mark + "." + loan.incoming,
    proof = editionKey + "." + loan.position;
  if (cmd.mode === "adjust" && atStop(cmd.position))
    return [{ setFlag: editionKey + ".position", value: cmd.position }];
  if (
    cmd.mode === "try" &&
    (cmd.setting === 0 || cmd.setting === 1 || cmd.setting === 2)
  ) {
    const effects: Effect[] = [
      { setFlag: proof + ".try" + cmd.setting, value: true },
      { setFlag: proof + ".last", value: cmd.setting },
      { setFlag: site + ".tried", value: true },
    ];
    if (
      (cmd.setting === 0 && testedLoan(state, cmd.stop, loan, 1)) ||
      (cmd.setting === 1 && testedLoan(state, cmd.stop, loan, 0))
    )
      effects.push({ setFlag: site + ".compared", value: true });
    return effects;
  }
  if (cmd.mode === "letter" && atStop(cmd.letter)) {
    if (selectedLoan(state, cmd.stop, loan) === undefined)
      throw new Error(
        "First give the reader a physical impression to examine.",
      );
    if (cmd.letter !== 0 && state.flags[proof + ".identified"] !== true)
      throw new Error("Put the particular object on the letter first.");
    return cmd.letter === 0
      ? [{ setFlag: proof + ".identified", value: true }]
      : [
          { setFlag: site + ".questioned", value: true },
          { setFlag: mark + ".letter", value: cmd.letter },
        ];
  }
  if (cmd.mode !== "issue" || !edition(cmd.edition))
    throw new Error("Choose a workbench setting or an edition.");
  if (
    !testedLoan(state, cmd.stop, loan, 0) ||
    !testedLoan(state, cmd.stop, loan, 1)
  )
    throw new Error(
      "Try the first two settings with the slip that is here now. Different readers receive different parts.",
    );
  const effects: Effect[] = [
    { setFlag: mark + ".sent", value: cmd.edition },
    { setFlag: site + ".edition", value: cmd.edition },
    { setFlag: site + ".key", value: cmd.key },
  ];
  if (loan.incoming !== "first")
    effects.push({ setFlag: site + ".received", value: true });
  return effects;
}

export interface LoanStrip {
  label: string;
  text: string;
}
export interface LoanReading {
  bell?: boolean;
  strips: [LoanStrip, LoanStrip];
  observation: string;
}
const strip = (label: string, text: string): LoanStrip => ({ label, text });
export function loanReading(
  record: SpecimenExhibit,
  card: EvidenceCard,
  stop: LoanStop,
  setting: Setting,
  incoming: Incoming,
  position: Setting = 0,
): LoanReading {
  const number = record.specimen.accession,
    date = record.dateText,
    limit = card.limits;
  const source = record.specimen.institution,
    title = record.name;
  switch (stop) {
    case "press": {
      const line = [
          [title, number, date],
          [number, date, title],
          [date, title, number],
        ][position].join(" · "),
        cells = incoming === "carry" ? 28 : 18;
      const chars = Array.from(line),
        short = chars.slice(0, cells).join("");
      const first = setting === 0 ? short : line;
      const back =
        setting === 2
          ? source + " · " + limit
          : incoming === "keep"
            ? source + " · retained at the desk"
            : "Uninked paper";
      return {
        strips: [strip("Impression", first), strip("Reverse", back)],
        observation:
          setting === 0
            ? "The chase takes " +
              cells +
              " spaces. " +
              Math.max(0, chars.length - cells) +
              " characters fall outside the mitten-sized impression."
            : setting === 1
              ? "Mina unfolds the second leaf. The full date and number survive the pull. Fold it again and the outer face hides the last leaf."
              : "The source and its limit now sit on the reverse. The runner must turn the impression over to see them.",
      };
    }
    case "stage": {
      const beat = ["House lights", "Change", "Final beat"][position],
        echo = incoming === "carry" && position === 2,
        prompter = incoming === "keep";
      const lamp = setting !== 1 && (setting === 2 || position !== 2);
      const bell =
        (setting !== 0 &&
          (position === 1 || (setting === 2 && position === 2))) ||
        echo;
      return {
        bell,
        strips: [
          strip(
            "Front row · " + beat,
            lamp ? "The name is lit · " + title : "Dark glass",
          ),
          strip(
            "Balcony · " + beat,
            bell
              ? "Bell on the number · " + number
              : prompter
                ? "The prompter holds up the dated leaf · " + date
                : "No bell",
          ),
        ],
        observation: echo
          ? "On the final beat, the visiting runner relays the number to the balcony. Watch what the front row can still see."
          : prompter && !bell
            ? "The bell is still. The prompter has the other desk’s dated leaf and holds it where the upper reader can see it."
            : lamp && bell
              ? "Both seats have a cue on the same beat. The two readers can match a name and a number. The signals cannot carry the whole account."
              : lamp
                ? "The lamp catches the name for the front row. Move the beat forward to see how long the reader has to signal."
                : bell
                  ? "The balcony has the number. Below, a hand is still shading the dark lamp."
                  : "The two seats wait in the dark. Advance or rewind the cues at your own pace.",
      };
    }
    case "dispatch": {
      const returnAddress =
        incoming === "carry"
          ? source
          : incoming === "keep"
            ? "Side desk · " + number
            : "No other desk has answered yet.";
      return {
        strips: [
          strip(
            "Public strap",
            setting === 1
              ? "Plain canvas"
              : [title, date, source][position] + " · " + number,
          ),
          strip("Inside pocket", setting === 0 ? "The packet is shut." : limit),
        ],
        observation:
          setting === 2
            ? "The same counterfoil number joins the two surfaces. Return address on this slip · " +
              returnAddress
            : setting === 0
              ? "A caller can locate the object. The reason to qualify a claim stays inside the hatch. Return mark · " +
                returnAddress
              : "The side clerk can read the limit in private. From the street, the plain strap gives no clue which slip to request. Return mark · " +
                returnAddress,
      };
    }
    case "fern": {
      const overlap =
        incoming === "carry"
          ? number
          : incoming === "keep"
            ? source
            : "bare thread";
      const outerDry =
        position === 2 ||
        setting === 2 ||
        (position === 0 ? setting === 0 : setting === 1);
      const backDry = position === 2 || setting === 2 || !outerDry;
      return {
        strips: [
          strip(
            "Outer strip",
            outerDry ? number + " · " + date : "Ink washed into the sleeve",
          ),
          strip("Return strip", backDry ? limit : "A grey streak at the seam"),
        ],
        observation:
          (position === 2
            ? "The second wax sheet keeps both lines dry in either orientation. It leaves no space for a spare blank."
            : setting === 2
              ? "The waxed overlap holds both strips dry. The roll takes two hands to open."
              : outerDry
                ? "The dated line comes out legible. The other strip rubs against the wet seam."
                : "Only the reverse survives this pass. A field date would need another witness.") +
          " The tie catches " +
          overlap +
          ".",
      };
    }
  }
}
export function loanWeave(stop: LoanStop): Weave {
  const aoks: Record<LoanStop, NonNullable<Weave["aoks"]>> = {
    press: ["ART", "HIS", "LAN"],
    stage: ["ART", "HUM", "LAN"],
    dispatch: ["HIS", "HUM", "POL"],
    fern: ["NAT", "HIS", "TEC"],
  };
  return {
    concepts: [
      "evidence",
      "interpretation",
      "justification",
      "perspective",
      "responsibility",
      "power",
    ],
    framework: ["methods-and-tools", "perspectives", "ethics"],
    aoks: aoks[stop],
    atl: [...loanStops[stop].skills],
    subjects: [...loanStops[stop].subjects],
    thinking: {
      dok: 3,
      bloom: "evaluate",
      fink: "integration",
      solo: "relational",
    },
    minutes: 4,
  };
}

export const readerLetters: Record<
  LoanStop,
  readonly [string, string, string]
> = {
  press: [
    "Tuck the object’s name in the mitten",
    "Ask which words the far reader can recover",
    "Ask who can check the words off the edge",
  ],
  stage: [
    "Give the usher the object’s number",
    "Ask what the back row could perceive",
    "Ask which part a performance can establish",
  ],
  dispatch: [
    "Address the caller’s packet",
    "Ask what can be checked from the street",
    "Ask who has to request the inside slip",
  ],
  fern: [
    "Name the thing on the drying line",
    "Ask what the wet roll can still establish",
    "Ask what a later watcher must find again",
  ],
};
export type Letter = 0 | 1 | 2;
export function readerAnswer(
  loan: DeskLoan,
  stop: LoanStop,
  letter: Letter,
  setting: Setting,
) {
  if (letter === 0) return loan.card.text;
  const sheet = loanReading(
    loan.record,
    loan.card,
    stop,
    setting,
    loan.incoming,
    loan.position,
  );
  if (letter === 1) {
    const line = sheet.strips[stop === "stage" ? 1 : 0];
    return (
      "“" +
      line.text +
      "” is all I get from " +
      line.label.toLowerCase() +
      ". " +
      sheet.observation
    );
  }
  const voice: Record<LoanStop, string> = {
    press:
      "Mina sets the uncut record next to the impression. She reads aloud the part a traveller could never recover by squinting at a clipped slip.",
    stage:
      "Edda holds the two cue cards in the same light. “You can tell me which beat reached you. Neither seat by itself can tell me the history of what we staged.”",
    dispatch:
      "Ade opens the second pocket where the caller can read the qualification beside the name. Someone who only saw the strap would have to write back.",
    fern: "Elian ties a clean leaf to the roll. “If the last line has washed off, I can tell you it was there. For its words I have to go back to the record.”",
  };
  return voice[stop] + " " + loan.card.limits;
}
