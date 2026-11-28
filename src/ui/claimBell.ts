import type { GameController } from '../app/controller';
import { callerNames, channels, channelNames, describeRule, hearCaller, homeReading, readRule, shifts, shiftNames, tested, visitors, workingRule, type BellCommand, type Site } from '../domain/claimBell';
import { h } from './dom';
import { artURL } from './illustrations';
import { ctx } from '../app/context';
import { playCueTrial } from '../app/cueTrialAudio';
import { localGuide } from './localGuide';
import './claimBell.css';

export function claimBellPanel(c: GameController, sound: (key: string) => void, site: Site) {
  const well = site === 'well';
  const shell = h('div', { class: 'claim-bell' });
  const desk = h('div', {});
  const feedback = h('p', { class: 'bell-feedback', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  function control(id: string, label: string, command: BellCommand, result: () => string, selected?: boolean) {
    return h('button', { type: 'button', 'data-bell': id, 'aria-pressed': selected === undefined ? undefined : String(selected), onclick: () => {
      const error = c.dispatch(command).find(e => e.kind === 'error');
      feedback.textContent = error?.kind === 'error' ? error.message : result();
      if (!error) {
        const knock = !well && command.act === 'try' && command.who === 'first' && hearCaller(site, 'first', workingRule(c.state, site)).entered;
        if (knock) playCueTrial(['work', 'rest', 'work', 'work'], ctx.settings.sfxVolume, () => shell.isConnected && ctx.settings.sfxVolume > 0);
        else sound(command.act === 'turn' || command.act === 'receive' ? 'sfx.page' : 'sfx.click');
      }
      draw();
      const focus = desk.querySelector<HTMLButtonElement>('[data-bell="' + id + '"]') ?? desk.querySelector<HTMLButtonElement>('button');
      focus?.focus({ preventScroll: true });
    } }, label);
  }
  const row = (...items: HTMLElement[]) => h('div', { class: 'bell-controls' }, ...items);
  function draw() {
    const state = c.state, rule = workingRule(state,site), flags = state.flags;
    const sent = readRule(flags['claimbell.issued']), signed = readRule(flags['claimbell.signed']);
    const turned = flags['claimbell.' + site + '.turned'] === true;
    const received = flags['claimbell.received'] === true;
    const word = well ? 'claim' : 'evidence';
    const term = c.pack.glossary.find(g => g.id === word);
    const parts: HTMLElement[] = [
      h('p', { class: 'bell-scene' }, h('img',{ src: artURL(well?'bell.spare':'bell.hatch'), alt:'' }), well
        ? (state.flags['well.jug'] === 'late' ? 'The porters’ covered jug is safe on its hook.' : state.flags['well.jug'] === 'dawn' ? 'The soup kitchen’s first jug is already set aside.' : 'Efua has set the covered jug aside.') + ' Behind it hangs a spare pot. Someone has scratched a cup on its side. “I heard no one ask for it,” Efua says. From the ridge comes the empty rattle of a cart.'
        : 'Nobody can find the crack in the wheel. Below the sill, someone taps the desk three times with wet fingers. The clerk has already written “no witnesses”.'),
      row(control('turn', turned ? 'Turn the word plate again' : 'Turn the brass word plate', { type:'WorkClaimBell', act:'turn' }, () => well
        ? 'CLAIM. The older word could mean calling out or demanding something as a right. Efua puts her thumb over the word “aloud”. “Did I add that bit myself?”'
        : 'EVIDENCE. The root points to seeing. The listener taps again. The clerk leaves room for what a neighbour could hear.')),
    ];
    if (turned && term?.history) {
      parts.push(h('p', { class:'bell-plate' }, h('strong',{},term.term), ' · ',term.history.note,' ',h('a',{ href:term.history.url,target:'_blank',rel:'noopener noreferrer' },'Word history')));
    }
    if (!well && sent) parts.push(row(control('receive',received ? 'Read Efua’s sealed rule' : 'Break Efua’s paper seal', {type:'WorkClaimBell',act:'receive'},()=>'Efua sent “'+describeRule(sent)+'”. At home a claim was a request for a turn. Here someone claims the wheel is cracked. Getting that account into the book leaves the crack to be checked.')));
    if (turned && (well || received)) {
      parts.push(h('fieldset',{},h('legend',{},'Fit one entrance to the hatch'),row(...channels.map(channel =>
        control(channel,channelNames[channel],{type:'WorkClaimBell',act:'set',channel,shift:rule.shift},()=>'The hatch takes this kind of request. '+channelNames[channel]+'.',channel === rule.channel)))),
        h('fieldset',{},h('legend',{},'Hang the brass bell'),row(...shifts.map(shift=>
          control(shift,shiftNames[shift],{type:'WorkClaimBell',act:'set',channel:rule.channel,shift},()=>'The clerk will enter requests at the '+(shift==='dawn'?'first':'closing')+' bell.',shift === rule.shift)))),
        h('section',{},h('h3',{},'Walk a shift'),row(...visitors.map(who=>control(who,'Walk with '+callerNames[site][who],{type:'WorkClaimBell',act:'try',who},()=>hearCaller(site,who,rule).words)))));
      const slips=visitors.filter(who=>tested(state,site,who,rule)).map(who=>h('li',{},h('strong',{},callerNames[site][who]),' · ',hearCaller(site,who,rule).words));
      if (slips.length) parts.push(h('ul',{class:'bell-slips','aria-label':'Slips from the fitted rule'},...slips));
      if (well && !sent) parts.push(row(control('issue','Seal this rule for the Old Weir',{type:'WorkClaimBell',act:'issue'},()=>'Efua ties the plate to a narrow board. The scribe in the Council Yard has a different sort of claim waiting.')));
      if (sent) parts.push(h('p',{class:'fine'},'Emberford’s sealed rule · '+describeRule(sent)));
      if (!well) parts.push(row(control('sign',signed ? 'Sign the revised council rule' : 'Sign the council rule',{type:'WorkClaimBell',act:'sign'},()=>'Two accounts are in the bundle, including anyone the hatch missed. Bring the rule back to Efua’s spare pot.')));
      if (signed) parts.push(h('p',{class:'fine'},'Signed at the weir · '+describeRule(signed)));
      if (well && signed) parts.push(row(control('home','Give the returning porter the council rule',{type:'WorkClaimBell',act:'home'},()=>homeReading(c.state))));
      if (well && signed && state.flags['claimbell.home'] === state.flags['claimbell.signed']) parts.push(h('p',{class:'bell-plate'},homeReading(state)));
    }
    desk.replaceChildren(...parts);
  }
  shell.append(feedback, desk, localGuide(c,well?'WORLD-02':'WORLD-12',()=>
    well ? c.state.flags['claimbell.signed'] ? 'claimbell.home' : 'claimbell.issue' : 'claimbell.sign'));
  draw();
  return shell;
}
