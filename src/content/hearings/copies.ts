import type { TownHearing } from "./types";
export const copies: TownHearing = {
  id: "dropped-verb",
  title: "Who will come for the parcel?",
  chapter: 7,
  world: "WORLD-08",
  map: "copies.press",
  place: "The City of Copies press",
  x: 9,
  y: 5,
  host: "agate-vale",
  opening:
    "A parcel has waited under the press long enough for a spider to take out a lease. The notice reads “After counting the sheets, the parcel will be collected.” Agate brushes a bit of wool off the string. Her father has mended every loose chair at the press, and the press has yet to work out who promised to collect his invoice.",
  claim:
    "Everyone can read the notice. Every reader will know who must fetch the parcel.",
  source:
    "“I gave the same line to the printer and the lending desk,” says Agate. “One put on a coat. So did the other one. I counted two coats and called it agreement.”",
  narrow:
    "People can agree that a parcel needs collecting while each expects someone else to do it.",
  fair: "Agate folds the first sheet. “Name the apprentice in public and every missed collection follows her. She covers for three people.”",
  concession:
    "Mina tries a named desk on the public sheet and keeps the person’s name on a return stub.",
  press: "“Which word in that sheet would tell a wet reader where to knock?”",
  question:
    "How does changing the grammatical subject change who can be held to a promise?",
  value: false,
  kq: "KQ-ROUTE-02",
  outcomes: {
    exposed:
      "The two return stubs tell incompatible stories. Lark sets PRESS DESK in the forme and makes space for a return address.",
    narrowed:
      "Mina takes down the notice and adds the collecting desk below the promise. The old sentence goes into the drawer with its date.",
    split:
      "Some want a person’s name, some a desk that stays open through a change of shift. Lark runs a short proof of each.",
    "won-over":
      "Agate volunteers her chair-repair invoice for the next test. Mina keeps a private return stub and Lark prints the name of the desk.",
    "lost-ground":
      "The old sheet goes out again. A runner returns with the unopened parcel. Mina now has a delivery to bring to the next hearing.",
  },
  stations: [
    {
      title: "The movable subject chase",
      art: "hearing.subject-chase",
      speaker: "copies-presskeeper",
      opening:
        "Lark prises a metal space out of the sentence. “Fine bit of lead. It eats people for breakfast. Put one back.”",
      readings: [
        [
          "Set THE PRESS before WILL COLLECT.",
          "The proof now reads “After counting the sheets, the press will collect the parcel.” Lark sets a press token by the door. Nobody has asked whether the press counts sheets.",
        ],
        [
          "Set THE LENDING DESK before WILL COLLECT.",
          "The lending desk now has both jobs on paper. Its receipt book shows it counts loans. The press tally still carries the sheet counts. The two jobs can have different owners.",
        ],
      ],
      card: "Changing the grammatical subject moves both counting and collecting onto one desk. The press keeps the sheet tally.",
      limit:
        "The proof assigns work in print. The receipts record who has actually done it.",
      witness:
        "I can set any name you give me. When I set LENDING here it also makes them count. The counting hand on the docket is mine.",
      claim:
        "Print a separate subject for each job and leave a desk to contact.",
      challenge:
        "Moving the subject beside “will collect” leaves the counting job untouched.",
      diagnosis:
        "In both proofs the opening phrase attaches to the new subject. It can silently reassign the counting too.",
      objection:
        "Two people can read a notice differently without showing where the opening phrase attaches.",
      reframe:
        "Making a sentence legible and giving two workers workable instructions are separate jobs.",
      chair: "Give Lark the chair at the type case.",
      handover:
        "Lark prints “The press counts the sheets. The lending desk collects the parcel.” The spider loses its lease just before closing.",
      nextTown:
        "Agate produces an invoice with two tiny muddy prints on it. “One desk counted the chairs and the other paid me. That spider has gone into accountancy.”",
    },
    {
      title: "The two coat pegs",
      art: "hearing.coat-pegs",
      speaker: "copies-lendingkeeper",
      opening:
        "Mina hangs a red coat under PRESS and a green one under LENDING. In each pocket somebody has left a reply to the same notice.",
      readings: [
        [
          "Turn out the press pocket.",
          "Lark wrote “counted and ready for the lending desk” and went looking for string. The parcel stayed in the press room.",
        ],
        [
          "Turn out the lending pocket.",
          "Mina wrote “waiting for press collection” and went to open the return desk. She was ready to accept the parcel, not to collect it.",
        ],
      ],
      card: "Both desks read the notice and prepared for the other one to move the parcel.",
      limit:
        "Two replies establish this misunderstanding. Other readers might have made a different guess.",
      witness:
        "I put on my coat because the return desk is cold. Somebody saw me and ticked “collected.” Excellent coat. Terrible receipt.",
      claim:
        "Try the notice with both desks and let each send a return stub before the next run.",
      challenge: "Two ready readers understood the same collecting duty.",
      diagnosis:
        "The replies name opposite collectors. Two people getting ready did not establish agreement.",
      objection:
        "A fresh proof shows what the printer could write. The coat pockets record what these two readers expected.",
      reframe:
        "A return stub lets the reader challenge an instruction after it leaves the person who wrote it.",
      chair: "Move the chair in reach of Mina’s return pocket.",
      handover:
        "Mina sews a pocket where a short visitor can reach it. The next reply says, simply, “I can collect it if someone helps me with the stairs.”",
      nextTown:
        "“Mina’s first reply was a request for a hand on the stairs,” Agate says. “I’d given the visitor a voice. I hadn’t given them a handrail.”",
    },
  ],
  weave: {
    concepts: [
      "interpretation",
      "perspective",
      "evidence",
      "responsibility",
      "power",
      "explanation",
    ],
    atl: ["communication", "research", "social"],
    aoks: ["ART", "LAN", "HUM"],
    subjects: ["lang-langlit", "lang-b", "lit-perf", "business"],
    framework: ["perspectives", "methods-and-tools", "ethics"],
    thinking: {
      dok: 3,
      bloom: "create",
      fink: "integration",
      solo: "relational",
    },
    minutes: 7,
  },
};
