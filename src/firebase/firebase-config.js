import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAG8vrLK85fkXUN67lZ0B6gGBv0Gy-z6Mc",
  authDomain: "arnemetia.firebaseapp.com",
  projectId: "arnemetia",
  storageBucket: "arnemetia.firebasestorage.app",
  messagingSenderId: "110840404863",
  appId: "1:110840404863:web:f9deb3c763e5d262bed84a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
