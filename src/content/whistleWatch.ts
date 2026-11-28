import type { ContentPack, Weave } from "../domain/types";

export const whistlePlaces = [
  {
    id: "fern",
    map: "forest.station",
    world: "WORLD-06",
    chapter: 5,
    actor: [18, 5],
    table: [19, 5],
    title: "Three feet on the mudbank",
  },
  {
    id: "stage",
    map: "stage.rehearsal",
    world: "WORLD-10",
    chapter: 9,
    actor: [5, 13],
    table: [6, 14],
    title: "The review behind the cloth",
  },
  {
    id: "island",
    map: "island.workshop",
    world: "WORLD-15",
    chapter: 14,
    actor: [23, 13],
    table: [24, 13],
    title: "Where the map folds shut",
  },
] as const;
export type WhistleSite = (typeof whistlePlaces)[number]["id"];
export const whistleStories = {
  fern: {
    greeting:
      "Liri is sixteen. She turns a brass whistle over in her hand until the mark where she filed it shines. “I wanted a place on the night ferry watch. They said to bring a print from the mudbank. Look what I brought them. Three feet. Tell me you’d hire a three-footed animal.”",
    need: "A pressed track lies on a tray beside a cracked heel plate. Liri wants to know which part of the mark she can stand behind before anybody sends it to the harbour.",
    opening:
      "At low water a three-toed fan runs into a square notch. The bank walker found it in the mud. The mender owns the boot with a loose square nail. Each has been asked to sign the whole strip.",
    moves: [
      "Run the bank walker’s tracing over the fan",
      "Set the mender’s heel over the notch",
      "Turn the heel so its missing nail faces the water",
    ],
    notes: [
      "The outer toes and heel of the fan sit inside the tracing. Its grooves end before the square notch. The walker saw the print once the tide had fallen. She never saw the feet that made it.",
      "The loose nail meets one corner, but the boot tread crosses the fan on this setting. Liri holds the two pieces up. Their edges disagree.",
      "Turned towards the water, the missing nail and three transverse bars line up with the second impression. A line along the notch interrupts a toe groove. The second mark could have covered the first.",
    ],
    choice: [
      "Keep two signed slips with the bank walkers.",
      "Ask the harbour observer to compare the two strips at the bank.",
    ],
    replies: [
      "Liri sets the slips in two pockets. “I wanted one expert to tell me what walked there. I’ve got two people who can tell me where they stopped.” The harbour will have to send someone to the bank to ask.",
      "The bank walkers lend the harbour observer one comparison at the tray. She can report that the two shapes overlap. The walking sheet and the nesting places stay with the people who made them.",
    ],
    questions: [
      "What qualified each person to sign a particular part of the strip?",
      "What could neither person know from the mud alone?",
    ],
    obj: "whistle.fern.sent",
    concept: ["evidence", "power", "justification", "responsibility"],
    framework: ["methods-and-tools", "scope", "ethics"],
    areas: ["HIS", "NAT", "IND"],
    subjects: ["biology", "history", "ess"],
  },
  stage: {
    greeting:
      "Liri mends the rehearsal-room curtain with the same knot that holds her whistle on. “My hand shakes before the first note. I thought if nobody saw my name, they’d just hear the tune. The back bench sent me a different tune.”",
    need: "A warning needs two short calls. A cloth, two listeners and a name card wait on a stand. Liri wants to try hearing the same warning from the two seats.",
    opening:
      "The prompt book records two strokes. A loose panel by the rear bench swallows the second. One listener is an apprentice who needs the conductor’s recommendation. The other has the keys to the hall.",
    moves: [
      "Leave both names on the stands",
      "Cover the listener’s name",
      "Cover both names",
    ],
    notes: [
      "The maker and the listener may speak to one another after signing. The apprentice can ask for a repair and knows the conductor will recognise her handwriting.",
      "The listener can return a slip without signing it. The conductor’s name still sits above the tune. Someone following up has to come through the clerk.",
      "Neither name is on the copy. The repair clerk asks for the place where the listener sat. Only one seat has a loose panel, so concealing a name need not conceal that listener.",
    ],
    choice: [
      "Give each listener a seat-numbered counterfoil.",
      "Keep names in the repair room and send a nameless notice.",
    ],
    replies: [
      "Liri gives a copy to each listener. They can call her back to the seat where a beat went missing. The apprentice slips her counterfoil inside her sleeve when the conductor passes.",
      "Liri keeps both names behind the repair curtain. The wall copy says the warning reached the front and failed at the rear. Somebody has to visit the repair room to ask who heard it.",
    ],
    questions: [
      "Which difference followed the seat when the names were covered?",
      "Who could challenge a public slip without exposing the apprentice?",
    ],
    obj: "whistle.stage.sent",
    concept: ["objectivity", "perspective", "responsibility", "interpretation"],
    framework: ["perspectives", "methods-and-tools", "ethics"],
    areas: ["ART", "HUM", "LAN"],
    subjects: ["music", "psychology", "theatre"],
  },
  island: {
    greeting:
      "Liri is kneeling on a roll of chart linen. “It won’t curl up if I sit on it.” It curls up anyway. In her pocket a note from her little sister asks whether she’s a watchkeeper yet. “Depends who’s asking.”",
    need: "The ferry watch needs a crossing a visitor can find. The bank walking group has kept a daytime route and a nesting survey on different layers. Liri wants the ferry job and is tired of waiting for a signature.",
    opening:
      "A clean outer sheet carries two public landing steps and a high-water turn. A smaller leaf locates a roost. The keepers agreed to show the survey at their table only. They offer to hear another request after the season.",
    moves: [
      "Set the two landing steps on the outer sheet",
      "Lift the nesting inset at the keepers’ table",
      "Fold the nesting inset out of the travelling frame",
    ],
    notes: [
      "Two landing steps and the high-water turn line up. The public route reaches the boat without a nesting mark.",
      "At their own table the keepers can compare the nesting leaf with the outer route. No permission to take the inset away is written on its back.",
      "With the inset folded in, someone can still trace the ferry turn between two public steps. A blank corner in the travelling copy marks where further permission is needed.",
    ],
    choice: [
      "Take the route-only sheet to the ferry.",
      "Leave the route on the keepers’ table and take visitors there.",
    ],
    replies: [
      "Liri brings the route to the ferry. Her sister finds the high-water turn before the next boat. One passenger asks about the blank corner. Liri writes down where to ask.",
      "The keepers get to meet the people using their work. A late passenger misses that visit. Liri promises to take a morning watch at the table herself.",
    ],
    questions: [
      "Who can change the destination or withdraw the local survey?",
      "What can a passenger do with the public route, and what would still require a conversation?",
    ],
    obj: "whistle.island.sent",
    concept: ["culture", "power", "values", "responsibility"],
    framework: ["ethics", "scope", "perspectives"],
    areas: ["HUM", "IND", "TEC"],
    subjects: ["geography", "digital-society", "global-politics"],
  },
} as const;
export const whistleRelief = {
  fern: {
    request:
      "The tide is up to Liri’s chalk line. The walker wants a dry copy of her signature, but her boots are still on the drying pegs. Liri can hold the impression still if you turn the press.",
    action: "Wind the press while Liri steadies the wet strip",
    result:
      "I turned the screw as Liri kept the paper from slipping. The walker tucked the dry impression into her boot. She can carry her own mark home now.",
    memory:
      "“She sent her little boy back with a print of his heel.” Liri digs in her pocket. The heel belongs to a boy who wears his shoes on the wrong feet.",
    receipt: "a bank walker’s heel print",
  },
  stage: {
    request:
      "The player behind the curtain is supposed to warn the ferry and catch it too. Liri offers to stay at the rear panel if you give the two-beat call from the rail.",
    action: "Give the call so the other player can catch her ferry",
    result:
      "I sounded two taps from the rail. Liri held the loose panel still from the other side. This time she raised two fingers. The apprentice took her fiddle aboard the last ferry.",
    memory:
      "“It was the panel. My hand was shaking as much as ever.” Liri gives two sharp taps. “She was halfway across the water by then. I hope she heard that.”",
    receipt: "the ferry player’s second beat",
  },
  island: {
    request:
      "Liri’s sister has missed two boats waiting at the public steps. The keepers still need someone at the chart. Liri can meet her if you cover a watch at the table.",
    action: "Take the table watch while Liri meets her sister",
    result:
      "I took the visitors’ bench. Liri ran down to the steps with one boot unlaced. Her sister brought her back two chipped cups of ferry tea. One was for me.",
    memory:
      "“Cold tea by the time she found you, wasn’t it?” Liri turns the chipped cup round. “She’s saving for a flask.”",
    receipt: "tea in a chipped ferry cup",
  },
} as const;

export const whistleStops = {
  fern: [
    "The mudbank tray",
    "A three-toed fan and a boot share the mud.",
    "The bank walker can account for the fan and the mender can account for the boot.",
    "Overlay the bank tracing, try the boot both ways, then give each person a slip they can sign.",
  ],
  stage: [
    "The curtain stand",
    "A second beat has gone missing at just one seat.",
    "The name covers travel independently of the listeners.",
    "Try all three review arrangements. In one arrangement hear both seats in succession before choosing how the review will travel.",
  ],
  island: [
    "The linen chart",
    "Liri has two sheets and one carrying frame.",
    "At the local table, the drawing on the inset can be read alongside the public landmarks.",
    "Mount the steps. Try the open frame at the rail. Fold in the local inset, test the folded copy, then send the route by either means.",
  ],
} as const;
export function whistleWeave(site: WhistleSite): Weave {
  const w = whistleStories[site];
  return {
    aoks: [...w.areas],
    subjects: [...w.subjects],
    concepts: [...w.concept],
    framework: [...w.framework],
    atl: ["thinking", "research", "social", "communication"],
    minutes: 4,
    thinking: {
      dok: 3,
      bloom: "evaluate",
      solo: "relational",
      fink: site === "island" ? "caring" : "integration",
    },
  };
}
export function addWhistleWatch(pack: ContentPack) {
  pack.items.push({
    id: "item.notched-whistle",
    name: "Liri’s notched whistle",
    description:
      "A little filed whistle worn smooth on one side. Liri remembers which shift it came from. At the Plan Workshop it can call the daytime ferry or invite a watcher to the table.",
    historicalLabel: "fictional-world",
    art: "whistle.notched",
  });
  const liri = pack.characters.find((c) => c.id === "liri-pell")!;
  liri.localGreeting = { ...liri.localGreeting };
  for (const site of whistlePlaces) {
    const id = site.id,
      w = whistleStories[id],
      key = "whistle." + id,
      neighbour = whistlePlaces[(whistlePlaces.indexOf(site) + 2) % 3].id;
    liri.localGreeting[site.map] = key + ".hello";
    const going =
      id === "fern"
        ? "The two slips are on the tray beside you."
        : id === "stage"
          ? "The two listening seats are ready by the curtain."
          : "The chart frame is on your left.";
    const notes = {
      fern: [
        "“You sent the route outside? At least the curl in that linen reached somebody before it reached us.”",
        "“You made people come to the table. I’ll take the tray out to the bank walkers. They get tired too.”",
      ],
      stage: [
        "“Two signers. I remember how the bank walker turned the print back when she reached the boot. I can let a listener stop at the second beat.”",
        "“Inviting somebody to the tray worked because they came to us. What happens when a review gets sent the other way?”",
      ],
      island: [
        "“You kept the counterfoils. My sister held on to her little slip like it was a theatre ticket.”",
        "“A blank name gave that apprentice a chance to speak. I didn’t think of her the first time I drew this map.”",
      ],
    }[id];
    pack.dialogue.push(
      {
        id: key + ".hello",
        speaker: liri.id,
        historicalLabel: "fictional-world",
        text: w.greeting,
        options: [
          ...(id === "island"
            ? [
                {
                  text: "Ask who recalled the route.",
                  if: { flag: "whistle.island.recalled", eq: true },
                  next: key + ".withdrawn",
                },
              ]
            : []),
          {
            text: "Ask about " + whistleRelief[id].receipt + ".",
            if: { flag: key + ".relieved", eq: true },
            next: key + ".relief",
          },
          ...w.replies.map((_, i) => ({
            text: "Ask Liri how the handover went.",
            if: { flag: w.obj, eq: i },
            next: key + ".recall" + i,
          })),
          ...notes.map((_, i) => ({
            text: "Take out the whistle from the other watch.",
            if: { flag: whistleStories[neighbour].obj, eq: i },
            next: key + ".neighbour" + i,
          })),
          {
            text: "Offer to take a watch with her.",
            next: key + ".invite",
            effects: [{ setFlag: key + ".together", value: true }],
          },
          {
            text: "Let Liri take this shift on her own.",
            next: key + ".alone",
            effects: [{ setFlag: key + ".together", value: false }],
          },
        ],
      },
      {
        id: key + ".invite",
        speaker: liri.id,
        historicalLabel: "fictional-world",
        text:
          "Liri turns the back of her hand up. The little toothed mark from her whistle is still there. " +
          w.need +
          " " +
          going,
      },
      {
        id: key + ".alone",
        speaker: liri.id,
        historicalLabel: "fictional-world",
        text: {
          fern: "“Good. I can ask the walker myself.” Liri turns the mud strip away from the sun. There is room beside her if you come back.",
          stage:
            "“I can take a criticism.” She says it twice. When the apprentice taps on the curtain, Liri holds it open for her.",
          island:
            "“Keep an ear on the boat for me, then.” She leaves a stone on the linen and sits down with the keepers.",
        }[id],
      },
      {
        id: key + ".relief",
        speaker: liri.id,
        historicalLabel: "fictional-world",
        text: whistleRelief[id].memory,
      },
      ...w.replies.map((text, i) => ({
        id: key + ".recall" + i,
        speaker: liri.id,
        historicalLabel: "fictional-world" as const,
        text,
      })),
      ...notes.map((text, i) => ({
        id: key + ".neighbour" + i,
        speaker: liri.id,
        historicalLabel: "fictional-world" as const,
        text,
      })),
    );
    if (id === "island")
      pack.dialogue.push({
        id: key + ".withdrawn",
        speaker: liri.id,
        historicalLabel: "fictional-world",
        text: "“The walkers took the sheet back. I told my sister before I took the notice down. She was cross.” Liri tests the notch with her thumb. “She can be cross. She can still take the morning walk with me.”",
      });
    whistleStops[id].forEach((text, i) =>
      pack.hints.push({
        id: "h." + w.obj + "." + i,
        objective: w.obj,
        depth: (i + 1) as 1 | 2 | 3 | 4,
        text,
      }),
    );
    pack.missions.push({
      id: "KG-CH" + site.chapter + "-WHISTLE-WATCH",
      world: site.world,
      title: site.title,
      stake: w.need,
      available: {
        any: [{ flagSet: key + ".together" }, { flagSet: key + ".work" }],
      },
      knowledgeQuestion: w.questions[0],
      objectives: [
        {
          id: w.obj,
          title: {
            fern: "Leave signatures on the parts of the mud strip each person examined.",
            stage:
              "Let two listeners review the same warning from their own seats.",
            island: "Make a ferry map that honours the keepers’ terms of use.",
          }[id],
          essential: false,
          done: { flagSet: w.obj },
          weave: whistleWeave(id),
          questionWays: [
            {
              id: {
                fern: "KQ-ROUTE-19",
                stage: "KQ-ROUTE-08",
                island: "KQ-ROUTE-27",
              }[id],
              action: "comparing",
            },
          ],
        },
      ],
    });
  }
  const recall = "whistle.island.recalled";
  [
    "A folded ferry sheet may still be in circulation.",
    "Look at the Plan Workshop’s linen chart.",
    "The keepers’ original agreement includes a seasonal call-back.",
    "Send the route-only map first. Read the walkers’ new notice and ring the whistle to call the copy back. The table path will open.",
  ].forEach((text, i) =>
    pack.hints.push({
      id: "h." + recall + "." + i,
      objective: recall,
      text,
      depth: (i + 1) as 1 | 2 | 3 | 4,
    }),
  );
  const island = pack.missions.find((m) => m.id === "KG-CH14-WHISTLE-WATCH")!;
  island.objectives.push({
    id: recall,
    title: "Call the ferry’s sheet back when the walkers change its terms.",
    essential: false,
    visible: { flag: "whistle.island.sent", eq: 0 },
    done: { flag: recall, eq: true },
    weave: whistleWeave("island"),
    questionWays: [{ id: "KQ-ROUTE-27", action: "revising" }],
  });
}
