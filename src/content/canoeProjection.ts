import type { ContentPack, DialogueNode, Objective } from "../domain/types";

export function addCanoeProjection(pack: ContentPack): void {
  const stage = "stage-host";
  const image = "birdside.projection.image";
  const range = "birdside.projection.range";
  const source = "HIS-PVS-KUALOA",
    voyage = "HIS-PVS-RENEWAL",
    memory = "HIS-PVS-LEARNING-FROM-MAU";
  const set = (setFlag: string, value: string) => ({ setFlag, value });
  const title = "One pair of hands in the frame";
  const nodes: DialogueNode[] = [
    {
      id: "birdside.project",
      speaker: stage,
      text: "From the gallery, the cutout canoe looks splendid. It also looks like every canoe in the prop room. A child has already taken a programme home that calls it “the boat with the brave man”. The projectionist has one glass slide and room for a little type at the bottom.",
      options: [
        {
          text: "Hold the stock silhouette over the glass.",
          next: "birdside.stock",
        },
        {
          text: "Lay the Oʻahu launch record against the projection.",
          next: "birdside.launch-slide",
        },
        {
          text: "Set the two voyages beside the same hulls.",
          next: "birdside.voyage-slide",
        },
        {
          text: "Try the sentence the audience will take home.",
          if: { objective: image },
          next: "birdside.project-range",
        },
      ],
    },
    {
      id: "birdside.stock",
      speaker: "narrator",
      effects: [{ setFlag: "birdside.stock-tested", value: true }],
      text: "A second cutout from the scenery cupboard casts the same black shape. If the programme goes home like this, neither child can tell which canoe the play follows.",
      options: [
        {
          text: "Slide the glass back and try another frame.",
          next: "birdside.project",
        },
      ],
    },
    {
      id: "birdside.launch-slide",
      speaker: "narrator",
      citationSource: source,
      text: "Leave the two hulls in view. The public launch record fixes this particular canoe at Kualoa/Hakipuʻu on Oʻahu on 8 March 1975. Its later navigators do not belong on a line that dates the launch.",
      options: [
        {
          text: "Expose the place, day and name in the launch frame.",
          effects: [set(image, "launch")],
          next: "birdside.project-range",
        },
        { text: "Put the slide back.", next: "birdside.project" },
      ],
    },
    {
      id: "birdside.voyage-slide",
      speaker: "narrator",
      citationSource: voyage,
      text: "The same Hōkūleʻa travelled to Tahiti with Piailug navigating in 1976 and with Thompson navigating in 1980. The crew’s history also puts Piailug aboard in support in 1980. The programme can follow a change of roles on one identified canoe.",
      options: [
        {
          text: "Expose the name and two dated roles in the voyage frame.",
          effects: [set(image, "voyages")],
          next: "birdside.project-range",
        },
        { text: "Put the slide back.", next: "birdside.project" },
      ],
    },
    {
      id: "birdside.project-range",
      speaker: stage,
      text: "The back row asks whether a stage picture can show how anybody learns to navigate. You could put one claim into the programme and leave the audience a way of testing it.",
      options: [
        {
          text: "Project “Every navigator learned by writing.”",
          next: "birdside.every",
        },
        {
          text: "Mount one learner’s account with this crew’s record.",
          effects: [set(range, "particular")],
          next: "birdside.particular",
        },
        {
          text: "Give the next historian a comparison to test.",
          effects: [set(range, "compare")],
          next: "birdside.compare",
        },
      ],
    },
    {
      id: "birdside.every",
      speaker: "narrator",
      citationSource: memory,
      text: "Thompson recalls Piailug asking him to use a pencil. He also remembers how his teacher had learned differently from his own grandfather. Two hands in that very account give the word “every” trouble.",
      options: [
        { text: "Move the edge of the claim.", next: "birdside.project-range" },
      ],
    },
    {
      id: "birdside.particular",
      speaker: stage,
      text: "The child goes home with an identified canoe, the public voyage dates and an account of what helped one learner. A blank space after their names leaves room for another crew to tell its own story.",
    },
    {
      id: "birdside.compare",
      speaker: stage,
      text: "The projectionist adds a second, empty frame. A later historian can compare the next crew’s job list with its accounts of who taught whom. A list of jobs can omit teaching. This single voyage gives no count of how often it happens.",
    },
  ];
  pack.dialogue.push(
    ...nodes.map((n) => ({
      ...n,
      historicalLabel: "fictional-world" as const,
    })),
  );
  const objectives: Objective[] = [
    {
      id: image,
      title:
        "Compare a stock cutout with a dated view of this particular canoe.",
      essential: false,
      done: {
        all: [
          { flag: "birdside.stock-tested", eq: true },
          { flag: image, in: ["launch", "voyages"] },
        ],
      },
      weave: {
        concepts: ["evidence", "interpretation", "culture", "perspective"],
        framework: ["scope", "methods-and-tools"],
        aoks: ["ART", "HIS"],
        subjects: ["film", "theatre", "history"],
        atl: ["research", "communication"],
        thinking: {
          dok: 2,
          bloom: "apply",
          fink: "application",
          solo: "relational",
        },
        minutes: 2,
      },
      kq: { id: "KQ-ROUTE-19", action: "comparing" },
      onComplete: [{ journal: "j." + image }],
    },
    {
      id: range,
      title: "Choose how far the programme’s claim can travel.",
      essential: false,
      visible: { objective: image },
      done: {
        all: [
          { objective: image },
          { flag: range, in: ["particular", "compare"] },
        ],
      },
      weave: {
        concepts: [
          "justification",
          "certainty",
          "responsibility",
          "truth",
          "explanation",
          "perspective",
        ],
        framework: ["scope", "ethics", "perspectives"],
        aoks: ["HIS", "HUM", "IND"],
        subjects: ["history", "anthropology", "theatre"],
        atl: ["thinking", "research"],
        thinking: {
          dok: 3,
          bloom: "evaluate",
          fink: "integration",
          solo: "extended",
        },
        minutes: 3,
      },
      kq: { id: "KQ-ROUTE-27", action: "revising" },
      onComplete: [{ journal: "j." + range }],
    },
  ];
  pack.missions.push({
    id: "KG-CH9-FOLDING-PROJECTION",
    world: "WORLD-10",
    title,
    available: { objective: "birdside.fitted" },
    stake:
      "After the show, a child should be able to tell a real canoe from any black shape in the scenery cupboard.",
    knowledgeQuestion:
      "What can one situated example establish about the ways people make a historical account?",
    objectives,
  });
  pack.journal.push(
    {
      id: "j." + image,
      text: "I replaced the gallery silhouette with a dated view of Hōkūleʻa.",
      readings: [
        {
          when: { flag: image, eq: "launch" },
          text: "I fixed the stage frame to Hōkūleʻa at Kualoa/Hakipuʻu, Oʻahu, on her launch day. Another dark hull could have cast the same shadow.",
        },
        {
          when: { flag: image, eq: "voyages" },
          text: "I used two dated navigator lines to follow the same Hōkūleʻa through two journeys. A cutout alone could have stood for another canoe.",
        },
      ],
    },
    {
      id: "j." + range,
      text: "I gave the projectionist a claim with edges.",
      readings: [
        {
          when: { flag: range, eq: "particular" },
          text: "I kept the stage programme close to Thompson’s account of his own learning from Piailug.",
        },
        {
          when: { flag: range, eq: "compare" },
          text: "I left a second frame empty so that the next historian could test whether another crew list also left out part of the teaching.",
        },
      ],
    },
  );
  const clues = [
    [
      "The spare cutout fits two different canoes.",
      "Carry and equip Hōkūleʻa in the House of Performance gallery.",
      "A date must name what happened to the particular canoe.",
      "Test the spare cutout and expose either the launch record or the two voyage roles on the glass.",
    ],
    [
      "The audience wants to take the sentence home.",
      "Use the glass beside the folding projector.",
      "A single teaching account can support a particular case or give another historian an idea to test.",
      "Try the broad claim if you like. Mount either the named learner’s account or a comparison for a second crew.",
    ],
  ];
  objectives.forEach((obj, i) =>
    clues[i].forEach((text, j) =>
      pack.hints.push({
        id: "h." + obj.id + "." + (j + 1),
        depth: (j + 1) as 1 | 2 | 3 | 4,
        text,
        objective: obj.id,
      }),
    ),
  );
}
