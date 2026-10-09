# DineFlow – Restaurant Table Reservation & Queue App (React Native + Firebase)

IT3060 HCI · Group WE_127. Built from Milestone 01 (requirements FR1–FR10, NFR1–NFR8) and the Milestone 02 high-fidelity
prototype (21 screens + the planned reminder screen). Stack: **Expo (React Native)**, **Firebase Auth** (anonymous diners,
email/password staff) and **Cloud Firestore** (real-time listeners everywhere – no manual refresh, NFR2).

## Screens → files → requirements

| Screen | File | Req. |
|---|---|---|
| c01 Splash | `src/screens/customer/Splash.js` | – |
| c02 Home (+ c13 reminder banner) | `Home.js` | FR1, FR9 |
| c03 Restaurant details | `RestaurantDetails.js` | FR1 |
| c04 Reservation details | `ReservationDetails.js` | FR2 |
| c05 Available slots | `AvailableSlots.js` | FR2, FR8 |
| c06 Reservation confirmation | `ReservationConfirmation.js` | FR2, NFR6 |
| c07 Join virtual queue | `JoinQueue.js` | FR3, FR5 |
| c08 Queue tracker | `QueueTracker.js` | FR3, FR5, NFR2, NFR5 |
| c09 Table-ready notification | `TableReady.js` (+ alert in `navigation/CustomerTabs.js`) | FR4, NFR3 |
| c10 My reservations | `MyReservations.js` | FR6, FR9 |
| c11 Modify reservation | `ModifyReservation.js` | FR6 |
| c12 Cancel reservation | `CancelReservation.js` | FR6 |
| s01 Staff login | `src/screens/staff/StaffLogin.js` | – |
| s02 Staff dashboard | `StaffDashboard.js` | FR7, NFR8 |
| s03 Live floor / table map | `FloorMap.js` | FR7, NFR4 |
| s04 Live queue | `LiveQueue.js` | FR5, FR7 |
| s05 Customer called | `CustomerCalled.js` | FR4 |
| s06 Table assignment | `TableAssignment.js` | FR7 |
| s07 Double-booking warning | `DoubleBookingWarning.js` | FR8 |
| s08 Mark seated | `MarkSeated.js` | FR7 |
| m01 Manager analytics | `ManagerAnalytics.js` | FR10 |
| Staff Hub tab (shift reservations, log out) | `StaffHub.js` | FR7 |

Usability fixes from the Milestone 02 test log are applied: **UI-01** primary "Assign Recommended Table" button at the top of the
panel and on the dashboard; **UI-02** visible check-marks on selected slots; **UI-03** distinct Modify / Cancel buttons;
**UI-04** bold "Please report to the Front Host Stand within 10 minutes" call-out on c08/c09. Recommendation from §5: the
double-booking override requires a reason and is stored on the ticket (audit note).

## Firestore data model

- `users/{uid}` – `{ role: 'staff' | 'manager' }` (created by hand, see step 6)
- `restaurants/harbor-bistro` – profile
- `tables/{id}` – `{ restaurantId, name, area, capacity, status: 'available' | 'occupied' }` ("reserved" is derived from bookings)
- `reservations/{id}` – `{ userId, name, partySize, date, time, status: confirmed | seated | cancelled | no_show, tableId, bookingId }`
- `queue/{id}` – `{ userId, name, partySize, ticket, status: waiting | called | seated | no_show | left, createdMs, calledMs, seatedMs, arrived, override? }`
- `meta/queueCounter` – ticket counter

Double-booking protection (FR8): a reservation is only created if a table that fits the party has no overlapping booking
(±90 min); staff seating a walk-in at a table with a booking in the next 90 min get the s07 warning.
Wait estimate (NFR5): position in line × time per party, recalculated from how many tables are occupied right now.

## Setup

### 1. Firebase project (manual, once)
1. https://console.firebase.google.com → **Add project** (Analytics not needed).
2. **Project settings → Your apps → Web (`</>`)** → register an app → copy the `firebaseConfig` object into `src/firebase/config.js`.
3. **Build → Authentication → Get started → Sign-in method**: enable **Anonymous** *and* **Email/Password**.
4. **Build → Firestore Database → Create database** (production mode, nearest region).
5. Firestore → **Rules** tab → paste the contents of `firestore.rules` → **Publish**. (No composite indexes are needed.)
6. **Authentication → Users → Add user** twice (e.g. `host@dineflow.com`, `manager@dineflow.com`, any password). Copy each user's **UID**.
   Then Firestore → **Start collection** `users` → Document ID = that UID → field `role` (string) = `staff` (or `manager`).
7. Run the app, log in as staff → Dashboard → **Seed demo data** (creates Harbor Bistro + 9 tables).

### 2a. Run locally (needs Node.js LTS from https://nodejs.org + the *Expo Go* app on your phone)
```bash
npx create-expo-app@latest dineflow --template blank
cd dineflow
npx expo install firebase @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-notifications @expo/vector-icons expo-status-bar
```
Copy `src/`, `App.js` and `metro.config.js` from this folder into the new project (overwrite), then `npx expo start` and scan the QR code with Expo Go
(phone and PC on the same Wi-Fi; add `--tunnel` if that fails).

### 2b. Run without installing Node.js
- **Expo Snack** (https://snack.expo.dev): create a Snack, add the same file/folder structure (`App.js`, `src/...`), put the dependencies from
  `snack-package.json` into its `package.json`, then open the web preview or scan the QR with Expo Go.
- **GitHub Codespaces**: push this folder to a GitHub repo, open it in a Codespace (Node is pre-installed) and follow 2a.

## Demo script (matches the Milestone 02 test tasks)
1. Diner: Home → Reserve a Table → party 4 → today → 7:30 PM → confirm (Task 1).
2. Make the restaurant "full": staff → Floor Map → set tables Occupied. Diner: Join Virtual Queue → watch position + estimate (Task 2).
3. Diner: Bookings → Modify the time, then Cancel (Task 3).
4. Staff: Live Queue → **Call Party** → the diner's phone shows the table-ready screen (Task 4).
5. Staff: **Seat Table** → recommended table → Mark Seated (Task 5). Try a table with a booking in the next 90 min to see s07.

## Known limitations (be upfront about these in the viva)
- Table-ready alerts are in-app + local notifications. True background push / SMS fallback (FR4, NFR3) needs Firebase Cloud Messaging and a Cloud Function (not included).
- FR9 reminder is an in-app banner (c13) shown within 2 hours of the booking, not a scheduled push.
- For simplicity all signed-in users can read reservations/queue so availability and position can be computed on the phone; the only personal data stored is the name the diner types.
  A production version would move that logic into Cloud Functions.
- Single restaurant (Harbor Bistro) as in the prototype.
