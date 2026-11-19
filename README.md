<<<<<<< HEAD
# Canvas Studio

Collaborative visual workspace prototype untuk **graphic design + infinite-style whiteboard**. Arah visual: bright neo-brutalism, cream canvas, black outlines, blue/lime/coral accents, tanpa maskot atau karakter.

## Fitur yang sudah ada

### Editor
- Canvas SVG dengan zoom, pan, dotted grid, smart-snap toggle, dan design / whiteboard mode.
- Select, pan, frame, text, rectangle, ellipse, line, arrow, pen/freehand, sticky note, comment card, image upload, dan eraser.
- Move, resize, rotate, duplicate, delete, lock, hide/show, layer ordering.
- Inspector: posisi X/Y, ukuran W/H, rotation, fill/text color, stroke, stroke width, opacity, corner radius, text content, font family, font size, weight, alignment.
- Layers, assets shelf, multiple pages, background settings.
- Undo/redo untuk perubahan editor utama; autosave lokal melalui localStorage.
- Export PNG, SVG, project JSON, dan browser print workflow untuk Save as PDF.
- Keyboard shortcuts: V, H, T, R, O, L, P, N, Ctrl/Cmd+D, Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Delete, Esc.

### Kolaborasi
- Share link dengan room code.
- Presence / daftar pengguna aktif.
- Live cursors dengan nama dan warna.
- Sinkronisasi add / edit / move / delete object dan page updates lewat WebSocket.
- BroadcastChannel fallback agar dua tab pada browser yang sama bisa saling melihat perubahan walau WebSocket belum dijalankan.
- Server room menyimpan dokumen ke `server/data/rooms.json`.
- Batas default 10 koneksi aktif per room (`MAX_ROOM_USERS`).

## Menjalankan di Windows / macOS / Linux

Butuh Node.js 20 atau lebih baru.

1. Extract folder proyek.
2. Buka Terminal / PowerShell pada folder `canvas-studio`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Buat file `.env` dari `.env.example` (untuk lokal, nilai default `ws://localhost:8787` sudah sesuai).
5. Jalankan frontend dan collaboration server:

   ```bash
   npm run dev:all
   ```

6. Buka `http://localhost:5173`.

Alternatif, jalankan dalam dua terminal:

```bash
npm run collab
npm run dev
```

## Mencoba kolaborasi di dua komputer dalam satu jaringan

1. Jalankan server di komputer host.
2. Cari IPv4 komputer host dengan `ipconfig` (Windows) atau `ip addr` (Linux).
3. Buat `.env` di root proyek pada komputer host:

   ```env
   VITE_COLLAB_WS_URL=ws://192.168.1.10:8787
   ```

   Ganti alamat contoh di atas dengan IPv4 host yang sebenarnya.
4. Restart `npm run dev:all` setelah mengubah `.env`.
5. Izinkan port `5173` dan `8787` melalui firewall komputer host.
6. Dari komputer lain di jaringan yang sama, buka `http://192.168.1.10:5173`.
7. Klik **Share**, salin invite link, lalu buka link itu dari komputer lain. Link membawa room code yang sama.

Untuk pengguna di internet, deploy frontend dan WebSocket server ke hosting yang mendukung WebSocket. Gunakan URL `wss://...` pada `VITE_COLLAB_WS_URL` untuk lingkungan HTTPS.

## Build production

```bash
npm run build
npm run preview
```

Frontend hasil build ada di `dist/`. Jalankan server kolaborasi secara terpisah dengan `npm run collab`.

## Catatan penting sebelum dipakai secara komersial

Ini adalah **fondasi MVP/prototype**, bukan layanan produksi siap menerima data rahasia. Kolaborasi menggunakan protokol room sederhana dengan urutan update server-side; jika dua orang mengedit properti objek yang sama pada saat bersamaan, perubahan terakhir yang sampai ke server akan menang. Untuk tahap produksi, pertimbangkan Yjs/CRDT, autentikasi akun, kontrol akses yang diverifikasi di server, invite token yang ditandatangani, rate limit, validasi payload, backup/version history di server, penyimpanan file cloud, observability, dan pengujian beban.

Pilihan permission di dialog Share pada prototype ini adalah rancangan UI dan belum menjadi kontrol keamanan server. Jangan membuka room sensitif ke publik sebelum autentikasi dan permission enforcement dibuat. File yang diunggah disimpan sebagai data URL di dokumen; untuk penggunaan besar, pindahkan ke object storage dan simpan referensinya.

Autosave lokal memakai browser storage. Export JSON adalah cara paling aman untuk backup proyek saat ini.
=======
# canvas-studio
>>>>>>> 8b747479ca81838074673971e4d42d5087351342
