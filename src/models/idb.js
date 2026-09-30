import { openDB } from "idb";

export async function getDB() {
  return await openDB("video-store", 3, {
    upgrade(db) {
      console.log("Upgrading DB...",db)
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos", { keyPath: 'id', autoIncrement: true});
      }
    },
  });
}

//throws when the browser can't store it (e.g. QuotaExceededError) - the caller must not report success
export async function saveVideo(blob, subtitle, image, data, name) {
  const db = await getDB();
  await db.put("videos", {
    id:name,
    video:blob, name, subtitle, image, data, downloadedAt: Date.now()
  });
}

export async function getVideoRecord(key) {
  const db = await getDB();
  return await db.get("videos", key);
}

export async function deleteVideo(key) {
  const db = await getDB();
  await db.delete("videos", key);
}

export async function listVideoKeys() {
  const db = await getDB();
  return await db.getAllKeys("videos");
}

export async function listVideos() {
  const db = await getDB();
  return await db.getAll("videos")
}


