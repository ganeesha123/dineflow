import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase/config';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const NAME_KEY = 'dineflow_guest_name';

async function readRole(uid) {
  const s = await getDoc(doc(db, 'users', uid));
  const r = s.exists() ? s.data().role : null;
  return r === 'staff' || r === 'manager' ? r : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // null = customer, 'staff' | 'manager'
  const [ready, setReady] = useState(false);
  const [guestName, setGuestNameState] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY).then((n) => n && setGuestNameState(n)).catch(() => {});
  }, []);

  const setGuestName = (n) => {
    setGuestNameState(n);
    AsyncStorage.setItem(NAME_KEY, n).catch(() => {});
  };

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        if (u && !u.isAnonymous) {
          try {
            const r = await readRole(u.uid);
            setRole(r || null);
            setUser(u);
          } catch (e) {
            await signOut(auth); setRole(null); setUser(null);
          }
        } else {
          setRole(null);
          setUser(u);
        }
        setReady(true);
      }),
    []
  );

  const startAsGuest = async (name) => {
    const email = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@guest.dineflow.com';
    const pwd = 'guestpassword123';
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
    } catch (e) {
      await createUserWithEmailAndPassword(auth, email, pwd);
    }
  };

  const staffLogin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const r = await readRole(cred.user.uid);
    if (!r) {
      await signOut(auth);
      throw new Error('This account is not registered as restaurant staff.');
    }
  };

  const logout = () => signOut(auth);

  return (
    <Ctx.Provider value={{ user, role, ready, guestName, setGuestName, startAsGuest, staffLogin, logout }}>
      {children}
    </Ctx.Provider>
  );
}
