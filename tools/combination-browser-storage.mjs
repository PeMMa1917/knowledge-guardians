// Larger reviewer ledgers store one record per exact cell. The small legacy ledger remains readable.
export function openReviewDatabase(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('cells');
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(Error('The review database is open in an older tab.'));
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}
export function storedReviews(db) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('cells').objectStore('cells').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export function writeReviewChanges(db, members, pending) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cells', 'readwrite');
    const store = tx.objectStore('cells'),
      records = new Map();
    let fault;
    tx.oncomplete = () => resolve(records);
    tx.onabort = () =>
      reject(fault ?? tx.error ?? Error('Interrupted review save.'));
    for (const [key, change] of pending) {
      const read = store.get(key);
      read.onsuccess = () => {
        try {
          const old = read.result;
          let next = change.record;
          if (old && change.keepExisting) next = old;
          else if (old && change.patch) {
            // Preserve fields last edited in another tab. A local click changes only its own fields.
            const time = Math.max(
              Date.parse(next.updated),
              Date.parse(old.updated) + 1,
            );
            next = {
              ...old,
              ...change.patch,
              updated: new Date(time).toISOString(),
            };
          } else if (old) {
            const merged = mergeLedger(members, new Map([[key, old]]), {
              version: 1,
              records: [next],
            });
            next = merged.get(key);
          }
          if (next !== old) store.put(next, key);
          records.set(key, next);
        } catch (err) {
          fault = err;
          tx.abort();
        }
      };
    }
  });
}
