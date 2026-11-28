import { returnCoatCognition } from './return-coat-evidence.mjs';
import { pocketCognition } from './pocket-theatre-evidence.mjs';
// Each row names the specific part of a tested action that earns this pairing.
// The demanding project around a step cannot raise the depth of a routine recall.
export const cognitiveActions = [
  ...returnCoatCognition, ...pocketCognition,
  {
    objective: 'optics.drawings', story: 119, game: 41,
    dimensions: ['micro:325', 'micro:496', 'area:ART', 'area:NAT', 'concept:explanation', 'framework:methods-and-tools', 'reasoning:inductive', 'reasoning:pragmatic'],
    bloom: 'analyse', dok: 3,
    demand: 'Test both chalk predictions at a seat. Change the aperture until their forecasts disagree and compare repeat readings before handing the company a cue or a further test.',
    consequence: 'The production can keep a reliable entrance or reserve the disputed seat for another trial of the explanation.',
  },
  {
    objective: 'rivernames.placename', story: 52, game: 209,
    dimensions: ['micro:828', 'area:HIS', 'theme:IND', 'concept:interpretation', 'framework:perspectives', 'reasoning:analogical'],
    bloom: 'analyse', dok: 3,
    demand: 'Consult the two named source leaves and give the high-water walker the morning pin. Compare the different uses of a fixed point before deciding what goes on each sheet.',
    consequence: 'Emlet can keep the record of his own morning. The next walker receives a route she can alter or a tide-specific slip.',
  },
  { objective:'claimbell.issue', story:11, game:114, dimensions:['etymology:claim','vocabulary:claim','micro:370','concept:perspective','framework:perspectives'],
    bloom:'create',dok:3,demand:'Design an entrance and a shift after trying both claimants and at least two methods of calling for a turn.',
    consequence:'The sealed times and entrance travel to the council. The player must try the rule there as signed.' },
  { objective:'claimbell.weir.test', story:15, game:22, dimensions:['micro:64','vocabulary:claim','concept:evidence','framework:methods-and-tools'],
    bloom:'apply',dok:2,demand:'Apply the pot charter to a new kind of claim. Walk a listener and a chalk maker through its actual window.',
    consequence:'One can leave a rubbing while three knocks can leave the flat slot empty.' },
  { objective:'claimbell.sign', story:11, game:114, dimensions:['micro:759','etymology:evidence','vocabulary:evidence','concept:evidence','framework:ethics'],
    bloom:'evaluate',dok:3,demand:'Judge the hearing rule after comparing a sight-based slot with a late oral hearing. Decide which channel and shift to sign.',
    consequence:'The porter back in Emberford is bound by the returned rule. A proxy cannot speak for a wrist he wants to keep private.' },

  {
    objective: 'last-bell.voices.sleeve', story: 48,
    dimensions: ['micro:1016', 'concept:evidence'], bloom: 'remember', dok: 1,
    demand: 'Retrieve the permission on the sleeve whose shelf mark matches the surviving strip.',
    consequence: 'The correct record can be found again before the recording goes on the air.',
  },
  {
    objective: 'optics.presets', story: 74, game: 49,
    dimensions: ['framework:methods-and-tools', 'subject:design-tech'], bloom: 'remember', dok: 1,
    demand: 'Recall a previously stowed tool packing from its impression in the felt.',
    consequence: 'The same fittings are available for the next bench after the loan has ended.',
  },
  {
    objective: 'middlehouse.guests', story: 86, game: 29,
    dimensions: ['framework:perspectives', 'concept:responsibility'], bloom: 'understand', dok: 2,
    demand: 'Use what the resident can sense to give its perch a job. The mat, sill and brick each offer different help.',
    consequence: 'When the resident returns, the player can follow a direction, use a sightline or recover a floor.',
  },
  {
    objective: 'rivernames.walks', story: 85, game: 122,
    dimensions: ['subject:geography', 'concept:explanation', 'framework:methods-and-tools', 'question:KQ-ROUTE-02', 'reasoning:causal'], bloom: 'apply', dok: 2,
    demand: 'Walk the marked delivery under two tide conditions. Recover the slack at the flooded stair and try another edge.',
    consequence: 'A different hand receives the parcel. The route can be retried from the board.',
  },
  {
    objective: 'last-bell.voices.left', story: 48, game: 287,
    dimensions: ['micro:1010', 'concept:interpretation', 'framework:scope', 'question:KQ-ROUTE-07'], bloom: 'analyse', dok: 3,
    demand: 'Listen beyond the excerpt to distinguish two bells and decide what the complete statement supports.',
    consequence: 'The next listener can receive a named voice or an unsigned account with different limits.',
  },
  {
    objective: 'elbow.fitting', story: 25, game: 195,
    dimensions: ['micro:1116', 'area:MAT', 'area:ART', 'framework:scope', 'reasoning:deductive'], bloom: 'analyse', dok: 3,
    demand: 'Separate the overall sleeve length from how it is distributed. Move joints and try the resulting fit over both troupes.',
    consequence: 'The same total can leave different partners unable to take hands. The signed pattern travels.',
  },
  {
    objective: 'elbow.lottery', story: 119, game: 69,
    dimensions: ['micro:1109', 'concept:evidence', 'framework:methods-and-tools', 'area:MAT', 'reasoning:deductive'], bloom: 'evaluate', dok: 3,
    demand: 'Commit to a direction before the packets open. Compare extreme and ordinary assignments before judging the observed result.',
    consequence: 'The receiving crew learns which comparison underlies the result they are asked to use.',
  },
  {
    objective: 'middlehouse.night', story: 86, game: 162,
    dimensions: ['micro:115', 'concept:values', 'framework:ethics', 'question:KQ-ROUTE-35', 'reasoning:pragmatic'], bloom: 'evaluate', dok: 4,
    demand: 'Carry a tested cart stop and sightline across the house inquiry. At the meeting weigh access, rest and performance against the earlier invitation.',
    consequence: 'On returning, the player finds which neighbour got the key and what the other neighbour has had to give up.',
  },
  {
    objective: 'elbow.curtain', story: 112, game: 194,
    dimensions: ['micro:1118', 'area:HIS', 'area:ART', 'concept:interpretation', 'framework:perspectives', 'reasoning:abductive'], bloom: 'create', dok: 4,
    demand: 'Develop a production across the costume trials and the records of repairs. Compose its visible sleeve, hinge and first entrance.',
    consequence: 'The choices change the stage picture, the sister who enters first and what is later said in the loft.',
  },
  {
    objective: 'last-bell.council.reopened', story: 15, game: 114,
    dimensions: ['micro:1180', 'micro:1200', 'concept:responsibility', 'framework:ethics', 'reasoning:pragmatic'], bloom: 'create', dok: 4,
    demand: 'Reopen an issued minute after collecting the flood tally, missing replies, amended route and the witness’s conditions. Redesign who runs the trial.',
    consequence: 'The households receive either control of the trial or assigned roles with comparable observations. The final minute carries that decision.',
  },
];
