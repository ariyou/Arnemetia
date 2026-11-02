import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { auth } from './firebase-config.js';

const googleProvider = new GoogleAuthProvider();

export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email.trim(), password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const loginWithGoogle = () => signInWithRedirect(auth, googleProvider);

export const logout = () => signOut(auth);
