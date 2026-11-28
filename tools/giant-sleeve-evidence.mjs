// Each entry points to a physical action whose state is checked in the named test.
const source = 'tests/giant-sleeve.test.ts';
export const elbowProofs = [
  {
    objective:'elbow.fitting', map:'stage.giants-elbow', target:'elbow-patterns',source,
    anchor:'expect(summer.filter((p) => p.fits)).toHaveLength(patchCount(mask))',
    action:'Move at most two brass elbows between four parts. Lower the same pattern over the winter and summer troupes. Both total eighty centimetres, yet the people who can take hands differ. The signed pattern travels with the two hinge sheets.',
    reasoning:[{mode:'deductive',basis:'At most two joints can be borrowed. In the summer troupe every fixed reach differs by more than one centimetre, so at least two hands must miss.'}],
    comparison:{areas:[
      {id:'MAT',method:'Keep the same mean and change the individual reaches. Count the hands within tolerance.',limit:'The mean cannot locate the puppeteers who will need help.'},
      {id:'ART',method:'Fit individual parts and decide which performers can link hands in this staging.',limit:'A workable blocking decision can give visibly unequal roles to the four performers.'}],
      concepts:['values'],framework:['scope'],connection:'A fit that makes sense for a mean may leave particular performers without a partner. Moving a joint changes the ensemble even with its mean held fixed.'},
    dimensions:['micro:1116','subject:theatre','subject:math-ai','area:MAT','area:ART','concept:values','framework:scope'],elements:['game:195','story:25'],
  },
  {
    objective:'elbow.lottery',map:'market.square',target:'elbow-lottery',source,
    anchor:"expect(readings.at(-1)?.clears).toBe(sheet === 'chalk' ? 3 : 0)",
    action:'Peg a direction before either packet opens, swap treatment clips among six numeric strips and restore the observed assignment. Send the result after checking an extreme and an interior assignment in each packet. Both rare draws can give completely different catches.',
    reasoning:[{mode:'deductive',basis:'Under the sharp null and random assignment, there are twenty equally likely groups of three. One is as high as the observed draw and two are as far in either direction.'},{mode:'pragmatic',basis:'The puppet needs enough lift to reach its physical catch. Equal tail counts leave this question unanswered until someone compares millimetres with the clearance.'}],
    comparison:{areas:[
      {id:'MAT',method:'Enumerate all assignments under the sharp null and the selected tail rule.',limit:'The fraction of extreme assignments gives neither a size of effect nor the probability that the null is true.'},
      {id:'NAT',method:'Compare individual measured lifts with the two physical catch thresholds.',limit:'Success on three tested strips leaves performance on future hinges uncertain.'}],
      concepts:['evidence'],framework:['methods-and-tools'],connection:'The same two tail counts accompany a useful lift in one apparatus and a smaller lift below threshold in another.'},
    dimensions:['micro:1109','subject:physics','subject:math-ai','area:MAT','area:NAT','concept:evidence','framework:methods-and-tools'],elements:['game:69','story:119'],
  },
  {
    objective:'elbow.curtain',map:'stage.rehearsal',target:'elbow-curtain',source,
    anchor:"expect(flag(d.s, 'performedFace')).toBe('seam')",
    action:'Inspect printed instructions and three left-handed repairs. Turn one side of the sleeve toward the audience, fit the old or fine hinge, and give one of the sisters the first cue. The moon or moons, staged evidence, entrance and loft conversation change with these decisions.',
    reasoning:[{mode:'abductive',basis:'Three repairs on the inside fit Vee’s account of taking the weight. The printed entrance alone could lead a viewer to attribute the whole performance to Pip.'}],
    comparison:{areas:[
      {id:'HIS',method:'Read an earlier instruction alongside material repairs made during later use.',limit:'Neither the instruction nor the stitches can tell a spectator all the private reasons for the change.'},
      {id:'ART',method:'Determine which visible face and order of entrances frame the work for spectators.',limit:'A successful performance can conceal labour that the audience cannot see.'}],
      concepts:['interpretation'],framework:['perspectives'],connection:'The two faces support different histories of the same sleeve. Turning it toward the audience changes who can see each kind of evidence.'},
    dimensions:['micro:1118','subject:lit-perf','subject:theatre','area:HIS','area:ART','concept:interpretation','framework:perspectives'],elements:['game:194','story:112'],
  },
];
