import type { AOK } from '../domain/types';
/** The travelling coat is an ordinary shift coat. Each pocket holds a working part of someone's shift. */
export interface CoatPocket {
  title: string;
  opening: string;
  to: string;
  run: string;
  controls: [string, string, string][];
  seams: [string, string];
  replies: [string, string];
  question: string;
  areas: AOK[];
  subjects: string[];
}

export const pocketStories: Record<string, CoatPocket> = {
  archive: {
    title: 'Two women and a key',
    opening:
      'Ise catches a blue coat before it slides off the peg. “My mother used to mend this. I told people it was hers.” Inside the cuff a label says only SHE LEFT IT THERE. Two women had keys that night. The little press has room for eighteen words.',
    to: 'press',
    run: 'Ink the cuff label',
    controls: [
      ['The hand in the sentence', 'Keep the pronouns', 'Set the two names'],
      ['The space before the message', 'Keep the formal opening', 'Lift the opening into the offcut tray'],
    ],
    seams: ['Stitch the printed face outside', 'Leave the loose type inside'],
    replies: [
      'Bayette pins the cuff low enough for the child delivering type to read. She asks about the woman the line leaves out.',
      'Bayette saves the cut words in a type drawer. Ise’s mother comes to move a letter with her own thumb.',
    ],
    question: 'Who could act on the shorter label? What would a person still have to ask?',
    areas: ['HIS', 'ART', 'LAN'],
    subjects: ['lang-langlit', 'visual-arts'],
  },
  nile: {
    title: 'Wages for an empty box',
    opening:
      'A wage slip falls out of the lining. Imani knows the box by the squeak of its handle. “First thing I was paid to carry. If I show the porter just this book, he’ll swear I never turned up.” There are two drawers and a pencilled tally from the quay.',
    to: 'market',
    run: 'Make a contact print of the drawer',
    controls: [
      ['What the archive kept', 'Open the paid drawer', 'Include the unpaid slips'],
      ['Whose mark faces up', 'Face the office stamp up', 'Face the quay tally up'],
    ],
    seams: ['Sew a copy beside the pay window', 'Slip the quay tally into the hem'],
    replies: [
      'Sessa leaves an empty space in the pay book. This time an unpaid carrier can put a name there.',
      'Sessa’s aunt recognises the creak of the handle. She marks the pay that is still in dispute and returns the tally.',
    ],
    question: 'Which journey could vanish twice, once in the office and once in the archive?',
    areas: ['HIS', 'HUM', 'POL'],
    subjects: ['history', 'business'],
  },
  cold: {
    title: 'The degree in the mitten',
    opening:
      'Tovrie lets her brother take the morning watch. His mitten holds two glass thermometers. Both log the same reading three times. His initials tremble more each time he writes them. “Can mine be steady and still be off?”',
    to: 'yard',
    run: 'Lower the instruments into the bath',
    controls: [
      ['Who repeats the reading', 'Stay at the first bench', 'Take the sample to the other bench'],
      ['The reference in the mitten', 'Use the unmarked shop copy', 'Unfold the comparison chain'],
    ],
    seams: ['Let the next shift take a second reading', 'Send the reference cord to the toolmaker'],
    replies: [
      'Hesper fishes a thermometer out of her own pocket. It agrees with the second bench. She puts both values on the order.',
      'Hesper ties the last tag to the cord. She leaves a blank where the next comparison is due.',
    ],
    question:
      'How far back could the watchkeeper follow the reference before they needed to trust someone?',
    areas: ['NAT', 'MAT', 'TEC'],
    subjects: ['physics', 'chemistry'],
  },
  coast: {
    title: 'The fourth lamp',
    opening:
      'Orren’s daughter has stitched a fourth lamp onto a drawing of three. From his tower it looks like a mistake. From her beach it is the place where she waits for him. A wet pencil line on the cuff says HIGH WATER.',
    to: 'chart',
    run: 'Lay the tide traces on the sill',
    controls: [
      ['The watchers', 'Unroll the tower station', 'Add the three beach watchers'],
      ['The forecast', 'Follow the open-water model', 'Overlay the sheltered-bay model'],
    ],
    seams: ['Send a height for tying the boat', 'Send the spread for laying the path'],
    replies: [
      'Ostel ties the boat beside the mark and leaves the pencil line loose enough to move at the next tide.',
      'Ostel’s friend chalks a second path above the highest mark. It takes longer. Her shoes stay dry.',
    ],
    question: 'What did the beach watchers add, and which part of their disagreement survived both models?',
    areas: ['NAT', 'MAT', 'TEC'],
    subjects: ['geography', 'physics'],
  },
  fern: {
    title: 'The ground that kept the small feet',
    opening:
      'Vellune finds a print no bigger than her little fingernail in the coat pocket. Her grandmother remembered a clearing full of light-footed animals. The new lookout grew up seeing only two. Neither of them wants the other to be called a liar.',
    to: 'cold',
    run: 'Lift a cast from the track bed',
    controls: [
      ['The bed that held the prints', 'Lift the stone cast', 'Lift the fine silt cast'],
      [
        'The season in the notebook',
        'Take the lookout’s first year',
        'Turn back to grandmother’s first year',
      ],
    ],
    seams: ['Keep a space for missing prints', 'Hang both first years at the blind'],
    replies: [
      'Tovrie gives her brother a tray of fine sand to leave beside the hard yard. He draws a shoe outside each tray to remind himself who set it there.',
      'Tovrie copies the two dates onto different mittens. “Both first winters,” her brother says, and puts them on.',
    ],
    question:
      'How much of the difference starts in the ground and how much starts with the year you called normal?',
    areas: ['NAT', 'HIS', 'TEC'],
    subjects: ['biology', 'geography'],
  },
  yard: {
    title: 'A click under the thumb',
    opening:
      'Hesper’s apprentice refuses to throw out the old wheel. “Listen when my thumb comes round.” Hesper hears a room full of tools. He hears the click his teacher taught him to catch. His teacher has never seen the mark inside the wheel.',
    to: 'stage',
    run: 'Give the wheel one turn',
    controls: [
      ['The pickup', 'Keep the room pickup', 'Clip the pickup to the bearing'],
      ['The trace', 'Unroll the vibration marks', 'Give each height a pitch'],
    ],
    seams: ['Leave the pitch strip in the cuff', 'Send the vibration marks backstage'],
    replies: [
      'Brannic tries the strip in the dark. One of the curtain rollers sings the same high note each turn. She chalks its place before the doors open.',
      'The shifter lays the marks under his thumb. “That I can use with the orchestra playing.” He sends Hesper a clean bearing.',
    ],
    question:
      'Which part of the pattern survived changing from heights to pitches? What else could make the click?',
    areas: ['NAT', 'ART', 'TEC'],
    subjects: ['physics', 'music'],
  },
  press: {
    title: 'The line that made her stop',
    opening:
      'Bayette finds the mirror reader rubbing a pale groove between two lines of type. “Every time I stop here they think I’ve finished.” The words are hers. The spacing was someone else’s.',
    to: 'voices',
    run: 'Pull a proof for the reader',
    controls: [
      ['Breath at the hinge', 'Cast the line in one breath', 'Set a separate line for the second action'],
      ['Where the credit sits', 'Drop the credit into the sentence', 'Hang a keyed credit on the margin'],
    ],
    seams: ['Send the hand copy to the teller', 'Hang the reading proof beside the curtain'],
    replies: [
      'Wren lays the proof on her knee. A child can trace the pause and still find who supplied the words.',
      'Wren asks the stagehand to wait for the second line before he draws the curtain. The mirror reader stays to hear the last word.',
    ],
    question: 'When did the break help someone finish a thought? What did moving the credit cost?',
    areas: ['ART', 'HIS', 'LAN'],
    subjects: ['lang-langlit', 'theatre'],
  },
  chart: {
    title: 'Five boats and a long wait',
    opening:
      'Ostel has cut a neat row of bars for the five landing places. His friend sees a cliff made of wood. “My mother waits at that fifth one. Will they think all the boats wait as long as hers?” Ostel puts down the saw.',
    to: 'gate',
    run: 'Slide the five boats into their waits',
    controls: [
      ['Where the ruler starts', 'Set zero at the waterline', 'Slide eight minutes below the frame'],
      ['The time on the sign', 'Hang the mean', 'Hang the median'],
    ],
    seams: ['Mark the common crossing time', 'Leave the five waits on the sign'],
    replies: [
      'Maro asks who is still out after the sign comes down. She sends a runner to the fifth berth.',
      'Maro’s father reads along the five marks with a spoon. He can point to his landing without knowing the word for average.',
    ],
    question: 'Which detail would disappear if someone took home only the number on the sign?',
    areas: ['MAT', 'HUM', 'POL'],
    subjects: ['math-ai', 'geography'],
  },
  stage: {
    title: 'The rest that moves the curtain',
    opening:
      'Brannic’s glove catches on a crooked stitch. It has the rhythm of the old curtain call. “They laughed when I missed that beat.” Behind her, the shifter starts to whistle. He has been waiting for that gap for years.',
    to: 'archive',
    run: 'Cue the four-beat rehearsal',
    controls: [
      ['The old score', 'Keep the surviving rest', 'Give the rest a new answering note'],
      [
        'The second player',
        'Hold the shifter to the written entry',
        'Let the shifter answer the last sounded note',
      ],
    ],
    seams: ['Stitch in the score with its rest', 'Keep a loop for a second player'],
    replies: [
      'Ise taps the old rest against her key. For once the library opens on the silence between two knocks.',
      'Ise’s mother answers from the other side of the door. The reader at the desk learns that the second tap belongs to her.',
    ],
    question: 'Which parts of the performance could the score preserve on its own?',
    areas: ['ART', 'MAT', 'LAN'],
    subjects: ['music', 'theatre'],
  },
  market: {
    title: 'What the basket money bought',
    opening:
      'Sessa’s aunt keeps the wrapping from her first paid repair. It says WANT on one side and BOUGHT on the other. “Same person. Same basket. Go and see who was still mending handles when the ferry went.”',
    to: 'nile',
    run: 'Walk the basket orders to the ferry',
    controls: [
      ['The evidence on each order', 'Turn the wish side up', 'Turn the purchase side up'],
      ['The last ferry', 'Ring at the usual hour', 'Give the repair stall one more hour'],
    ],
    seams: ['Send the orders to the buyer', 'Leave a repair hour on the rota'],
    replies: [
      'Imani reads all four wishes to the buyer before she opens the purse. Two people stay to ask about the repair stall.',
      'Imani keeps the repairer on the rota past the bell. The cheaper basket still has customers. Her aunt had never claimed otherwise.',
    ],
    question:
      'What made a purchase tell a different story from a wish? Which explanation did the extra hour leave open?',
    areas: ['HUM', 'MAT', 'POL'],
    subjects: ['economics', 'business'],
  },
  gate: {
    title: 'A little dry button',
    opening:
      'Maro has promised her father a dry stair. He pins a blue button beside each crossing when his shoes get wet. “You could halve the trouble,” he says, “and I’d still like to know how many socks to bring.”',
    to: 'dispatch',
    run: 'Count the crossings on the two stairs',
    controls: [
      ['The measure on the button', 'Press the relative change', 'Press the difference per hundred'],
      ['The people who came back', 'Read the returned cards', 'Unroll the missing cards too'],
    ],
    seams: ['Sew the change on the trial pouch', 'Leave the missing-card tally on the flap'],
    replies: [
      'Ro can plan a small trial for the next watch. She leaves room on the card for the number of crossings.',
      'Ro sends a runner to the houses that never returned a card. A blank is a reason to call, she says.',
    ],
    question: 'What would you tell a household about its own risk when some cards have not come home?',
    areas: ['MAT', 'HUM', 'TEC'],
    subjects: ['math-ai', 'psychology'],
  },
  dispatch: {
    title: 'The drawer that never made a sound',
    opening:
      'Ro has sewn a bell to the successful route slips. The drawer sings beautifully. The runner who tested the other routes puts down a fistful of silent paper. “Did I need a bell to have done a day’s work?”',
    to: 'council',
    run: 'Lay out the paired route trials',
    controls: [
      ['Which slips reach the rail', 'Hang the trials with a saving', 'Hang all four trials'],
      [
        'When the group gets its name',
        'Use the route written before the trials',
        'Draw a ring around the best result afterwards',
      ],
    ],
    seams: ['Give the next crew the full drawer', 'Send the best route for a fresh trial'],
    replies: [
      'Hale reads out the zero beside the third trial. For the first time its runner is paid for the shift.',
      'Hale hands the circled slip to a crew that did not choose it. They pin a blank tally beside it before they set out.',
    ],
    question: 'What changes when the crew that selects a promising route also supplies its only test?',
    areas: ['HUM', 'MAT', 'POL'],
    subjects: ['psychology', 'math-ai'],
  },
  voices: {
    title: 'The blue everyone remembered',
    opening:
      'Wren sets out two folded boats. The girl is quite sure about the sound of the splash. She is less sure the boat was blue. “If I keep telling it for you, will it end up blue anyway?” Wren puts her own account down first, face to the table.',
    to: 'fern',
    run: 'Play the two accounts back',
    controls: [
      [
        'The interviewer’s opening',
        'Invite the teller to start with the sound',
        'Ask when the blue boat struck',
      ],
      [
        'When the second teller listens',
        'Seal both accounts separately',
        'Play the first account to the second teller',
      ],
    ],
    seams: ['Return the separately dated folds', 'Let both tellers hear the differences'],
    replies: [
      'Vellune writes “heard” on one fold and “inferred later” on the other. She leaves the colour out of the nest book.',
      'Vellune lays down her own pencil first. Two lookouts can disagree at the blind without having to repeat one another’s words.',
    ],
    question:
      'Which detail was vivid before anyone asked about it? Could two matching accounts have come from one suggestion?',
    areas: ['HUM', 'HIS', 'LAN'],
    subjects: ['psychology', 'history'],
  },
  island: {
    title: 'A shortcut that hears its name',
    opening:
      'Joss has made a wooden lane for the house that rolls. It fits exactly on the plan. The child pushes a second house onto it and the model squeaks. “You told both of us this way was quicker.”',
    to: 'coast',
    run: 'Send the six households home',
    controls: [
      ['The crossing in the model', 'Use the lengths on the flat drawing', 'Fit the one-at-a-time hinge'],
      ['The sign at the fork', 'Leave the two routes unnamed', 'Announce that the short lane is fastest'],
    ],
    seams: ['Send the measured plan', 'Pass on the hinge and the route sign'],
    replies: [
      'Orren walks the lengths between his lamps. His daughter follows one turn behind and comes back with a different time.',
      'Orren puts the sign where he can see the queue it creates. His daughter turns it round before the next six boats arrive.',
    ],
    question: 'When did announcing a prediction change the journey it was supposed to describe?',
    areas: ['MAT', 'HUM', 'NAT', 'TEC'],
    subjects: ['design-tech', 'geography'],
  },
  council: {
    title: 'A chair that leaves a mark',
    opening:
      'Hale has been setting chairs in a half-circle for years. The minute book calls every meeting full. “Show me the line I’m in.” His chair has a crescent worn into its back. There is no crescent on the roll of people who spoke.',
    to: 'island',
    run: 'Roll the chair marks onto the minutes',
    controls: [
      ['What counts as a turn', 'Stamp each occupied chair', 'Stamp each person who spoke'],
      [
        'Who may call the pause',
        'Leave the bell with the first speaker',
        'Pass the bell to a waiting chair',
      ],
    ],
    seams: ['Keep both rolls in the public minutes', 'Give the next pause to the chair keeper'],
    replies: [
      'Joss sets the two rolls against her model hall. Six chairs belong on the plan. Two more doorways belong on it too.',
      'Joss puts the pause bell at chair height. The child who rolls the house stops the rehearsal before it rolls off the board.',
    ],
    question:
      'Whose work did the attendance measure hide, and how did giving up the bell change the next turn?',
    areas: ['HUM', 'HIS', 'POL'],
    subjects: ['global-politics', 'theatre'],
  },
};
