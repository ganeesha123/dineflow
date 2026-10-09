import {
  collection, doc, getDocs, addDoc, setDoc, updateDoc, onSnapshot, query, where, runTransaction, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { RID, findTables } from '../utils';

import { doc as firestoreDoc, getDoc as firestoreGetDoc } from 'firebase/firestore';

const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const listen = (q, cb) => onSnapshot(q, (s) => cb(list(s)), (e) => console.warn('Firestore:', e.message));

// Fetch a user profile (name + mobile) – used by staff call screen
export async function getUserProfile(uid) {
  const s = await firestoreGetDoc(firestoreDoc(db, 'users', uid));
  return s.exists() ? s.data() : null;
}


// ---------- realtime watchers ----------
export const watchRestaurant = (cb) =>
  onSnapshot(doc(db, 'restaurants', RID), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null), (e) => console.warn(e.message));

export const watchTables = (cb) =>
  listen(query(collection(db, 'tables'), where('restaurantId', '==', RID)), (l) =>
    cb(l.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })))
  );

export const watchReservations = (cb) =>
  listen(query(collection(db, 'reservations'), where('restaurantId', '==', RID)), (l) =>
    cb(l.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)))
  );

export const watchQueueAll = (cb) =>
  listen(query(collection(db, 'queue'), where('restaurantId', '==', RID)), cb);

// active line only (waiting + called), oldest first
export const watchQueue = (cb) =>
  watchQueueAll((l) => cb(l.filter((x) => x.status === 'waiting' || x.status === 'called').sort((a, b) => a.createdMs - b.createdMs)));

// ---------- reservations ----------
export async function createReservation({ uid, name, party, date, time }) {
  const [tables, reservations] = await Promise.all([
    getDocs(query(collection(db, 'tables'), where('restaurantId', '==', RID))).then(list),
    getDocs(query(collection(db, 'reservations'), where('restaurantId', '==', RID))).then(list),
  ]);
  const free = findTables({ tables, reservations, date, time, party });
  if (!free.length) throw new Error('That slot was just taken. Please pick another time.');
  const data = {
    restaurantId: RID, userId: uid, name, partySize: party, date, time, status: 'confirmed',
    tableId: free[0].id, tableName: free[0].name,
    bookingId: '#HB-' + Math.floor(10000 + Math.random() * 89999), createdMs: Date.now(),
  };
  const ref = await addDoc(collection(db, 'reservations'), data);
  return { id: ref.id, ...data };
}

export async function modifyReservation(id, { party, date, time }) {
  const [tables, reservations] = await Promise.all([
    getDocs(query(collection(db, 'tables'), where('restaurantId', '==', RID))).then(list),
    getDocs(query(collection(db, 'reservations'), where('restaurantId', '==', RID))).then(list),
  ]);
  const free = findTables({ tables, reservations, date, time, party, excludeId: id });
  if (!free.length) throw new Error('No table is free at that time. Try another slot.');
  await updateDoc(doc(db, 'reservations', id), { partySize: party, date, time, tableId: free[0].id, tableName: free[0].name });
}

export const setReservationStatus = (id, status) => updateDoc(doc(db, 'reservations', id), { status });

// ---------- virtual queue ----------
export async function joinQueue({ uid, name, party }) {
  const counter = doc(db, 'meta', 'queueCounter');
  const num = await runTransaction(db, async (tx) => {
    const s = await tx.get(counter);
    const n = (s.exists() ? s.data().n : 100) + 1;
    tx.set(counter, { n });
    return n;
  });
  const data = {
    restaurantId: RID, userId: uid, name, partySize: party, ticket: 'A' + String(num).padStart(3, '0'),
    status: 'waiting', createdMs: Date.now(), calledMs: null, arrived: false, tableId: null,
  };
  const ref = await addDoc(collection(db, 'queue'), data);
  return { id: ref.id, ...data };
}
export const updateQueue = (id, patch) => updateDoc(doc(db, 'queue', id), patch);
export const callEntry = (id) => updateQueue(id, { status: 'called', calledMs: Date.now() });
export const noShowEntry = (id) => updateQueue(id, { status: 'no_show' });

// ---------- staff: tables / seating ----------
export const setTableStatus = (id, status) => updateDoc(doc(db, 'tables', id), { status });

export async function seatEntry({ entryId, tableId, override }) {
  const b = writeBatch(db);
  const patch = { status: 'seated', seatedMs: Date.now(), tableId };
  if (override) patch.override = override; // audit note for double-booking override
  b.update(doc(db, 'queue', entryId), patch);
  b.update(doc(db, 'tables', tableId), { status: 'occupied' });
  await b.commit();
}

// ---------- demo data (run once from Staff Dashboard) ----------
export async function seedDemoData() {
  const b = writeBatch(db);
  b.set(doc(db, 'restaurants', RID), {
    name: 'Harbor Bistro', cuisine: 'Modern American', area: 'Waterfront District',
    address: '120 Harbor View Dr, Waterfront', phone: '(555) 234-5678', rating: 4.9, reviews: '1.2k',
    open: '17:00', close: '22:00', lastSeating: '21:30', tags: ['Seafood', 'Sunset views', 'Wine list'],
  });
  const defs = [
    ['t1', 'T1', 'Patio Section', 4], ['t2', 'T2', 'Patio Section', 2], ['t3', 'T3', 'Patio Section', 4],
    ['t4', 'T4', 'Main Dining Hall', 6], ['t5', 'T5', 'Main Dining Hall', 4], ['t6', 'T6', 'Main Dining Hall', 4],
    ['t7', 'T7', 'Main Dining Hall', 8], ['t8', 'T8', 'Main Dining Hall', 4], ['t9', 'T9', 'Main Dining Hall', 2],
  ];
  defs.forEach(([id, name, area, capacity]) =>
    b.set(doc(db, 'tables', id), { restaurantId: RID, name, area, capacity, status: 'available' })
  );
  b.set(doc(db, 'meta', 'queueCounter'), { n: 100 });
  await b.commit();
}
