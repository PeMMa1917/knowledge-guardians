import type { Weave } from "../domain/types";

export const vaultStations = [
  "many",
  "twogates",
  "chosen",
  "stamp",
  "margin",
  "promise",
] as const;
export type VaultStation = (typeof vaultStations)[number];
export interface VaultWork {
  title: string;
  voice: string;
  help: string;
  pair: [string, string];
  replies: [string, string];
  reflections: [string, string];
  weave: Pick<Weave, "aoks" | "subjects" | "concepts" | "framework">;
}
export const vaultWork: Record<VaultStation, VaultWork> = {
  many: {
    title: "The bell that answered itself",
    voice:
      "A market bell rings inside the rock. A fishmonger, a girl selling paper and a man with a red hat all shout that the latch is stuck. A fourth cord sticks out underneath. There is a smear of oil on it.",
    help: "Give the cords a pull at full voice. Then wrap the market bell in felt and pull again. The service cord reaches the latch on the far side.",
    pair: [
      "Hang the service cord within a child’s reach.",
      "Carry a rubbing of the working latch to the market.",
    ],
    replies: [
      "The first hand on the cord is too small to ring the big bell. The little latch lifts just the same.",
      "The paper seller takes the rubbing to the three stalls. The red hat turns out to belong to her father. He has never once come down these stairs.",
    ],
    reflections: [
      "Which voices could you still hear with the felt on?",
      "What did the messenger actually see?",
    ],
    weave: {
      aoks: ["HUM", "NAT", "LAN"],
      subjects: ["psychology", "physics", "lang-langlit"],
      concepts: ["evidence", "certainty", "justification"],
      framework: ["scope", "methods-and-tools"],
    },
  },
  twogates: {
    title: "A chain across three doors",
    voice:
      "Two handles offer ALL or NONE. Behind the bars a binder waits with a soaked book, a child with a drawing, and a gardener with an envelope for her brother. The gardener has brought a chair. She has learned what two handles mean.",
    help: "Try the linked gates both ways. Lift the middle link. Each shutter can now move on its own. Try a mixed opening before choosing what to leave.",
    pair: [
      "Leave the handles with the people waiting.",
      "Hang your arrangement above the porter’s stool.",
    ],
    replies: [
      "The gardener takes the chair home. There are three handles low enough for a caller to move. Somebody still has to dry the binder’s book.",
      "The porter keeps the stencil and tries to learn everybody’s name. The first caller to arrive after his shift has finished finds an empty stool.",
    ],
    reflections: [
      "Which visitor’s choices changed when you lifted the link?",
      "Who could change your arrangement tomorrow?",
    ],
    weave: {
      aoks: ["HUM", "MAT", "POL"],
      subjects: ["global-politics", "math-aa", "design-tech"],
      concepts: ["power", "values", "responsibility", "perspective"],
      framework: ["scope", "ethics", "perspectives"],
    },
  },
  chosen: {
    title: "The shelf of dry nights",
    voice:
      "Three green tabs stick out of the flood book. The little drawings show three dry crossings. Behind the drawer there is a groove the width of a thumb. Venn was here when his hands were smaller.",
    help: "Look through the green tabs. Slide the drawer out to see all six dated edges, including the torn leaf. Set your frame on a different run of nights.",
    pair: [
      "Lend the complete book to the ferry crew.",
      "Leave the frame with a list of what lies outside it.",
    ],
    replies: [
      "The ferrier puts the whole book beside the chalk. A wet thumb smears one green tab. The date beneath it survives.",
      "The narrow frame fits the outside notice. A list of the other nights swings below it. A child lifts the list to see if her wet birthday is there.",
    ],
    reflections: [
      "Which nights were missing from the first view?",
      "What can a later reader do with the torn leaf?",
    ],
    weave: {
      aoks: ["HIS", "NAT", "MAT"],
      subjects: ["history", "geography", "math-ai"],
      concepts: ["evidence", "truth", "interpretation"],
      framework: ["scope", "methods-and-tools"],
    },
  },
  stamp: {
    title: "Whose hand held the lamp?",
    voice:
      "The Hollow Archivist holds a seal over its face. “KEEPER,” it says. Then, in a smaller voice, “It’s the only name they left me.” Three layers of wax bind a note to its jacket. Each takes a different impression.",
    help: "Roll the lamp from the keeper’s wax to the slip underneath. Turn the slip over for its place and hour. Keep the keeper’s mark beside the identifying marks you find.",
    pair: [
      "Give the watch clerk space above the seal.",
      "Keep the keeper’s mark with its date of filing.",
    ],
    replies: [
      "A thumbprint appears above the gold mark. The Archivist tries to cover it, then brings the lamp closer. “I knew her. I never knew she worked nights.”",
      "The gold still catches the light first. Underneath it the filing date comes a day after the watch. The Archivist adds a little hook for the older slip.",
    ],
    reflections: [
      "Which hand witnessed the crossing?",
      "What did the second date tell you about the keeper?",
    ],
    weave: {
      aoks: ["HIS", "ART", "TEC"],
      subjects: ["history", "visual-arts", "digital-society"],
      concepts: ["power", "justification", "evidence"],
      framework: ["methods-and-tools", "perspectives"],
    },
  },
  margin: {
    title: "A forecast in the margin",
    voice:
      "It folds four dry crossings into a fan. “They all came back.” Two more leaves wait under its elbow. “If I lift my arm and one of them didn’t, will anybody still want me keeping the door?”",
    help: "Set a peg for how many of the next two crossings you expect to stay dry. Lift both flaps. The first peg stays where you put it. Try setting a second peg for the next shift.",
    pair: [
      "Pin the first peg beside the opened leaves.",
      "Give tomorrow’s watch both pegs.",
    ],
    replies: [
      "The first peg stays exactly where you put it. Somebody looking over your shoulder can tell which marks were made before the flaps opened.",
      "The next watchkeeper gets your first guess and your new one. She brings her own peg. “You wanted somebody to come back,” she tells the Archivist. “I can do mornings.”",
    ],
    reflections: [
      "What did you already know when you set the first peg?",
      "How would tomorrow’s watch find out whether the second peg held up?",
    ],
    weave: {
      aoks: ["NAT", "MAT", "HUM"],
      subjects: ["biology", "math-ai", "psychology"],
      concepts: ["explanation", "certainty", "objectivity"],
      framework: ["scope", "methods-and-tools"],
    },
  },
  promise: {
    title: "The last inch of the sentence",
    voice:
      "The Archivist has kept one inch of Elsbet’s letter inside its sleeve. It says CHECK EVERY CLAIM. “Ten years I sat here so she could trust somebody,” it says. “Is this what she thought of me?” The paper has a matching crease in her reply book.",
    help: "Move the two shutters to read what came before and after the familiar line. Then give each of the two people a turn at the listening rail. Their worries belong to different moments.",
    pair: [
      "Pull up a second chair inside the circle of lamplight.",
      "Take the lamp upstairs and bring morning visitors down.",
    ],
    replies: [
      "The Archivist tries the other chair first. The legs are uneven. It folds the edge of its old KEEPER label under one. It nudges the lamp into your hands. “Bring it back tomorrow. I’ll keep your seat.” It stays sitting when the door opens.",
      "In daylight the lamp is hardly brighter than a button. In the hatch below, the Archivist turns the handles towards the visitors. “Somebody bring me a description of the weather.”",
    ],
    reflections: [
      "What was Elsbet asking somebody to do?",
      "Which fear could you take seriously even after seeing the rest of her letter?",
    ],
    weave: {
      aoks: ["HIS", "ART", "LAN"],
      subjects: ["lang-lit", "theatre", "philosophy"],
      concepts: ["perspective", "interpretation", "responsibility"],
      framework: ["perspectives", "ethics", "scope"],
    },
  },
};
export const vaultNights = [
  "Held at evening bell",
  "Water above the near board",
  "Held at evening bell",
  "Held at evening bell",
  "Water above the near board",
  "Leaf torn through the gauge mark",
] as const;
export const vaultLetter = [
  "When you carry my lamp,",
  "check every claim",
  "that leaves our hall in someone else’s name.",
  "Keep the witness close enough to put it right.",
] as const;
export const waiting = [
  "The binder’s wet book",
  "The child’s drawing",
  "The gardener’s letter",
] as const;
export function vaultWeave(station: VaultStation): Weave {
  return {
    ...vaultWork[station].weave,
    atl: ["thinking", "communication", "research"],
    minutes: 4,
    thinking:
      station === "many" || station === "stamp"
        ? {
            dok: 2,
            bloom: "analyse",
            fink: "application",
            solo: "multistructural",
          }
        : {
            dok: 3,
            bloom: "evaluate",
            fink: station === "promise" ? "human" : "integration",
            solo: "relational",
          },
  };
}

export const weirLampWeave: Weave = {
  aoks: ["HIS", "HUM", "POL"],
  subjects: ["history", "psychology", "global-politics"],
  concepts: ["evidence", "responsibility", "interpretation", "certainty"],
  framework: ["scope", "methods-and-tools", "ethics"],
  atl: ["thinking", "research"],
  minutes: 4,
  thinking: {
    dok: 3,
    bloom: "evaluate",
    fink: "integration",
    solo: "relational",
  },
};
