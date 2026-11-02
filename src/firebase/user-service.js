import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { db } from './firebase-config.js';

const normalizeNickname = (value) => value.trim().toLowerCase();

export async function getPlayerProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createPlayerProfile(user, nickname) {
  const cleanNickname = nickname.trim();
  const nicknameLower = normalizeNickname(cleanNickname);

  if (!/^[a-zA-Z0-9_]{4,16}$/.test(cleanNickname)) {
    throw new Error('Nickname harus 4–16 karakter: huruf, angka, atau underscore.');
  }

  const userRef = doc(db, 'users', user.uid);
  const usernameRef = doc(db, 'usernames', nicknameLower);

  await runTransaction(db, async (transaction) => {
    const [userSnapshot, usernameSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(usernameRef)
    ]);

    if (userSnapshot.exists()) {
      throw new Error('Profil akun ini sudah dibuat. Silakan login ulang.');
    }
    if (usernameSnapshot.exists()) {
      throw new Error('Nickname sudah dipakai. Coba nama lain.');
    }

    transaction.set(usernameRef, {
      uid: user.uid,
      nickname: cleanNickname
    });

    transaction.set(userRef, {
      nickname: cleanNickname,
      nicknameLower,
      role: 'player',
      level: 1,
      exp: 0,
      createdAt: serverTimestamp()
    });
  });
}
