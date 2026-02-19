# Release Guide (Sokki)

This document describes the manual release process for Sokki.

---

## Overview

- Repository: GitHub (`origin`)
- Branch strategy:
  - `main`: stable / release branch
  - `dev`: development branch
  - `release/vX.Y.Z`: temporary release preparation branch
- Version format: `vX.Y.Z` (example: `v0.3.0`)
- Distribution: GitHub Releases (attach `.dmg` and `.zip`)

---

## Pre-release Checklist

Make sure:

- Your working tree is clean:

  ```bash
  git status
  ```

- Local branches are up to date:

  ```bash
  git fetch origin --prune
  git checkout dev && git pull origin dev
  git checkout main && git pull origin main
  ```

---

## Release Procedure

### 1. Create a release branch (from dev)

```bash
git checkout dev
git pull origin dev
git checkout -b release/vX.Y.Z
git push -u origin release/vX.Y.Z
```

---

### 2. Update version & prepare release notes

Update version in:

- `src-tauri/tauri.conf.json`
- `CHANGELOG.md` (if applicable)

```bash
git add -A
git commit -m "chore: release vX.Y.Z"
git push
```

---

### 3. Build (local)

```bash
npm ci
npm run tauri build
```

Build artifacts (example):

```
src-tauri/target/release/bundle/dmg/*.dmg
src-tauri/target/release/bundle/zip/*.tar.gz
```

---

### 4. Merge into main

**Option A: Merge locally**

```bash
git checkout main
git pull origin main
git merge --no-ff release/vX.Y.Z
git push origin main
```

**Option B: Merge via GitHub PR**

- Create PR: `release/vX.Y.Z` → `main`
- Merge on GitHub
- Then sync locally:

```bash
git checkout main
git pull origin main
```

---

### 5. Tag the release (on main)

Make sure you are on the latest main:

```bash
git checkout main
git pull origin main
git tag vX.Y.Z
git push origin vX.Y.Z
```

Verify:

```bash
git show vX.Y.Z
```

---

### 6. Create GitHub Release

- Go to GitHub → Releases → Draft a new release
- Tag: `vX.Y.Z`
- Title: `vX.Y.Z`
- Attach `.dmg` and `.zip`
- Write release notes (optional but recommended)

---

### 7. Delete release branch (optional but recommended)

```bash
git branch -d release/vX.Y.Z
git push origin --delete release/vX.Y.Z
```

---

## After Release: Resume Development

Sync dev with the latest main:

```bash
git checkout dev
git pull origin dev
git merge --no-ff main
git push origin dev
```

Then start a new feature branch:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/short-description
git push -u origin feature/short-description
```

---

## Common Mistakes

- Forgetting to push the tag:

  ```bash
  git push origin vX.Y.Z
  ```

- Tagging the wrong commit:

  ```bash
  git tag -d vX.Y.Z
  git push origin :refs/tags/vX.Y.Z
  ```

- Tagging before merging into main

  Always tag the release commit on main.
