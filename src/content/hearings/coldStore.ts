import type { TownHearing } from "./types";
export const coldStore: TownHearing = {
  id: "empty-chair",
  title: "The woman outside the family door",
  chapter: 3,
  world: "WORLD-04",
  map: "preserved.archive",
  place: "Cold Store of Names",
  x: 8,
  y: 4,
  host: "agate-vale",
  opening:
    "Agate Vale runs a thumb under an empty chair. “Beech. My father made that joint. He’s outside waiting for a woman he fed for eleven winters. They’ve asked him to give his relation to her in one word. I was the fool who ruled the column that narrow.”",
  claim:
    "Give the first seat to a relative named on the roll. Their name makes them our surest witness to the last night.",
  question:
    "When is a rule for admitting a witness also a claim about what they know?",
  source:
    "“The roll got a sister through the door yesterday. I kept the stub. I can show you her name. I cannot show you what she saw in the room.”",
  narrow:
    "A name on the roll establishes a recorded family link. An account of the night needs its own witness.",
  fair: "Agate folds the stub. “Make each grieving person give their whole history at the door and some won’t come in.”",
  concession:
    "You leave the family stub in use for admission. Nobody has to prove their grief at the door.",
  press: "“If I let your visitor in, whose account can I ask them to check?”",
  value: true,
  kq: "KQ-ROUTE-19",
  outcomes: {
    exposed:
      "Pilar opens both registers on the same table. Aster asks who will take the first watch at the door.",
    narrowed:
      "Aster draws a line under the family column. The visitation stub goes underneath with a space for a second signature.",
    split:
      "The roll stays on the inside table. Luz sets a spare stool outside for people who have a story and no recorded kin.",
    "won-over":
      "Agate lifts her father’s chair over the sill. “Family comes in this door. So does the person who sat the night.” Aster keeps the two records in their own hands.",
    "lost-ground":
      "The first names still come from the roll. Pilar gets permission to carry one account in from the landing. She has to choose whose.",
  },
  stations: [
    {
      title: "The family door stamp",
      art: "hearing.family-stamp",
      speaker: "preserved-registrar",
      opening:
        "Aster has put a strip of paper over the latch so the door will close quietly. There is a family stamp on one side and a blank eyelet on the other.",
      readings: [
        [
          "Press the sister’s stub against the family stamp.",
          "The stamp fits. Iren is listed here as the patient’s sister. The date beside her name is the day the roll was copied.",
        ],
        [
          "Hold the stub against the night watch eyelet.",
          "It covers the eyelet completely. Underneath, the chair was signed out to Pev. The sister came on the morning boat.",
        ],
      ],
      card: "Iren’s family stub matches the roll. She came on the boat after the watch.",
      limit:
        "The stamping gives her a family link. It gives her no view into the room the night before.",
      witness:
        "I filled in “sister.” I thought it would spare her an explanation. I never asked her to witness a night she missed.",
      claim:
        "Let family pass on the stub, and ask the sister what came to her on the morning boat.",
      challenge: "A family stamp identifies the person who sat the night.",
      diagnosis:
        "Iren’s stamp fits, but her boat came after the night in question.",
      objection:
        "A watch stub does not establish who was admitted on the named family roll.",
      reframe:
        "The family roll can open a door without certifying an account of the watch.",
      chair: "Turn the chair towards the family door.",
      handover:
        "Iren takes the seat halfway through a sentence. The person behind her waits while she remembers the colour of the morning boat.",
      nextTown:
        "“Iren sent me a little painted boat,” Agate says. “She remembers its colour perfectly. Giving her the chair let her tell the part she actually saw.”",
    },
    {
      title: "The spare key and the night string",
      art: "hearing.watch-string",
      speaker: "preserved-inquiry-keeper",
      opening:
        "Pilar winds the night string around a spare key. “Eleven winters of soup and he still writes ‘friend’ in pencil. Easier to rub off, he says.”",
      readings: [
        [
          "Match the four night knots to the key loans.",
          "Pev borrowed the bedside key on each of four watches. His fourth knot has a white repair. Pilar was there when it broke.",
        ],
        [
          "Stretch the string along the family roll.",
          "It comes up blank beside Pev. The key sheet lets Pilar find him. The family roll gives no account of who fed the patient.",
        ],
      ],
      card: "Four loans put Pev at the bedside. The night string and key sheet agree about the repaired knot.",
      limit:
        "The loans establish access to the bedside. Pev is still the person to ask what he heard.",
      witness:
        "I lent him the key, and I repaired one knot. He told me about soup. I can vouch for the key and the repair myself.",
      claim:
        "Give a visiting witness a stool at the threshold and let them mark which part they saw.",
      challenge:
        "An unlisted visitor can offer no checkable part of the night.",
      diagnosis:
        "Pilar can check the key repair. A second person can be found through the dated loans.",
      objection:
        "The name list tells us who was registered. It does not test a bedside visitor’s account.",
      reframe:
        "A visit can leave a trace without leaving a family name on the roll.",
      chair: "Set the chair beside the borrowed keys.",
      handover:
        "Pev opens his hand. In it is the key nobody remembered to take back. Pilar sits with him while he tells her what he heard on his fourth watch.",
      nextTown:
        "“Father returned the key,” Agate says. “Pilar came round for soup anyway. Imagine having a visitor after the paperwork’s finished.”",
    },
  ],
  weave: {
    concepts: [
      "evidence",
      "power",
      "perspective",
      "responsibility",
      "justification",
      "values",
    ],
    atl: ["communication", "social", "thinking"],
    aoks: ["HIS", "HUM", "POL"],
    subjects: ["history", "anthropology", "global-politics"],
    framework: ["ethics", "perspectives", "methods-and-tools"],
    thinking: { dok: 3, bloom: "evaluate", fink: "human", solo: "relational" },
    minutes: 7,
  },
};
