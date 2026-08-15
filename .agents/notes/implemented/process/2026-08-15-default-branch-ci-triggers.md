# Agent Note: Default-branch CI triggers across the branch rename

Status: implemented

English | [中文](2026-08-15-default-branch-ci-triggers.zh.md)

## Problem

The repository's default branch moves from `master` to `main`. Seven workflows key their push lane to a literal branch name, and three `ci.yml` jobs additionally guard on `github.ref == 'refs/heads/master'`. Renaming the default branch does not rewrite those literals, so the whole push lane — post-merge CI, documentation deployment, both release pack sequences, the sandbox proofs, and the two self-hosted standby drills — stops firing while pull-request checks keep passing, which reads as a healthy repository.

Actions cache scoping sharpens the failure. `wine-apt-cache` and `serial-linux` exist to populate the default-branch cache scope that every pull request's job restores from. A job pinned to a branch that is no longer the default cannot serve that purpose: the branch stops receiving merges, so the job stops running, and a save from any non-default ref lands in a scope no pull request reads.

## Decision

Every push-triggered workflow lists both names, `branches: [main, master]`, and the three `ci.yml` job guards accept either ref through an explicit disjunction. Both names are listed so that this change and the default-branch rename are independent events: the push lane covers whichever branch is default at any moment, in either order, with no window where nothing runs.

Comments that named `master` as the branch now name the default branch, because the branch name was never the operative fact — cache scope, merge cadence, and standby-drill frequency all follow whichever branch is default.

## Alternatives considered

**Point the triggers at `main` only.** This couples the workflow change to the exact moment of the rename. Landing it first kills the push lane on the still-default `master`; landing it after leaves a window with no post-merge CI. Listing both removes the ordering constraint.

**Resolve the default branch dynamically.** `on.push.branches` accepts no expressions, and no default-branch context exists at trigger-parse time. A job-level `if:` could compare against `github.event.repository.default_branch`, but the trigger itself cannot, so the branch name would remain a literal in seven files while the mechanism grew a second form.

**Drop the push lane and rely on pull-request checks.** The post-merge lanes prove what a pull request cannot: default-branch cache seeding, both pack sequences against the merged tree, and the standby drills that keep the self-hosted pools demonstrably ready to take over a required lane.

**Keep `master` as the default and fast-forward it after each merge.** This preserves every literal but makes the default branch a mirror that any direct push to `main` silently desynchronizes, and it keeps the repository's advertised branch different from the branch pull requests target.

## Consequences

The push lane fires on both branches while both exist, so a repository carrying two live branch heads runs its post-merge lanes twice. That cost is bounded by the rename: once `main` is default and `master` is deleted, `master` leaves the seven trigger lists and the three guards, and the dual listing has no remaining function. The prose that now names the default branch stays accurate through the rename and needs no further edit.

Workflows keyed to tags or to `pull_request` alone are untouched. Repository documentation still names `origin/master` where it describes external maintenance tooling; those references resolve against the branch that tooling actually fetches and are outside this change.
