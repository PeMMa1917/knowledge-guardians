const source='tests/first-cup.test.ts';
export const cupProofs=[
  {
    objective:'cup.roll',map:'market.first-cup',target:'first-cup-jug',source,
    anchor:"expect(mixDegrees(pour)).toBe(18 + 9 * Array.from(pour).filter((c) => c === 'w').length)",
    action:'Use equal scoops from two carafes at measured temperatures. Open three groups of tickets for the same reference cocoa. When rain reaches the kitchen, pick a stop for the mobile cart.',
    reasoning:[{mode:'deductive',basis:'For the kitchen model four equal cool scoops stay at the cool temperature. Each replacement by a warm scoop adds one fourth of the difference.'},{mode:'causal',basis:'The ticket changes while the reference drink stays fixed. The separate travelling jug is the one whose composition can change.'}],
    comparison:{areas:[
      {id:'MAT',method:'Compute a weighted mean from the count of equal-mass scoops.',limit:'The mixing rule leaves heat loss to the room and the cup out of the calculation.'},
      {id:'HUM',method:'Compare the empty ticket and two initial numbers within the same volunteer crew.',limit:'Only three offers sit behind each ticket. A pattern in the crew cannot supply a particular person’s reason.'}
    ],concepts:['evidence'],framework:['methods-and-tools'],connection:'Set the temperature by pouring. Open all three groups of price tickets. The two averages use different evidence.'},
    dimensions:['micro:318','area:MAT','area:HUM','subject:psychology','subject:math-ai','concept:evidence','framework:methods-and-tools'],elements:['game:119','game:152','story:87']
  },
  ...[['steps','civic.steps'],['weir','water.gatehouse']].map(([stop,map])=>({
    objective:'cup.facing.'+stop,map,target:'first-cup-cart-'+stop,source,
    anchor:"expect(d.done('cup.facing.' + stop)).toBe(true)",
    action:'At the chosen street, correct the travelling dial using the glass in the same shade. Unfold two individual reasons for prices that cut across the crew average. Choose which evidence the person outside the cart sees first.',
    reasoning:[{mode:'inductive',basis:'Three bids per numbered ticket give a group pattern and individual exceptions.'},{mode:'pragmatic',basis:'An outward display makes one result legible from the road. The other requires a closer look at the cart.'}],
    comparison:{areas:[
      {id:'NAT',method:'Put two thermometers in the same place and measure the two-degree offset before correcting the ring.',limit:'Correcting the ring cannot eliminate real heat loss between kitchen and street.'},
      {id:'HUM',method:'Compare three ticket groups, then examine two individuals’ own reasons for their offers.',limit:'Subtracting a constant from everyone’s offer cannot recover the motives of those individuals.'}
    ],concepts:['objectivity'],framework:['methods-and-tools'],connection:'Turn the corrected gauge or two individual offers toward a new audience. The other method stays on the back.'},
    dimensions:['micro:306','micro:1107','area:NAT','area:HUM','subject:physics','subject:psychology','concept:objectivity','framework:methods-and-tools'],elements:['game:170','game:119','story:114','story:119']
  })),
  ...['mill','steps'].map(bench=>({
    objective:'cup.passers.'+bench,map:'market.first-cup',target:'first-cup-jug',source,
    anchor:"expect(d.done('cup.passers.' + bench)).toBe(true)",
    action:'Turn the runner’s tray over. Trace nine actual offers, then count invitations including those that did not result in a bid. Show an absent response as an empty place.',
    reasoning:[{mode:'deductive',basis:'A person who never wrote a bid supplied no numerical value to the sum.'}],
    dimensions:['micro:311','area:HUM','subject:economics','concept:evidence','framework:scope'],elements:['game:119','story:83']
  }))
];
