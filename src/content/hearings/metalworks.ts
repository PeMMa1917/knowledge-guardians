import type { TownHearing } from "./types";
export const metalworks: TownHearing = {
  id: "missing-tooth",
  title: "The bell that paid nobody",
  chapter: 6,
  world: "WORLD-07",
  map: "metalworks.yard",
  place: "The Metalworks yard",
  x: 8,
  y: 4,
  host: "agate-vale",
  opening:
    "“Nobody minds the cost of stopping a wheel until it’s their dinner.” Agate sets a wooden tooth on the council chair. It is from her father’s kitchen clock. Someone has brought a cracked brass one to match it. The two cracks look like sisters.",
  claim:
    "A cracked tooth came out of this delivery. Every wheel using teeth from the delivery needs to stop.",
  source:
    "Agate holds up a damp tag. “From the tray by the blue door. I believed the blue door belonged to one delivery. Is there a part of that I can check?”",
  narrow:
    "Pause the wheel using the marked strip. Track the tray to its deliveries before issuing a wider notice.",
  fair: "“I can offer my dinner to the worker who misses theirs. I can’t give anybody a new hand.” Agate waits for someone to hear her out.",
  concession:
    "Bea leaves the marked wheel stopped while the second delivery is traced. Its crew can use the bench.",
  press:
    "“Let me see what would make you extend the stoppage to the second wheel.”",
  question:
    "How far can a case travel when the group it supposedly represents has changed?",
  value: false,
  kq: "KQ-ROUTE-04",
  outcomes: {
    exposed:
      "Bea empties the blue tray. Two delivery strips fall on the flags. Corra sends a separate notice with each.",
    narrowed:
      "The chalk circle shrinks to the wheel with the marked tooth. Corra ties the second strip to a follow-up slip.",
    split:
      "One crew waits on the flags. A second asks to see its own delivery before agreeing to a halt.",
    "won-over":
      "Agate carries a stool to the inspection bench. The waiting worker gets paid for telling Corra where each strip went.",
    "lost-ground":
      "The wide notice goes up. Bea cuts a work token for someone waiting without a shift while Corra follows the second strip.",
  },
  stations: [
    {
      title: "The forked delivery strip",
      art: "hearing.delivery-tags",
      speaker: "metal-steward",
      opening:
        "Bea has two ends of a delivery tag and one drawing pin. “These slipped under the same pin. Come closer. One has been rained on twice.”",
      readings: [
        [
          "Fit the pinholes together.",
          "The holes line up. Both strips hung on the blue door. The top strip is marked K12 and the bottom J9.",
        ],
        [
          "Lay the stamped ends beside the wheel tags.",
          "K12 belongs to the wheel by the steps. J9 belongs to the back wheel. The crack was logged against K12. Both trays passed the door.",
        ],
      ],
      card: "Two deliveries shared a door. The cracked sample came from K12. The back wheel carries J9.",
      limit:
        "A shared doorway records handling. It does not make the two deliveries a single batch.",
      witness:
        "I hung both strips there to keep them dry. If you only need somebody to blame, I can stand here all afternoon. If you need the wheels, read the ends.",
      claim:
        "Stop the tagged wheel and send the crews to trace the second delivery.",
      challenge: "All teeth on the blue-door tray have the same delivery mark.",
      diagnosis:
        "The pinholes match but the two stamps differ. One storage point held two lots.",
      objection:
        "Inspect the tray’s tags to establish where the second wheel’s teeth came from.",
      reframe:
        "A stop on one wheel and an inspection of the other can happen on the same shift.",
      chair: "Put the paid watch chair beside Bea’s tags.",
      handover:
        "Bea gives the waiting porter the tags and a work token. The porter finds a third delivery still listed under yesterday’s colour.",
      nextTown:
        "“That porter has started writing the delivery letters on the back of each colour,” Agate says. “He asked me for a pencil that works in rain.”",
    },
    {
      title: "The two chalked test teeth",
      art: "hearing.test-teeth",
      speaker: "metal-inspector",
      opening:
        "Corra lays out a bent tooth and a straight one. A thumbprint in old blue chalk covers the word “spare.” “Somebody wanted me to see the crack first. Fair enough. Stay for the other one.”",
      readings: [
        [
          "Set the K12 sample in its shallow groove.",
          "At rest the split closes. Under the short test lever the original split opens at the chalk line.",
        ],
        [
          "Run the same lever on the J9 spare.",
          "The J9 spare keeps its line on this pull. The J9 delivery has eighteen more teeth Corra has not tried.",
        ],
      ],
      card: "The K12 split opened in the jig. One J9 spare held on the same pull. Eighteen J9 teeth remain unexamined.",
      limit:
        "One steady spare can challenge a claim about every tooth. It supplies no rate of failure for the rest.",
      witness:
        "I was the one who wrote “spare.” If one clean tooth cleared a whole delivery I could go home by noon. I have never been home by noon.",
      claim:
        "Pay for another round of inspection before offering either crew a batch-wide promise.",
      challenge: "Every tested tooth opened on the same pull.",
      diagnosis:
        "The second spare held in the same jig. This result leaves the other eighteen untested.",
      objection: "Which physical comparison was run at the same setting?",
      reframe:
        "A rule about who may stop work is a different decision from an estimate of how many teeth will fail.",
      chair: "Carry the watch chair to Corra’s jig.",
      handover:
        "Corra lets the wheel hand take the seat and feel the same lever. “That was my question,” the hand says. “Nobody let me touch it before.”",
      nextTown:
        "“The wheel hand sent me a sketch of the lever,” Agate says. “I used to think a demonstration meant I got to do the demonstrating.”",
    },
  ],
  weave: {
    concepts: [
      "certainty",
      "evidence",
      "explanation",
      "justification",
      "objectivity",
      "responsibility",
    ],
    atl: ["thinking", "research", "social"],
    aoks: ["NAT", "MAT", "HUM", "TEC"],
    subjects: ["physics", "design-tech", "math-ai", "economics"],
    framework: ["scope", "methods-and-tools", "ethics"],
    thinking: {
      dok: 3,
      bloom: "analyse",
      fink: "application",
      solo: "relational",
    },
    minutes: 7,
  },
};
