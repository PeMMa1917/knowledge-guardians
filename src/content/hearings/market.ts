import type { TownHearing } from "./types";
export const market: TownHearing = {
  id: "last-cup",
  title: "The price of the last cup",
  chapter: 10,
  world: "WORLD-11",
  map: "market.square",
  place: "The Market of Measures",
  x: 24,
  y: 21,
  host: "vesper-quill",
  opening:
    "Vesper has brought her own chipped cup. When the price board goes up she turns it upside down. “My mother used to do that when we were out. I thought it kept the flies off.” The milk sellers have one coin to return on each of twenty sales. Both queues have been waiting since dawn.",
  claim:
    "Both households pay one more coin for a cup. Give them equal places on the queue because the increase is the same for both.",
  source:
    "Vesper puts two receipts under her cup. “Two yesterday. Three today. Every buyer at this stall paid that change. Tell me what you would count next.”",
  narrow:
    "The price rose by one coin for both buyers. Their remaining food money and the cost of waiting differ.",
  fair: "Vesper taps the wet receipt. “A public queue that asks for your purse also asks you to tell the whole street how much you have.”",
  concession:
    "You leave a way of taking a place without showing the street what was in somebody’s purse.",
  press:
    "“If your rule follows the household’s budget, who gets to read that budget?”",
  question:
    "When do equal price changes warrant different decisions about a public queue?",
  value: true,
  kq: "KQ-ROUTE-24",
  outcomes: {
    exposed:
      "Tellen puts both household trays beside the receipts. The price stays three coins.",
    narrowed:
      "The board keeps the one-coin increase and adds two small trays showing what each buyer had left.",
    split:
      "One queue keeps numbered tokens. Beside it Dagny opens a quiet desk for people who can explain a shortfall.",
    "won-over":
      "Vesper rights her cup. “Write the price where we can all see it. Let a person ask me something without the whole street listening.” She takes the first private shift.",
    "lost-ground":
      "The equal-place queue runs to the corner. Dagny goes down the line to hear from the people who have to leave before the milk arrives.",
  },
  stations: [
    {
      title: "Two purses and the same milk cup",
      art: "hearing.food-purses",
      speaker: "market-assayer",
      opening:
        "Tellen will lend you two wooden purses. “Four food coins in this one. Ten in the other. Same morning, same cup. Please give the purses back. Last time a child bought an actual pear.”",
      readings: [
        [
          "Pay the old and new price from the four-coin purse.",
          "Two coins used to remain. Now one remains. The increase takes one quarter of the original food purse, half of what remained after buying the old cup.",
        ],
        [
          "Repeat the purchases with ten food coins.",
          "Eight used to remain and seven remain now. The extra coin is one tenth of the original purse and one eighth of the old remainder. The extra coin buys precisely the same cup.",
        ],
      ],
      card: "The extra coin takes one quarter of a four-coin purse and one tenth of a ten-coin purse.",
      limit:
        "The trays model two food budgets. They leave out travel, household size and other ways to obtain milk.",
      witness:
        "I can weigh the milk and count the coins. Ask me how it feels to have one left and I have to put down the scale.",
      claim: "Run a confidential shortfall queue beside the posted price.",
      challenge:
        "An equal cash rise uses an equal proportion of each food purse.",
      diagnosis:
        "The extra coin takes a quarter of one purse and a tenth of the other. The denominator matters.",
      objection:
        "A waiting ticket shows time spent away from work. It does not measure a purse.",
      reframe:
        "The extra coin can be the same at the till and a different share of what the buyer can spend.",
      chair: "Set a chair behind Tellen’s purse screen.",
      handover:
        "The first visitor shows Tellen an empty purse, then asks for the screen to be moved. From the queue everyone can see who goes behind it. Tellen turns the chair towards the common counter.",
      nextTown:
        "“We put the purse screen in plain sight,” Agate says. “It was the visitor who thought to hide the queue.”",
    },
    {
      title: "The tide and the two return tickets",
      art: "hearing.return-tickets",
      speaker: "market-clerk",
      opening:
        "Dagny threads a cord through two return tickets. “My father and I used to trade places in queues. People thought we liked the company. One of us always had a boat to catch.”",
      readings: [
        [
          "Hook the ferry worker’s ticket on the hour rail.",
          "The worker leaves before the subsidised stall opens. Surrendering the ticket gets them back to their paid shift in time.",
        ],
        [
          "Hang the neighbour’s ticket at the same hour.",
          "The neighbour can wait and takes a place. The two tickets carry the same price, but only one can be used before the owner must leave.",
        ],
      ],
      card: "Two equal-value tickets reached different shifts. One buyer could wait. One lost access on the ferry bell.",
      limit:
        "The two cases reveal a time barrier. They give no count of how many households face it.",
      witness:
        "I can tell you how many tokens I handed out. I used to call that the number of people we served. Then somebody brought a token back.",
      claim:
        "Keep the queue open to everybody and let a timed return token hold a place for a buyer who must leave.",
      challenge:
        "An equal place in the line always gives a buyer equal access.",
      diagnosis:
        "A valid ticket remained unusable for the worker who had to leave on the bell.",
      objection:
        "Two unequal purses do not tell us whether a particular worker could stay until the stall opened.",
      reframe:
        "Counting tokens issued answers a different question from counting buyers who could actually use one.",
      chair: "Carry the chair to Dagny’s return rail.",
      handover:
        "Dagny keeps the ferry worker’s place. The neighbour turns the ticket round to show her a second stamp. “I stood in line for them yesterday.”",
      nextTown:
        "“Somebody waited twice for that ferry worker,” says Agate. “Neither turn showed up in the till. Now Dagny asks who did the waiting.”",
    },
  ],
  weave: {
    concepts: [
      "objectivity",
      "values",
      "power",
      "responsibility",
      "interpretation",
      "justification",
    ],
    atl: ["thinking", "social", "communication"],
    aoks: ["MAT", "HUM", "POL"],
    subjects: ["economics", "math-ai", "business", "global-politics"],
    framework: ["scope", "perspectives", "ethics", "methods-and-tools"],
    thinking: { dok: 3, bloom: "evaluate", fink: "caring", solo: "relational" },
    minutes: 7,
  },
};
