/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const Firebase = {
  signIn() {
    return signInWithPopup(auth, googleProvider);
  },
  
  signOut() {
    return signOut(auth);
  },

  onAuth(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async saveData(userId, data) {
    try {
      const userDoc = doc(db, 'users', userId);
      await setDoc(userDoc, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (e) {
      console.error('[Firebase] Save Error:', e);
      return false;
    }
  },

  async loadData(userId) {
    try {
      const userDoc = doc(db, 'users', userId);
      const snap = await getDoc(userDoc);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.error('[Firebase] Load Error:', e);
      return null;
    }
  }
};
