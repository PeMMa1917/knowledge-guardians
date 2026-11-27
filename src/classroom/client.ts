import { request, ServiceError } from './request';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import { KEY_PERMANENT, KEY_SLOTS, parsePair, type KeyValueStore } from '../domain/saves';
import { migratePermanent } from '../domain/permanent';

export type Identity = {
  id: string;
  display: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
};
type Remote = { revision: number; package: string | null; updated: string | null };
type SceneDrafts = Record<string, { title: string; text: string; at?: string; mapId?: string }>;
type Data = { slots: string | null; permanent: string | null; scenes?: SceneDrafts };
type Copy = { revision: number; dirty: boolean; data: string | null };
export type Writing = { kind: string; title: string; text: string };
export let classroom: ClassSave | undefined;

export function notice(who = classroom?.who): string {
  return who
    ? `You and ${who.teacherName}, the assigned teacher for ${who.className}, can read your diary notes and unfinished diary writing as they sync. To give your teacher a separate portfolio entry, select Share and send a progress file. Photos stay on this device.`
    : 'Local play. Your diary writing stays in this browser. You choose what to export.';
}
function pack(data: Data) {
  return btoa(strFromU8(zlibSync(strToU8(JSON.stringify(data)), { level: 1 }), true));
}
function unpack(raw: string | null): Data {
  if (raw === null) return { slots: null, permanent: null };
  const data = JSON.parse(strFromU8(unzlibSync(strToU8(atob(raw), true))));
  if (
    !data ||
    !Object.hasOwn(data, 'slots') ||
    !Object.hasOwn(data, 'permanent') ||
    (data.slots !== null && typeof data.slots !== 'string') ||
    (data.permanent !== null && typeof data.permanent !== 'string')
  )
    throw new Error('Unreadable class save.');
  return { slots: data.slots, permanent: data.permanent, scenes: data.scenes };
}
function validate(data: Data) {
  const result = parsePair(data.slots);
  if (!result.ok || result.warning)
    throw new Error(
      'This game version could not open the complete online save. Your copies are still available.',
    );
  if (data.permanent !== null) migratePermanent(JSON.parse(data.permanent));
  return result.pair;
}
export function teacherWriting(data: Data): Writing[] {
  const state = validate(data).continue?.state;
  const rows: Writing[] = [];
  if (state) {
    const diary = state.adventureDiary;
    state.notes.forEach((text, i) =>
      rows.push({ kind: diary.noteDetails[i]?.kind ?? 'note', title: '', text }),
    );
    if (diary.noteDraft?.text)
      rows.push({ kind: 'draft-' + diary.noteDraft.kind, title: '', text: diary.noteDraft.text });
    const titles = new Map(diary.entries.map((e) => [e.id, e.title]));
    for (const [entry, responses] of Object.entries(diary.reflectionResponses)) {
      for (const text of Object.values(responses))
        if (text)
          rows.push({ kind: 'draft-reflection', title: titles.get(entry) ?? 'Journal reflection', text });
    }
  }
  for (const draft of Object.values(data.scenes ?? {})) {
    if (draft.text) rows.push({ kind: 'draft-note', title: draft.title, text: draft.text });
  }
  return rows;
}
function describe(raw: string | null) {
  if (!raw) return 'Empty';
  const entry = validate(unpack(raw)).continue;
  return entry ? entry.location + ' · ' + new Date(entry.savedAt).toLocaleString() : 'Learning record';
}
export class ClassSave implements KeyValueStore {
  private readonly key: string;
  private readonly path: string;
  private timer?: number;
  private running?: Promise<void>;
  private stopped = false;
  private paused = false;
  status = 'Saved on this device.';
  constructor(readonly who: Identity) {
    this.key = 'kg.class.v1.' + [who.id, who.classId, who.teacherId].map(encodeURIComponent).join('/');
    this.path =
      'student/save?' + new URLSearchParams({ account: who.id, class: who.classId, teacher: who.teacherId });
  }
  get albumKey() {
    return this.key + '.album';
  }
  private read(): Copy {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : { revision: 0, dirty: false, data: null };
  }
  private write(copy: Copy) {
    localStorage.setItem(this.key, JSON.stringify(copy));
  }
  private message(message: string) {
    this.status = message;
    window.dispatchEvent(new Event('kg-class-status'));
  }
  get(key: string) {
    const data = unpack(this.read().data);
    return key === KEY_SLOTS ? data.slots : key === KEY_PERMANENT ? data.permanent : null;
  }
  drafts(): SceneDrafts {
    return unpack(this.read().data).scenes ?? {};
  }
  sceneDraft(id: string) {
    return unpack(this.read().data).scenes?.[id]?.text ?? '';
  }
  storeScene(id: string, title: string, text: string, mapId?: string) {
    const old = this.read(),
      data = unpack(old.data);
    if ((data.scenes?.[id]?.text ?? '') === text) return;
    const scenes = { ...data.scenes };
    if (text) scenes[id] = { title, text, at: new Date().toISOString(), mapId: scenes[id]?.mapId ?? mapId };
    else delete scenes[id];
    this.changed(old, { ...data, scenes });
  }
  set(key: string, value: string) {
    if (!(key === KEY_SLOTS || key === KEY_PERMANENT)) throw new Error('Unknown class save key.');
    const old = this.read(),
      data = unpack(old.data);
    if (key === KEY_SLOTS) data.slots = value;
    else data.permanent = value;
    this.changed(old, data);
  }
  private changed(old: Copy, data: Data) {
    this.write({ ...old, dirty: true, data: pack(data) });
    this.message(
      this.paused
        ? 'Two devices have changes. Review the copies at the title screen.'
        : 'Saved here. Waiting to sync.',
    );
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(this.retry, 250);
  }
  async open(choose: (local: string, online: string) => Promise<'local' | 'online' | 'cancel'>) {
    const remote = await request<Remote>(this.path);
    const prior = localStorage.getItem(this.key);
    let local: Copy;
    try {
      local = this.read();
      if (!Number.isSafeInteger(local.revision) || local.revision < 0 || typeof local.dirty !== 'boolean')
        throw new Error();
      validate(unpack(local.data));
    } catch {
      if (!remote.package)
        throw new Error(
          'The copy on this device could not be opened. A school backup is needed before replacing it.',
        );
      const remoteLabel = describe(remote.package);
      if ((await choose('Unreadable copy on this device', remoteLabel)) !== 'online') return false;
      if (prior !== localStorage.getItem(this.key))
        throw new Error('This device saved again. Reopen the comparison.');
      local = { revision: remote.revision, data: remote.package, dirty: false };
    }
    if (remote.package) validate(unpack(remote.package));
    let keepLocal = local.dirty && local.data !== remote.package;
    const onlineRolledBack =
      local.data !== null && local.revision > remote.revision && local.data !== remote.package;
    if ((keepLocal && local.revision !== remote.revision) || onlineRolledBack) {
      const choice = await choose(describe(local.data), describe(remote.package));
      if (choice === 'cancel') return false;
      if (prior !== localStorage.getItem(this.key))
        throw new Error('This device saved again. Reopen the comparison.');
      keepLocal = choice === 'local';
    }
    this.write({
      revision: remote.revision,
      data: keepLocal ? local.data : remote.package,
      dirty: keepLocal,
    });
    this.message(keepLocal ? 'Saved here. Waiting to sync.' : 'Up to date with your class.');
    return true;
  }
  activate() {
    classroom = this;
    window.addEventListener('online', this.retry);
    window.addEventListener('focus', this.retry);
    this.retry();
  }
  private retry = () => {
    void this.sync();
  };
  async sync() {
    if (this.running) return this.running;
    if (this.stopped || this.paused) return;
    this.running = this.upload().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }
  private async upload() {
    try {
      for (;;) {
        const local = this.read();
        if (!local.dirty || !local.data || this.stopped) return;
        const result = await request<{ revision: number }>(this.path, 'PUT', {
          revision: local.revision,
          package: local.data,
          writing: teacherWriting(unpack(local.data)),
        });
        const next = this.read();
        if (next.revision !== local.revision) continue;
        this.write({ ...next, revision: result.revision, dirty: next.data !== local.data });
        if (next.data === local.data) {
          this.message('Synced to your class.');
          return;
        }
      }
    } catch (error) {
      const code = error instanceof ServiceError ? error.status : 0;
      this.paused = [401, 403, 409].includes(code);
      this.message(
        code === 409
          ? 'Two devices have changes. Return to the title and reopen your class to choose a copy.'
          : code === 413
            ? 'This adventure exceeds the online save limit. Your writing is on this device. Export a copy from your journal.'
            : this.paused
              ? 'Your class session changed. Reopen your class at the title. Your writing is saved here.'
              : 'Saved on this device. Class sync is pending. Reconnect or retry at the title.',
      );
      if (code !== 413 && !this.paused && !this.stopped) {
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(this.retry, 30000);
      }
    }
  }
  async leave() {
    await this.sync();
    this.stopped = true;
    window.clearTimeout(this.timer);
    window.removeEventListener('online', this.retry);
    window.removeEventListener('focus', this.retry);
    classroom = undefined;
  }
}
