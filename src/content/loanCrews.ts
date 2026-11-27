import collection from "./loan-collection.json";

export const loanStops = {
  press: {
    map: "copies.landing",
    world: "WORLD-08",
    place: "Lending Hall Landing",
    person: "Mina",
    speaker: "copies-lendingkeeper",
    title: "The press in a matchbox",
    art: "loan.matchpress",
    hook: "Mina opens the tiniest press in town with her thumbnail. Her brother built it to print a claim check small enough to ride inside a mitten. His own check came back this morning. Somebody had shaved the last word off his address.",
    action: "Pull the little press",
    controls: [
      "Set the short chase",
      "Unfold the long chase",
      "Tip the source onto the back",
    ],
    choices: [
      "Send the short check on the morning cart",
      "Keep the folded check at the lending desk",
    ],
    replies: [
      "The driver takes the short check. A reader can travel immediately, but needs the lending desk to unfold the rest.",
      "Mina hangs up the long check. Both edges can be checked here. The driver has already rounded the bend.",
    ],
    doors: ["The morning-cart lane", "The fold-out reading room"],
    targets: ["copies.archive", "copies.press"],
    skills: ["research", "communication"],
    subjects: ["lang-langlit", "design-tech", "history"],
  },
  stage: {
    map: "stage.foyer",
    world: "WORLD-10",
    place: "Front Foyer",
    person: "Edda",
    speaker: "stage-director",
    title: "The balcony handbell",
    art: "loan.balcony",
    hook: "Edda holds a bell with its clapper tied in a sock. “When I was up there I used to clap a second late. The others thought it was a joke.” The front-row crew can see her hand. The balcony waits for a sound.",
    action: "Try the cue from both seats",
    controls: [
      "Pull the near lamp",
      "Ring from the balcony",
      "Hold both through the change",
    ],
    choices: [
      "Give the leading cue to the front row",
      "Give the balcony the opening beat",
    ],
    replies: [
      "The near lamp comes up first. A child beside the stage can call the change. Someone higher up has to wait a beat.",
      "The balcony rings before the lamp turns. The upper seats can start the exchange. The front row waits for the second cue.",
    ],
    doors: ["The prompt-side stair", "The balcony walk"],
    targets: ["stage.rehearsal", "stage.gallery"],
    skills: ["thinking", "communication"],
    subjects: ["theatre", "music", "physics"],
  },
  dispatch: {
    map: "civic.dispatch",
    world: "WORLD-13",
    place: "Library Dispatch",
    person: "Ade",
    speaker: "civic-operator",
    title: "The two-pocket post",
    art: "loan.pockets",
    hook: "Ade is sewing a second pocket onto the postbag. His little girl put a drawing in last week’s public pocket for him. Half the step knew about his missing front tooth before he got home.",
    action: "Send the bag through the hatch",
    controls: [
      "Hang the name on the outer strap",
      "Put the limit inside",
      "Tie a return slip between the pockets",
    ],
    choices: [
      "Let the public hatch issue the next slip",
      "Keep the paired answer at the side desk",
    ],
    replies: [
      "The outer hatch can send immediately. The public gets the line on the strap. A reader who needs the inside must ask.",
      "The two parts stay within reach of the same worker. A quiet reply can travel back. Readers must wait for a turn at the desk.",
    ],
    doors: ["The hatch to the North Steps", "The side desk’s canal passage"],
    targets: ["civic.steps", "civic.canal"],
    skills: ["social", "research"],
    subjects: ["global-politics", "digital-society", "lang-b"],
  },
  fern: {
    map: "forest.station",
    world: "WORLD-06",
    place: "Fern Station",
    person: "Elian",
    speaker: "forest-naturalist",
    title: "The rain on the field roll",
    art: "loan.fieldroll",
    hook: "Elian has rubbed the corner of a label clean off with the sleeve of his coat. Yesterday he blamed the rain. The coat is on the peg today, complete with a tiny backwards word on the cuff.",
    action: "Draw the practice roll through the wet sleeve",
    controls: [
      "Turn the outer strip up",
      "Turn the return strip up",
      "Tuck the overlap under the waxed tie",
    ],
    choices: [
      "Take the outer strip to the trail watch",
      "Dry the joined account under the awning",
    ],
    replies: [
      "The watch can compare the outer line while there is light. The reverse goes to the awning for a slower reading.",
      "Both marks can dry under the same roof. The trail watcher goes home without this sighting and can ask again at the clearing.",
    ],
    doors: ["The outside watch path", "The clearing below the awning"],
    targets: ["forest.trail", "forest.community"],
    skills: ["thinking", "research"],
    subjects: ["biology", "ess", "geography"],
  },
} as const;
export type LoanStop = keyof typeof loanStops;
export type LoanEdition = "carry" | "keep";
export type LoanFamily = keyof typeof collection;
interface LoanJob {
  primary: LoanStop;
  other: LoanStop;
  job: string;
  need: string;
  boundary: string;
}
export const loanJobs: Record<LoanFamily, LoanJob> = {
  m02: {
    primary: "press",
    other: "dispatch",
    job: "A count on two slips",
    need: "The merchant needs the catalogue number to follow ten ingots and their bag together.",
    boundary:
      "Retain the degree of certainty attached to the proposed century.",
  },
  nile: {
    primary: "fern",
    other: "press",
    job: "The route before the visitor",
    need: "The route keeper needs to recognise the historical sheet before setting a modern traveller on a road.",
    boundary:
      "Landmarks in the recorded landscape leave the current condition of a crossing open.",
  },
  fitting: {
    primary: "stage",
    other: "dispatch",
    job: "The hand and its exposure",
    need: "The lantern crew needs to tell an exposure from a later photographic copy.",
    boundary: "A hand-shaped shadow cannot date every copy of the picture.",
  },
  accession: {
    primary: "dispatch",
    other: "press",
    job: "The number beside the cord",
    need: "A caller needs to distinguish this catalogued Peruvian khipu from other knotted records.",
    boundary:
      "Keep the collection identification separate from a reading of any individual knot.",
  },
  clearance: {
    primary: "press",
    other: "fern",
    job: "The lid for a particular case",
    need: "The packing clerk has a place for the identified object and a different space for the catalogue claim.",
    boundary:
      "A public record cannot grant authority over how another community uses a design.",
  },
  "date-peg": {
    primary: "fern",
    other: "stage",
    job: "A peg between two years",
    need: "The watcher must carry the interval on the recorded object without quietly making it one birthday.",
    boundary:
      "A single peg can mark the place you are looking. Its position does not narrow a catalogued date range.",
  },
  relay: {
    primary: "stage",
    other: "press",
    job: "An address for the next carrier",
    need: "The receiving worker needs the particular attribution that travelled with the object.",
    boundary:
      "An island, a region and a named maker make different claims. Keep the catalogue’s wording.",
  },
  asia: {
    primary: "dispatch",
    other: "stage",
    job: "The maker’s place on the slip",
    need: "The next reader needs this particular record in a doorway crowded with similar-looking objects.",
    boundary:
      "The display location cannot supply an unrecorded maker or workshop.",
  },
  specimen: {
    primary: "fern",
    other: "dispatch",
    job: "Who used the working shape?",
    need: "A shape can suggest a way to hold or use the object. The lending desk also needs its recorded identity.",
    boundary: "Trying a movement at the bench cannot identify a past user.",
  },
  polar: {
    primary: "dispatch",
    other: "fern",
    job: "Before the next party leaves",
    need: "The party preparing a departure needs to know which expedition an equipment record belongs to.",
    boundary:
      "A catalogue association does not settle whether a particular person used the object on a particular day.",
  },
  fern: {
    primary: "press",
    other: "stage",
    job: "Two ages on the same label",
    need: "A visitor needs the identity of a fossil and the kind of time the record assigns to it.",
    boundary:
      "Geological age and the date of collecting or describing a specimen answer different questions.",
  },
  lantern: {
    primary: "stage",
    other: "fern",
    job: "The part caught by the lamp",
    need: "The worker staging a landscape needs a particular impression and the details its frame actually shows.",
    boundary:
      "A change in illumination changes what can be seen. It cannot change the object’s recorded history.",
  },
  "date-register": {
    primary: "press",
    other: "dispatch",
    job: "Leave the interval on the ticket",
    need: "The register has room for a name and a date, but its printing block can lop off the qualification.",
    boundary:
      "Keep the recorded period with the object. A precise registration number supplies no extra precision about its making.",
  },
  passage: {
    primary: "dispatch",
    other: "stage",
    job: "The question and the right address",
    need: "A visitor wants the specific public record and a place to ask a follow-up question.",
    boundary:
      "Finding a public record does not settle permission to copy, perform or reuse what it describes.",
  },
  window: {
    primary: "fern",
    other: "press",
    job: "Looking from a remembered position",
    need: "The second watcher needs the point of view named in the record before comparing an observation.",
    boundary:
      "A new viewing position can reveal a difference without identifying what happened between the two views.",
  },
  imprint: {
    primary: "stage",
    other: "dispatch",
    job: "A mark that stayed on the carrier",
    need: "The receiver must be able to separate a visible feature from an inference about how it was made.",
    boundary:
      "A proposed production sequence needs support beyond one shiny or dark surface.",
  },
  depot: {
    primary: "fern",
    other: "press",
    job: "Put the instrument back in its party",
    need: "A field crew needs to recognise the individual instrument and its recorded expedition association.",
    boundary:
      "The instrument’s existence cannot establish a reading, position or result from a particular survey.",
  },
  "reference-line": {
    primary: "dispatch",
    other: "fern",
    job: "What left the mark?",
    need: "The reader needs a particular recorded trace and a way to keep a proposed cause open.",
    boundary: "A pattern on a surface does not by itself identify its maker.",
  },
  makers: {
    primary: "press",
    other: "stage",
    job: "Separate the last coat from the first",
    need: "One worker describes the surface. The next must know which construction detail the collection record actually identifies.",
    boundary:
      "A visible pattern alone cannot establish the full order of manufacture.",
  },
  object: {
    primary: "fern",
    other: "press",
    job: "The user outside the picture",
    need: "The lending line needs the situated record before somebody performs a use suggested by the shape.",
    boundary:
      "A demonstration by a new wearer cannot supply the identity or intent of an earlier owner.",
  },
  "cue-workshop": {
    primary: "stage",
    other: "dispatch",
    job: "The beat drawn on the ticket",
    need: "The caller needs the named musical object beside a cue the new audience can perceive.",
    boundary:
      "A practice signal played at the counter is a new performance, not a recording of the historical voice or instrument.",
  },
};
export const loanKeys: Readonly<Record<LoanFamily, readonly string[]>> =
  collection;
const familyByKey = new Map(
  Object.entries(loanKeys).flatMap(([family, keys]) =>
    keys.map((key) => [key, family as LoanFamily] as const),
  ),
);
export const loanFamily = (key: string) => familyByKey.get(key);
export function pairedStop(
  family: LoanFamily,
  stop: LoanStop,
): LoanStop | undefined {
  const job = loanJobs[family];
  if (stop === job.primary) return job.other;
  if (stop === job.other) return job.primary;
}
export function stationKeys(stop: LoanStop): string[] {
  return Object.entries(loanKeys).flatMap(([group, keys]) =>
    pairedStop(group as LoanFamily, stop) ? keys : [],
  );
}

export const stops = Object.keys(loanStops) as LoanStop[];
export const stopFromMap = (map: string) =>
  stops.find((stop) => loanStops[stop].map === map);
export const loanBench = (stop: LoanStop) => "field-loan." + stop + ".bench";
