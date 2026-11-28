import type {
  Condition,
  ContentPack,
  DialogueNode,
  DialogueOption,
  Objective,
  ShowdownOutcome,
  ShowdownRecord,
} from "../../domain/types";
import { coldStore } from "./coldStore";
import { metalworks } from "./metalworks";
import { copies } from "./copies";
import { repairBook } from "./repairBook";
import { market } from "./market";
import type { TownHearing } from "./types";

export const townHearings = [coldStore, metalworks, copies, market];
export const hearingKey = (h: TownHearing) => "hearing." + h.id;
export const hearingCard = (h: TownHearing, i: number) =>
  "card." + hearingKey(h) + "." + i;
const cardCondition = (h: TownHearing, i: number): Condition => ({
  card: hearingCard(h, i),
});
const outcomeFlag = (h: TownHearing) => "sd." + hearingKey(h) + ".outcome";
const seat = (h: TownHearing, i: number): Condition => ({
  flag: hearingKey(h) + ".seat",
  eq: i,
});

function hintTrail(pack: ContentPack, goal: string, lines: string[]) {
  for (const [i, text] of lines.entries()) {
    pack.hints.push({
      id: "h." + goal + "." + i,
      objective: goal,
      depth: (i + 1) as 1 | 2 | 3 | 4,
      text,
    });
  }
}

function assembleHearing(h: TownHearing, pack: ContentPack): ShowdownRecord {
  return {
    id: hearingKey(h),
    title: h.title,
    place: h.place,
    opponent: h.host,
    intro: {
      "empty-chair":
        "The latch clicks. A man holding a soup pot pushes himself up, then sees the chair has gone to somebody else. His daughter moves the pot out of the aisle.",
      "missing-tooth":
        "The wheel by the steps ticks once after it has stopped. A wheel hand leaves a half-eaten pear on the rim and takes the place nearest the door.",
      "dropped-verb":
        "Two messengers reach for the parcel at the same time. Both let go. Up in the rafters an apprentice starts to laugh and turns it into a cough.",
      "last-cup":
        "Someone in the milk queue calls the time. Three people turn towards the ferry. Vesper picks up the chipped cup so that everyone can see the old and new prices underneath.",
    }[h.id]!,
    valueShowdown: h.value,
    canBeWonOver: true,
    crowd: { player: 43, opponent: 55, patience: 8 },
    opponentClaim: {
      text: h.claim,
      force: 4,
      sourceReply: h.source,
      narrowed: h.narrow,
      links: h.stations.map((s, i) => ({
        id: "link" + i,
        text: s.challenge,
        weakTo: [hearingCard(h, i)],
        cracked: s.diagnosis,
        holds: s.objection,
      })),
      counterexamples: [
        { card: hearingCard(h, 1), why: h.stations[1].diagnosis },
      ],
    },
    playerClaims: h.stations.map((s, i) => ({
      id: "proposal" + i,
      text: s.claim,
      force: i + 2,
      reframe: s.reframe,
      supports: [{ card: hearingCard(h, i), strength: 2, why: s.card }],
    })),
    witnesses: h.stations
      .map((s, i) => ({
        id: s.speaker,
        name: pack.characters.find((c) => c.id === s.speaker)!.name,
        if: cardCondition(h, i),
        line: s.witness,
        strength: 2,
      }))
      .concat([
        {
          id: "travelling-chair",
          name: "Agate’s travelling repair book",
          strength: 1,
          if: {
            any: [
              { flagSet: hearingKey(h) + ".post0.arrived" },
              { flagSet: hearingKey(h) + ".post1.arrived" },
            ],
          } as Condition,
          line: {
            "empty-chair":
              "At the market there were two counts. Tickets issued could be checked at the rail. Whether a buyer could use a ticket took a second visit. What can someone check in each of these two books?",
            "missing-tooth":
              "A bedside key gave a visitor access. The keeper still had to ask what he saw. A delivery tag gets me to a wheel. Who can show me what happened on it?",
            "dropped-verb":
              "Two batches hung on the same pin. Someone had to follow them separately. If you follow counting and collecting separately, where does each instruction land?",
            "last-cup":
              "Two desks put on their coats. Neither collected the parcel. Can a ticket that somebody took tell us by itself whether they ever got a cup?",
          }[h.id]!,
        },
      ]),
    fairPoints: [{ id: "cost", text: h.fair, concede: h.concession }],
    script: [
      { move: "point", point: "cost" },
      { move: "press", line: h.press },
    ],
    outcomes: {
      exposed: { text: h.outcomes.exposed, effects: [] },
      narrowed: { text: h.outcomes.narrowed, effects: [] },
      split: { text: h.outcomes.split, effects: [] },
      "won-over": { text: h.outcomes["won-over"], effects: [] },
      "lost-ground": { text: h.outcomes["lost-ground"], effects: [] },
    },
    weave: h.weave,
  };
}

function addSources(h: TownHearing, pack: ContentPack) {
  const key = hearingKey(h);
  const objectives: Objective[] = [];
  for (const [i, station] of h.stations.entries()) {
    const id = key + ".station" + i;
    const actions: DialogueOption[] = station.readings.map(([text], j) => ({
      text,
      next: id + ".read" + j,
    }));
    const both: Condition = {
      all: station.readings.map((_, j) => ({ flagSet: id + ".read" + j })),
    };
    actions.push(
      {
        text: "Take these two readings to the hearing.",
        if: both,
        next: id + ".signed",
      },
      { text: "Leave the work here." },
    );
    pack.dialogue.push({
      id,
      speaker: station.speaker,
      historicalLabel: "fictional-world",
      text: station.opening,
      options: actions,
      effects: [{ setFlag: key + ".visited", value: true }],
    });
    station.readings.forEach(([, text], j) => {
      const reading = id + ".read" + j;
      pack.dialogue.push({
        id: reading,
        speaker: station.speaker,
        historicalLabel: "fictional-world",
        text,
        effects: [{ setFlag: reading, value: true }],
        options: [
          { text: "Try the other position.", next: id + ".read" + (1 - j) },
          { text: "Step back to the work.", next: id },
          { text: "Take the two readings.", if: both, next: id + ".signed" },
        ],
      });
    });
    pack.dialogue.push({
      id: id + ".signed",
      speaker: station.speaker,
      historicalLabel: "fictional-world",
      text: station.card + " " + station.limit,
      effects: [{ addCard: hearingCard(h, i) }],
    });
    pack.cards.push({
      id: hearingCard(h, i),
      title: station.title,
      text: station.card,
      limits: station.limit,
      historicalLabel: "fictional-world",
      claimKind: "observation",
      sources: [],
    });
    hintTrail(pack, id, [
      station.opening,
      "Look for " + station.title + " in " + h.place + ".",
      station.readings[0][0] + " Then try the other position.",
      "After seeing both readings, take the pair to the hearing. " +
        station.limit,
    ]);
    const journal = "j." + id;
    pack.journal.push({
      id: journal,
      text:
        "I worked with " +
        pack.characters.find((c) => c.id === station.speaker)!.name +
        ". " +
        station.card,
    });
    objectives.push({
      id,
      title: station.title,
      done: cardCondition(h, i),
      essential: false,
      weave: {
        ...h.weave,
        thinking: {
          dok: 2,
          bloom: "analyse",
          solo: "relational",
          fink: "application",
        },
        minutes: 2,
      },
      questionWays: [{ id: h.kq, action: "comparing" }],
      onComplete: [{ journal }],
    });
  }
  return objectives;
}

function previousNews(h: TownHearing, pack: ContentPack): DialogueOption[] {
  const previous =
    townHearings[
      (townHearings.indexOf(h) + townHearings.length - 1) % townHearings.length
    ];
  return previous.stations.map((s, i) => {
    const id = hearingKey(h) + ".post" + i;
    const stamp = id + ".arrived";
    const key = hearingKey(h),
      record = repairBook[h.id];
    const finished = key + ".amended";
    const options: DialogueOption[] = h.stations.map((_, local) => ({
      text: "Bring the two hearing decisions to the repair bench.",
      if: seat(h, local),
      next: id + ".compare" + local,
    }));
    for (const local of [0, 1]) {
      pack.dialogue.push({
        id: id + ".compare" + local,
        speaker: h.host,
        historicalLabel: "fictional-world",
        text: record.arrival + " " + h.stations[local].handover,
        options: [
          ...record.methods.map((text, method) => ({
            text,
            next: key + ".amend" + method,
            effects: [
              { setFlag: finished, value: method },
              { setFlag: finished + ".from", value: i },
              { setFlag: finished + ".local", value: local },
              { journal: "j." + key + ".amend" + method },
            ],
          })),
          { text: "Return the two decisions to the repair book." },
        ],
      });
    }
    options.push({ text: "Refold the reply." });
    pack.dialogue.push({
      id,
      speaker: "agate-vale",
      historicalLabel: "fictional-world",
      text: s.nextTown,
      effects: [{ setFlag: stamp, value: true }],
      options,
    });
    return {
      text: "Open the reply from " + previous.place + ".",
      next: id,
      if: seat(previous, i),
    };
  });
}

export function addTownHearings(pack: ContentPack) {
  const agate = {
    id: "agate-vale",
    name: "Agate Vale",
    role: "Chair mender and hearing steward for the Gilded Seal",
    sprite: "custom:deep.grey.walnut.olive.scarf.rose.bun.lightframes.none",
    mode: "fictional" as const,
    talk: [{ node: hearingKey(coldStore) + ".invite" }],
    localGreeting: {} as Record<string, string>,
  };
  pack.characters.push(agate);
  for (const h of townHearings) {
    const key = hearingKey(h),
      result = outcomeFlag(h);
    const host = pack.characters.find((c) => c.id === h.host)!;
    host.localGreeting = { ...host.localGreeting, [h.map]: key + ".invite" };
    const news = previousNews(h, pack);
    if (h.host !== agate.id) {
      agate.localGreeting[h.map] = key + ".repair";
      pack.dialogue.push({
        id: key + ".repair",
        speaker: agate.id,
        historicalLabel: "fictional-world",
        text: "Agate shaves a corner from the foot of the hearing chair. “My father always did this bit after the hearing. By then you knew which way a person liked to lean.”",
        options: [...news, { text: "Leave her to the repair." }],
      });
    }
    const invite: DialogueNode = {
      id: key + ".invite",
      speaker: h.host,
      historicalLabel: "fictional-world",
      text: h.opening,
      effects: [{ setFlag: key + ".visited", value: true }],
      options: [
        { text: "Take a seat at the hearing.", open: "showdown:" + key },
        {
          text: "Read what the town did.",
          if: { flagSet: result },
          next: key + ".chair",
        },
        ...(h.host === agate.id ? news : []),
        { text: "Leave the chair for somebody else." },
      ],
    };
    pack.dialogue.push(invite);
    const objectives = addSources(h, pack);
    const record = repairBook[h.id];
    record.replies.forEach((text, method) => {
      const id = key + ".amend" + method;
      pack.dialogue.push({
        id,
        speaker: h.stations[method].speaker,
        historicalLabel: "fictional-world",
        text,
      });
      pack.journal.push({
        id: "j." + id,
        text: "I brought two hearings together. " + text,
      });
    });
    objectives.push({
      id: key + ".amended",
      title: "Try a change from the travelling repair book.",
      visible: {
        all: [
          { flagSet: key + ".seat" },
          {
            any: [
              { flagSet: key + ".post0.arrived" },
              { flagSet: key + ".post1.arrived" },
            ],
          },
        ],
      },
      done: { flagSet: key + ".amended" },
      essential: false,
      weave: {
        ...h.weave,
        aoks: [...new Set([...(h.weave.aoks ?? []), ...(h === copies ? ["NAT" as const] : h === metalworks ? ["HIS" as const] : [])])],
        thinking: {
          dok: 4,
          bloom: "create",
          solo: "extended",
          fink: "integration",
        },
      },
      questionWays: [{ id: h.kq, action: "revising" }],
    });
    const previous =
      townHearings[
        (townHearings.indexOf(h) + townHearings.length - 1) %
          townHearings.length
      ];
    hintTrail(pack, key + ".amended", [
      record.arrival,
      "Look for a reply sent from " + previous.place + ".",
      "Place a hearing chair in both towns, in either order. Find Agate in " +
        h.place +
        ".",
      "Ask Agate to open the reply. Bring both decisions to the bench and try one of the two changes.",
    ]);
    pack.showdowns.push(assembleHearing(h, pack));
    const dispositions: DialogueOption[] = h.stations.map((s, i) => ({
      text: s.chair,
      next: key + ".seated" + i,
      effects: [
        { setFlag: key + ".seat", value: i },
        { journal: "j." + key + ".seated" + i },
      ],
    }));
    pack.dialogue.push({
      id: key + ".chair",
      speaker: h.host,
      historicalLabel: "fictional-world",
      text: "A patch of wool is tied to the chair. Someone has tucked the town’s decision under it.",
      options: (Object.keys(h.outcomes) as ShowdownOutcome[]).map((id) => ({
        text: "Unfold the town’s decision.",
        if: { flag: result, eq: id },
        next: key + ".ruling." + id,
      })),
    });
    for (const [code, text] of Object.entries(h.outcomes)) {
      pack.dialogue.push({
        id: key + ".ruling." + code,
        speaker: h.host,
        historicalLabel: "fictional-world",
        text,
        options: [...dispositions, { text: "Fold the decision back for now." }],
      });
    }
    h.stations.forEach((station, i) => {
      const id = key + ".seated" + i;
      pack.dialogue.push({
        id,
        speaker: station.speaker,
        historicalLabel: "fictional-world",
        text: station.handover,
      });
      pack.journal.push({
        id: "j." + id,
        text: "I moved the hearing chair. " + station.handover,
      });
    });
    objectives.push({
      id: key + ".seated",
      title: "Place the hearing chair where someone can use it.",
      done: { flagSet: key + ".seat" },
      essential: false,
      weave: h.weave,
      questionWays: [{ id: h.kq, action: "staging" }],
    });
    hintTrail(pack, key + ".seated", [
      h.fair,
      "Find the hearing chair in " + h.place + ".",
      "After the hearing, ask to read what the town did. Its decision is tied to the chair.",
      "Unfold the decision and choose a place. " +
        h.stations[0].chair +
        " Or " +
        h.stations[1].chair,
    ]);
    h.stations.forEach((station, i) => {
      const id = key + ".checked" + i;
      objectives.push({
        id,
        title: station.challenge.replace(/\.$/, "") + "?",
        essential: false,
        visible: cardCondition(h, i),
        done: { flagSet: "sd." + key + ".checked.link" + i },
        weave: h.weave,
        questionWays: [{ id: h.kq, action: "testing" }],
      });
      hintTrail(pack, id, [
        h.question,
        station.objection,
        "Look at " + station.title + " before taking a seat.",
        "At the hearing challenge “" +
          station.challenge +
          "” with your paired readings. " +
          station.diagnosis,
      ]);
    });
    pack.missions.push({
      id: "KG-CH" + String(h.chapter).padStart(2, "0") + "-HEARING",
      title: h.title,
      world: h.world,
      available: { flagSet: key + ".visited" },
      stake: h.fair,
      knowledgeQuestion: h.question,
      objectives,
    });
  }
}
