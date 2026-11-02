import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { db } from './firebase-config.js';

const normalizeNickname = (value) => value.trim().toLowerCase();
const isValidNickname = (value, role = 'player') => {
  const minimum = role === 'project' ? 1 : 4;
  return new RegExp('^[a-zA-Z0-9_]{' + minimum + ',16}$').test(value);
};

export async function getPlayerProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createPlayerProfile(user, nickname, gender) {
  const cleanNickname = nickname.trim();
  const nicknameLower = normalizeNickname(cleanNickname);

  if (!['female', 'male'].includes(gender)) throw new Error('Pilih karakter perempuan atau laki-laki.');

  if (!isValidNickname(cleanNickname, 'player')) {
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
      gender,
      role: 'player',
      level: 1,
      exp: 0,
      createdAt: serverTimestamp()
    });
  });
}

export async function setPlayerGender(user, gender) {
  if (!['female', 'male'].includes(gender)) {
    throw new Error('Pilihan karakter tidak valid.');
  }
  const userRef = doc(db, 'users', user.uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists()) throw new Error('Profil pemain tidak ditemukan.');
    transaction.update(userRef, { gender });
  });
}

export async function changePlayerNickname(user, nextNickname) {
  const cleanNickname = nextNickname.trim();
  const nicknameLower = normalizeNickname(cleanNickname);
  const userRef = doc(db, 'users', user.uid);

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists()) throw new Error('Profil pemain tidak ditemukan.');

    const profile = userSnapshot.data();
    if (!isValidNickname(cleanNickname, profile.role)) {
      const minimum = profile.role === 'project' ? 1 : 4;
      throw new Error(`Nickname ${profile.role === 'project' ? 'Project' : 'pemain'} harus ${minimum}–16 karakter: huruf, angka, atau underscore.`);
    }

    const oldNicknameLower = profile.nicknameLower;
    if (nicknameLower === oldNicknameLower) {
      transaction.update(userRef, { nickname: cleanNickname });
      return;
    }

    const newUsernameRef = doc(db, 'usernames', nicknameLower);
    const oldUsernameRef = doc(db, 'usernames', oldNicknameLower);
    const [newUsernameSnapshot, oldUsernameSnapshot] = await Promise.all([
      transaction.get(newUsernameRef),
      transaction.get(oldUsernameRef)
    ]);

    if (newUsernameSnapshot.exists()) {
      throw new Error('Nickname sudah dipakai. Coba nama lain.');
    }
    if (!oldUsernameSnapshot.exists() || oldUsernameSnapshot.data().uid !== user.uid) {
      throw new Error('Data nickname lama tidak cocok. Hubungi pengelola Arnemetia.');
    }

    transaction.delete(oldUsernameRef);
    transaction.set(newUsernameRef, {
      uid: user.uid,
      nickname: cleanNickname
    });
    transaction.update(userRef, {
      nickname: cleanNickname,
      nicknameLower
    });
  });
}
