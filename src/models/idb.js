import { openDB } from "idb";

export async function getDB() {
  return await openDB("video-store", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos", { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveVideo(blob, subtitle, image, data, name) {
  try{
    console.log("Saving..")
    console.log(name)
    const db = await getDB();
    await db.put("videos", { 
      id:name,
      video:blob, name, subtitle, image, data, downloadedAt: Date.now() });
  }catch(error){
    console.log({error})
  }

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


