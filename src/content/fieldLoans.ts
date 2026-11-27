import {
  loanBench,
  loanFamily,
  loanJobs,
  loanStops,
  stationKeys,
  stops,
  type LoanStop,
} from "./loanCrews";
import { PERSPECTIVE_FLAG, specimenToolId } from "../domain/specimenGear";
import { loanSite, loanWeave } from "../domain/fieldLoan";
import type { Condition, ContentPack } from "../domain/types";

export const loanFitted = (stop: LoanStop): Condition => ({
  flag: PERSPECTIVE_FLAG,
  in: stationKeys(stop).map(specimenToolId),
});
const voices = {
  press: [
    [
      "A small mitten is hanging by the door of the Record Room. Inside is the short ticket, warm from someone’s hand. Mina’s brother has written the last word of his address on the lining.",
      "Ask him to sew a pocket for the folded address.",
      "He starts with his own mitten, leaving the thumb free. The runner can still use the short check. The second address can come as a separate leaf.",
    ],
    [
      "A reader at the press has counted the folds twice. She has both ends of the line and has missed the cart. “It is a peculiar thing to be exactly sure where I should be standing and to hear it drive away.”",
      "Give her the first place on the next cart.",
      "Mina chalks one reserved mitten on tomorrow’s cart list. The reader puts her folded sheet down to warm her hands.",
    ],
  ],
  stage: [
    [
      "A child on the rehearsal stair curls a finger like the front-row lamp hook. Behind the wall another child calls, “Was that it?” The front row has learned the cue faster than it has learned to pass it on.",
      "Leave a beat for the answer from the wall.",
      "On the next go the child keeps their finger raised. A shoe taps from the far side. This time both children bow.",
    ],
    [
      "A balcony usher passes the bell from hand to hand. A reader in the front row keeps turning to look up and missing the next line. Edda recognises that awkward half-turn.",
      "Move the reflecting card into the front row’s sight line.",
      "The front row sees a flash when the balcony lifts the bell. The usher still carries the clapper. Nobody has to take the stairs to borrow it.",
    ],
  ],
  dispatch: [
    [
      "A caller at the North Steps has found the right packet. Now the caller wants to ask something that the whole step needn’t hear. Ade can see the queue over the top of the bag.",
      "Loop a quiet return cord under the public hatch.",
      "The caller tugs once and hands the folded query through the side. The next reader can still find the public slip.",
    ],
    [
      "A canal messenger has waited for the side clerk until the water has taken the bottom step. Nobody on the street has seen what she came to ask. “I can keep a secret. Can the desk keep the time?”",
      "Mark a next opening on the outside flap.",
      "The messenger scrapes the mud off her shoe and comes back at the marked bell. The name of the person inside stays folded up.",
    ],
  ],
  fern: [
    [
      "The watcher on the trail has the dated strip. She holds it up to a gap in the trees, waiting for the reverse to become visible against the sky. It is still hanging at the station.",
      "Tie a second meeting place to the empty corner.",
      "The watcher marks the clearing under the awning. Two people can now meet to compare the reverse without pretending that daylight supplied its words.",
    ],
    [
      "A walker at the community clearing recognises Elian’s back-to-front cuff print. He is standing under a perfectly dry roof. The watch has already left for the ridge.",
      "Hang a reader’s peg where the trail splits.",
      "The walker leaves her peg at the fork. The next watch can find the whole dry roll even when there is nobody under the roof to wave them in.",
    ],
  ],
} as const;
export const loanReplies = (stop: LoanStop) => voices[stop];
const prompts: Record<LoanStop, string> = {
  press:
    "How does the format of an account affect which parts of it a reader can check?",
  stage:
    "How does changing the audience’s position change what a performance can show?",
  dispatch:
    "Who has access to a reason when its conclusion is easy to pass on?",
  fern: "What becomes of a field claim when the conditions for preserving its evidence change?",
};
export function addFieldLoans(pack: ContentPack) {
  pack.exhibits = pack.exhibits.map((record) => {
    const specimen = record.specimen,
      family = specimen && loanFamily(specimen.key);
    if (!specimen || !family) return record;
    const job = loanJobs[family],
      home = loanStops[job.primary],
      peer = loanStops[job.other];
    const hint =
      "Fit " +
      record.name +
      " at " +
      home.place +
      " or " +
      peer.place +
      ". " +
      job.need;
    return {
      ...record,
      specimen: {
        ...specimen,
        fieldUse: hint,
        revisit: {
          map: home.map,
          prop: loanBench(job.primary),
          method: job.job,
          hint,
        },
      },
    };
  });
  for (const stop of stops) {
    const desk = loanStops[stop],
      site = loanSite(stop);
    const outcome: Condition = {
      flag: site + ".edition",
      in: ["carry", "keep"],
    };
    const steps = [
      {
        id: "compared",
        title: "Try the two faces of " + desk.title.toLowerCase() + ".",
        done: { flag: site + ".compared", eq: true } as Condition,
        where:
          "Fit one of the collected objects named for this bench in your satchel.",
        how:
          desk.controls[0] + ", then " + desk.controls[1].toLowerCase() + ".",
      },
      {
        id: "questioned",
        title: "Answer a second letter about how the reader could tell.",
        done: { flag: site + ".questioned", eq: true } as Condition,
        where:
          "Look for the letter from the next reader under the two practice strips.",
        how: "Make an impression first. Name the object in the first letter and then send back a question about the way the account can be checked.",
      },
      {
        id: "issued",
        title: "Decide who takes the first reading.",
        done: outcome,
        where: "Return to " + desk.person + " at " + desk.place + ".",
        how: "Try the first two arrangements with the same item and issue the edition you want a neighbour to receive.",
      },
      {
        id: "heard",
        title: "See who is waiting on the other side.",
        done: { flagSet: site + ".heard" } as Condition,
        where:
          "Pass through the marked way beside the bench and look near the entrance.",
        how: "Speak to the reader at the far end, and make the small repair they need.",
      },
      {
        id: "answered",
        title: "Try an edition already handled in another town.",
        done: { flag: site + ".received", eq: true } as Condition,
        where: "The other town is named on the fitted object’s workbench.",
        how: "Issue an edition there with the same object, then try both settings and issue here. Your first receipt changes what arrives.",
      },
    ];
    pack.missions.push({
      id: "KG-LOAN-" + stop.toUpperCase(),
      world: desk.world,
      title: desk.title,
      knowledgeQuestion: prompts[stop],
      stake: desk.replies[0],
      available: { any: [loanFitted(stop), { flagSet: site + ".tried" }] },
      objectives: steps.map((row) => ({
        id: site + "." + row.id,
        title: row.title,
        done: row.done,
        essential: false,
        weave: {
          ...loanWeave(stop),
          thinking:
            row.id === "compared"
              ? {
                  dok: 2,
                  bloom: "apply",
                  fink: "application",
                  solo: "multistructural",
                }
              : row.id === "heard"
                ? { dok: 2, bloom: "apply", fink: "caring", solo: "relational" }
                : loanWeave(stop).thinking,
        },
        kq: {
          id:
            row.id === "compared"
              ? "KQ-NEW-003"
              : row.id === "heard"
                ? "KQ-NEW-006"
                : "KQ-NEW-005",
          action: row.how,
        },
      })),
    });
    for (const step of steps) {
      [
        desk.hook,
        step.where,
        step.how,
        "Both editions leave work for a different reader. " + step.how,
      ].forEach((text, i) =>
        pack.hints.push({
          id: "h." + site + "." + step.id + "." + (i + 1),
          objective: site + "." + step.id,
          depth: (i + 1) as 1 | 2 | 3 | 4,
          text,
        }),
      );
    }
    pack.dialogue.push(
      {
        id: site + ".invite",
        speaker: desk.speaker,
        text: desk.hook,
        options: [
          { text: "Look at the work waiting here.", next: site + ".letter" },
          { text: "Keep walking." },
        ],
      },
      {
        id: site + ".letter",
        speaker: desk.speaker,
        text: "When you earn an object, open its perspective in your satchel. Its description names the benches that can use it. Bring one here and I will lend you the tools. The slip you send will change what another town can do.",
      },
    );
    for (const [i, choice] of (["carry", "keep"] as const).entries()) {
      const [scene, offer, reply] = voices[stop][i],
        id = site + ".reader." + choice;
      pack.dialogue.push(
        {
          id,
          speaker: "narrator",
          text: scene,
          options: [
            {
              text: offer,
              if: { flag: site + ".edition", eq: choice },
              effects: [{ setFlag: site + ".heard", value: choice }],
              next: id + ".reply",
            },
            { text: "Leave them a moment." },
          ],
        },
        { id: id + ".reply", speaker: "narrator", text: reply },
      );
    }
  }
}
