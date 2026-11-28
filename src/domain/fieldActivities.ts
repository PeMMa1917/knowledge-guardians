// Local models of the forty field games. Counters and movements belong to the practice equipment.
export interface FieldResult { progress:number; done:boolean; text:string }
export interface FieldTool { chart?:{cell:number;post?:number}; title:string; prompt:string; controls:string[]; help:string; move:(input:number)=>FieldResult }
type Setup = (seed:number, position:number)=>FieldTool;
const advance=(progress:number,text:string,done=false):FieldResult=>({progress,text,done});
const tool=(title:string,prompt:string,controls:string[],help:string,move:FieldTool['move']):FieldTool=>({title,prompt,controls,help,move});
const countBits=(mask:number)=>mask.toString(2).split('1').length-1;
const tones=['low','middle','high'];

// Players can return to a viewpoint. Only visits that add a viewpoint fill the sheet.
function collect(title:string,prompt:string,controls:string[],findings:string[],needed:number,mask:number):FieldTool {
  return tool(title,prompt+' Recorded '+countBits(mask)+' of '+needed+'.',controls,'Try a position whose trace you have yet to keep.',i=>{
    const next=mask|1<<i;
    return advance(next,findings[i]+(mask===next?' The same trace is already on your sheet.':''),countBits(next)>=needed);
  });
}
function relay(title:string,prompt:string,controls:string[],sequence:number[],position:number,finish:string):FieldTool {
  const index=position%sequence.length;
  return tool(title,prompt+' Signal '+(index+1)+' of '+sequence.length+'.',controls,'Follow the marks in order. A missed call repeats this signal.',
    i=>i===sequence[index]?advance(index+1,index+1===sequence.length?finish:'The far signal answers. Continue with the next mark.',index+1===sequence.length):advance(index,'The lantern stays down. The caller repeats the current mark.'));
}
function twoDecisions(title:string,first:string,offers:string[],replies:string[],second:string[],finals:string[][],position:number):FieldTool{
  if(position===0)return tool(title,first,offers,'Choose who or what will carry the first part of the work.',i=>advance(i+1,replies[i]));
  const route=position-1;
  return tool(title,replies[route],second,'The first choice changes what your next action can preserve.',i=>advance(position,finals[route][i],true));
}
function ferry(seed:number,position:number):FieldTool {
  const rock=[1,3,4,5,7][seed%5],cell=position%9,turned=position>=9;
  const coord=(n:number)=>String.fromCharCode(65+n%3)+(1+Math.floor(n/3));
  const chart=turned?'The obstruction is at '+coord(rock)+'.':'The first view marks the landing at C3.';
  const view=tool('Run the two-chart crossing','At '+coord(cell)+'. '+chart+' Columns run west to east. Rows run north to south.',
    ['North','East','South','West','Unroll the shoal chart'],'Use the other view to see the obstruction. Reach C3 carrying both observations.',i=>{
      if(i===4)return advance(cell+9,'The second view singles out '+coord(rock)+'. You can keep it visible as you move.',cell===8);
      const n=cell+[-3,1,3,-1][i];
      if(n<0||n>8||i===1&&cell%3===2||i===3&&cell%3===0||n===rock)return advance(position,'The way is blocked. You keep your footing at '+coord(cell)+'.');
      return advance(n+(turned?9:0),'You reach '+coord(n)+'.'+(n===8&&!turned?' Check the second view before sending this route home.':''),n===8&&turned);
    });
  view.chart={cell,...(turned?{post:rock}:{})};
  return view;
}
const games:Setup[]=[
  (seed)=>{
    const mark=2+seed%5;
    return tool('Trim the carrier','The load pulls '+mark+' divisions towards the quay. Put a counterweight on the opposite arm.',Array.from({length:7},(_,i)=>(i+1)+' divisions'),'Match the pull on the two arms.',
      i=>advance(i+1,i+1===mark?'The pointer holds at the centre. The porter can lift the latch.':(i+1<mark?'The load':'The counterweight')+' still pulls the arm down by '+Math.abs(mark-i-1)+'.',i+1===mark));
  },
  (s,p)=>{const seq=[s%3,(s+1)%3,(s+2)%3];return relay('Ring the bell stair','Three landings call '+seq.map(i=>tones[i]).join(' · ')+'. Ring back from this end.',tones.map(t=>'Ring '+t),seq,p,'Boots sound on all three landings. The carrier has a clear way up.');},
  (_,p)=>collect('Conduct the pauses','Perform one line three ways. Listen for where the waiting actor moves.', ['Rest before the first word','Rest before the name','Rest after the name'],
    ['A hand rises before anyone has been named.','The back row turns to the person being named.','The named actor has time to answer.'],3,p),
  (_,p)=>twoDecisions('Play the evidence cards','The witness saw the crate arrive. The book records when it was paid for. Play one card on the public claim.', ['Play the arrival','Play the payment'],
    ['The arrival card supports a place and a time. Its maker’s name is blank.','The payment proves a buyer signed. The goods could have arrived later.'],
    ['Limit the claim to the card','Invite the other witness'],[['The card dates the arrival. The buyer has to wait.','The clerk adds a purchase entry alongside the sighting.'],['The card dates the purchase. The empty arrival space stays visible.','The witness can date the crate without guessing who paid.']],p),
  (s,p)=>{
    const roll=(n:number)=>{let x=Math.imul(s+1,1103515245)^Math.imul(n+1,1597334677);x=Math.imul(x^(x>>>16),2246822507);return 1+((x^(x>>>13))>>>0)%6;};
    return tool('Cast the pattern dice','The caller bets that a six always follows a pair. '+p+' casts have reached the tray.',['Roll one die','Roll a handful of six','Pin the series to the board'],
      'Roll at least six times. Keep every value, including the draws that break a run.',i=>{if(i===2)return advance(p,p>=6?'The whole series is pinned up. A streak can happen in the tray by chance.':'The pin will hold after six casts. Keep rolling.',p>=6);
        const n=i===0?1:6,first=p%180;return advance(p+n,'The dice show '+Array.from({length:n},(_,j)=>roll(first+j)).join(', ')+'.');});
  },
  (s,p)=>{const seq=[s%3,(s+2)%3,(s+1)%3],edges=['reed','shell','star'];return relay('Lay a path through the marsh','The marker posts carry '+seq.map(i=>edges[i]).join(', ')+'. Match each tile to the post so the water can drain.',edges.map(x=>'Lay the '+x+' tile'),seq,p,'Water slips between the joints. The walker can take the whole path.');},
  (s,p)=>{const alphabet=['sun','reed','fish'],seq=[s%3,(s+2)%3];return relay('Turn the custom cipher','Here the sign after a mark is spoken. The strip shows '+seq.map(i=>alphabet[(i+2)%3]).join(' then ')+'. The local ring reads sun, reed, fish, then sun.',alphabet,seq,p,'The keeper opens the cabinet. In the other port this same strip would sound different.');},
  (s)=>{const k=1+s%4;return tool('Set the agreement lock','The gate slip allows marks '+k+' to '+(k+2)+'. The return slip allows '+(k+2)+' to '+(k+4)+'.',Array.from({length:8},(_,i)=>'Set mark '+(i+1)),'Find the mark inside both intervals.',i=>advance(i+1,i+1===k+2?'Both pins drop. The two witnesses can share this mark.':'One pin remains raised. Try a mark both slips allow.',i+1===k+2));},
  (s,p)=>tool('Run the controlled trial',(p?'The first run is pinned above the second tray.':'Start from two untested trays.')+' Both have one tile under the same lamp.',
    ['Run the untouched pair','Tilt one tray','Move both lamp and tilt'],'Record the baseline and then change one condition.',
    i=> i===0?advance(1,'Both shadows reach division '+(s%5+2)+'.'):i===1&&p===1?advance(2,'Only the tilt changed. The second shadow moves two marks.',true):advance(p,i===2?'The shadows differ. Two changes could account for it.':'There is no baseline pinned up yet.')),
  (_,p)=>{
    const seen=p>>2,first=p&3;
    return tool('Cook both orders','Keep the same two ingredients. '+(first?'One ingredient is in the practice pan.':'Start a fresh pan.')+' Recorded pans '+countBits(seen)+'/2.',
      ['Add syrup','Add crumbs'],'Try the other ingredient second. Then reverse the order in a fresh pan.',i=>{
        if(first===0)return advance((seen<<2)+i+1,i?'Crumbs cover the base.':'Syrup coats the base.');
        if(first===i+1)return advance(p,'That ingredient is already in this pan.');
        const next=seen|1<<(first-1);return advance(next<<2,first===1?'The crumbs bind into a sheet.':'Dry pockets remain under the syrup.',next===3);
      });
  },
  (s,p)=>{
    const target=1+s%3, pigment=p%4,lamplit=p>=4;
    return tool('Mix under two lamps','The daylight swatch takes '+target+' blue drops. Your vat has '+pigment+'. '+(lamplit?'The amber lamp is lit.':'You are working in daylight.'),
      ['Add one blue drop','Dip out one drop','Switch to the amber lamp','Lift a test strip'],'Match daylight first, then see what the same mixture looks like under amber.',
      i=>{if(i<2)return advance((lamplit?4:0)+Math.max(0,Math.min(3,pigment+(i===0?1:-1))),'The dye spreads across the test strip.');
        if(i===2)return advance(4+pigment,'The lamp changes. The dye in the vat stays still.');
        return advance(p,pigment===target&&lamplit?'The daylight match turns greenish under amber. Both swatches go on the tray.':'The keeper asks for the daylight mixture under the amber lamp.',pigment===target&&lamplit);});
  },
  (s,p)=>ferry(s,p),
  (s,p)=>{
    const day=Math.floor(p/10),cash=p%10,demand=1+(s+day*2)%3;
    return tool('Keep the three-day stall','Market day '+(day+1)+'. '+demand+' visitors have put down a token. You have '+cash+' spare receipts.',
      ['Make one copy','Make two copies','Make three copies'],'Stock once each day. Unsold copies use paper. A waiting visitor can return tomorrow.',i=>{
        const sold=Math.min(demand,i+1),balance=Math.max(0,Math.min(9,cash+sold-Math.abs(demand-i-1)));
        return advance((day+1)*10+balance,sold+' served. '+Math.max(0,demand-i-1)+' still waiting. '+Math.max(0,i+1-demand)+' sheets carry over to the binder.',day===2);
      });
  },
  (s,p)=>tool('Plant paired rows','The lower row gets '+(s%3+1)+' cups and an open screen. '+(p?'The comparison row is planted.':'The comparison row is empty.'),
    ['Plant the same seed in both','Shade the comparison row','Replace its seed and shade it'],'Use the same seed first. Change the shade in just one row.',
    i=>i===0?advance(1,'Both rows have the same seed.'):p===1&&i===1?advance(2,'The shaded row comes up later. The keeper marks the single changed condition.',true):advance(p,'Seed and light both need a record before anyone can compare growth.')),
  (_,p)=>twoDecisions('Carry a copy through the press','One line will fit the first strip. What travels to the second press?', ['Copy the finding','Copy its condition'],
    ['The second press has the finding. The words “from this seat” are missing.','The second press knows where the keeper stood. It still needs the finding.'],['Print the strip as received','Send back for its partner'],
    [['A short confident line reaches the quay. The witness can object when it comes back.','The condition travels on a second strip. The early run waits.'],['Readers get a location with no conclusion attached.','The two strips are tied through the same hole. Both travel late.']],p),
  (_,p)=>collect('Frame the scene three ways','Take one view from each side of the rehearsal.', ['Frame the hand','Frame the audience','Frame the lamp'],
    ['The hand is clear. The crowd falls outside the frame.','You can see the reaction. The gesture is hidden by a shoulder.','The lamp explains the long shadow. The actor’s mouth is beyond the edge.'],3,p),
  (s,p)=>collect('Take the quiet watch','Choose two stations. Record a place even when the signal stays quiet.', ['Watch the sill','Wait behind the reed screen','Listen from the landing'],
    ['The sill carries '+(1+s%4)+' scratches.','A wing brushes the screen twice. The bird stays out of sight.','A long silence ends in one returning call.'],2,p),
  (_,p)=>tool('Read the room','The usher has a hand on the rail. '+['The doorway is still noisy.','The front row has settled. The rear is still turning.','The far usher lowers a hand.'][p],
    ['Wait for the next cue','Speak to the room','Pass a note to the far usher'],'An early call reaches a different audience. A quiet note can be carried without waiting.',
    i=>i===0?advance(Math.min(2,p+1),p===0?'A chair settles in front.':'The far usher catches your eye.'):advance(p,i===2?'The usher passes the note down the back row. The front waits for a reply.':p===2?'Both ends catch the call. The first boat has already left.':'The near seats catch the call. The usher writes it down for the people still arriving.',true)),
  (_,p)=>tool('Lift the layers','The practice trench has '+(2-Math.floor(p/3))+' layers of paper soil. Record each layer before lifting the next.',
    ['Brush the current surface','Draw its outline','Lift the recorded layer'],'Brush, sketch and lift from the top down. Each torn edge helps the next person place the lower layer.',
    i=>{const phase=p%3;if(i!==phase)return advance(p,'The layer stays in the tray until its surface and edge have a record.');
      return advance(p+1,['A line appears under the soft brush.','The outline carries the height of the find.','The layer lifts away with a dated sketch.'][phase],p===5);}),
  (_,p)=>twoDecisions('Mend the split stand','The stand carries a worn finger groove. The hinge is also loose. Choose where to begin.',
    ['Pin the hinge','Trace the finger groove'],['The stand bears weight. The groove is still wearing away.','The old grip has a record. The stand still sags.'],['Add a visible brace','Make a removable support'],
    [['The hinge and brace can take the whole load. The change can be seen across the room.','A visitor can remove the support to see the earlier shape.'],['The traced grip survives beside the brace that covers it.','The support lifts out to reveal the grip. A keeper has to attend each demonstration.']],p),
  (_,p)=>collect('Thread the star frames','Look through the same four pinholes with two pilots’ thread patterns.', ['Stretch the outward pilot’s thread','Stretch the return pilot’s thread'],
    ['The thread draws a hook between the four lights. The outward pilot uses its tip.','The lights stay put. The second thread makes a sail whose hem points home.'],2,p),
  (_,p)=>collect('Unwrap the map','Lift the same paper globe in two pieces. Watch what happens to the grid.',
    ['Peel strips from pole to pole','Open the sheet along the equator'],['The gaps widen between the ends of the strips.','The equatorial band stays broad. The polar marks stretch at the edge.'],2,p),
  (_,p)=>tool('Earn the small creature’s company','A paper-winged creature watches the case. '+['It keeps both feet behind the sill.','One foot is on the sill.','It has folded its wings.'][p],
    ['Sit a pace back','Hold out an open sleeve','Tap the glass'],'Give it room first. Once it folds its wings it can choose to perch.',
    i=>i===2?advance(0,'It slips behind the sill. The keeper leaves the seat for another try.'):i===0?advance(Math.min(2,p+1),p?'Its wings settle.':'It puts one foot in the light.'):advance(p,p===2?'It takes the sleeve, then flies home by the low gap you can now show the keeper.':'It watches the sleeve from a distance.',p===2)),
  (s,p)=>{const target=5+s%9;return tool('Cut the delivery tally',target+' bundles reach the gate. Your practice stick shows '+p+'.',
    ['Cut one notch','Cut a group of five','Use a fresh stick','Split the tally'],'Count in ones and fives. Split the stick when both copies can carry the whole delivery.',
    i=>i===2?advance(0,'You set the practice stick aside.'):i===3?advance(p,p===target?'The split sticks carry matching counts to buyer and seller.':'The porter counts a different number of bundles.',p===target):advance(Math.min(20,p+(i===0?1:5)),'The cut shows on both halves.'));},
  (s,p)=>{const start=1+(s%6),mask=start^p;return tool('Connect the reading lamps','Three seats have lamps. From the door they are '+[1,2,4].map(b=>mask&b?'lit':'dark').join(', ')+'.',
    ['Turn the left pair','Turn the centre lamp','Turn the right pair'],'Each key switches every lamp on its wire. Bring light to all three seats.',
    i=>{const turn=p^[3,2,6][i],lit=start^turn;return advance(turn,lit===7?'Every seat can see the label.':countBits(lit)+' seats have light.',lit===7);});},
  (_,p)=>tool('Pack the travelling crate','The object, source slip and lifting sling have separate sockets. '+countBits(p)+' fitted.',
    ['Seat the padded object','Clip its source slip','Loop the sling','Lift the crate'],'Fit all three before the porter lifts. The slip travels with the object.',
    i=>i===3?advance(p,p===7?'The sling bears the weight and the source slip stays in view.':'The porter sets it down. A socket is still empty.',p===7):advance(p|1<<i,'The fitting holds in its own socket.')),
  (s,p)=>{const flags=['square','fork','pennant'],seq=[s%3,(s+2)%3,(s+2)%3];return relay('Send the harbour flags','The pilot asks for '+seq.map(i=>flags[i]).join(', ')+'. The far bank repeats one hoist at a time.',flags.map(f=>'Hoist '+f),seq,p,'The far bank reproduces the whole message and the pilot can check it.');},
  (_,p)=>twoDecisions('Stage the shadow','Choose who directs the paper figure.', ['Stand with the lamp keeper','Stand with the audience'],
    ['You see the string catch. The audience sees a bow.','You see a bow. From here the string is hidden.'],['Turn the screen halfway','Exchange places with the other witness'],
    [['The hinge is visible beside the silhouette. The show can carry on.','The keeper watches a convincing bow from your seat.'],['The audience glimpses a working hand while the bow continues.','You feel the caught string and can tell the actor when it happened.']],p),
  (s,p)=>collect('Find the first echo','Compare the call against a movable felt curtain.', ['Call with the wall bare','Hang felt on the near wall','Hang felt on the far wall'],
    ['Two taps return after '+(s%3+1)+' and '+(s%3+4)+' beats.','The early tap is muffled.','The later tap fades. The first is still clear.'],2,p),
  (_,p)=>tool('Weave the source band','Threads on the shuttle: '+countBits(p)+'. The blue and striped slips descend from the same ledger.',
    ['Weave the blue ledger','Weave the striped copy','Weave the porter’s separate account','Lift the band'],'Choose traces from independent origins so that the band carries more than one account.',
    i=>i===3?advance(p,(p&3)&&(p&4)?'The ledger and the porter each hold the band.':'Most of the pull still rests on a single witness.',!!((p&3)&&(p&4))):advance(p|1<<i,'A thread remains tied to its original slip.')),
  (s,p)=>{const low=1+s%3, high=low+2,values=[low-1,low,low+1,high,high+1];return tool('Pin the forecast range','The trial counts were '+low+', '+(low+1)+' and '+high+'. '+(p?'The lower pin sits at '+values[p-1]+'. Place the upper pin.':'Place the lower pin.'),
    values.map(n=>'Pin '+n),'A range can leave extra room at either end. Include the trial counts and let the next crew see the width.',
    i=>!p?advance(i+1,'The lower pin catches the cord.'):values[p-1]<=low&&values[i]>=high?advance(p,'The cord spans all three runs. A future run can still fall outside it.',true):advance(0,'A recorded run falls outside the cord. The keeper hands both pins back.'));},
  (s,p)=>collect('Roll the measuring wheel','Measure the quay from more than one starting seam.', ['Roll from the chalk line','Start half a turn ahead','Roll back from the far peg'],
    [s%4+7+' turns from the chalk.',s%4+8+' turns at the offset seam.',s%4+7+' turns on the return.'],3,p),
  (_,p)=>collect('Turn the prism','Put each light source through the same practice prism.', ['Open the white shutter','Open the red shutter','Return the white shutter through the filter'],
    ['Several bands spread across the blank card.','A narrow red band reaches the card.','The filter removes some bands even though the shutter began white.'],3,p),
  (s,p)=>{
    const chamber=Math.floor(p/2),blue=p%2===1;
    const doors=['left','right','middle'],gate=(s+chamber)%3;
    const marked=(chamber%2===0)===blue;
    return tool('Walk the lens maze','Room '+(chamber+1)+'. Through the '+(blue?'blue':'amber')+' lens '+(marked?'a footprint points to the '+doors[gate]+' door.':'all three doorways look alike.'),
      ['Turn the lens','Take the left door','Take the right door','Take the middle door'],'Change the lens to reveal a footprint. At the next chamber another colour may show the way.',
      i=>{if(i===0)return advance(chamber*2+(blue?0:1),'The red and blue shadows trade places.');
        if(i-1!==gate||!marked)return advance(p,'The painted doorway leads you back to this chamber.');
        return advance((chamber+1)*2+(blue?1:0),chamber===2?'Daylight. You can guide a second visitor through the maze.':'The door opens onto a chamber lit by different glass.',chamber===2);});
  },
  (s,p)=>{const mark=1+s%5;return tool('Line up the year mirror','Move the earlier outline to the hinge at mark '+mark+'. It is now at '+p+'.',
    ['Slide one mark left','Slide one mark right','Hold both outlines'],'Match the hinge. Then compare the edges that have moved over the years.',
    i=>i===2?advance(p,p===mark?'The hinge meets. The rooflines still part at the corner.':'The hinge points do not meet yet.',p===mark):advance(Math.max(0,Math.min(6,p+(i===0?-1:1))),'The earlier outline shifts one mark.'));},
  (_,p)=>tool('Mount a labelled collage','The visitor needs two different accounts and labels that still lift. '+countBits(p&7)+' accounts on the wall.',
    ['Mount the maker’s slip','Mount the borrower’s slip','Mount the repair slip','Hinge the credits beneath them'],'Mount two or three accounts. Leave their credits attached when the wall goes up.',
    i=>i===3?advance(p,countBits(p)>=2?'The visitors can lift each credit to see which voice they heard.':'There is room for a second account.',countBits(p)>=2):advance(p|1<<i,'That slip stays attached to its author’s mark.')),
  (s,p)=>{const load=2+s%3;return tool('Rest a claim on the beam','The claim draws '+load+' weights. You have added '+p+'.',
    ['Add one witnessed case','Add a repeated test (two weights)','Lift one weight','Try the support'],'Build support for this practice claim. A repeated test supplies two weights.',
    i=>i===3?advance(p,p>=load?'The trial claim rests on its support. The keeper marks where this support ends.':'The claim lifts the lighter evidence pan.',p>=load):advance(Math.max(0,Math.min(6,p+[1,2,-1][i])),'The balance shifts.'));},
  (s,p)=>{const change=s%3;return tool('Wind the music box','Score: low, high, low. '+(p?'As played: '+['low','high','low'].map((n,i)=>i===change?'middle':n).join(', ')+'.':'Wind once to hear or read the take.'),
    ['Wind and play','Lift pin one','Lift pin two','Lift pin three'],'Compare the three positions. Lift the pin whose played pitch changed.',
    i=>i===0?advance(1,'The three-note take is on the strip.'):advance(p,i===change+1&&p?'The bent pin comes free. The understudy can repeat the written pitch.':'Wind the box and check this bar against the score.',!!p&&i===change+1));},
  (s,p)=>{const target=2+s%4;return tool('Tie the keeper’s count','Tie '+target+' arrivals into the cord. The messenger can feel '+p+' knots.',
    ['Tie a knot','Undo the last knot','Pass the cord across the screen'],'Count the knots by touch or by the printed count. Ask the receiving keeper to read them back.',
    i=>i===2?advance(p,p===target?'The far hand returns the full count without needing to see the arrivals.':'The returned count differs from the arrivals.',p===target):advance(Math.max(0,Math.min(7,p+(i===0?1:-1))),'The cord holds '+Math.max(0,Math.min(7,p+(i===0?1:-1)))+' knots.'));},
  (s,p)=>{const start=s%2, strips=['quay','arch','orchard'];return tool('Fly the survey kite','The first strip runs from '+strips[start]+' to '+strips[start+1]+'. '+(p?'You have the first photograph. Choose the overlapping one.':'Lift the kite for a first photograph.'),
    ['Photograph the starting strip','Frame the quay and arch','Frame the arch and orchard'],'The next strip must have one landmark in common and add one new landmark.',
    i=>i===0?advance(1,'The print comes down on the string.'):advance(p,p&&i-1!==start?'The arch lines up on both prints. The outer landmarks extend the survey.':'That photograph cannot extend the first strip yet.',!!p&&i-1!==start));}
];
export function fieldActivity(form:number,seed:number,position:number):FieldTool {
  return games[form](seed,position);
}
