import {
  vaultStations,
  vaultWork,
  vaultWeave,
  weirLampWeave,
} from "./vaultNight";
import type { ContentPack, Objective } from "../domain/types";

const steps = [
  [
    "Ring the market cords and find the independent latch.",
    "Trace the voices back to the mouths of the tubes.",
    "Pull all four cords. Wrap the market bell and ring again. Then try the short service cord.",
  ],
  [
    "Open a path for the people at the three shutters.",
    "The long handle ties three different needs together.",
    "Raise and lower the chain. Lift the link, move a single shutter, then leave any arrangement with either keeper.",
  ],
  [
    "Take a flood record beyond the tabbed nights.",
    "Venn’s thumb mark runs past the green index.",
    "Fan the tabs. Slide the window to nights four through six. Leave the whole book or send a frame with the omissions.",
  ],
  [
    "Find whose hand is under the keeper’s seal.",
    "The top seal and the hand on the slip did different jobs.",
    "Light the filing seal, ease out the slip and turn it over. Give the watch clerk or the keeper the first line.",
  ],
  [
    "Keep the first forecast while the last leaves open.",
    "The first peg belongs to the watch before it sees the missing crossings.",
    "Peg an expectation, raise both flaps, then set another peg for the next watch. Either recipient can use it.",
  ],
  [
    "Hear two people at the listening rail and decide where the lamp belongs.",
    "One inch of Elsbet’s letter has survived under the keeper’s sleeve.",
    "Open both edges of the letter, try both chairs and leave a place downstairs or bring the morning watch back.",
  ],
];
export function addVaultMissions(pack: ContentPack) {
  const objectives = vaultStations.map((id, i): Objective => {
    const objective = "vault-work." + id + ".left",
      w = vaultWork[id];
    [
      w.voice,
      "Descend through the floor of Elsbet’s study in Emberford.",
      steps[i][1],
      steps[i][2],
    ].forEach((text, n) =>
      pack.hints.push({
        id: "h." + objective + "." + n,
        objective,
        depth: (n + 1) as 1 | 2 | 3 | 4,
        text,
      }),
    );
    return {
      id: objective,
      title: steps[i][0],
      essential: false,
      done: { flagSet: objective },
      weave: vaultWeave(id),
      questionWays: [
        {
          id: "KQ-ROUTE-" + ["08", "27", "23", "19", "05", "07"][i],
          action: [
            "tracing",
            "arranging",
            "comparing",
            "testing",
            "revising",
            "listening",
          ][i],
        },
      ],
    };
  });
  pack.missions.push({
    id: "KG-CH1-VAULT-WATCH",
    world: "WORLD-02",
    title: "The keeper who stayed",
    stake:
      "The hatch has been shut for ten years. Something below the stairs has kept the light on.",
    knowledgeQuestion:
      "Who can put a record right after its keeper has moved on?",
    available: {
      any: [
        { flag: "undercroft.found", eq: true },
        { flagSet: "vault-work.many.ring" },
      ],
    },
    objectives,
  });
  const id = "weir-lamp.to";
  [
    "The red line on the flood sheet crosses a fold.",
    "Look for a table at the Old Weir after opening the Undercroft.",
    "There is a watch record and a later inquiry on the table.",
    "Pin both leaves under Elsbet’s lamp. Hold the two dates to the light and send either copy.",
  ].forEach((text, i) =>
    pack.hints.push({
      id: "h." + id + "." + i,
      objective: id,
      depth: (i + 1) as 1 | 2 | 3 | 4,
      text,
    }),
  );
  const compare = "weir-lamp.compared-first-peg";
  [
    "The forecast pegs can travel with the lamp.",
    "The Hollow Archivist has the folded crossing leaves.",
    "Keep the first peg in place while the real results appear. Then set the next one.",
    "Bring that forecast to the Old Weir, place its two papers together under the lamp, and send an account to either keeper.",
  ].forEach((text, i) =>
    pack.hints.push({
      id: "h." + compare + "." + i,
      objective: compare,
      depth: (i + 1) as 1 | 2 | 3 | 4,
      text,
    }),
  );
  pack.missions.push({
    id: "KG-CH11-WEIR-LAMP",
    world: "WORLD-12",
    title: "The red line on the flood sheet",
    stake:
      "The inquiry clerk knows how high the water rose. Her red pencil has crossed from the later report onto the earlier page.",
    knowledgeQuestion:
      "What could a keeper reasonably have known before the flood?",
    available: {
      all: [
        { item: "item.brass-lamp" },
        { flag: "visited.map.water.gatehouse", eq: true },
      ],
    },
    objectives: [
      {
        id,
        title: "Return a dated account to the watch or the families’ inquiry.",
        essential: false,
        done: { flagSet: id },
        weave: weirLampWeave,
        questionWays: [{ id: "KQ-ROUTE-18", action: "revising" }],
      },
      {
        id: compare,
        title:
          "Put the forecast you made in the vault beside the two dates on the weir report.",
        essential: false,
        visible: { flagSet: "vault-work.margin.first" },
        done: { flag: compare, eq: true },
        weave: weirLampWeave,
        questionWays: [{ id: "KQ-ROUTE-08", action: "comparing" }],
      },
    ],
  });
}
