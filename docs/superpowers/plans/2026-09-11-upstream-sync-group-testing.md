# Upstream Sync and Group Project Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menggabungkan lima commit terbaru dari repository pusat tanpa kehilangan konfigurasi deployment GCP, lalu menyediakan runbook pengujian empat peserta pada satu project kelompok.

**Architecture:** Riwayat fork dipertahankan melalui merge pada branch khusus. Kode aplikasi mengikuti struktur upstream, sedangkan konfigurasi Docker, Nginx, Cloud Build, dan path `/portal/` dipertahankan serta diuji kembali. Runbook kelompok hanya mengatur koordinasi resource bersama dan nama unik.

**Tech Stack:** Git, GitHub, Next.js 16, Node.js test runner, Prisma, Docker, Docker Compose, Nginx, Cloud Build, Markdown, dan Google Cloud CLI.

## Global Constraints

1. Repository pusat adalah `https://github.com/matiurari/personal-geoportal.git` dengan branch `main`.
2. Repository fork memakai remote `origin` melalui alias SSH `github-dhanypedia`.
3. Commit `2556441` adalah baseline deployment yang sudah berhasil diuji.
4. Kode aplikasi mengikuti upstream. Pipeline deployment fork dipertahankan selama tetap kompatibel.
5. Folder `src/app/web-internal` tidak boleh diaktifkan kembali. Struktur aktif adalah `src/app/internal`.
6. Tidak boleh ada `.env`, token, key JSON, atau kredensial lain dalam commit dan output.
7. Prosa runbook memakai Bahasa Indonesia dan mengikuti aturan penggunaan dash pada workspace pelatihan.
8. Pekerjaan lokal tidak membuat, mengubah, atau menghapus resource GCP.

---

### Task 1: Siapkan baseline dan branch sinkronisasi

**Files:**

- Verify: seluruh working tree `/Users/dhanypedia/personal-geoportal-testing`
- Reference: `docs/superpowers/specs/2026-09-11-upstream-sync-group-testing-design.md`

**Interfaces:**

- Consumes: branch `main`, commit `2556441`, dan repository upstream publik.
- Produces: tag `gcp-tested-20260911`, remote `upstream`, dan branch `sync-upstream-20260911`.

- [ ] **Step 1: Pastikan working tree bersih**

```bash
cd /Users/dhanypedia/personal-geoportal-testing
git status --short --branch
git log -3 --oneline
```

Expected: tidak ada file tidak terlacak atau perubahan lokal.

- [ ] **Step 2: Tandai baseline deployment teruji**

```bash
git tag gcp-tested-20260911 2556441
git show --no-patch --oneline gcp-tested-20260911
```

Expected: tag menunjuk ke `2556441 fix: align portal trailing slash`.

- [ ] **Step 3: Tambahkan atau perbarui remote upstream**

```bash
if git remote get-url upstream >/dev/null 2>&1; then
  git remote set-url upstream https://github.com/matiurari/personal-geoportal.git
else
  git remote add upstream https://github.com/matiurari/personal-geoportal.git
fi

git fetch upstream main
git remote -v
```

Expected: `upstream/main` menunjuk ke repository pusat.

- [ ] **Step 4: Buat branch sinkronisasi**

```bash
git switch -c sync-upstream-20260911
git status --short --branch
```

Expected: branch aktif adalah `sync-upstream-20260911` dan working tree bersih.

### Task 2: Merge upstream dan selesaikan perubahan struktur aplikasi

**Files:**

- Delete: `src/app/web-internal/layout.js`
- Delete: `src/app/web-internal/page.js`
- Verify: `.gitignore`
- Verify: `src/app/internal/layout.js`
- Verify: `src/app/internal/page.js`
- Verify: seluruh file yang dibawa oleh lima commit `upstream/main`

**Interfaces:**

- Consumes: `upstream/main` dan branch sinkronisasi dari Task 1.
- Produces: satu merge commit tanpa file konflik dan tanpa mengembalikan route lama.

- [ ] **Step 1: Mulai merge upstream**

```bash
git merge --no-ff upstream/main
```

Expected: merge berhenti dengan konflik `modify/delete` pada dua file di `src/app/web-internal`.

- [ ] **Step 2: Pastikan daftar konflik sesuai simulasi**

```bash
git diff --name-only --diff-filter=U
```

Expected:

```text
src/app/web-internal/layout.js
src/app/web-internal/page.js
```

Jika ada konflik tambahan, periksa fungsi file sebelum melanjutkan. Kode aplikasi mengikuti upstream. File deployment mengikuti fork jika tidak merusak build aplikasi.

- [ ] **Step 3: Ikuti penghapusan route lama**

```bash
git rm src/app/web-internal/layout.js
git rm src/app/web-internal/page.js
```

Expected: kedua file tercatat sebagai terhapus dan `src/app/internal` tetap tersedia.

- [ ] **Step 4: Periksa hasil resolusi**

```bash
git diff --name-only --diff-filter=U
git status --short
git diff --check --cached
test -f src/app/internal/layout.js
test -f src/app/internal/page.js
test ! -e src/app/web-internal/layout.js
test ! -e src/app/web-internal/page.js
```

Expected: tidak ada konflik atau whitespace error.

- [ ] **Step 5: Selesaikan merge**

```bash
git commit -m "merge: sync upstream main"
git log --oneline --decorate --graph -12
```

Expected: commit upstream dan commit deployment fork tetap ada dalam riwayat.

### Task 3: Verifikasi aplikasi dan pipeline deployment

**Files:**

- Verify: `package.json`
- Verify: `package-lock.json`
- Verify: `tests/next-config.test.mjs`
- Verify: `next.config.mjs`
- Verify: `Dockerfile`
- Verify: `docker-compose.yml`
- Verify: `nginx.conf`
- Verify: `cloudbuild.yaml`
- Modify: hanya file deployment yang gagal karena perubahan upstream

**Interfaces:**

- Consumes: hasil merge bersih dari Task 2.
- Produces: aplikasi yang lolos test, build Next.js, build Docker, validasi Compose, dan pemeriksaan Cloud Build.

- [ ] **Step 1: Pasang dependency sesuai lockfile**

```bash
npm ci
```

Expected: instalasi selesai dan Prisma Client dibuat oleh `postinstall`.

- [ ] **Step 2: Jalankan test konfigurasi deployment**

```bash
node --test tests/next-config.test.mjs
```

Expected: `output`, `basePath`, dan `trailingSlash` memiliki nilai yang sudah diuji.

- [ ] **Step 3: Jalankan build produksi**

```bash
npm run build
```

Expected: `prisma generate` dan `next build` selesai dengan exit code 0.

- [ ] **Step 4: Validasi Docker Compose**

```bash
NEXTJS_IMAGE="asia-southeast2-docker.pkg.dev/example-project/katalog-images/nextjs-hifni:test" \
  docker compose config --quiet
```

Expected: konfigurasi valid tanpa error variabel image kosong.

- [ ] **Step 5: Build image Docker lokal**

```bash
docker build -t personal-geoportal:sync-test .
```

Expected: image Next.js standalone selesai dibangun.

- [ ] **Step 6: Validasi Cloud Build dan Nginx**

```bash
ruby -e 'require "yaml"; YAML.load_file("cloudbuild.yaml", aliases: true)'
rg -n '_IMAGE_NAME|_VM_NAME|_VM_ZONE|_VM_APP_DIR|NEXTJS_IMAGE' cloudbuild.yaml
rg -n 'basePath|trailingSlash|standalone' next.config.mjs
rg -n 'location /|proxy_pass http://nextjs:3000' nginx.conf
```

Expected: YAML valid, substitution deployment digunakan, dan Nginx memproksi seluruh path.

- [ ] **Step 7: Pastikan merge tidak membawa secret**

```bash
git diff gcp-tested-20260911..HEAD -- . ':!package-lock.json' | \
  rg -n 'BEGIN PRIVATE KEY|ghp_|github_pat_|DATABASE_URL=.*@|NEXTAUTH_SECRET=.+' || true
git ls-files | rg '(^|/)\.env$|\.pem$|\.key$|service-account.*\.json$' || true
```

Expected: tidak ada private key, token, URL database hidup, `.env`, atau key Service Account.

- [ ] **Step 8: Commit hanya jika deployment perlu disesuaikan**

```bash
git diff --check
git status --short
git add Dockerfile cloudbuild.yaml docker-compose.yml next.config.mjs nginx.conf tests/next-config.test.mjs
git commit -m "fix: preserve GCP deployment"
```

Expected: commit dilewati jika tidak ada file deployment yang berubah.

### Task 4: Buat runbook pengujian empat peserta

**Files:**

- Create: `/Users/dhanypedia/Pelatihan WebGIS BIG/gcp-setup/panduan-uji-project-kelompok.md`
- Modify: `/Users/dhanypedia/Pelatihan WebGIS BIG/gcp-setup/panduan-akun-master.md`
- Modify: `/Users/dhanypedia/Pelatihan WebGIS BIG/gcp-setup/panduan-akun-peserta.md`
- Modify: `/Users/dhanypedia/Pelatihan WebGIS BIG/docs-md/00-INDEX.md`

**Interfaces:**

- Consumes: pola nama unik dari panduan akun master dan variabel dari panduan akun peserta.
- Produces: runbook koordinasi yang menautkan panduan utama tanpa mengulang seluruh deployment.

- [ ] **Step 1: Gunakan mapping Kelompok A**

| Kode | Email | Slug |
|---|---|---|
| A01 | `hifninazih111@gmail.com` | `hifni` |
| A02 | `kokodontrue@gmail.com` | `koko` |
| A03 | `rezafahlevi464@gmail.com` | `reza` |
| A04 | `dhanypedia@gmail.com` | `dhany` |

Nilai bersama:

```bash
PROJECT_ID="geoportal-kelompok-a-926500"
REGION="asia-southeast2"
ZONE="asia-southeast2-b"
REPOSITORY="katalog-images"
APP_DIR="/opt/webgis/app"
```

- [ ] **Step 2: Dokumentasikan resource bersama dan unik**

Resource bersama adalah API, VPC default, firewall, network tag, Artifact Registry, dan budget alert. Gunakan pola unik berikut:

```text
VM                 webgis-SLUG
Service Account    cb-deployer-SLUG
GitHub connection  github-SLUG
Linked repository  repo-SLUG
Trigger            deploy-SLUG
Image              katalog-images/nextjs-SLUG
Static IP           webgis-ip-SLUG
DNS zone            geoportal-SLUG
Domain              domain milik peserta
```

Path `/opt/webgis/app` dan nama Docker Compose `app` boleh sama karena setiap peserta memakai VM berbeda.

- [ ] **Step 3: Tambahkan pre-check bersama**

```bash
gcloud config set project "$PROJECT_ID"
gcloud services list --enabled --format="value(config.name)"
gcloud artifacts repositories describe "$REPOSITORY" --location="$REGION"
gcloud compute firewall-rules list \
  --filter="name:(allow-webgis-http OR allow-webgis-iap-ssh)"
gcloud compute instances list
gcloud iam service-accounts list
gcloud builds connections list --region="$REGION"
gcloud builds triggers list --region="$REGION"
```

Expected: resource bersama tersedia dan nama unik peserta belum bertabrakan.

- [ ] **Step 4: Tambahkan urutan dan kriteria pengujian**

Urutan: tetapkan slug, buat Service Account dan VM, hubungkan GitHub, buat trigger, jalankan deployment pertama secara bergiliran, lalu uji push bersamaan. Kriteria lulus mencakup empat VM, empat trigger berhasil, empat URL `/portal/`, isolasi image, dan semua VM dapat dihentikan tanpa mengubah resource bersama.

- [ ] **Step 5: Tautkan runbook**

Tambahkan satu tautan singkat pada panduan master, panduan peserta, dan `docs-md/00-INDEX.md`. Jangan menyalin ulang isi runbook.

- [ ] **Step 6: Validasi Markdown**

```bash
cd "/Users/dhanypedia/Pelatihan WebGIS BIG"
for file in \
  gcp-setup/panduan-uji-project-kelompok.md \
  gcp-setup/panduan-akun-master.md \
  gcp-setup/panduan-akun-peserta.md \
  docs-md/00-INDEX.md
do
  count="$(awk '/^```/{n++} END{print n+0}' "$file")"
  test "$((count % 2))" -eq 0
done

rg -n ' — | - ' gcp-setup/panduan-uji-project-kelompok.md || true
rg -n 'TODO|TBD|PLACEHOLDER' gcp-setup/panduan-uji-project-kelompok.md || true
```

Expected: code fence berpasangan dan tidak ada placeholder atau dash sebagai penghubung kalimat.

### Task 5: Integrasikan dan push fork

**Files:**

- Verify: seluruh repository aplikasi
- Verify: runbook dan tautan pada workspace pelatihan

**Interfaces:**

- Consumes: merge terverifikasi dan runbook tervalidasi.
- Produces: branch `main` fork yang sinkron dan tag baseline pada remote `origin`.

- [ ] **Step 1: Jalankan pemeriksaan akhir**

```bash
cd /Users/dhanypedia/personal-geoportal-testing
node --test tests/next-config.test.mjs
npm run build
NEXTJS_IMAGE="asia-southeast2-docker.pkg.dev/example-project/katalog-images/nextjs-hifni:test" \
  docker compose config --quiet
git diff --check main..HEAD
git status --short --branch
```

Expected: semua pemeriksaan berhasil dan working tree bersih.

- [ ] **Step 2: Pastikan kedua riwayat tergabung**

```bash
git merge-base --is-ancestor upstream/main HEAD
git merge-base --is-ancestor gcp-tested-20260911 HEAD
git log --oneline --decorate --graph -20
```

Expected: kedua pemeriksaan ancestry selesai dengan exit code 0.

- [ ] **Step 3: Majukan main ke hasil sinkronisasi**

```bash
git switch main
git merge --ff-only sync-upstream-20260911
```

Expected: `main` maju tanpa merge tambahan.

- [ ] **Step 4: Push memakai alias GitHub Dhanypedia**

```bash
git remote get-url origin
git push origin main
git push origin gcp-tested-20260911
```

Expected: origin memakai `git@github-dhanypedia:dhanypedia/personal-geoportal-testing.git`, branch `main` terbarui, dan tag baseline tersedia.

- [ ] **Step 5: Laporkan hasil akhir**

Catat hash merge, hasil test, hasil build, konflik yang diselesaikan, link runbook, serta konfirmasi bahwa tidak ada resource GCP yang diubah.
