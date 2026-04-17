# Revelove — Auth demo (NestJS + MongoDB + Expo)

Monorepo ringkas untuk mengevaluasi keputusan engineering: struktur kode, state, API, dan manajemen sesi multi-perangkat / multi-akun di satu device.

## Prasyarat

- Node.js (disarankan **≥ 20.19.x** agar cocok dengan Expo SDK 54 / React Native 0.81)
- MongoDB berjalan lokal (`mongodb://127.0.0.1:27017`)

## Menjalankan backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

API default: `http://localhost:3000`.

Variabel lingkungan opsional:

- `PORT` — port server (default `3000`)
- `JWT_SECRET` — secret penandatanganan JWT (default dev: `dev-secret`)
- Ubah connection string MongoDB di `backend/src/app.module.ts` jika perlu.

### Endpoint inti

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| POST | `/auth/register` | — | Registrasi email + password (password di-hash) |
| POST | `/auth/login` | — | Login; body bisa berisi `deviceId`, `deviceName`; mengembalikan JWT + `sessionId` |
| GET | `/auth/me` | Bearer JWT | User saat ini |
| GET | `/auth/sessions` | Bearer JWT | Daftar sesi per user |
| DELETE | `/auth/sessions/:id` | Bearer JWT | Revoke sesi (logout per device) |

Respons sukses memakai bentuk `{ statusCode, data }`. JWT memuat `sub` (user) dan `sessionId`; setiap request memvalidasi sesi masih aktif di MongoDB.

## Menjalankan mobile (Expo / React Native)

```bash
cd mobile
npm install
npm start
```

Lalu buka di Android emulator, iOS simulator, atau Expo Go.

### URL API dari perangkat

- **Android emulator**: default `http://10.0.2.2:3000` (sudah di-set di kode).
- **iOS simulator**: default `http://localhost:3000`.
- **Perangkat fisik / kasus khusus**: set environment Expo:

```bash
# Contoh Windows PowerShell — ganti IP dengan IP LAN mesin Anda
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3000"; npm start
```

## Keputusan desain (ringkas)

1. **Sesi server-side**: JWT tidak bisa dicabut hanya dengan menghapus di client. Setiap login membuat dokumen `Session`; revoke menonaktifkan sesi sehingga guard JWT menolak token tersebut.
2. **Multi-device**: `deviceId` stabil per instalasi (disimpan lokal); backend menyimpan per session sehingga satu user bisa punya banyak sesi aktif.
3. **Multi-akun di satu device**: client menyimpan beberapa `{ userId, accessToken, sessionId, … }` di AsyncStorage dan memilih akun aktif tanpa memanggil API berulang untuk data yang sudah di-cache (`/me`, `/sessions` dengan TTL singkat).
4. **Pemisahan lapisan**: `api/` (HTTP), `services/` (identitas perangkat + cache), `state/` (auth), `screens/` + `components/` (UI).

## Struktur folder

- `backend/` — NestJS + Mongoose
- `mobile/` — Expo (TypeScript), navigasi stack + tab, layar Login / Register / Home / Profile / Sessions
