import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function getLocalRecords(collectionName: string) {
  const data = localStorage.getItem(`healthsync_guest_${collectionName}`);
  return data ? JSON.parse(data) : [];
}

function saveLocalRecords(collectionName: string, records: any[]) {
  localStorage.setItem(`healthsync_guest_${collectionName}`, JSON.stringify(records));
}

export async function addRecord(collectionName: string, data: any, userId: string = "guest") {
  if (userId === "guest") {
    const records = getLocalRecords(collectionName);
    const newRecord = {
      ...data,
      id: crypto.randomUUID(),
      userId: "guest",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    saveLocalRecords(collectionName, records);
    return newRecord.id;
  }

  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getRecords(collectionName: string, userId: string = "guest") {
  if (userId === "guest") {
    const records = getLocalRecords(collectionName);
    return records.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const colRef = collection(db, collectionName);
  const q = query(colRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateRecord(collectionName: string, id: string, data: any, userId: string = "guest") {
  if (userId === "guest") {
    const records = getLocalRecords(collectionName);
    const index = records.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
      saveLocalRecords(collectionName, records);
    }
    return;
  }

  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRecord(collectionName: string, id: string, userId: string = "guest") {
  if (userId === "guest") {
    let records = getLocalRecords(collectionName);
    records = records.filter((r: any) => r.id !== id);
    saveLocalRecords(collectionName, records);
    return;
  }

  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

