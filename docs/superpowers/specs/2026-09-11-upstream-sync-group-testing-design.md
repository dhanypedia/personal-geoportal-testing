# Desain Sinkronisasi Upstream dan Pengujian Project Kelompok

Tanggal: 11 September 2026

## Tujuan

Fork `dhanypedia/personal-geoportal-testing` tetap mengikuti perkembangan
`matiurari/personal-geoportal` tanpa kehilangan konfigurasi deployment Google Cloud
Platform (GCP) yang sudah berhasil diuji. Dokumentasi pelatihan juga memperoleh satu
runbook singkat untuk menguji empat deployment di dalam satu project kelompok.

## Ruang lingkup

Pekerjaan mencakup dua hasil:

1. Sinkronisasi lima commit terbaru dari branch `main` upstream ke fork.
2. Pembuatan `gcp-setup/panduan-uji-project-kelompok.md` pada workspace pelatihan.

Pekerjaan tidak mengubah resource GCP yang sedang berjalan dan tidak menjalankan
deployment ke VM.

## Strategi sinkronisasi

Sinkronisasi dilakukan melalui branch `sync-upstream-20260911`. Kondisi branch `main`
sebelum merge ditandai dengan tag lokal `gcp-tested-20260911` agar hasil deployment yang
sudah teruji mudah ditemukan kembali.

Remote upstream memakai repository publik
`https://github.com/matiurari/personal-geoportal.git`. Merge dilakukan dengan riwayat
commit tetap utuh. Pendekatan reset tidak digunakan karena akan menghapus sembilan commit
deployment pada fork.

## Aturan resolusi konflik

Simulasi merge menemukan konflik pada dua file:

1. `src/app/web-internal/layout.js`
2. `src/app/web-internal/page.js`

Upstream menghapus folder `src/app/web-internal`, sedangkan fork sudah memiliki struktur
pengganti pada `src/app/internal`. Resolusi mengikuti penghapusan upstream untuk kedua file
tersebut. Struktur `src/app/internal` menjadi sumber aktif.

File deployment berikut dipertahankan selama tidak bertentangan dengan perubahan aplikasi
upstream:

1. `.dockerignore`
2. `.env.example`
3. `Dockerfile`
4. `cloudbuild.yaml`
5. `docker-compose.yml`
6. `next.config.mjs`
7. `nginx.conf`
8. test konfigurasi deployment

Jika upstream mengubah dependency atau struktur build sehingga konfigurasi deployment
tidak lagi valid, konfigurasi deployment disesuaikan tanpa mengembalikan folder
`web-internal`.

## Runbook pengujian project kelompok

Runbook baru berfungsi sebagai lembar koordinasi asisten. Dokumen tidak mengulang semua
perintah pada panduan akun peserta. Isinya mencakup:

1. Project ID, region, dan zone kelompok.
2. Mapping email, kode peserta, dan slug unik.
3. Daftar resource bersama.
4. Pola nama unik untuk VM, Service Account, GitHub connection, linked repository,
   trigger, image, static IP, DNS zone, dan domain.
5. Urutan pre-check, deployment, pemeriksaan benturan, dan cleanup.
6. Kriteria lulus untuk empat deployment yang berjalan pada project yang sama.

Runbook menautkan panduan akun master dan panduan akun peserta sebagai sumber langkah
lengkap. Temuan error baru tetap dicatat pada `docs-md/troubleshooting.md` sesuai aturan
workspace pelatihan.

## Alur kerja

1. Buat tag pengaman dan branch sinkronisasi.
2. Tambahkan atau perbarui remote upstream.
3. Fetch `upstream/main`.
4. Merge upstream dan selesaikan konflik sesuai aturan di atas.
5. Instal dependency bila diperlukan.
6. Jalankan test dan build aplikasi.
7. Periksa konfigurasi Docker dan Cloud Build.
8. Buat runbook pengujian project kelompok.
9. Tinjau diff akhir untuk memastikan secret tidak ikut masuk.
10. Merge hasil sinkronisasi ke `main` setelah semua pemeriksaan lulus.

## Penanganan kegagalan

Jika test atau build gagal karena perubahan upstream, perbaikan dilakukan pada branch
sinkronisasi. Jika penyebabnya belum dapat diselesaikan tanpa mengubah alur aplikasi,
branch `main` tetap berada pada commit teruji dan tag pengaman tidak diubah.

Jika merge menghasilkan konflik tambahan, setiap konflik diperiksa berdasarkan fungsi.
Perubahan upstream diprioritaskan untuk kode aplikasi. Perubahan fork diprioritaskan untuk
pipeline deployment, proxy Nginx, Docker Compose, serta integrasi GCP.

## Kriteria selesai

Pekerjaan dinyatakan selesai ketika:

1. Lima commit upstream sudah tergabung dalam riwayat fork.
2. Folder lama `src/app/web-internal` tidak kembali aktif.
3. Test dan build aplikasi berhasil.
4. Konfigurasi deployment tetap menunjuk ke path `/portal/` dan memakai variabel resource
   unik.
5. Tidak ada file environment atau kredensial yang masuk ke commit.
6. Runbook project kelompok tersedia dan konsisten dengan panduan master serta peserta.
