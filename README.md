# NusantaraTrail Frontend 🖥️

Web Admin Panel untuk NusantaraTrail menggunakan React + TypeScript + Tailwind CSS.

---

## Prasyarat

- Node.js >= 18
- Backend NusantaraTrail sudah berjalan di `http://localhost:3000`

---

## Langkah Running

### 1. Install dependencies

```bash
cd nusantaratrail-frontend
npm install
```

### 2. Pastikan backend sudah jalan

```bash
# Di terminal lain, pastikan backend running
cd nusantaratrail-backend
npm run dev
# → Server running at http://localhost:3000
```

### 3. Jalankan frontend

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## Login

Gunakan akun dari seed backend:

| Email | Password | Role |
|-------|----------|------|
| superadmin@nusantaratrail.id | password123 | Super Admin |
| admin@nusantaratrail.id | password123 | Admin |

---

## Halaman yang Tersedia

| Path | Halaman | Role |
|------|---------|------|
| `/login` | Halaman login | Semua |
| `/dashboard` | Dashboard & statistik | Admin, Superadmin |
| `/locations` | Daftar lokasi wisata | Admin, Superadmin |
| `/locations/:id` | Detail lokasi + QR + Audio + Review | Admin, Superadmin |
| `/reports` | Laporan kunjungan | Admin, Superadmin |
| `/users` | Manajemen pengguna | Superadmin |

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** — styling
- **TanStack Query** — data fetching & caching
- **Zustand** — state management (auth)
- **React Hook Form** + **Zod** — form & validasi
- **Recharts** — grafik & chart
- **Axios** — HTTP client
- **React Router v6** — routing

---

## Proxy API

Vite sudah dikonfigurasi untuk proxy request ke backend:
- `/api/*` → `http://localhost:3000/api/*`
- `/uploads/*` → `http://localhost:3000/uploads/*`

Jadi tidak perlu CORS setup tambahan saat development.

---

## Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/` — bisa di-deploy ke App Engine atau Cloud Run.
