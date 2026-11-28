import {TAKU_PRINT,takuDescription} from './takuPrint';
import records from '../content/night-register.json';
import trails from '../content/night-trails.json';
import stations from '../content/ink-post-stations.json';
import { nightKeepers } from '../content/nightKeepers';
import { nightFamilies } from '../content/nightFamilies';
import { PERSPECTIVE_FLAG, specimenToolId, carryFlag, specimenItemId } from './specimenGear';
import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect } from './types';

export const nightSites = nightKeepers.map((story, index) => {
  const station = stations.find((s) => s.id === story.site)!;
  return {
    ...story,
    index,
    world: station.world,
    doorMap: station.map,
    room: 'night-register.' + story.site,
  };
});
export type NightSite = (typeof nightSites)[number];
export const nightFriends = nightSites.flatMap((site) =>
  site.names.split(' ').map((name, index) => ({
    id: site.site + '-' + nightFamilies[index].mode,
    name,
    site,
    family: nightFamilies[index],
  })),
);
export const nightWorks = records.map((record, index) => {
  const site = nightSites[Math.floor(index / 68)];
  return {
    ...record,
    site,
    slot: index % 68,
    exhibit: 'OBJ-NIGHT-' + record.id,
    objective: 'night.work.' + record.id,
    card: 'card.night.' + record.id,
    source: 'HIS-NIGHT-' + record.id,
    image: 'specimens/night-register/' + record.id + '.png',
    key: 'nga:' + record.accession.toLowerCase(),
    url: 'https://www.nga.gov/collection/art-object-page.' + record.id + '.html',
  };
});
export type NightWork = (typeof nightWorks)[number];
export type NightFriend = (typeof nightFriends)[number];
export const nightByExhibit = new Map(nightWorks.map((w) => [w.exhibit, w]));
export const nightByFriend = new Map(nightFriends.map((f) => [f.id, f]));
const byId = new Map(nightWorks.map((w) => [w.id, w]));
const byTool = new Map(nightWorks.map((w) => [specimenToolId(w.key), w]));
export const creatureTrails = new Map(
  trails.map((pair) => [pair.friend, [byId.get(pair.home)!, byId.get(pair.away)!] as const]),
);
export const trailMark = (friend: NightFriend, work: NightWork) => 'night.trail.' + friend.id + '.' + work.id;
type State = Pick<CampaignState, 'flags' | 'mapId'>;
export const activeFriend = (s: State) => {
  const f = nightByFriend.get(String(s.flags['lor.out'] ?? ''));
  return f && s.flags['lor.' + f.id + '.friend'] === true ? f : undefined;
};
export const nightFriendFlag = (f: NightFriend) => 'lor.' + f.id + '.friend';
export const nightJob = (w: NightWork) => 'night.job.' + w.id;
export const nightCarry = 'night.delivering';
export function missingCaption(s: State, site: NightSite) {
  const id = s.flags[site.room + '.slip'];
  return typeof id === 'number' ? byId.get(id) : undefined;
}
export function drawerAddress(w: NightWork) {
  return (
    'Row ' +
    (1 + Math.floor(w.slot / 8)) +
    ' from the north wall, position ' +
    (1 + (w.slot % 8)) +
    ' from the left'
  );
}

function decodeEdition(raw: unknown) {
  if (typeof raw !== 'string') return;
  const [id, mode, path, helperId] = raw.split('|');
  const work = byId.get(Number(id)),
    family = nightFamilies.find((f) => f.mode === mode);
  if (!work || !family || (path !== '0' && path !== '1')) return;
  return { work, family, choice: Number(path) as 0 | 1, helper: nightByFriend.get(helperId), raw };
}
export function nightEdition(s: State, key: string) {
  return decodeEdition(s.flags[key]);
}
export function nightParcel(s: State) {
  return nightEdition(s, nightCarry)?.work;
}
export function nightLens(s: State & Pick<CampaignState, 'inventory'>) {
  const key = s.flags[PERSPECTIVE_FLAG];
  if (typeof key !== 'string') return;
  const work = byTool.get(key);
  return work && s.inventory[specimenItemId(work.key)] > 0 && s.flags[carryFlag(work.key)] === true
    ? work
    : undefined;
}
export function nightReading(w: NightWork, mode: string) {
  if(w.id===TAKU_PRINT)return takuDescription(mode);
  switch (mode) {
    case 'medium':
      return w.medium;
    case 'accession':
      return w.accession;
    case 'maker':
      return w.maker;
    case 'date':
      return w.date;
    default:
      return w.title;
  }
}
export type NightCommand = { type: 'WorkNightRegister' } & (
  | { action: 'watch' | 'travel' | 'rest' | 'recall'; friend: string }
  | { action: 'retrain'; friend: string; bond: 'scout' | 'courier' }
  | { action: 'befriend'; friend: string; bond: 'scout' | 'courier' }
  | { action: 'trial' | 'whole'; work: number; method: string }
  | { action: 'send'; work: number; choice: 0 | 1 }
  | { action: 'carry'; work: number }
  | { action: 'lend'; work: number }
  | { action: 'receive'; choice: 0 | 1 }
  | { action: 'read-memory'; trace: 'keeper' | 'copy' | 'home' }
  | { action: 'find-caption'; work: number }
  | { action: 'bind-caption'; work: number; choice: 0 | 1 }
  | { action: 'favour'; choice: 0 | 1 }
  | { action: 'resolve'; choice: 0 | 1 }
);
const set = (setFlag: string, value: string | number | boolean): Effect => ({ setFlag, value });
export function nightReceipt(s: State, site: NightSite) {
  const work = byId.get(Number(s.flags[site.room + '.received']));
  const choice = s.flags[site.room + '.reading'];
  const edition = nightEdition(s, site.room + '.edition');
  if (work && edition?.work === work && (choice === 0 || choice === 1)) return { work, choice, edition };
}
export function nightFinding(s: State) {
  return nightSites.filter((site) => nightReceipt(s, site));
}
export function nightEffects(cmd: NightCommand, s: State & Pick<CampaignState, 'inventory'>): Effect[] {
  const site = nightSites.find((p) => p.room === s.mapId || p.doorMap === s.mapId);
  if (!site) throw Error('Find the night register at a chapter lamp.');
  if ('choice' in cmd && cmd.choice !== 0 && cmd.choice !== 1) throw Error('Choose a place for the record.');
  if ('friend' in cmd) {
    const f = nightByFriend.get(cmd.friend);
    if (!f) throw Error('That companion has no perch here.');
    const met = s.flags[nightFriendFlag(f)] === true;
    if (cmd.action === 'watch' || cmd.action === 'befriend') {
      if (site !== f.site || s.mapId !== site.room) throw Error('Visit the creature at its home perch.');
      if (cmd.action === 'watch') return [set('night.watch.' + f.id, true)];
      if (!s.flags['night.watch.' + f.id]) throw Error('Wait beside the perch until you see what moves.');
      if (!('bond' in cmd) || (cmd.bond !== 'scout' && cmd.bond !== 'courier'))
        throw Error('Choose how you want to share the perch.');
      if (met) throw Error('That companion already remembers how you met. Call it at the perch.');
      return [set(nightFriendFlag(f), true), set('night.bond.' + f.id, cmd.bond), set('lor.out', f.id)];
    }
    if (!met) throw Error('The creature needs to know you first.');
    if (cmd.action === 'retrain') {
      if (site !== f.site || s.mapId !== site.room) throw Error('Try a new job together at the home perch.');
      if (cmd.bond !== 'scout' && cmd.bond !== 'courier') throw Error('Choose a field job.');
      return [set('night.bond.' + f.id, cmd.bond)];
    }
    if (cmd.action === 'recall') {
      const saved = nightEdition(s, 'night.pocket.' + f.id);
      if (
        !saved ||
        saved.work.site === site ||
        activeFriend(s) !== f ||
        s.flags['night.bond.' + f.id] !== 'courier'
      )
        throw Error('Ask the travelling courier that kept a copy at another register.');
      return [set(nightCarry, saved.raw), set('night.has-parcel', true)];
    }
    if (cmd.action === 'rest' && s.flags['lor.out'] !== f.id)
      throw Error('This companion is already resting.');
    return [set('lor.out', cmd.action === 'travel' ? f.id : '')];
  }
  if (cmd.action === 'receive') {
    const parcel = nightParcel(s);
    if (!parcel || parcel.site === site) throw Error('This lamp needs a parcel from another chapter.');
    return [
      set(site.room + '.received', parcel.id),
      set(site.room + '.memory', 0),
      set(site.room + '.reading', cmd.choice),
      set(site.room + '.edition', String(s.flags[nightCarry])),
      set(site.room + '.open', true),
      set(nightCarry, false),
      set('night.has-parcel', false),
    ];
  }
  if (cmd.action === 'favour') {
    if (!nightReceipt(s, site)) throw Error('Bring a reading to the keeper before staying after closing.');
    return [set(site.room + '.favour', cmd.choice)];
  }
  if (cmd.action === 'read-memory') {
    const trace = memoryTraces[cmd.trace];
    if (!trace || !nightReceipt(s, site))
      throw Error('Receive a reading before opening the keeper’s folder.');
    const marks = Number(s.flags[site.room + '.memory'] ?? 0) | trace;
    const effects = [set(site.room + '.memory', marks)];
    if (marks === 7) effects.push(set(site.room + '.compared-memory', true));
    return effects;
  }
  if (cmd.action === 'resolve') {
    if (nightFinding(s).length < 3) throw Error('Read the replies in three different chapters first.');
    const sheet = 'night.signatures.' + cmd.choice;
    const signatures =
      s.flags[sheet] ??
      JSON.stringify(
        nightFinding(s).map((found) => [
          found.site,
          s.flags[found.room + '.edition'],
          s.flags[found.room + '.reading'],
        ]),
      );
    return [set('night.resolution', cmd.choice), set(sheet, signatures), set('night.signatures', signatures)];
  }
  const work = byId.get(cmd.work);
  if (cmd.action === 'find-caption') {
    if (!work || work.site !== site || s.mapId !== site.room)
      throw Error('Take a loose proof from its own register.');
    return [set(site.room + '.slip', work.id)];
  }
  if (cmd.action === 'bind-caption') {
    if (
      !work ||
      missingCaption(s, site) !== work ||
      s.mapId !== site.room ||
      s.flags['inspected.' + work.exhibit] !== true
    )
      throw Error('Bring the loose proof to the case with its accession and compare the museum caption.');
    return [
      set(site.room + '.bound-caption', work.id),
      set(nightJob(work) + '.caption', cmd.choice),
      set(site.room + '.slip', false),
    ];
  }
  if (cmd.action === 'lend') {
    if (!work || nightLens(s) !== work || site === work.site)
      throw Error('Equip an earned object from another chapter first.');
    const edition = nightEdition(s, nightJob(work) + '.edition');
    if (!edition) throw Error('Give the original a local use before lending its reading.');
    return [set(nightCarry, edition.raw), set('night.has-parcel', true)];
  }
  if (!work || work.site !== site || s.mapId !== site.room || s.flags['inspected.' + work.exhibit] !== true)
    throw Error('Open the original case in its own room first.');
  const key = nightJob(work);
  if (cmd.action === 'carry') {
    if (!nightEdition(s, key + '.edition'))
      throw Error('Give the work a local use before packing a travelling copy.');
    return [set(nightCarry, String(s.flags[key + '.edition'])), set('night.has-parcel', true)];
  }
  if (cmd.action === 'send') {
    if (!s.flags[key + '.checked'])
      throw Error('Try a field tool and put the whole record back beside the result.');
    const helper = activeFriend(s);
    const edition = [work.id, s.flags[key + '.method'], cmd.choice, s.flags[key + '.helper'] || ''].join('|');
    const effects = [
      set(key + '.sent', cmd.choice),
      set(key + '.edition', edition),
      set(site.room + '.posted', work.id),
    ];
    if (helper && s.flags[key + '.helper'] === helper.id && creatureTrails.get(helper.id)?.includes(work))
      effects.push(set(trailMark(helper, work), edition));
    if (helper && s.flags['night.bond.' + helper.id] === 'courier' && s.flags[key + '.helper'] === helper.id)
      effects.push(set('night.pocket.' + helper.id, edition));
    return effects;
  }
  const family = nightFamilies.find((f) => f.mode === cmd.method);
  if (!family) throw Error('Choose a field tool on the bench.');
  if (cmd.action === 'trial')
    return [
      set(key + '.method', family.mode),
      set(key + '.checked', false),
      set(key + '.helper', activeFriend(s)?.family.mode === family.mode ? activeFriend(s)!.id : false),
    ];
  if (s.flags[key + '.method'] !== family.mode) throw Error('Try that tool with this object first.');
  return [set(key + '.checked', true)];
}
export const memoryTraces = { keeper: 1, copy: 2, home: 4 } as const;
export function traceMemory(s: State, site: NightSite, trace: keyof typeof memoryTraces) {
  const receipt = nightReceipt(s, site);
  if (!receipt) return '';
  const { edition, work, choice } = receipt;
  if (trace === 'keeper') return site.keeper + ' remembers who used it here. ' + site.replies[choice];
  if (trace === 'copy')
    return (
      'The sealed reading arrived with ' +
      edition.family.job.toLowerCase() +
      ' recorded. ' +
      work.site.replies[edition.choice]
    );
  const home = nightEdition(s, nightJob(work) + '.edition');
  return (
    work.site.keeper +
    ' writes from the home room. ' +
    (home ? home.family.job + '. ' + work.site.replies[home.choice] : 'The original slip has gone missing.')
  );
}
export const captionFates = [
  'I stitched the caption to the sleeve. The next carrier can check the source on the way, but the writing has to stay with the picture.',
  'I left the caption at the desk and pressed the accession into the sleeve. People can consult the label at home while the picture travels.',
] as const;
export const nightEndings = [
  'Each keeper leaves a blank line beside their own name. The first person who helped gets to sign it. Hale sets down the pencil and waits with the others.',
  'The keepers pass the unfinished register one stop farther. Whoever receives a page can turn it over and write what the first keeper could never have seen.',
] as const;
export function nightDiary(cmd: NightCommand, before: State, after: State) {
  const site = nightSites.find((p) => p.room === after.mapId || p.doorMap === after.mapId);
  if (!site) return;
  let text: string, suffix: string;
  if ('friend' in cmd) {
    const f = nightByFriend.get(cmd.friend)!;
    if (
      (cmd.action === 'watch' && before.flags['night.watch.' + f.id]) ||
      (cmd.action === 'befriend' && before.flags[nightFriendFlag(f)]) ||
      ((cmd.action === 'travel' || cmd.action === 'rest') &&
        before.flags['lor.out'] === after.flags['lor.out'])
    )
      return;
    text =
      cmd.action === 'retrain'
        ? 'Back home, ' +
          f.name +
          ' and I practised a new job. Next time we travel together, ' +
          (cmd.bond === 'scout'
            ? 'we will look for unread cases.'
            : 'we will save a copy for the next keeper.')
        : cmd.action === 'watch'
          ? 'I waited beside ' + f.name + '. ' + f.family.sign
          : cmd.action === 'befriend'
            ? 'I made room for ' + f.name + '. ' + f.family.trust
            : cmd.action === 'recall'
              ? 'I asked ' +
                f.name +
                ' to bring back the travelling copy of ' +
                nightParcel(after)?.title +
                '.'
              : cmd.action === 'travel'
                ? f.name + ' came with me to the next case.'
                : 'I let ' + f.name + ' rest at the lamp.';
    suffix = f.id;
  } else if (cmd.action === 'favour') {
    text = 'I stayed after closing. ' + site.favours[cmd.choice] + '. ' + site.nextMorning[cmd.choice];
    suffix = String(cmd.choice);
  } else if (cmd.action === 'read-memory') {
    text = 'I opened a witness folder. ' + traceMemory(after, site, cmd.trace);
    suffix = site.site + '.' + cmd.trace;
  } else if (cmd.action === 'resolve') {
    if (before.flags['night.resolution'] === cmd.choice) return;
    text = 'I brought the keepers their register. ' + nightEndings[cmd.choice];
    suffix = String(cmd.choice);
  } else {
    const w = cmd.action === 'receive' ? nightParcel(before) : byId.get(cmd.work);
    if (!w) return;
    const f = nightFamilies.find((f) => f.mode === after.flags[nightJob(w) + '.method']);
    const helper = nightByFriend.get(String(after.flags[nightJob(w) + '.helper']));
    const label = w.title + ' (' + w.accession + ')';
    suffix = w.id + '.' + ('choice' in cmd ? cmd.choice : 'method' in cmd ? cmd.method : 'parcel');
    switch (cmd.action) {
      case 'find-caption':
        text =
          'I picked up a loose plate at ' +
          site.keeper +
          '’s desk. The mount had the mark ' +
          w.accession +
          ' on its back.';
        break;
      case 'bind-caption':
        text =
          'I traced the loose plate to ' +
          label +
          ', credited to ' +
          w.maker +
          '. ' +
          captionFates[cmd.choice];
        break;
      case 'trial':
        if(w.id===TAKU_PRINT){text='I tried “'+f!.job+'” on Beato’s print. '+takuDescription(cmd.method);break;}
        text =
          'I tried the field tool on ' + label + (helper ? ' with ' + helper.name : '') + '. ' + f!.limit;
        break;
      case 'whole':
        if(w.id===TAKU_PRINT){text='I compared the title with the whole print. '+takuDescription('original');break;}
        text =
          'I put the unaltered record back beside my trial of ' +
          label +
          '. Its maker line reads ' +
          w.maker +
          '.';
        break;
      case 'send':
        text = 'I chose “' + site.choices[cmd.choice] + '” for ' + label + '. ' + site.replies[cmd.choice];
        break;
      case 'lend':
        text = 'I unpacked ' + label + ' from my satchel so ' + site.keeper + ' could try the reading here.';
        break;
      case 'carry':
        text = 'I packed the reading of ' + label + ' for a keeper in another chapter.';
        break;
      case 'receive':
        text =
          'I brought ' +
          label +
          ' from ' +
          w.site.keeper +
          ' to ' +
          site.keeper +
          '. ' +
          site.replies[cmd.choice];
        break;
    }
  }
  if (cmd.action === 'send') {
    const helper = activeFriend(after),
      work = byId.get(cmd.work);
    if (helper && work && before.flags[trailMark(helper, work)] !== after.flags[trailMark(helper, work)]) {
      const pair = creatureTrails.get(helper.id)!;
      text +=
        ' ' +
        helper.name +
        ' pressed a track beside this frame. ' +
        (pair.every((w) => nightEdition(after, trailMark(helper, w)))
          ? 'Both trail readings can now be opened together at any chapter perch.'
          : 'The second frame is still out there.');
    }
  }
  return diaryEvent(
    site.room + ':' + cmd.action + ':' + suffix,
    'choice',
    site.room,
    site.title,
    text,
    {},
    'after-break',
  );
}

export function signedNames(s: State) {
  const raw = s.flags['night.signatures'];
  if (typeof raw !== 'string') return [];
  try {
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      if (!Array.isArray(row)) return [];
      const site = nightSites.find((v) => v.site === row[0]),
        edition = decodeEdition(row[1]);
      return site && edition && (row[2] === 0 || row[2] === 1)
        ? [
            site.keeper +
              ' signed for ' +
              edition.work.title +
              ' (' +
              edition.work.accession +
              '). ' +
              site.choices[row[2]] +
              '.',
          ]
        : [];
    });
  } catch {
    return [];
  }
}

export function nightQuestions(key: string): Record<string, string> | undefined {
  const [room, action, value] = key.split(':');
  const site = nightSites.find((site) => site.room === room);
  if (!site || !value) return;
  const work = byId.get(Number(value.split('.')[0])),
    friend = nightByFriend.get(value);
  switch (action) {
    case 'find-caption':
      return { observation: 'What would help you identify this mount if its picture were upside down?' };
    case 'bind-caption':
      return {
        observation:
          'What did the caption let you say about ' + work?.title + ' that the picture alone left open?',
        reader: 'Who would need the accession again after your filing choice?',
      };
    case 'trial':
      return {
        observation: 'Which detail in ' + work?.title + ' became easier to see or read under this setting?',
        reader: 'What fell outside the tool’s reach?',
      };
    case 'whole':
      return {
        observation:
          'What, if anything, did restoring the full record change about your first reading of ' +
          work?.title +
          '?',
      };
    case 'carry':
    case 'recall':
    case 'lend':
      return {
        observation:
          'Which part of the first reading would surprise someone who saw only the current display?',
      };
    case 'watch':
    case 'befriend':
      return {
        observation:
          'What did ' + (friend?.name ?? 'your companion') + ' do that changed how you approached the perch?',
      };
    case 'retrain':
    case 'travel':
    case 'rest':
      return {
        reader:
          'What would make you choose a different job for ' +
          (friend?.name ?? 'this companion') +
          ' on the next journey?',
      };
    case 'favour':
      return {
        reader:
          'In “' +
          site.title +
          '”, what did the keeper want to decide for themselves? Where did your help leave them room?',
      };
    case 'read-memory':
      return {
        observation:
          'Which of the three accounts could change tomorrow? Which one would let you check what arrived?',
      };
    case 'resolve':
      return {
        reader:
          'Whose contribution became visible in the signed register? Whose name would you still like to find?',
      };
    case 'receive':
      return {
        observation:
          'What did ' + site.keeper + ' need from this reading that the first recipient might have missed?',
      };
    case 'send':
      return {
        reader:
          'Who gained something when you left ' + work?.title + ' this way? Who might ask to have it back?',
      };
  }
}
