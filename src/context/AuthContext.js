import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth, db } from '../firebase/config';

// Required for Google auth session to close properly after redirect
WebBrowser.maybeCompleteAuthSession();

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const NAME_KEY = 'dineflow_guest_name';

async function readUserDoc(uid) {
  const s = await getDoc(doc(db, 'users', uid));
  return s.exists() ? s.data() : null;
}

function isStaffRole(role) {
  return role === 'staff' || role === 'manager';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);
  const [guestName, setGuestNameState] = useState('');

  // (Google Auth removed as per user request to avoid 400 errors without real credentials)

  // ---------- persist name locally ----------
  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY).then((n) => n && setGuestNameState(n)).catch(() => {});
  }, []);

  const setGuestName = (n) => {
    setGuestNameState(n);
    AsyncStorage.setItem(NAME_KEY, n).catch(() => {});
  };

  // ---------- handle Firebase auth state ----------

  // ---------- Firebase auth state listener ----------
  // This is the SINGLE SOURCE OF TRUTH for user state.
  // It loads the user's name from Firestore here so it is always in sync.
  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        if (u) {
          try {
            const userDoc = await readUserDoc(u.uid);
            if (userDoc) {
              if (isStaffRole(userDoc.role)) {
                // Staff or manager user
                setRole(userDoc.role);
                setUser(u);
              } else {
                // Regular customer (registered via email or google)
                setRole(null);
                setUser(u);
                // Load their name from Firestore into the greeting
                if (userDoc.name) {
                  setGuestName(userDoc.name);
                }
              }
            } else {
              // No Firestore doc — anonymous/guest user (old flow), keep as customer
              setRole(null);
              setUser(u);
            }
          } catch (e) {
            console.warn('Auth state error:', e.message);
            setRole(null);
            setUser(u);
          }
        } else {
          setRole(null);
          setUser(null);
        }
        setReady(true);
      }),
    []
  );

  // ---------- customer register ----------
  const customerRegister = async (name, email, mobile, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const profile = {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      role: 'customer',
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    // Sign out immediately so user can log in from the login screen
    await signOut(auth);
    setGuestName(name.trim());
  };

  // ---------- customer login ----------
  const customerLogin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    // Explicitly fetch and set the name to guarantee it displays immediately
    const userDoc = await readUserDoc(cred.user.uid);
    if (userDoc && userDoc.name) {
      setGuestName(userDoc.name);
    }
  };

  // ---------- Google login removed ----------

  // ---------- staff login ----------
  const staffLogin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const userDoc = await readUserDoc(cred.user.uid);
    if (!userDoc || !isStaffRole(userDoc.role)) {
      await signOut(auth);
      throw new Error('This account is not registered as restaurant staff.');
    }
  };

  const logout = () => {
    setGuestNameState('');
    AsyncStorage.removeItem(NAME_KEY).catch(() => {});
    return signOut(auth);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        role,
        ready,
        guestName,
        setGuestName,
        customerRegister,
        customerLogin,
        staffLogin,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
