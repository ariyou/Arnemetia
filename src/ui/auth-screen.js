import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  watchAuthState
} from '../firebase/auth-service.js';
import { createPlayerProfile, getPlayerProfile, setPlayerGender } from '../firebase/user-service.js';
import { initCharacterPreview } from '../character/character-preview.js';

const escapeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function showMessage(element, message, isError = true) {
  element.textContent = message;
  element.className = isError ? 'auth-message error' : 'auth-message success';
}

export function initAuthScreen() {
  const overlay = document.createElement('section');
  overlay.id = 'auth-screen';
  overlay.innerHTML = `
    <div class="auth-panel">
      <div class="auth-brand"><span class="auth-crest">A</span><div><strong>ARNEMETIA</strong><small>YOUR ADVENTURE BEGINS</small></div></div>
      <div id="auth-content">
        <h1>Welcome, Adventurer</h1>
        <p class="auth-subtitle">Masuk untuk menyimpan perjalanan karaktermu.</p>
        <div class="auth-tabs">
          <button type="button" class="selected" data-mode="login">Login</button>
          <button type="button" data-mode="register">Daftar</button>
        </div>
        <form id="auth-form">
          <label id="nickname-label" hidden>Nickname karakter
            <input id="auth-nickname" name="nickname" minlength="4" maxlength="16" pattern="[A-Za-z0-9_]{4,16}" autocomplete="nickname" placeholder="Contoh: Aria" />
          </label>
          <label>Email
            <input id="auth-email" name="email" type="email" autocomplete="email" required placeholder="nama@email.com" />
          </label>
          <label>Password
            <input id="auth-password" name="password" type="password" minlength="6" autocomplete="current-password" required placeholder="Minimal 6 karakter" />
          </label>
          <button class="auth-primary" id="auth-submit" type="submit">Login</button>
        </form>
        <div class="auth-divider"><span>atau</span></div>
        <button type="button" class="auth-google" id="auth-google"><b>G</b> Lanjutkan dengan Google</button>
        <p id="auth-message" class="auth-message" aria-live="polite"></p>
        <p class="auth-terms">Dengan masuk, kamu menyetujui aturan komunitas Arnemetia.</p>
      </div>
    </div>`;
  document.body.append(overlay);

  const content = overlay.querySelector('#auth-content');
  const form = overlay.querySelector('#auth-form');
  const nicknameLabel = overlay.querySelector('#nickname-label');
  const nicknameInput = overlay.querySelector('#auth-nickname');
  const emailInput = overlay.querySelector('#auth-email');
  const passwordInput = overlay.querySelector('#auth-password');
  const submitButton = overlay.querySelector('#auth-submit');
  const googleButton = overlay.querySelector('#auth-google');
  const message = overlay.querySelector('#auth-message');
  let mode = 'login';
  let currentUser = null;
  let currentGender = 'male';
  let busy = false;

  function setBusy(value) {
    busy = value;
    submitButton.disabled = value;
    googleButton.disabled = value;
    submitButton.textContent = value ? 'Memproses…' : (mode === 'register' ? 'Buat akun' : 'Login');
  }

  function setMode(nextMode) {
    mode = nextMode;
    content.querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('selected', button.dataset.mode === mode);
    });
    nicknameLabel.hidden = mode !== 'register';
    nicknameInput.required = mode === 'register';
    passwordInput.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
    submitButton.textContent = mode === 'register' ? 'Buat akun' : 'Login';
    showMessage(message, '');
  }

  content.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  async function showNicknameSetup(user) {
    currentUser = user;
    content.innerHTML = `
      <h1>Pilih nickname</h1>
      <p class="auth-subtitle">Nama ini akan terlihat oleh pemain lain di dunia Arnemetia.</p>
      <div class="character-preview" id="character-preview"></div><p class="preview-hint">Geser karakter untuk melihat dari berbagai sisi</p><div class="character-choice"><p class="auth-hint">Pilih karakter</p><div class="character-options"><button type="button" class="character-option selected" data-gender="male"><span class="character-icon">♂</span><b>Cowok</b></button><button type="button" class="character-option" data-gender="female"><span class="character-icon">♀</span><b>Cewek</b></button></div></div>
      <form id="nickname-form" novalidate>
        <label>Nickname karakter
          <input id="nickname-value" name="nickname" minlength="4" maxlength="16" pattern="[A-Za-z0-9_]{4,16}" autocomplete="nickname" required placeholder="Contoh: Aria" />
        </label>
        <p class="auth-hint">4–16 karakter. Gunakan huruf, angka, atau underscore. Nickname harus unik.</p>
        <button class="auth-primary" type="submit">Simpan nickname</button>
      </form>
      <p id="nickname-message" class="auth-message" aria-live="polite"></p>
      <button type="button" class="auth-logout" id="auth-logout">Bukan akunmu? Logout</button>`;
    let selectedGender = startingGender || 'male';
    const preview = initCharacterPreview(content.querySelector('#character-preview'), selectedGender);
    content.querySelectorAll('[data-gender]').forEach((option) => option.classList.toggle('selected', option.dataset.gender === selectedGender));
    content.querySelectorAll('[data-gender]').forEach((button) => button.addEventListener('click', () => {
      selectedGender = button.dataset.gender;
      content.querySelectorAll('[data-gender]').forEach((option) => option.classList.toggle('selected', option === button));
      preview.setGender(selectedGender);
    }));
    const nicknameForm = content.querySelector('#nickname-form');
    const nicknameMessage = content.querySelector('#nickname-message');
    content.querySelector('#auth-logout').addEventListener('click', async () => { await logout(); window.location.reload(); });
    nicknameForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) {
        showMessage(nicknameMessage, 'Permintaan sebelumnya masih diproses. Tunggu sebentar.');
        return;
      }

      const nicknameInput = content.querySelector('#nickname-value');
      const nickname = nicknameInput.value.trim();
      const saveButton = nicknameForm.querySelector('button');

      if (!/^[a-zA-Z0-9_]{4,16}$/.test(nickname)) {
        showMessage(nicknameMessage, 'Nickname wajib 4–16 karakter, hanya huruf, angka, atau underscore.');
        nicknameInput.focus();
        return;
      }

      busy = true;
      saveButton.disabled = true;
      saveButton.textContent = 'Menyimpan…';
      showMessage(nicknameMessage, 'Menghubungi Firestore dan menyimpan nickname…', false);

      try {
        await createPlayerProfile(user, nickname, selectedGender);
        showMessage(nicknameMessage, 'Nickname berhasil disimpan. Membuka dunia Arnemetia…', false);
        preview.destroy();
        overlay.remove();
        window.dispatchEvent(new CustomEvent('arnemetia:profile-ready', {
          detail: { nickname, role: 'player', gender: selectedGender }
        }));
      } catch (error) {
        console.error('[Arnemetia] Gagal menyimpan nickname:', error);
        const code = error.code ? ' (' + error.code + ')' : '';
        showMessage(nicknameMessage, (error.message || 'Gagal menyimpan nickname.') + code);
        saveButton.disabled = false;
        saveButton.textContent = 'Simpan nickname';
      } finally {
        busy = false;
      }
    });
  }

  async function showGenderSetup(user, startingGender = currentGender) {
    content.innerHTML = `
      <h1>Pilih karakter</h1>
      <p class="auth-subtitle">Tentukan penampilan awal petualangmu. Pilihan ini bisa diubah nanti.</p>
      <div class="character-preview" id="character-preview"></div>
      <p class="preview-hint">Geser karakter untuk melihat dari berbagai sisi</p>
      <div class="character-options">
        <button type="button" class="character-option selected" data-gender="male"><span class="character-icon">♂</span><b>Cowok</b></button>
        <button type="button" class="character-option" data-gender="female"><span class="character-icon">♀</span><b>Cewek</b></button>
      </div>
      <p id="gender-message" class="auth-message" aria-live="polite"></p>
      <button type="button" class="auth-primary" id="save-gender">Lanjut ke dunia</button>`;
    let selectedGender = 'male';
    const preview = initCharacterPreview(content.querySelector('#character-preview'), selectedGender);
    content.querySelectorAll('[data-gender]').forEach((button) => button.addEventListener('click', () => {
      selectedGender = button.dataset.gender;
      content.querySelectorAll('[data-gender]').forEach((option) => option.classList.toggle('selected', option === button));
      preview.setGender(selectedGender);
    }));
    content.querySelector('#save-gender').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const messageEl = content.querySelector('#gender-message');
      button.disabled = true;
      button.textContent = 'Menyimpan…';
      try {
        await setPlayerGender(user, selectedGender);
        preview.destroy();
        const profile = await getPlayerProfile(user.uid);
        currentGender = profile?.gender || selectedGender;
        overlay.remove();
        window.dispatchEvent(new CustomEvent('arnemetia:profile-ready', { detail: profile }));
      } catch (error) {
        console.error('[Arnemetia] Gagal menyimpan pilihan karakter:', error);
        showMessage(messageEl, (error.message || 'Gagal menyimpan pilihan karakter.') + (error.code ? ' (' + error.code + ')' : ''));
        button.disabled = false;
        button.textContent = 'Lanjut ke dunia';
      }
    });
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(emailInput.value, passwordInput.value);
      } else {
        await loginWithEmail(emailInput.value, passwordInput.value);
      }
      // The auth-state listener loads the profile or asks for a nickname.
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan login.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/weak-password': 'Password minimal 6 karakter.',
        'auth/network-request-failed': 'Koneksi bermasalah. Coba lagi.'
      };
      showMessage(message, messages[error.code] || error.message || 'Gagal memproses akun. Coba lagi.');
      setBusy(false);
    }
  });

  googleButton.addEventListener('click', async () => {
    if (busy) return;
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      showMessage(message, error.message || 'Login Google gagal.');
      setBusy(false);
    }
  });

  window.addEventListener('arnemetia:open-character-select', async () => {
    if (!currentUser) {
      overlay.hidden = false;
      return;
    }
    overlay.hidden = false;
    document.body.append(overlay);
    await showGenderSetup(currentUser, currentGender);
  });

  watchAuthState(async (user) => {
    currentUser = user;
    if (user) setBusy(false);
    if (!user) {
      // Ignore Firebase's initial signed-out notification; never reload during auth restoration.
      overlay.hidden = false;
      return;
    }
    try {
      const profile = await getPlayerProfile(user.uid);
      if (profile) {
        currentGender = profile.gender || 'male';
        if (!profile.gender) {
          await showGenderSetup(user);
          return;
        }
        overlay.remove();
        window.dispatchEvent(new CustomEvent('arnemetia:profile-ready', { detail: profile }));
      } else {
        await showNicknameSetup(user);
      }
    } catch (error) {
      showMessage(message, 'Tidak bisa memuat profil. Periksa koneksi dan Security Rules.');
    }
  });
}
