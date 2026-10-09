// tiny in-memory setting: "alert me when my table is ready" (c08 notification settings toggle)
let notifyOn = true;
export const getNotifyOn = () => notifyOn;
export const setNotifyOn = (v) => { notifyOn = !!v; };
