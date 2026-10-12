# Agent Note: NousAI container image

Status: implemented

English | [中文](2026-08-18-nousai-container-image.zh.md)

## Problem

Deploying the NousAI web surface means reproducing a working monorepo checkout: build `lib/`, build the NousAI frontend dist, and install a web profile whose bundle graph links three fork-only workspace packages. Two of those steps fail silently when done naively — `dsh plugin install` with no manifest scaffolds a *default* profile and exits zero, yielding a healthy-looking stock DeepSeek surface, and the nousai bundle's `workspace:^` sibling ranges cannot resolve from a profile outside the monorepo, so first boot dies on a missing package.

## Decision

A two-stage OCI image (`Dockerfile`, `docker/`) builds identically under Podman and Docker. The build stage compiles the workspace (`build:native-system` for the flock addon that session write locks require, then `build:lib` + `build:web:nousai`) and resolves the profile bundle graph into a throwaway `DSH_HOME` seed at `/opt/dsh-seed`, writing the profile manifest (`docker/profile-package.json`) *before* running `dsh plugin install` so the default-profile scaffold can never occur, and linking all three fork packages explicitly (`link:/app/...`) because `workspace:^` does not survive leaving the workspace. The build fails unless every NousAI package is linked into the seeded profile — both silent failure modes are converted to loud build failures.

The build context excludes `.git`, and `build:lib`'s Desktop bundle step runs `git rev-parse HEAD` when neither `DSH_CLIENT_VERSION` nor `DSH_CLIENT_COMMIT_HASH` is set, so the build stage takes the source commit as a required build argument: `podman build --build-arg DSH_CLIENT_COMMIT_HASH="$(git rev-parse HEAD)" .`. A missing or empty argument stops the build before the source is copied in; `scripts/client-build-environment.ts` rejects a value that is not a 7 to 40 character hexadecimal commit hash.

The runtime stage carries the built `/app` and the seed. `docker/entrypoint.sh` copies the seed into the mounted `/data` volume only when the profile is absent, writes an LM Studio provider settings file only when it is absent, re-links the profile against the current image (visible warning, boot continues on failure), and execs `dsh web --host <interface address> --port 3080 --public-url $DSH_PUBLIC_URL --no-open`. The `webserver` config rejects every wildcard bind (`0.0.0.0`, `::`) at load, so the entrypoint resolves the container's own non-loopback IPv4 interface address with Node at each boot, because the engine may assign a different one per run; the exposure a network bind carries is kept in check by publishing to loopback only (`-p 127.0.0.1:3080:3080`). `DSH_PUBLIC_URL` (default `http://127.0.0.1:3080/`, the documented publish mapping) is the root the printed URL, `DSH_WEB_URL`, and the web-surface prompt advertise. A volume seeded by an image before 0.2.1-alpha.2 carries a `webserver` patch binding `0.0.0.0`; the entrypoint deletes that patch while its text is still the seeded text and leaves an edited one alone, which then fails loud at load. On SELinux-enforcing hosts (including `podman machine`'s Fedora CoreOS VM) the volume mount needs `:Z`; without it a second container reusing the volume draws a different MCS category and the seed copy fails on `Permission denied`.

The image ships the whole workspace including devDependencies: dsh resolves its profile bundles out of its installation tree, and `dsh plugin install` shells out to pnpm, so neither survives pruning. The build context excludes root `.env` — the documented `DEEPSEEK_API_KEY` home — so `COPY . .` cannot bake credentials into the image.

## Sandbox posture

In a rootless container neither Linux sandbox rung works: bwrap cannot create a nested user namespace, and the Landlock launcher binary is a release-workflow prebuilt that `pnpm install` does not produce, so the functional probe reports `unusable` even on a Landlock-capable kernel (ABI 9 measured). Boot and model turns are unaffected; shell commands raise `SANDBOX_UNAVAILABLE`. The deployment either sets `DSH_PERMISSION_MODE=danger-full-access` and treats the container as the boundary, or adds a build stage running `native/system`'s `build:native`. Deliberately unresolved in the image: it is a security-posture decision, not a build detail. Reintroduction condition: deciding the in-container sandbox stance adds the launcher build stage (or a prebuilt fetch) and drops this paragraph.

## Alternatives considered

**Resolve the bundle graph on first boot instead of at build time.** Requires network and a registry at container start, and re-opens the default-profile scaffold trap on every fresh volume. The build-time seed boots offline and is asserted once, at image build.

**Prune devDependencies for a smaller runtime image.** dsh resolves profile bundles from its installation tree and `dsh plugin install` shells out to pnpm; pruning breaks both. The size cost buys a runtime that can re-link and extend its own profile.

**`--privileged` to restore the bwrap sandbox rung.** Trades container isolation away to regain in-container isolation — the wrong direction; `--security-opt seccomp=unconfined` does not help.

**Seed a `webserver` profile patch with the bind.** Images before 0.2.1-alpha.2 did this with `host: '0.0.0.0'`, the one spelling that reached every interface without knowing the container's address. The schema rejects every wildcard since 0.2.1-alpha.1, and a concrete address written once into the volume goes stale when the engine assigns a different one to the next run; a `!!js` expression reading an environment variable would keep it current but moves a per-boot value into a user-owned file.

**Include `.git` in the build context.** Keeps the build command at `podman build .`, but adds the full Git history to every build context, and a checkout created by `git worktree` has a `.git` file that points outside the context, so its build would still fail.

**Set `DSH_CLIENT_VERSION` in the build step instead.** The Desktop bundle step then skips Git, so the plain `podman build .` works, but the client bundles embed the version, so General Settings shows a current-version row, and the image records no commit.

## Consequences

A fresh volume boots offline with the NousAI surface guaranteed by build-time assertions. The container is the security boundary until the sandbox decision lands — shell tools fail with `SANDBOX_UNAVAILABLE` under the default permission mode. Defaults are Podman-first: `host.containers.internal` needs an override or `--add-host` under Docker (noted in the entrypoint). Seeded files under `/data` are written only when absent, so user edits to the settings file and sessions survive restarts and image rebuilds; the bind and the advertised root travel with the image's entrypoint, and `DSH_PUBLIC_URL` is the one deployment knob.
