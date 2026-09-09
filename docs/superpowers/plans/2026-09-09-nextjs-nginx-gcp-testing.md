# Next.js + Nginx GCP Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the fork for a Next.js + Nginx deployment in `geoportal-testing`.

**Architecture:** Cloud Build builds a standalone Next.js image, pushes it to Jakarta Artifact Registry, then reaches the VM via IAP and redeploys the exact image tag. Nginx publishes `/portal/` and proxies it to Compose service `nextjs`.

**Tech Stack:** Next.js standalone, Docker, Docker Compose, Nginx, Cloud Build, Artifact Registry.

## Global Constraints

- Region: `asia-southeast2`; target project is `geoportal-testing`.
- Scope excludes GeoServer and PostGIS containers.
- Secrets stay in VM `.env`; values are never committed or printed.
- Preserve application base path `/portal`.

---

### Task 1: Safe Docker build context

**Files:** Modify `.dockerignore`.

- [ ] Run this failing check before the change:

```bash
test "$(grep -cx '.env\*' .dockerignore)" -eq 1
```

Expected: failure because the current file has duplicate `.env` lines.

- [ ] Replace duplicate `.env` and ineffective `.local` entries with exactly `.env*`.
- [ ] Re-run the same check; expect exit code 0.

### Task 2: VM runtime stack

**Files:** Create `docker-compose.yml`, `nginx.conf`, `.env.example`.

**Interfaces:** Compose uses `NEXTJS_IMAGE` and runtime variables from VM `.env`. Nginx exposes port 80 and forwards `/portal/` to `nextjs:3000` without removing the `/portal` prefix.

- [ ] Run this failing existence check:

```bash
test -f docker-compose.yml && test -f nginx.conf && test -f .env.example
```

Expected: failure because all files are absent.

- [ ] Add Compose services `nextjs` and `nginx`. The `nextjs` service uses `image: ${NEXTJS_IMAGE:?Set NEXTJS_IMAGE in .env}`, `env_file: .env`, and `restart: unless-stopped`. Nginx uses `nginx:1.27-alpine`, maps `80:80`, mounts `./nginx.conf` read-only, depends on `nextjs`, and restarts unless stopped.
- [ ] Add an Nginx HTTP server that redirects `/` to `/portal/` and uses `proxy_pass http://nextjs:3000;` inside `location /portal/`.
- [ ] Add `.env.example` with blank placeholders for `NEXTJS_IMAGE`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NEXTAUTH_SECRET`, and `AUTH_API_URL`; state that the VM `.env` is never committed.
- [ ] Verify with these commands:

```bash
rg -q '^  nextjs:' docker-compose.yml
rg -q '^  nginx:' docker-compose.yml
rg -q '80:80' docker-compose.yml
rg -q 'location /portal/' nginx.conf
rg -q 'proxy_pass http://nextjs:3000;' nginx.conf
rg -q '^NEXTJS_IMAGE=' .env.example
```

### Task 3: Parameterized Cloud Build

**Files:** Modify `cloudbuild.yaml`.

**Interfaces:** Built-in substitutions are `$PROJECT_ID` and `$SHORT_SHA`; trigger values are `_VM_NAME`, `_VM_ZONE`, and `_VM_APP_DIR`.

- [ ] Run this failing check:

```bash
! rg -q 'project-2cd93730|matiurari0|latihan-web-gis' cloudbuild.yaml
```

Expected: failure because instructor-specific values remain.

- [ ] Replace image paths with `${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/${_IMAGE_NAME}:$SHORT_SHA`; default `_REGION` to `asia-southeast2`, `_REPOSITORY` to `katalog-images`, and `_IMAGE_NAME` to `nextjs-app`.
- [ ] Use `${_VM_NAME}`, `${_VM_ZONE}`, and `${_VM_APP_DIR}` in `gcloud compute ssh`. Inject the exact `$SHORT_SHA` image tag into both `docker compose pull nextjs` and `docker compose up -d nextjs` through `NEXTJS_IMAGE`.
- [ ] Set `dynamicSubstitutions: true` and retain `logging: CLOUD_LOGGING_ONLY`.
- [ ] Verify with these commands:

```bash
! rg -q 'project-2cd93730|matiurari0|latihan-web-gis' cloudbuild.yaml
rg -q '\$PROJECT_ID' cloudbuild.yaml
rg -q '\$SHORT_SHA' cloudbuild.yaml
rg -q '_VM_NAME' cloudbuild.yaml
rg -q '_VM_ZONE' cloudbuild.yaml
rg -q '_VM_APP_DIR' cloudbuild.yaml
```

### Task 4: Validation and commit

**Files:** Task 1-3 deployment files only.

- [ ] Run `npm ci`, then `npm run build`. If a build-time variable is missing, report only its name, never its value.
- [ ] Run Nginx syntax validation:

```bash
docker run --rm -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine nginx -t
```

- [ ] Review changed files before committing:

```bash
git diff --check
git status --short
git diff -- .dockerignore docker-compose.yml nginx.conf .env.example cloudbuild.yaml
```

- [ ] Commit only after every validation passes:

```bash
git add .dockerignore docker-compose.yml nginx.conf .env.example cloudbuild.yaml
git commit -m "chore: prepare GCP testing deployment"
```
