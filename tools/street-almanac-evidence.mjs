const source='tests/street-almanac.test.ts';
export const almanacProofs=[
  {
    objective:'almanac.stone.evening',map:'copies.archive',target:'street-parade-window',source,
    anchor:"expect(cueFlag(d.s, r, 'playedFace')).toBe('second')",
    action:'On three leaves, compare the destruction of the slab, the later return of the fragment and what the missing face cannot tell. Hang a caption on a six-beat score, hear it from two positions and decide which listener starts the evening.',
    reasoning:[{mode:'deductive',basis:'A 1919 receipt for a returned fragment places the return in that year. It cannot by itself date the incision.'},{mode:'pragmatic',basis:'Some beats reach only the person hearing the street. Other beats reach only the watcher. The uses of the six places depend on who should lead.'}],
    comparison:{areas:[
      {id:'HIS',method:'Separate the documented destruction from the later movement of the fragment.',limit:'Neither custody date identifies the lost text or the date of carving.'},
      {id:'ART',method:'Place sounds, lights and rests so two different positions receive different parts of the piece.',limit:'A moving performance can make an unsupported identification feel convincing.'}],
      concepts:['interpretation'],framework:['perspectives'],connection:'The caption determines which event the parade commemorates. The order of entrances determines who can give that commemoration its first public reading.'},
    dimensions:['micro:1008','subject:history','subject:music','area:HIS','area:ART','theme:LAN','concept:interpretation','framework:perspectives'],elements:['game:234','story:95']
  },
  {
    objective:'almanac.shell.proof',map:'copies.archive',target:'almanac-gill',source,
    anchor:"expect(d.e.node(options[0].option.next!).text).toBe(person.callbacks[side])",
    action:'Prepare the unknown-maker line or two named transfer slips with the collector. Change the composing block after dispatch. The person at the other end opens the paper that actually travelled and must place its names on a small envelope.',
    reasoning:[{mode:'deductive',basis:'A donor name and a collector name both identify acts of transfer. Neither identifies who made the object.'}],
    dimensions:['micro:1036','subject:anthropology','subject:history','area:HUM','area:HIS','theme:IND','concept:responsibility','framework:ethics'],elements:['game:21','story:114']
  }
];
