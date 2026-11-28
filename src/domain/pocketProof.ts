export interface PocketProof {
  face: string;
  traces: string[];
  marks?: { name: string; value: number }[];
  origin?: number;
  unit?: string;
  pitches?: number[];
}
const mark = (name: string, value: number) => ({ name, value });

/** The two bits are physical settings. The handover stores them, so later editions can be reconstructed. */
export function pocketProof(site: string, setting: number): PocketProof {
  const a = (setting & 1) !== 0,
    b = (setting & 2) !== 0;
  switch (site) {
    case 'archive': {
      const preface = 'Let it be known to all who may have occasion to read this notice that';
      const line = a
        ? 'Ise left the key. Her mother opens the reading room at dusk.'
        : 'She left it there. She opens it at dusk.';
      const words = (b ? line : preface + ' ' + line).split(' ');
      return {
        face: words.slice(0, 18).join(' '),
        traces: [
          words.length + ' words set. The cuff holds 18.',
          words.length > 18
            ? 'Outside the printed edge: ' + words.slice(18).join(' ')
            : 'The last word fits on the cuff.',
          b ? 'In the offcut tray: ' + preface : 'The formal opening is still locked into the type.',
        ],
      };
    }
    case 'nile':
      return {
        face: a
          ? 'Five slips survive, including two unpaid crossings.'
          : 'Three slips survive. Every one names a payment.',
        traces: [
          'Pay drawer · reed hamper, two seals, wool bale.',
          a
            ? 'Quay drawer · empty box, wet blanket. Both carriers signed. Neither was paid that day.'
            : 'The catalogue kept only paid trips. The empty-box carrier has no entry here.',
          b
            ? 'Independent quay tally · five arrivals. The tally keeper saw people land. She could not see inside their bundles.'
            : 'Original office stamp · THREE CLEARED. The clerk was paid to check wages, and his stamp covers part of the empty-box line.',
        ],
        marks: [mark('Paid slips', 3), mark('Unpaid slips available', a ? 2 : 0)],
      };
    case 'cold':
      return {
        face: a
          ? 'Bench A reads 4°. Bench B reads 5° on the same bath.'
          : 'At bench A the dial returns to 4° on all three runs.',
        traces: [
          a
            ? 'Bench A: 4, 4, 4. Independent thermometer on bench B: 5, 5, 5. Repeating at each bench establishes its steadiness.'
            : 'The same dial, person and bath give 4, 4, 4. A different workshop has yet to try it.',
          b
            ? 'Shop copy → quay reference → dated ice-point check. The shop copy reads one degree high against the quay reference. The tag gives the last check, not a promise for next winter.'
            : 'Both sides of the shop tag point back to the shop copy. Its steady reading gives no independent check on its scale.',
        ],
        marks: [
          mark('First run', 4),
          mark('Second run', 4),
          mark(a ? 'Other bench' : 'Same bench again', a ? 5 : 4),
        ],
        unit: '°',
      };
    case 'coast':
      return {
        face: b
          ? 'Two forecasts for this tide: 49–55 cm above the brass pin.'
          : 'The open-water model puts this tide 55 cm above the brass pin.',
        traces: [
          a
            ? 'Tower: 50 cm. Beach watchers: 46, 53 and 58 cm, at three different coves. The pilot’s map calls the first cove West Cove. Orren’s daughter writes Kettle Step on it, for the stone where she waits with his supper. Their rulers and local swell differ.'
            : 'Tower station: 50 cm against a fixed pin at noon. One place, with the same ruler as yesterday. Across the water the pilot’s map says West Cove. A beach slip marked Kettle Step has no place on this sheet.',
          b
            ? 'The sheltered model gives 49 cm, the open-water model 55 cm. This spread compares assumptions. A cove can still fall outside it.'
            : 'The open-water calculation carries the offshore swell all the way to the sill.',
        ],
        marks: [
          ...(a ? [mark('West cove', 46), mark('Jetty', 53), mark('East cove', 58)] : [mark('Tower', 50)]),
          mark('Open water', 55),
          ...(b ? [mark('Sheltered', 49)] : []),
        ],
        unit: ' cm',
      };
    case 'fern': {
      const small = (b ? [2, 8] : [1, 2])[Number(a)],
        large = b ? 3 : 2;
      return {
        face: small + ' small tracks and ' + large + ' heavy tracks remained in this cast.',
        traces: [
          a
            ? 'Fine silt holds shallow toes and deep heel marks. Two prints can belong to one animal.'
            : 'The hard bed keeps deep heels. A missing shallow toe can mean that the ground never held it.',
          b
            ? 'Grandmother’s first spring · thirty winters before the new watch. Her sketch marks both beds beside the same blind.'
            : 'Lookout’s first spring · last year. His first count already follows decades of change.',
        ],
        marks: [mark('Small tracks', small), mark('Heavy tracks', large)],
      };
    }
    case 'yard': {
      const heights = a ? [1, 1, 4, 1, 1, 1, 4, 1] : [3, 2, 4, 3, 4, 2, 4, 3];
      return {
        face: b
          ? 'The trace has become eight notes. Their heights follow the same eight marks.'
          : 'Two turns of the wheel. Each turn leaves four vibration marks.',
        traces: [
          a
            ? 'The bearing clip catches a sharp peak at the third mark on both turns. Test a second bearing before naming the fault.'
            : 'The room pickup catches hammer blows along with the bearing. Extra high marks compete with the tick from the wheel.',
          'Trace, from the thumb mark: ' + heights.join(' · '),
        ],
        marks: heights.map((n, i) => mark('Tick ' + (i + 1), n)),
        pitches: b ? heights.map((n) => [0, 262, 330, 392, 523][n]) : undefined,
      };
    }
    case 'press': {
      const credit = '(from the mirror reader’s signed slip, retained by the workshop)';
      const first = 'Lift the blue sheet ' + (b ? '[1]' : credit);
      const second = 'hold the curtain until her hand drops.';
      return {
        face: a ? first + '.\n\nThen ' + second : first + ', slide it past the lamp and ' + second,
        traces: [
          b
            ? 'Margin [1] · the mirror reader’s signed slip, retained by the workshop.'
            : 'The credit takes up ten words inside the cue.',
          a
            ? 'The reader can take a breath at the line break. The shifter still needs the second instruction.'
            : 'The cue runs in one sentence. The two actions sit in the same breath.',
        ],
      };
    }
    case 'chart': {
      const waits = [9, 9, 10, 11, 21];
      const time = b ? waits[2] : waits.reduce((sum, n) => sum + n, 0) / waits.length;
      return {
        face: 'The sign gives ' + time + ' minutes (' + (b ? 'median' : 'mean') + ').',
        traces: [
          'Five consecutive waits, in minutes: ' + waits.join(', ') + '.',
          a
            ? 'The ruler starts at 8 minutes. The shortest bar now looks very small. All five boats waited just as long.'
            : 'The ruler starts at zero. Bar lengths show the whole wait.',
          b
            ? 'The third of five ordered waits is 10. The last berth still waited 21 minutes.'
            : '60 minutes divided between five boats gives 12. No boat in this tally waited exactly 12.',
        ],
        marks: waits.map((v, i) => mark('Boat ' + (i + 1), v)),
        origin: a ? 8 : 0,
        unit: ' min',
      };
    }
    case 'stage': {
      const lead = [330, 392, a ? 440 : 0, 330];
      const answer = b ? (a ? [0, 0, 0, 523] : [0, 0, 494, 0]) : [0, 0, 494, 0];
      return {
        face: a ? 'The third beat has an extra voice.' : 'The lead leaves the third beat open.',
        traces: [
          'The cupboard files both slips under REST. On the lead score it means silence. On the shifter’s slip it is the place where he works.',
          'Understudy: ' + (a ? 'E · G · A · E' : 'E · G · rest · E'),
          'Shifter: ' + (b && a ? 'rest · rest · rest · C' : 'rest · rest · B · rest'),
          b
            ? 'The shifter listens first. An A on beat three moves the answer to four. An empty third beat leaves room to answer there.'
            : 'The written answer starts on three. A second voice can now meet it or leave it alone.',
        ],
        pitches: lead.flatMap((n, i) => [n, answer[i]]),
      };
    }
    case 'market': {
      const purchases = b ? ['mend', 'new', 'mend', 'new'] : ['new', 'new', 'mend', 'new'];
      const wishes = ['mend', 'new', 'mend', 'mend'];
      const shown = a ? purchases : wishes;
      return {
        face:
          shown.filter((v) => v === 'mend').length +
          ' of four ' +
          (a ? 'bought' : 'asked for') +
          ' a repair.',
        traces: [
          'In stall order: ' + shown.join(' · ') + '.',
          'The stall till, in the same order: ' + purchases.join(' · ') + '.',
          b
            ? 'The repairer works an extra hour. One buyer can now collect a mend before the ferry. Another still cannot afford it.'
            : 'The early ferry leaves before one repair is ready. Another customer has money only for the cheaper new basket.',
          a
            ? 'The coin records what was bought under those limits.'
            : 'The wish side was filled in before anyone knew the ferry time or the price.',
        ],
        marks: [
          mark('Repair', shown.filter((v) => v === 'mend').length),
          mark('New basket', shown.filter((v) => v === 'new').length),
        ],
      };
    }
    case 'gate':
      return {
        face: a
          ? 'Among completed cards, 4 fewer wet crossings per 100.'
          : 'Among completed cards, wet crossings fell by half.',
        traces: [
          'Old stair: 8 wet among 100 completed cards. New stair: 4 wet among 100.',
          a ? '8% − 4% = 4 percentage points.' : '(8 − 4) ÷ 8 = 50% relative decrease.',
          b
            ? 'Twenty more new-stair cards went out and never returned. Between 4 and 24 of all 120 new crossings could have been wet. The missing cards could change the comparison.'
            : 'Only returned cards are on the rail. People who stayed wet might have been less likely to come back.',
        ],
        marks: [
          mark('Old wet, returned', 8),
          mark('New wet, returned', 4),
          ...(b ? [mark('New outcome unknown', 20)] : []),
        ],
      };
    case 'dispatch': {
      const trials = [5, 1, 0, -2];
      const shown = a ? trials : trials.filter((n) => n > 0);
      const total = shown.reduce((sum, n) => sum + n, 0);
      return {
        face: b
          ? 'West saves 5 minutes in the route picked after opening the slips.'
          : 'The planned east route saves 1 minute in its recorded trial.',
        traces: [
          'Full trial design: one shift on each of west, east, quay and hill.',
          'Visible savings in minutes: ' +
            shown.join(', ') +
            '. Visible average: ' +
            total / shown.length +
            (total === shown.length ? ' minute.' : ' minutes.'),
          b
            ? 'The circle follows the winning slip. This crew has already used the result to choose west. A fresh shift could test it.'
            : 'The east route was written on the envelope before the slips came in. Other paths still matter to the overall result.',
        ],
      };
    }
    case 'voices':
      return {
        face: b
          ? 'The second account was recorded after the first was heard.'
          : 'Two accounts were sealed before either teller heard the other.',
        traces: [
          a
            ? 'First teller, after “When did the blue boat strike?”: “Blue, I think. The splash was loud.”'
            : 'First teller, after “Start where you can still hear it”: “A splash near the step. I did not see its colour.”',
          b
            ? a
              ? 'Second teller: “Blue, like she said. I remember the sound.”'
              : 'Second teller: “Near the step, she said. I remember the sound.”'
            : 'Second teller: “There was a knock on wood. I remember being cold. I never saw the boat land.”',
          'Original slip, dated before the interview: “Splash. Cold hands.” No colour was recorded. These are two fictional tellers on this particular night.',
        ],
      };
    case 'island': {
      const shortCount = b ? 6 : 3,
        last = 3 + (a ? shortCount - 1 : 0);
      return {
        face: 'The last household on the short lane reaches its door at beat ' + last + '.',
        traces: [
          'Short lane length: 3 beats. Long lane length: 5 beats. ' +
            shortCount +
            ' of six households choose the short lane.',
          a
            ? 'The hinge passes one house per beat. Each extra household on the short lane adds one beat to its last arrival.'
            : 'On the drawing six houses can pass through the same point at once.',
          b
            ? 'The sign sends all six households to the short lane. Their response can undo the advantage on the sign.'
            : 'With both routes unnamed, three households choose each one.',
        ],
        marks: [
          mark('Last short-lane arrival', last),
          ...(shortCount < 6 ? [mark('Last long-lane arrival', 5)] : []),
        ],
        unit: ' beats',
      };
    }
    case 'council':
      return {
        face: a
          ? b
            ? 'Five different people spoke.'
            : 'Two different people spoke.'
          : 'Six chairs were occupied.',
        traces: [
          'Attendance roll: six occupied chairs, including the chair keeper.',
          b
            ? 'Speaking roll: clerk, chair keeper, runner, mender, pilot, clerk. Each waiting chair can ring the pause.'
            : 'Speaking roll: clerk, pilot, clerk, clerk, pilot, clerk. The first speaker keeps the pause bell.',
          a
            ? 'Stamping one mark per distinct speaker leaves out listening, arranging seats and taking the minutes.'
            : 'A mark for attendance cannot tell you who got a turn to speak.',
        ],
        marks: [mark('People counted', a ? (b ? 5 : 2) : 6), mark('Chairs present', 6)],
      };
    default:
      throw Error('This pocket has no working instrument.');
  }
}
