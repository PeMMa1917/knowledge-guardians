/** What the two communities can do with a decision after it travels. */
export const repairBook: Record<
  string,
  {
    arrival: string;
    methods: [string, string];
    replies: [string, string];
    plaque: [string, string];
  }
> = {
  "empty-chair": {
    arrival:
      "Two things can happen at a door on the same morning. In the market a buyer could collect a token and still miss their milk. At the Cold Store a visitor can enter and never have a chance to speak. Agate has a pair of spare hooks.",
    methods: [
      "Keep an entry stub and offer an optional return visit.",
      "Leave a bell on the landing so a waiting witness can ask to speak.",
    ],
    replies: [
      "Aster numbers the stub, leaves the visitor’s name with them and lends them the second hook for a return visit. Iren comes back with the letter she had forgotten in her coat.",
      "Pilar knots the bell low enough for someone sitting outside. Pev rings once. Inside he asks for somebody else’s account to be heard first.",
    ],
    plaque: [
      "An entry stub and a return hook",
      "The witness bell on the landing",
    ],
  },
  "missing-tooth": {
    arrival:
      "In the Cold Store a family name could get you through the door. It could never show what happened at the bedside. A lot stamp takes a wheel inspector to the right bin. The person with a hand on the lever has something further to say.",
    methods: [
      "Leave the batch tag with the steward and invite the wheel hand to mark the pull.",
      "Lend the two records together and ask a second shift to repeat the pull.",
    ],
    replies: [
      "Bea keeps the tags dry while the wheel hand chalks the two positions. The inspector returns to find two different signatures, one on the lot and one beside the lever.",
      "Corra lends the paired slips to the late shift. A tired worker finds the jig set in the wrong notch. The day crew gets a chance to try both settings when they return.",
    ],
    plaque: ["Two signatures at the test jig", "The late shift’s marked notch"],
  },
  "dropped-verb": {
    arrival:
      "Following two delivery stamps took the wheel crew to two machines. Following two verbs may take a runner to two desks. Agate takes the pencil out from behind her ear. “It lasted one wet shift. Lark, spare me a line of metal?”",
    methods: [
      "Print a separate collecting address below the counting docket.",
      "Route a single proof through both desks for independent replies.",
    ],
    replies: [
      "Lark puts the collecting address below the count. The runner goes straight to the lending desk even after the counting clerk has gone home.",
      "Mina sends the same proof to both desks. They both sign, but one has written “Tuesday” and the other “tomorrow.” The runner brings them together before the next load leaves.",
    ],
    plaque: [
      "The collecting address in metal",
      "The runner’s two dated replies",
    ],
  },
  "last-cup": {
    arrival:
      "At the press, sending out an instruction did not establish that anybody had moved a parcel. Vesper takes the return ticket out from under her cup. “We counted handing these out. What if the person who never came back was the one who needed us?”",
    methods: [
      "Count issued and used tokens on separate public strings.",
      "Ask the people who returned unused tickets for an optional private account.",
    ],
    replies: [
      "Dagny threads used tokens onto a second cord. A gap opens after the ferry bell. Nothing on the strings tells an onlooker whether work or a late boat caused it.",
      "The first buyer tells Tellen about the ferry. The next wants no interview and takes the ticket away. Tellen closes the purse box without writing a reason beside the gap.",
    ],
    plaque: [
      "The issued and used token strings",
      "The private return-ticket box",
    ],
  },
};
