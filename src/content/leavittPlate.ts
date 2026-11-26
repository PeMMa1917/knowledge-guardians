import type { Condition, ContentPack } from '../domain/types';
import { specimenEquipped } from '../domain/specimenGear';

export const LEAVITT_KEY = 'harvard:a02969';
export const LEAVITT_CARD = 'card.leavitt.a02969';
export const LEAVITT_EXHIBIT = 'OBJ-HARVARD-A02969';
export const LEAVITT_OBJECTIVE = 'leavitt.plate.used';
export const LEAVITT_REVISIT = {
  map: 'nile.route', prop: 'leavitt-nile-registration',
  method: 'Align two corner marks before turning the older route drawing',
  hint: 'Return to the Nile Archive Map Room with the working plate equipped.',
};

const OWNER = 'coast-olwen-veer';
export const arrival: Condition = { objective: 'coast.arrival' };
export const mirror: Condition = { flag: 'leavitt.plate.mirror', eq: true };
export const calibrated: Condition = { flag: 'leavitt.plate.calibrated', eq: true };
export const LeavittReady: Condition = { all: [{ card: LEAVITT_CARD }, mirror, calibrated] };
export const leavittRoute = (route: 'chart' | 'watch'): Condition => ({ flag: 'leavitt.plate.route', eq: route });
export const leavittUsed = (route: 'chart' | 'watch'): Condition => ({ flag: LEAVITT_OBJECTIVE, eq: route });

const exhibition = 'HIS-LEAVITT-A02969';
const facsimile = 'HIS-LEAVITT-METHOD';

export const leavittPlateContent = {
  sources: [{
    id: exhibition, title: 'Harvard Plate Stacks, Starglass glass plate a02969',
    url: 'https://api.starglass.cfa.harvard.edu/public/plates/p/a02969',
    locator: 'Catalogue exposure, telescope, location and notebook mentions',
    supports: 'The exposure is recorded on 15 April 1898 UTC. The station was Arequipa, using the 24-inch Bruce Doublet.',
    accessed: '2026-11-26',
  }, {
    id: facsimile, title: 'Harvard Plate Stacks, Henrietta Swan Leavitt and variable stars',
    url: 'https://platestacks.cfa.harvard.edu/henrietta-swan-leavitt/variable-stars',
    locator: 'Figures 2 and 3 and the Comparing Plates section',
    supports: 'The exact plate is named a2969 in the article. The corresponding notebook page is dated 2 November 1906. The back-of-plate marks mirror the orientation of her chart.',
    accessed: '2026-11-26',
  }],
  exhibits: [{
    id: LEAVITT_EXHIBIT, name: 'Harvard glass plate a02969', art: 'reading-works.leavitt',
    historicalLabel: 'documented', dateText: '15 April 1898 (catalogue UTC). Analysed by 2 November 1906.',
    dateKind: '1898 dates the exposure at Arequipa. The 1906 date belongs to Henrietta Swan Leavitt’s notebook page referring to this plate.',
    summary: 'This exact Harvard photographic plate carries marks Henrietta Swan Leavitt used to identify measured stars. Harvard separates the exposure at Arequipa from her paper chart and its later notebook date.',
    sources: [exhibition, facsimile], grantsCard: LEAVITT_CARD,
    altText: 'Original schematic of a glass plate on a stand, with small star dots and two registration marks.',
    specimen: {
      key: LEAVITT_KEY, institution: 'Harvard Plate Stacks', accession: 'a02969 (a2969 in the exhibition article)',
      source: exhibition, objective: LEAVITT_OBJECTIVE, revisit: LEAVITT_REVISIT,
    },
  }],
  cards: [{
    id: LEAVITT_CARD, title: 'Two sides of plate a02969', historicalLabel: 'documented', claimKind: 'observation',
    text: 'In her 2 November 1906 notes, Leavitt drew the stars as viewed in the sky. Her marks on the back of this plate are mirrored from that view. Harvard records the exposure at Arequipa in 1898.',
    limits: 'This one exposure cannot establish a cycle of brightness. A notebook entry is evidence of analysis, and does not identify the person who exposed the plate.',
    sources: [exhibition, facsimile],
  }],
  characters: [{
    id: OWNER, name: 'Olwen Veer', role: 'Keeper of the headland practice plates', sprite: 'villager-2', mode: 'fictional',
    talk: [{ node: 'leavitt.plate.olwen' }],
  }],
  dialogue: [{
    id: 'leavitt.plate.olwen', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'I stood behind the glass to save the front. Then I sent a visitor to the other end of the pier. Both places were right where I left them. My marks were the part that had turned.',
  }, {
    id: 'leavitt.plate.turn', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'The archive says Leavitt marked the back of the glass to protect the surface on the front. Take this practice trace, hold its two corner stops and turn it to face the way the sky chart does.',
    options: [{
      text: 'Turn the trace to the marked face and match both corner stops.',
      if: { not: mirror }, effects: [{ setFlag: 'leavitt.plate.mirror', value: true }],
      next: 'leavitt.plate.mirror-reply',
    }, { text: 'Leave the trace on the table.' }],
  }, {
    id: 'leavitt.plate.mirror-reply', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'The left and right marks trade places, but both still register against their own corners. The glass has two faces. The notebook chart follows the sky face.',
  }, {
    id: 'leavitt.plate.compare', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'Two paper tests copy the same practice field. In the longer exposure model, the control dot grows from two rings to four. Our watched mark grows from three rings to six. Slide the guide against the control in each test.',
    options: [{
      text: 'Line up the control circle separately in each view.',
      if: { not: calibrated }, effects: [{ setFlag: 'leavitt.plate.calibrated', value: true }],
      next: 'leavitt.plate.calibrated-reply',
    }, { text: 'Leave both views for another check.' }],
  }, {
    id: 'leavitt.plate.calibrated-reply', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'In these paper models, both marks have doubled. The watched mark has the same size relative to the control in both. Different exposure conditions can change the dots. An actual brightness series needs a calibrated plate and other dates.',
  }, {
    id: 'leavitt.plate.dispatch', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'A visitor wants to find the same place in the chart. A watcher wants to know whether a mark changes with time. Which setup will you leave at the headland?',
    options: [{
      text: 'Leave a registered chart for someone to find the same two corners.',
      if: { all: [LeavittReady, { not: { flagSet: 'leavitt.plate.route' } }] },
      effects: [{ setFlag: 'leavitt.plate.route', value: 'chart' }], next: 'leavitt.plate.chart-sent',
    }, {
      text: 'Leave the control mark with a space for another dated watch.',
      if: { all: [LeavittReady, { not: { flagSet: 'leavitt.plate.route' } }] },
      effects: [{ setFlag: 'leavitt.plate.route', value: 'watch' }], next: 'leavitt.plate.watch-sent',
    }, { text: 'Leave the trials on the table.' }],
  }, {
    id: 'leavitt.plate.chart-sent', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'Bring the registered chart to the eastern headland stand. A visitor can use it on their own before the bell.',
  }, {
    id: 'leavitt.plate.watch-sent', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'Take the dated-watch strip to the western low board. The watch keeper can add another reading there.',
  }, {
    id: 'leavitt.plate.chart', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'The eastern stand shows a sky-facing chart and a separate mark for which face was copied. Both corner marks are visible.',
    options: [{
      text: 'Set the two corner pegs and show where the matching marks land.',
      if: { all: [leavittRoute('chart'), { not: { objective: LEAVITT_OBJECTIVE } }] },
      effects: [{ setFlag: LEAVITT_OBJECTIVE, value: 'chart' }, { journal: 'j.leavitt.chart' }],
      next: 'leavitt.plate.chart-reply',
    }, { text: 'Leave the stand for its next visitor.' }],
  }, {
    id: 'leavitt.plate.chart-reply', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'The visitor found both marks with the same chart instead of marking a second pair of stars. I’ll keep the date slots open for a watch that can test apparent change.',
  }, {
    id: 'leavitt.plate.watch', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'The western rail keeps the known control beside two dated slots. A third slot waits for a watch made with the control in view.',
    options: [{
      text: 'Clip the control to the open watch slot and leave its date space clear.',
      if: { all: [leavittRoute('watch'), { not: { objective: LEAVITT_OBJECTIVE } }] },
      effects: [{ setFlag: LEAVITT_OBJECTIVE, value: 'watch' }, { journal: 'j.leavitt.watch' }],
      next: 'leavitt.plate.watch-reply',
    }, { text: 'Leave the board for a keeper.' }],
  }, {
    id: 'leavitt.plate.watch-reply', speaker: OWNER, historicalLabel: 'fictional-world',
    text: 'The next watcher knows which dot stays with the control and where to record a later observation. The comparison stays open until those dates come in.',
  }, {
    id: 'leavitt.revisit.nile', speaker: 'nile-marek', historicalLabel: 'fictional-world',
    text: 'Two tracings of the store path face opposite ways. The glass pattern you brought has a fixed corner at each end. Can we set down those corners before we turn the route slip?',
    options: [{
      text: 'Set the two corner marks and turn the tracing in its frame.',
      if: { all: [specimenEquipped(LEAVITT_KEY), { not: { flagSet: 'leavitt.revisit.nile.used' } }] },
      effects: [{ setFlag: 'leavitt.revisit.nile.used', value: true }, { journal: 'j.leavitt.nile' }],
      next: 'leavitt.revisit.nile-reply',
    }, { text: 'Leave both tracings in place.' }],
  }, {
    id: 'leavitt.revisit.nile-reply', speaker: 'nile-marek', historicalLabel: 'fictional-world',
    text: 'The two store corners now match. The drawing from this side stays its own view. I’ll keep both frame edges beside the old route record so the next reader can turn it without moving the corners.',
  }],
  missions: [{
    id: 'KG-CH4-R77', world: 'WORLD-05', title: 'The Back of the Glass', available: arrival,
    knowledgeQuestion: 'Which marks stay the same when we change the way we observe them?',
    stake: 'A lookout can confuse a mirrored mark or a larger exposure with a change in the sky.',
    objectives: [{
      id: LEAVITT_OBJECTIVE, title: 'Use the matched chart or the dated-watch plan on the headland.',
      visible: { card: LEAVITT_CARD }, essential: false,
      done: { all: [LeavittReady, { flagSet: LEAVITT_OBJECTIVE }] },
      weave: {
        concepts: ['evidence', 'justification', 'certainty', 'interpretation', 'objectivity', 'responsibility'],
        framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
        thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' },
        atl: ['thinking', 'research', 'communication'], aoks: ['NAT', 'MAT', 'HIS'],
        subjects: ['physics', 'math-ai', 'history'], minutes: 5,
      },
    }],
  }],
  hints: [
    { id: 'h.leavitt.plate.1', objective: LEAVITT_OBJECTIVE, depth: 1, text: 'A change in the view can show up on the paper without the star itself changing.' },
    { id: 'h.leavitt.plate.2', objective: LEAVITT_OBJECTIVE, depth: 2, text: 'Inspect a02969 at the Bell Archive. Try the two corner stops and the control circle on the nearby stands.' },
    { id: 'h.leavitt.plate.3', objective: LEAVITT_OBJECTIVE, depth: 3, text: 'Send the chart to the headland’s east stand or the dated check to its west board.' },
    { id: 'h.leavitt.plate.4', objective: LEAVITT_OBJECTIVE, depth: 4, text: 'Try the chosen setup at the headland. Come back to the Bell Archive to see the reply. The working plate can help Marek turn a trace in the Nile Map Room.' },
  ],
  journal: [
    { id: 'j.leavitt.chart', claimKind: 'observation', text: 'I used a registered chart to let the visitor find a mark in both views. The plate and the notebook keep separate dates.' },
    { id: 'j.leavitt.watch', claimKind: 'observation', text: 'I left the separate control with a date slot for the next watcher. Our two test prints could not settle a change in the sky.' },
    { id: 'j.leavitt.nile', claimKind: 'observation', text: 'I brought the working plate’s corner marks to the Nile Map Room. They let Marek turn a tracing while keeping both source positions in view.' },
  ],
} satisfies Partial<ContentPack>;
