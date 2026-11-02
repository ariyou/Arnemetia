# ARNEMETIA

**Arnemetia** adalah proyek game **online action RPG bergaya chibi 3D**, dirancang untuk berjalan di browser terlebih dahulu. Arah visual mengambil inspirasi dari game mobile isometric dengan dunia fantasi berwarna, pertarungan real-time, monster, equipment, dan eksplorasi.

> Status: tahap perencanaan dan fondasi prototype. Fitur yang tercantum di dokumen ini adalah rancangan, bukan klaim bahwa semuanya sudah tersedia.

## 1. Prinsip desain

- **Weapon-based identity, bukan class tetap.** Pemain tidak memilih class saat membuat karakter. Weapon yang sedang digunakan menentukan gaya serangan, rangkaian combo, dan skill yang tersedia.
- **Web-first.** Prototype pertama dimainkan melalui browser desktop maupun mobile; Android APK bukan target awal.
- **Procedural-first.** Prototype awal tidak bergantung pada asset eksternal. Karakter, monster, senjata, lingkungan, dan efek sederhana dibuat dari geometri, material, dan animasi prosedural.
- **Action combat.** Pertarungan real-time dengan basic attack, combo, skill, dodge, cooldown, dan hit feedback.
- **Open-world direction.** Dunia dirancang sebagai beberapa zona yang saling terhubung. Prototype awal hanya memerlukan satu zona kecil.
- **Online-ready architecture.** Sistem gameplay dipisahkan agar nantinya bisa menggunakan server authoritative untuk multiplayer, penyimpanan akun, dan ekonomi.

## 2. Platform dan teknologi

### Prototype web

| Bagian | Pilihan awal |
|---|---|
| Rendering 3D | Three.js |
| Bahasa | TypeScript |
| Development server / bundler | Vite |
| Browser graphics | WebGL 2 |
| Source control | GitHub |
| Hosting | Cloudflare Pages atau static hosting setara |

### Backend tahap multiplayer

| Bagian | Pilihan kandidat |
|---|---|
| Multiplayer backend | Nakama |
| Database permanen | PostgreSQL |
| Cache / ephemeral state | Redis (jika diperlukan) |
| Server gameplay | Server-authoritative; validasi damage, loot, dan transaksi di server |

Backend multiplayer belum menjadi dependensi prototype single-player pertama.

## 3. Rancangan gameplay

### 3.1 Character

Karakter adalah avatar pemain, bukan class.

Data inti:
- ID karakter dan pemilik akun
- Nama karakter
- Level dan experience
- Base attributes
- Posisi dan zona terakhir
- Weapon aktif
- Equipment dan inventory
- Pet aktif
- Progress quest

### 3.2 Weapon menentukan gaya bertarung

Contoh rancangan weapon:

| Weapon type | Gaya bertarung | Contoh skill |
|---|---|---|
| Sword | Slash dan combo seimbang | Crescent Slash |
| Greatsword | Serangan berat dan lambat | Ground Breaker |
| Dual Daggers | Serangan cepat dan mobilitas | Shadow Flurry |
| Bow | Serangan jarak jauh | Piercing Shot |
| Staff | Serangan sihir dan area | Arcane Burst |
| Spear | Tusukan, jangkauan, kontrol area | Spiral Thrust |

Aturan desain:
- Tidak ada class permanen yang dipilih saat pembuatan karakter.
- Mengganti weapon mengganti moveset dan akses skill weapon tersebut.
- Level karakter dan progress utama tetap milik karakter.
- Skill khusus weapon dapat memiliki level/proficiency tersendiri.
- Balance weapon dilakukan melalui damage, attack speed, jangkauan, cooldown, dan resource cost.

### 3.3 Combat loop

1. Pemain menjelajah dan menemukan monster.
2. Pemain memilih target dan menyerang.
3. Weapon menentukan animasi/moveset dan skill.
4. Monster menerima damage dan memberi respons.
5. Monster mati dan menghasilkan EXP serta loot.
6. Pemain meningkatkan karakter, weapon, dan equipment.

Formula damage awal (placeholder untuk balancing):

`damage = max(1, attackPower * skillMultiplier - targetDefense)`

Critical, elemental modifiers, buffs, dan random variance ditambahkan setelah combat dasar stabil.

### 3.4 Progression

- Character level dan EXP
- Weapon proficiency
- Weapon skill upgrades
- Equipment rarity dan enhancement
- Pet progression
- Quest progression
- Rebirth/awakening sebagai fitur lanjutan, bukan kebutuhan prototype

### 3.5 World

Rencana zona konten:
- Emerald Forest — zona pemula
- Sunleaf Village — hub, NPC, merchant
- Crystal Cavern — dungeon dan resource
- Scorching Desert — zona lanjutan
- Frostfall Mountain — zona lanjutan
- Abyssal Realm — konten endgame

Prototype pertama hanya membangun satu arena/area hutan kecil dengan beberapa monster.

## 4. Data model konseptual

Relasi utama:

```text
User
 └── Characters
      ├── CharacterStats
      ├── Inventory ── Items
      ├── Equipment ── Items
      ├── ActiveWeapon ── WeaponDefinitions
      │                    └── WeaponSkills
      ├── WeaponProgress
      ├── CharacterPets ── PetDefinitions
      ├── QuestProgress ── QuestDefinitions
      └── CharacterLocation ── Zones

Zones
 ├── MonsterSpawns ── MonsterDefinitions
 ├── NPCs
 ├── GatherableResources
 └── Portals

Guilds
 └── GuildMembers ── Characters

Parties
 └── PartyMembers ── Characters
```

### Entitas dan field penting

| Entitas | Field inti |
|---|---|
| users | id, email, password_hash, created_at, status |
| characters | id, user_id, name, level, exp, active_weapon_id, zone_id |
| character_stats | character_id, hp, max_hp, attack, defense, strength, agility, intelligence, vitality, luck |
| weapon_definitions | id, name, weapon_type, attack_power, attack_speed, range, rarity |
| weapon_skills | id, weapon_id, name, multiplier, cooldown_ms, resource_cost |
| character_weapon_progress | character_id, weapon_id, proficiency, unlocked_skills |
| item_definitions | id, name, item_type, rarity, max_stack, metadata |
| inventory_items | id, character_id, item_id, quantity, enhancement_level |
| equipment_slots | character_id, slot, item_instance_id |
| monster_definitions | id, name, level, hp, attack, defense, exp_reward |
| monster_drops | monster_id, item_id, drop_weight, min_quantity, max_quantity |
| zones | id, name, min_level, max_level, map_key |
| monster_spawns | id, zone_id, monster_id, position, respawn_seconds |
| quest_definitions | id, name, description, quest_type, requirements, rewards |
| quest_progress | character_id, quest_id, status, progress_data |
| pet_definitions | id, name, rarity, passive_effect |
| character_pets | id, character_id, pet_id, level, exp |
| guilds | id, name, leader_character_id, created_at |
| guild_members | guild_id, character_id, role, joined_at |

Catatan implementasi:
- Gunakan UUID untuk identitas entitas.
- Gunakan tabel relasional dan foreign key untuk data permanen.
- Field JSON hanya untuk konfigurasi/metadata yang memang fleksibel.
- Currency, inventory, equipment, loot, dan combat multiplayer harus divalidasi server.
- Perubahan currency dan transaksi perdagangan harus atomik dan tercatat dalam ledger.
- Jangan mempercayai damage, reward, atau jumlah item yang dikirim client.

## 5. Arsitektur aplikasi

### Prototype single-player

```text
Browser
 ├── UI Layer
 ├── Input & Camera
 ├── Three.js Renderer
 ├── World / Zone
 ├── Character Controller
 ├── Weapon & Combat Systems
 ├── Monster AI
 ├── Inventory & Progression
 └── Local prototype save
```

### Target multiplayer

```text
Web Client
    │ HTTPS / WebSocket
    ▼
Authentication & Game Backend
    ├── Character Service
    ├── World / Match Service
    ├── Combat Validation
    ├── Inventory & Economy
    ├── Party / Guild / Chat
    └── Quest / Progression
          │
          ├── PostgreSQL
          └── Redis (optional)
```

## 6. Struktur folder target

```text
Arnemetia/
├── README.md
├── docs/
│   ├── GAME_DESIGN.md
│   ├── GAMEPLAY_SYSTEMS.md
│   ├── WORLD_DESIGN.md
│   ├── DATABASE_SCHEMA.md
│   └── SERVER_ARCHITECTURE.md
├── web/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── core/
│       ├── rendering/
│       ├── world/
│       ├── entities/
│       ├── combat/
│       ├── weapons/
│       ├── monsters/
│       ├── progression/
│       └── ui/
├── server/
│   └── (multiplayer backend, tahap berikutnya)
└── database/
    ├── migrations/
    └── seeds/
```

## 7. Development roadmap

### Milestone 0 — Web foundation
- Setup Vite + TypeScript + Three.js
- Halaman game dan renderer 3D
- Kamera isometric dan input mobile/desktop
- Build statis yang bisa di-host

### Milestone 1 — Playable prototype
- Karakter prosedural tanpa model eksternal
- Gerakan dan animasi prosedural
- Satu area hutan sederhana
- Satu jenis monster
- Basic attack, hit reaction, monster death
- EXP dan level sederhana

### Milestone 2 — Weapon identity
- Weapon definitions dan weapon switching
- Moveset per weapon
- Skill dan cooldown
- UI equipment dan weapon inventory
- Balance dasar

### Milestone 3 — RPG loop
- Beberapa monster dan drop
- Inventory dan equipment
- Quest dan NPC sederhana
- Pet prototype
- Save/load progress

### Milestone 4 — Multiplayer foundation
- Authentication
- Server-authoritative character state
- Player synchronization
- Chat dan party
- Persistent database

### Milestone 5 — MMORPG expansion
- Zona dunia tambahan
- Dungeon instance dan boss
- Guild dan trading
- Economy, moderation, anti-cheat
- Load testing dan optimasi mobile browser

## 8. Definition of Done untuk prototype pertama

Prototype dianggap berhasil jika:
- Dapat dibuka melalui URL HTTPS di browser HP.
- Tidak memerlukan instalasi aplikasi.
- Menampilkan dunia 3D tanpa asset eksternal.
- Pemain dapat menggerakkan karakter.
- Pemain dapat menyerang monster.
- Monster dapat menerima damage dan dikalahkan.
- Pemain mendapatkan EXP.
- Kontrol dasar dapat digunakan dengan layar sentuh.
- Build dapat diulang melalui cloud deployment dari GitHub.

## 9. Prinsip pengembangan

Bangun satu fitur yang benar-benar berjalan sebelum memperluas scope. Prioritas pertama adalah browser prototype yang ringan dan playable. Multiplayer, ekonomi, dan konten open world skala besar ditambahkan setelah core gameplay terbukti berjalan.
