import { openDB } from "idb";

const DB_NAME = "stakked-editor";
const DB_VERSION = 1;

let _db = null;

async function getDb() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pages")) {
        db.createObjectStore("pages", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    },
  });
  return _db;
}

export async function savePage(page) {
  const db = await getDb();
  await db.put("pages", { ...page, _savedAt: Date.now() });
}

export async function loadPage(id) {
  const db = await getDb();
  return db.get("pages", id);
}

export async function listLocalPages() {
  const db = await getDb();
  return db.getAll("pages");
}

export async function deletePage(id) {
  const db = await getDb();
  await db.delete("pages", id);
}

export async function saveMeta(key, value) {
  const db = await getDb();
  await db.put("meta", { key, value });
}

export async function loadMeta(key) {
  const db = await getDb();
  const rec = await db.get("meta", key);
  return rec?.value;
}
