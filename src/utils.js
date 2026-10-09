export const RID = 'harbor-bistro';
export const AVG_TURN = 6; // minutes per party ahead in queue (wait-time estimate)
export const STAY = 90; // minutes a booking occupies a table

export const pad = (n) => String(n).padStart(2, '0');
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());

export const nextDays = (n = 7) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: toDateStr(d),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

export const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
export const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const fmtDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
export const fmtClock = (ms) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const WINDOWS = {
  dinner: { label: 'Dinner (5–10 PM)', from: '17:00', to: '21:30' },
  lunch: { label: 'Lunch (Noon–3 PM)', from: '12:00', to: '14:30' },
};
export const genSlots = (w) => {
  const out = [];
  const end = toMin(WINDOWS[w].to);
  for (let m = toMin(WINDOWS[w].from); m <= end; m += 30) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out;
};

export const PARTY_CHIPS = [
  { label: '1-2', value: 2 },
  { label: '3-4', value: 4 },
  { label: '5-6', value: 6 },
  { label: '7+', value: 8 },
];

// Tables that can take `party` at date/time with no overlapping confirmed booking (smallest first)
export const findTables = ({ tables, reservations, date, time, party, excludeId }) => {
  const t0 = toMin(time);
  const busy = new Set(
    reservations
      .filter((r) => r.status === 'confirmed' && r.date === date && r.id !== excludeId && r.tableId && Math.abs(toMin(r.time) - t0) < STAY)
      .map((r) => r.tableId)
  );
  return tables.filter((t) => t.capacity >= party && !busy.has(t.id)).sort((a, b) => a.capacity - b.capacity);
};

// Live status chip: available / reserved / occupied
export const tableStatus = (t, reservations, date, nm) => {
  if (t.status === 'occupied') return 'occupied';
  const r = reservations.find(
    (r) => r.status === 'confirmed' && r.date === date && r.tableId === t.id && toMin(r.time) - nm <= 60 && toMin(r.time) - nm > -15
  );
  return r ? 'reserved' : 'available';
};

// Upcoming booking that would clash if a walk-in sits at this table now (FR8)
export const conflictFor = (t, reservations, date, nm) =>
  reservations.find(
    (r) => r.status === 'confirmed' && r.date === date && r.tableId === t.id && toMin(r.time) - nm <= STAY && toMin(r.time) - nm > -15
  );

// Predicted wait (NFR5): recalculated from the live queue + how many tables are turning over right now
export const estWait = (position, tables = []) => {
  const occ = tables.filter((t) => t.status === 'occupied').length;
  const per = occ ? Math.min(15, Math.max(3, Math.round(STAY / occ))) : AVG_TURN; // capped: a few busy tables should not imply hour-long waits
  return Math.max(5, Math.round((position * per) / 5) * 5);
};

// Best-fit table for a party right now: smallest free table that does not clash with an upcoming booking
export const recommendTable = (tables, reservations, party, date, nm) =>
  tables
    .filter((t) => t.capacity >= party && tableStatus(t, reservations, date, nm) === 'available' && !conflictFor(t, reservations, date, nm))
    .sort((a, b) => a.capacity - b.capacity)[0] || null;

export const efficiency = (party, cap) => Math.round((party / cap) * 100);

export const floorCounts = (tables, reservations) => {
  const date = todayStr();
  const nm = nowMin();
  const s = tables.map((t) => tableStatus(t, reservations, date, nm));
  return {
    total: tables.length,
    available: s.filter((x) => x === 'available').length,
    occupied: s.filter((x) => x === 'occupied').length,
    reserved: s.filter((x) => x === 'reserved').length,
  };
};

export const minsUntil = (date, time) => {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return Math.round((new Date(y, m - 1, d, h, mi).getTime() - Date.now()) / 60000);
};

export const fmtDur = (mins) => {
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
};

export const friendlyErr = (e) => {
  const c = (e && e.code) || '';
  if (c.includes('operation-not-allowed') || c.includes('admin-restricted'))
    return 'Sign-in method is not enabled in Firebase (Authentication → Sign-in method). See README step 3.';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') || c.includes('invalid-email'))
    return 'Incorrect email or password.';
  if (c.includes('network')) return 'No internet connection. Please try again.';
  if (c.includes('permission-denied')) return 'Permission denied by Firestore rules. Publish firestore.rules (README step 5).';
  return (e && e.message) || 'Something went wrong. Please try again.';
};
