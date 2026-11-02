import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { auth } from './firebase-config.js';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const watchAuthState = (callback, onError) =>
  onAuthStateChanged(auth, callback, onError);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email.trim(), password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
}

export const logout = () => signOut(auth);
