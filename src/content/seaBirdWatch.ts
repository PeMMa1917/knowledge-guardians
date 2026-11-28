import { BIRD_DOCK, HOKULEA, birdWeave, wingPin } from "../domain/birdSide";
import type {
  Condition,
  ContentPack,
  DialogueNode,
  Effect,
  Objective,
  Weave,
} from "../domain/types";

export const canoeExhibit = "OBJ-HOKULEA-1975";
const launch = "HIS-PVS-KUALOA";
const memory = "HIS-PVS-LEARNING-FROM-MAU";
const voyage = "HIS-PVS-RENEWAL";
const birds = "HIS-PVS-LANDFALL";
export const boardReady: Condition = {
  all: [
    {
      any: (["west", "east"] as const).map((side) => ({
        all: [
          { flag: wingPin("dawn", side), eq: true },
          { flag: wingPin("dusk", side), eq: true },
        ],
      })),
    },
    {
      any: (["west", "east"] as const).map((side) => ({
        flag: wingPin("squall", side),
        eq: true,
      })),
    },
  ],
};
const know = (id: string): Condition => ({ card: "card.birdside." + id });
const has = (id: string): Condition => ({ objective: "birdside." + id });
const edition = (value: string): Condition => ({
  flag: "birdside.edition",
  eq: value,
});
const later = (value: string): Condition => ({
  flag: "birdside.harbour-reply",
  eq: value,
});
const event = (flag: string, value: string | boolean = true): Effect => ({
  setFlag: "birdside." + flag,
  value,
});

const recordWeave: Weave = {
  concepts: [
    "evidence",
    "culture",
    "interpretation",
    "perspective",
    "justification",
    "responsibility",
  ],
  framework: ["scope", "perspectives", "methods-and-tools", "ethics"],
  aoks: ["HIS", "LAN", "IND"],
  subjects: ["history", "geography", "lang-langlit", "anthropology"],
  atl: ["research", "communication", "social"],
  thinking: { dok: 3, bloom: "evaluate", fink: "human", solo: "relational" },
  minutes: 3,
};
const dockWeave: Weave = {
  concepts: [
    "values",
    "power",
    "responsibility",
    "certainty",
    "justification",
    "explanation",
  ],
  framework: ["perspectives", "ethics", "methods-and-tools"],
  aoks: ["HUM", "NAT", "POL"],
  subjects: ["geography", "global-politics", "design-tech"],
  atl: ["social", "thinking"],
  thinking: { dok: 4, bloom: "create", fink: "caring", solo: "extended" },
  minutes: 5,
};

const stamps = [
  [
    "crew",
    "The other pair of hands",
    "Reopen the 1980 roster with the navigator’s memory beside it.",
    "I heard Sora give the apprentice’s spare key back. Nainoa Thompson navigating in 1980 and Mau Piailug sailing in support could both be true.",
  ],
  [
    "paper",
    "The pencil in the lesson",
    "Use the learner’s own account to mend the printed lesson.",
    "Renna cut “without writing” out of the fair copy. Thompson remembered Mau asking him to take notes. A printed line about memorising could erase the pencil from this particular lesson.",
  ],
  [
    "cloth",
    "Two hours on one wing",
    "Keep the peg on one side through two hours, then test what the rain hides.",
    "I unfolded two watches with the same westward flight. At first light the wing left an eastern ledge. At last light it returned to a western one. On the rain cloth either pin was a guess.",
  ],
  [
    "fitted",
    "A place on the next watch",
    "Give the harbour a practice edition after trying the cloth and repairing both accounts.",
    "I fitted a practice guide for Sora’s next crew. Its arrows carry the hour and the observers can mark an unreadable flight. The canoe’s launch record is ready at the model stand.",
  ],
  [
    "returned",
    "A berth for the learner",
    "Open the Island dock’s folding rail with Hōkūleʻa and try it with a new lookout.",
    "I brought Hōkūleʻa to another harbour. The two crews could change who held the guide after trying it from the end of the pier.",
  ],
];
const done: Condition[] = [
  { flag: "birdside.crew", eq: true },
  { flag: "birdside.paper", eq: true },
  boardReady,
  { flag: "birdside.edition", in: ["board", "lamp"] },
  { flag: "birdside.harbour-reply", in: ["wait", "walk"] },
];
const hints = [
  [
    "Sora left a spare key beside the canoe.",
    "Try both pockets in the crew’s folder at Seagrass Steps.",
    "Who navigated and who else sailed are two different questions.",
    "Read the memory and voyage record. Ask Sora to check the word “alone” against the recorded company.",
  ],
  [
    "Renna has a printed line about a pencil.",
    "Open the folder beside the canoe at Seagrass Steps.",
    "The learner described his teacher giving him a way to remember the lesson.",
    "Read the learner’s account and voyage record, then amend Renna’s caption with what the learner used.",
  ],
  [
    "One cloth is stitched to another.",
    "The folding flock is beside the canoe at Seagrass Steps.",
    "Try the same ledge at first light and last light before pulling the rain cloth.",
    "Peg either ledge at both hours, then peg a ledge in the rain. You can keep either tested position.",
  ],
  [
    "Sora wants a guide her next crew can actually use.",
    "Return to the two pockets beside the folding flock.",
    "Each correction mends a different account. The model lets you compare the hours.",
    "Repair both records and run the two-hour and rain trials. Then fit either the two-row board or the lamp.",
  ],
  [
    "One of the island lookouts has never handled a practice watch.",
    "The folding rail stands on the Two-Tide Dock after you equip Hōkūleʻa.",
    "Claim the canoe at Seagrass Steps after fitting a guide, then pack and equip it.",
    "At the Two-Tide Dock, unfold your earlier edition and either wait with the new lookout or walk the two piers together.",
  ],
];
export function addSeaBirdWatch(pack: ContentPack): void {
  pack.sources.push(
    {
      id: "HIS-PVS-KANE", title: "Herb Kawainui Kāne",
      url: "https://en.wikipedia.org/wiki/Herb_Kawainui_K%C4%81ne", accessed: "2026-11-28",
      locator: "Hōkūleʻa and the Polynesian Voyaging Society",
      supports: "Artist and historian Herb Kawainui Kāne (1928–2011) helped design Hōkūleʻa.",
      mla: {kind: "page", title: "Herb Kawainui Kāne", container: "Wikipedia", showAccessDate: true},
    },
    {
      id: launch,
      title:
        "Polynesian Voyaging Society · Hōkūleʻa’s launch at Kualoa/Hakipuʻu",
      url: "https://hokulea.com/hokulea-44th/",
      locator: "The 44th anniversary and launch paragraph",
      supports:
        "The society dates this canoe’s first launch at Kualoa/Hakipuʻu, Kāneʻohe Bay, Oʻahu to 8 March 1975.",
      accessed: "2026-11-27",
      mla: {
        kind: "page",
        title:
          "Update: PVS to Celebrate 10th Kualoa/Hakipuʻu Canoe Festival, Oʻahu",
        container: "Hōkūleʻa",
        author: "Polynesian Voyaging Society",
        showAccessDate: true,
      },
    },
    {
      id: memory,
      title: "Nainoa Thompson · Learning from Mau",
      url: "https://archive.hokulea.com/rapanui/mau.html",
      locator:
        "Nainoa’s recollections of the lessons in 1979 and the 1980 voyage",
      supports:
        "Thompson remembers Mau Piailug asking him to take notes, teaching with a model and taking him out in a boat to observe swells.",
      accessed: "2026-11-27",
      mla: {
        kind: "page",
        title: "Learning from Mau",
        author: "Thompson, Nainoa",
        container: "Polynesian Voyaging Society",
        showAccessDate: true,
      },
    },
    {
      id: voyage,
      title: "Polynesian Voyaging Society · A Generation of Renewal",
      url: "https://hokulea.com/history/",
      locator: "A Generation of Renewal 1975–2000, the 1976 and 1980 voyages",
      supports:
        "Piailug of Satawal navigated in 1976. Thompson navigated in 1980 and Piailug accompanied both legs in support.",
      accessed: "2026-11-27",
      mla: {
        kind: "page",
        title: "History",
        container: "Hōkūleʻa",
        author: "Polynesian Voyaging Society",
        showAccessDate: true,
      },
    },
    {
      id: birds,
      title: "Polynesian Voyaging Society · Locating Land",
      url: "https://archive.hokulea.com/navigate/land.html",
      locator: "Expanding landfall and the discussion of seabirds",
      supports:
        "Some seabirds leave land to feed in the morning and return later. Species, numbers and timing matter. A single bird can mislead.",
      accessed: "2026-11-27",
      mla: {
        kind: "page",
        title: "Locating Land",
        container: "Polynesian Voyaging Society",
        showAccessDate: true,
      },
    },
  );
  pack.cards.push(
    {
      id: "card.birdside.canoe",
      title: "Hōkūleʻa at Kualoa/Hakipuʻu, 8 March 1975",
      text: "The Polynesian Voyaging Society identifies the canoe and the Oʻahu bay where she first entered the water. Her Tahiti voyages followed in later years.",
      limits:
        "The launch date identifies this canoe. It cannot date a lesson or assign a role on a later voyage.",
      claimKind: "observation",
      historicalLabel: "documented",
      sources: [launch, voyage],
    },
    {
      id: "card.birdside.memory",
      title: "The learner’s pencil",
      text: "Nainoa Thompson recalls that in 1979 Piailug asked him to write things down. Models, time on the water and close observation were also part of his learning.",
      limits:
        "A learner can describe a particular lesson. His account does not set a single way of learning for everyone from Hawaiʻi or Satawal.",
      claimKind: "observation",
      historicalLabel: "documented",
      sources: [memory],
    },
    {
      id:"card.birdside.kane",
      person: {
        name: "Herb Kawainui Kāne",
        place: "Hawaiʻi",
        life: "1928–2011 · artist and canoe designer",
        era: "20th–21st centuries",
        continent: "Oceania",
      },
      title:"The canoe before the crossing",
      text:"Hawaiian artist and historian Herb Kawainui Kāne helped design Hōkūleʻa and co-founded the Polynesian Voyaging Society.",
      limits:"A designer can document a vessel’s intended form. The navigator and crew give a different kind of evidence about a passage.",
      claimKind:"observation", historicalLabel:"documented", sources:["HIS-PVS-KANE"],
    },
    {
      id: "card.birdside.voyage",
      person: {
        name: "Mau Piailug",
        place: "Satawal, Caroline Islands",
        life: "Navigator on the 1976 voyage",
        era: "20th–21st centuries",
        continent: "Oceania",
      },
      title: "Two crossings, two roles",
      text: "The Society names Mau Piailug of Satawal as navigator in 1976. Nainoa Thompson navigated the 1980 voyage from Hawaiʻi to Tahiti and back, with Piailug aboard in support.",
      limits:
        "A voyage summary can locate responsibility and company. A list of roles does not tell us what was said in a particular lesson.",
      claimKind: "observation",
      historicalLabel: "documented",
      sources: [voyage],
    },
  );
  pack.exhibits.push({
    id: canoeExhibit,
    name: "Hōkūleʻa, the voyaging canoe launched at Kualoa/Hakipuʻu on 8 March 1975",
    art: "birdside.canoe",
    historicalLabel: "documented",
    dateText: "8 March 1975",
    dateKind: "first launch",
    summary:
      "This double-hulled canoe first entered Kāneʻohe Bay on Oʻahu in 1975. On her voyages in 1976 and 1980 the same hulls carried different navigators. The Society recounts the distinct roles of Mau Piailug of Satawal and Nainoa Thompson of Hawaiʻi.",
    altText:
      "Two slender brown hulls joined by a deck, with two masts and curved sails in warm cream.",
    sources: [launch, voyage, memory],
    grantsCard: "card.birdside.canoe",
    specimen: {
      key: HOKULEA,
      institution: "Polynesian Voyaging Society",
      accession: "Hōkūleʻa · Kualoa/Hakipuʻu launch record, 8 March 1975",
      source: launch,
      objective: "birdside.fitted",
      people: [
        {
          name: "Mau Piailug",
          role: "Navigator from Satawal",
          detail:
            "Navigated Hōkūleʻa to Tahiti in 1976 and accompanied Thompson in 1980.",
          source: voyage,
        },
        {
          name: "Nainoa Thompson",
          role: "Navigator from Hawaiʻi",
          detail:
            "Navigated the 1980 round trip and described the combination of note-taking and practice he used while learning from Piailug.",
          source: memory,
        },
      ],
      fieldUse:
        "Bring the canoe to the Two-Tide Dock. Its folding rail opens a working watch for the new lookout.",
      revisit: {
        map: BIRD_DOCK,
        prop: "birdside.return",
        method: "Set a watch with a second observer.",
        hint: "Equip Hōkūleʻa at the Two-Tide Dock to unfold the rail.",
      },
    },
  });
  function say(
    id: string,
    speaker: string,
    text: string,
    options: DialogueNode["options"] = [],
    extra: Partial<DialogueNode> = {},
  ): void {
    pack.dialogue.push({
      id: "birdside." + id,
      speaker,
      historicalLabel: "fictional-world",
      text,
      options,
      ...extra,
    });
  }
  const renna = "sea-cartographer",
    sora = "sea-harbourkeeper";
  const back = {
    text: "Fold the sheet back into the pocket.",
    next: "birdside.folder",
  };
  const ready: Condition = { all: [has("crew"), has("paper"), has("cloth")] };
  say(
    "folder",
    sora,
    "Sora is oiling a key she has carried for thirty years. “My apprentice slipped it under the door. Thought the first solo watch meant she couldn’t call for company. Listen to the story I’ve been telling on this quay.” Two paper pockets are sewn into the awning. A third seam holds a strip of feathered cloth.",
    [
      {
        text: "Open the learner’s account of the pencil.",
        next: "birdside.memory",
      },
      { text: "Look for the artist who designed the canoe.", next:"birdside.kane" },
      { text: "Open the crew’s voyage history.", next: "birdside.voyage" },
      {
        text: "Look at what Renna printed about writing.",
        if: { all: [know("memory"), know("voyage")] },
        next: "birdside.paper",
      },
      {
        text: "Ask who else was aboard in 1980.",
        if: { all: [know("memory"), know("voyage")] },
        next: "birdside.crew",
      },
      {
        text: "Fit a guide to the next watch.",
        if: ready,
        next: "birdside.offer",
      },
      {
        text: "Ask after the returned key.",
        if: { flagSet: "birdside.harbour-reply" },
        next: "birdside.key",
      },
      { text: "Leave the pockets for later." },
    ],
  );
  say(
    "memory",
    "narrator",
    "In the account the Society preserves, Nainoa Thompson remembers his teacher, Mau Piailug of Satawal, arriving in 1979. Piailug asked him to use a pencil and paper. A model laid out on the ground and hours observing swells aboard a boat gave Thompson different ways to learn.",
    [back],
    {
      citationSource: memory,
      effects:[{addCard:"card.birdside.memory"}],
      historicalLabel: "documented",
    },
  );
  say("kane","narrator","Before this canoe could leave the beach, someone had to draw it. Artist and historian Herb Kawainui Kāne helped design Hōkūleʻa and co-founded the Polynesian Voyaging Society. Compare the design with the crew’s account of sailing her.",[back],{
    biographyCard:"card.birdside.kane",citationSource:"HIS-PVS-KANE",historicalLabel:"documented",
  });
  say(
    "voyage",
    "narrator",
    "The Society’s history of Hōkūleʻa distinguishes two voyages. Piailug navigated to Tahiti in 1976. In 1980 Thompson navigated there and back. Piailug accompanied him on both legs. Reading the name of the navigator tells you who bore that responsibility.",
    [back],
    {
      citationSource: voyage,
      biographyCard: "card.birdside.voyage",
      historicalLabel: "documented",
    },
  );
  say(
    "paper",
    renna,
    "Renna holds up her fair copy. “I set WITHOUT WRITING in my best type. My dad kept figures on his cuff. He would have asked me where I got those two words.” On the bench lie the voyage dates and the learner’s account.",
    [
      {
        text: "Lay the voyage dates over WITHOUT WRITING.",
        next: "birdside.dates-limit",
      },
      {
        text: "Fit the learner’s pencil into the printed lesson.",
        effects: [event("paper")],
        next: "birdside.paper-mended",
      },
    ],
  );
  say(
    "dates-limit",
    renna,
    "The two dates fit between the margins. The sentence about writing still has nothing holding it up. Renna leaves the type loose enough for another hand.",
    [
      {
        text: "Try the account from inside the lesson.",
        next: "birdside.paper",
      },
      back,
    ],
  );
  say(
    "paper-mended",
    renna,
    "Renna lifts the two lead words. “Somebody just walked off with a much better picture of my dad.” She leaves a space where a future learner can put a different tool.",
    [
      {
        text: "Try her headline on a second learning place.",
        next: "birdside.second-lesson",
      },
      back,
    ],
  );
  say(
    "second-lesson",
    renna,
    "Renna has started setting ALL NAVIGATORS NEED A PENCIL. Thompson’s same account describes how Piailug had learned with his grandfather. If the job is similar but the ways of learning differ, what can the historian carry from one case to the next?",
    [
      {
        text: "Give the second learner a blank line for their own account.",
        effects: [event("lesson-range", "open")],
        next: "birdside.open-lesson",
      },
      {
        text: "Print the question about which tools a teacher adapts.",
        effects: [event("lesson-range", "compare")],
        next: "birdside.compare-lesson",
      },
    ],
    { citationSource: memory },
  );
  say(
    "open-lesson",
    renna,
    "Renna sets a named tab for the learner in the account. A second tab has room for a different history. Nobody has had to borrow another person’s pencil to fit.",
    [back],
  );
  say(
    "compare-lesson",
    renna,
    "Renna prints the teacher’s choice of tool as something to look for in a second case. She keeps the number of other teachers who made that choice blank.",
    [back],
  );
  say(
    "crew",
    sora,
    "“I heard that Thompson navigated,” says Sora. “When I passed it on, I added ‘alone’. The single pair of hands in my drawing looked brave. I did draw the edge of the picture rather close.”",
    [
      {
        text: "Try to count the crew from the pencil lesson.",
        next: "birdside.memory-limit",
      },
      {
        text: "Unfold the voyage record beyond the navigator’s line.",
        effects: [event("crew")],
        next: "birdside.crew-mended",
      },
    ],
  );
  say(
    "memory-limit",
    sora,
    "A note about a lesson ashore gives Sora no head count at sea. She puts a finger under “alone” to hold the place while you open the other pocket.",
    [{ text: "Check who sailed the two legs.", next: "birdside.crew" }, back],
  );
  say(
    "crew-mended",
    sora,
    "Sora erases “alone” and leaves Thompson’s name on the navigation line. “I can give her the key and still stand the first watch with her.” A tiny metal click. She has oiled the wrong key twice.",
    [back],
  );
  say(
    "offer",
    renna,
    "The apprentice wants the westward birds left where she saw them. Renna has room for two rows on one board. Sora’s hooded lamp has room for one row at a time, but someone can turn it beside a learner. Which guide goes on the next boat?",
    [
      {
        text: "Send a board with a row for each hour.",
        effects: [event("edition", "board")],
        next: "birdside.board",
      },
      {
        text: "Fit a turning lamp for a pair of lookouts.",
        effects: [event("edition", "lamp")],
        next: "birdside.lamp",
      },
    ],
  );
  say(
    "board",
    renna,
    "Two rows stay on view when the watch changes. The apprentice can take them out alone. Renna asks her to leave a blank pinhole wherever the rain took the birds.",
    [back],
  );
  say(
    "lamp",
    sora,
    "Sora gives the apprentice the key and keeps the wick. Each can stop the other turning the hood too early. On a night with only one lookout someone must wait to go home.",
    [back],
  );
  say(
    "return",
    "narrator",
    "The two hulls fit the stops on the dock’s folding rail. Someone has left a wet mitten beside it with a cord long enough to reach a second pair of hands.",
    [
      {
        text: "Unfold the two-row board from Seagrass Steps.",
        if: edition("board"),
        next: "birdside.return-board",
      },
      {
        text: "Turn the two-person lamp from Seagrass Steps.",
        if: edition("lamp"),
        next: "birdside.return-lamp",
      },
    ],
  );
  const dockOptions = [
    {
      text: "Wait at the rail with the new lookout.",
      effects: [event("harbour-reply", "wait")],
      next: "birdside.wait",
    },
    {
      text: "Walk the two piers and trade the leading place.",
      effects: [event("harbour-reply", "walk")],
      next: "birdside.walk",
    },
  ];
  say(
    "return-board",
    "narrator",
    "From one side of the board both rows are clear. From the lower pier the top edge hides the later hour. The new lookout raises a mitten. She has been reading the right row for the wrong watch.",
    dockOptions,
  );
  say(
    "return-lamp",
    "narrator",
    "The hood makes one bright arrow. The lookout can turn it from the upper pier. Below, the second cord stops just short of her mitten. Somebody must stay, or the two of you can move.",
    dockOptions,
  );
  say(
    "wait",
    "narrator",
    "You wait through a change of light. The lookout ties the mitten cord where a second hand can reach it. One ferry leaves without the guide. The next two people can use it together.",
  );
  say(
    "walk",
    "narrator",
    "At the far pier the lookout takes the front place. You see the obstruction from below and trade the guide between you. The next crew gets two chalk footprints and must still make the walk.",
  );
  say(
    "key",
    sora,
    "Sora opens her palm. There is a pale key-shaped patch in the grime.",
    [
      {
        text: "Look for the second hand at the rail.",
        if: later("wait"),
        next: "birdside.key-wait",
      },
      {
        text: "Follow the chalk footprints.",
        if: later("walk"),
        next: "birdside.key-walk",
      },
    ],
  );
  say(
    "key-wait",
    sora,
    "“She kept the key. Yesterday she had me wait beside her, and today I had her wait beside me. We’re both learning the size of that word.” A second hook hangs beside the first.",
  );
  say(
    "key-walk",
    sora,
    "“She kept the key. Took me to the lower pier and handed me the guide. First time in thirty years I had to ask what the top row said.” Sora has chalk on both shoes.",
  );
  const objectives = stamps.map(
    ([id, , title], i): Objective => ({
      id: "birdside." + id,
      title,
      essential: false,
      done: done[i],
      weave: i < 2 ? recordWeave : i === 2 ? birdWeave : dockWeave,
      visible: i === 3 ? ready : i === 4 ? has("fitted") : undefined,
      kq: {
        id: i === 2 ? "KQ-ROUTE-19" : "KQ-ROUTE-27",
        action: i === 2 ? "comparing" : "revising",
      },
      onComplete: [{ journal: "j.birdside." + id }],
    }),
  );
  pack.missions.push(
    {
      id: "KG-CH8-FOLDING-FLOCK",
      world: "WORLD-09",
      title: "The spare key on the quay",
      stake:
        "An apprentice has given back the key after hearing that a navigator has to work alone.",
      knowledgeQuestion:
        "When can a first-hand account repair a public record, and when can the public record repair an account?",
      objectives: objectives.slice(0, 4),
    },
    {
      id: "KG-CH14-FOLDING-RAIL",
      world: "WORLD-15",
      title: "The mitten at the end of the rail",
      available: has("fitted"),
      stake:
        "The new lookout can read a guide from one end of the pier and lose the hour from the other.",
      knowledgeQuestion:
        "Who has to use a guide before its maker can say what it makes visible?",
      objectives: objectives.slice(4),
    },
  );
  const extension = "birdside.lesson-range";
  pack.missions
    .find((m) => m.id === "KG-CH8-FOLDING-FLOCK")!
    .objectives.push({
      id: extension,
      title: "Try the headline about a pencil on a second learning place.",
      essential: false,
      visible: has("paper"),
      done: { flag: extension, in: ["open", "compare"] },
      weave: {
        ...recordWeave,
        thinking: {
          dok: 3,
          bloom: "evaluate",
          fink: "integration",
          solo: "extended",
        },
      },
      kq: { id: "KQ-ROUTE-27", action: "revising" },
      onComplete: [{ journal: "j." + extension }],
    });
  pack.journal.push({
    id: "j." + extension,
    text: "I set two learners beside the headline about a pencil. I could carry a question about a teacher’s choice of tool into another history, while the number of other people who learned the same way stayed open.",
  });
  [
    "A pencilled headline still says “all”.",
    "Speak to Renna through the folder beside the folding flock.",
    "Mend her printed lesson and try her headline on a second learning place.",
    "Give the second learner an open line or give the historian a comparison to test.",
  ].forEach((text, i) =>
    pack.hints.push({
      id: "h." + extension + "." + (i + 1),
      objective: extension,
      depth: (i + 1) as 1 | 2 | 3 | 4,
      text,
    }),
  );
  stamps.forEach(([id, , , text], i) => {
    pack.journal.push({
      id: "j.birdside." + id,
      claimKind: "observation",
      text,
    });
    hints[i].forEach((text, j) =>
      pack.hints.push({
        id: "h.birdside." + id + "." + (j + 1),
        objective: "birdside." + id,
        depth: (j + 1) as 1 | 2 | 3 | 4,
        text,
      }),
    );
  });
}
