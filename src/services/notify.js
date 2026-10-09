// Local notifications (work in Expo Go). Real background push = Firebase Cloud Messaging + Cloud Functions (future work).
// expo-notifications is loaded lazily so the app still runs if the module is unavailable (e.g. some Snack setups).
let N = null;
try {
  N = require('expo-notifications');
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
    }),
  });
} catch (e) {
  N = null;
}

export async function ensureNotifyPermission() {
  if (!N) return false;
  try {
    const cur = await N.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await N.requestPermissionsAsync();
    return !!req.granted;
  } catch (e) {
    return false;
  }
}

export async function localNotify(title, body) {
  if (!N) return;
  try {
    await N.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch (e) {}
}
