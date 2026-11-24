# nazuaf-blog

Blog berbahasa Indonesia dengan halaman publik untuk daftar dan artikel, serta
panel admin untuk membuat, mengedit, menerbitkan, dan menghapus tulisan.
Aplikasi berjalan sebagai Cloudflare Worker dengan D1 di produksi. Untuk
pengembangan lokal, server Node.js menggunakan SQLite lokal.

## Persyaratan

- Node.js 22.5 atau lebih baru
- npm
- Wrangler untuk perintah Cloudflare

## Mulai secara lokal

Pasang dependensi (proyek ini tidak memiliki dependensi npm tambahan):

```sh
npm install
```

Buat `.dev.vars` di direktori proyek untuk konfigurasi lokal:

```dotenv
ADMIN_PASSWORD=nazuaf-dev-2026
SESSION_SECRET=local-session-secret-change-for-deployment
```

Jangan gunakan nilai rahasia lokal tersebut di produksi. Server lokal membaca
`.dev.vars`; jika `ADMIN_PASSWORD` tidak diatur, server memakai password
pengembangan `nazuaf-dev-2026`. File `.dev.vars` dan database SQLite lokal
di `.data/blog.sqlite` tidak dilacak Git.

Jalankan server:

```sh
npm run dev
```

Buka `http://localhost:8787`. Port bawaan adalah `8787`; untuk memilih port
lain, atur variabel lingkungan `PORT`. Masuk ke `/admin` dengan password
pengembangan di atas. Server lokal membuat tabel dari `schema.sql` saat
startup dan menyimpan data di `.data/blog.sqlite`.

Jalankan test dengan:

```sh
npm test
```

## Struktur file

- `src/app.js` — handler Worker, halaman publik dan admin, serta tiga artikel
  awal yang otomatis dimasukkan ke D1 yang masih kosong.
- `dev-server.js` — server Node.js lokal, pemuatan `.dev.vars`, dan adapter
  SQLite untuk pengembangan.
- `schema.sql` — skema SQLite yang digunakan server lokal.
- `migrations/0001_posts.sql` — migrasi awal tabel dan indeks untuk D1.
- `wrangler.toml` — konfigurasi Worker dan binding database D1.
- `test/blog.test.js` — pengujian fungsi, halaman, dan autentikasi admin.
- `.dev.vars.example` — contoh nama variabel konfigurasi lokal.
- `package.json` — skrip `dev` dan `test`, serta versi minimum Node.js.

## Siapkan D1

Pastikan Wrangler sudah terautentikasi ke akun Cloudflare yang berisi database
`nazuaf-blog`, lalu terapkan migrasi ke database jarak jauh:

```sh
npx wrangler d1 migrations apply nazuaf-blog --remote
```

Untuk menjalankan SQL langsung terhadap D1, gunakan `wrangler d1 execute`.
Contohnya, periksa artikel yang tersimpan:

```sh
npx wrangler d1 execute nazuaf-blog --remote \
  --command="SELECT id, slug, title, status FROM posts ORDER BY id;"
```

Untuk menerapkan SQL dari file, ganti `--command` dengan
`--file=PATH_KE_FILE.sql`. Gunakan migrasi untuk perubahan skema yang ingin
Anda lacak; `schema.sql` dipakai oleh server lokal.

## Seed artikel

Saat Worker pertama kali menerima request, aplikasi memasukkan tiga artikel
contoh dari `src/app.js` jika tabel `posts` kosong. Jika tabel sudah berisi
setidaknya satu baris, seed otomatis tidak dijalankan. Artikel selanjutnya
dapat dibuat melalui `/admin`: masuk, pilih **Tulis baru**, isi tulisan, lalu
simpan sebagai draft atau terbitkan.

## Deploy ke Cloudflare

1. Terapkan migrasi D1 seperti pada bagian [Siapkan D1](#siapkan-d1).
2. Tetapkan rahasia produksi di Worker. Gunakan nilai rahasia yang kuat dan
   jangan masukkan nilainya ke README, source code, atau Git:

   ```sh
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   ```

   Wrangler meminta setiap nilai secara interaktif. `ADMIN_PASSWORD` mengatur
   password masuk admin; `SESSION_SECRET` menandatangani sesi. Tetapkan
   keduanya sebelum deploy. Worker memiliki fallback untuk pengembangan jika
   rahasia tidak tersedia, sehingga jangan deploy tanpa rahasia produksi.
3. Deploy Worker:

   ```sh
   npx wrangler deploy
   ```

Konfigurasi nama Worker, entry point, dan binding D1 berada di `wrangler.toml`.
