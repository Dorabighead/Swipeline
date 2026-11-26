# M0 verification: external facts before implementation

**Date:** 2026-11-24. **Scope:** the checks the design plan asks for at the start
of M0 ([§17.3 naming](../swipeline-design-and-implementation-plan.md#173-name-check-checklist-do-before-creating-the-org),
[§10.6 security](../swipeline-design-and-implementation-plan.md#106-repository-security-settings-checklist),
[§11 CI/CD](../swipeline-design-and-implementation-plan.md#11-cicd-with-github-actions)).
Every claim below was checked directly against the registry, API or binary that
owns it on that date; the source is given so it can be re-checked.

## 1. Name availability

| Check | Result | Source |
|---|---|---|
| GitHub repository `JoeyHammoth/Swipeline` | Exists, **public**, issues and wiki enabled | GitHub REST `repos/JoeyHammoth/Swipeline` |
| GitHub organisation `swipeline` | 404 on a public request; unclaimed as far as that can tell (see the 2026-11-26 update for the caveat) | GitHub REST `orgs/swipeline` |
| npm `swipeline` | **Available** (registry 404) | `https://registry.npmjs.org/swipeline` |
| npm `create-swipeline` | **Available** (404) | `https://registry.npmjs.org/create-swipeline` |
| npm `@swipeline/core` | **Available** (404) | `https://registry.npmjs.org/@swipeline%2Fcore` |
| npm `swipeline-adapter-arxiv` | **Available** (404) | `https://registry.npmjs.org/swipeline-adapter-arxiv` |
| PyPI `swipeline` | **Available** (404) | `https://pypi.org/pypi/swipeline/json` |
| `swipeline.dev` | No HTTP response, not serving a site | HTTPS HEAD request |
| `swipeline.io` | No HTTP response, not serving a site | HTTPS HEAD request |

Not verified here, and still required before the first public announcement
(these need accounts or paid services, so they are tracked as an issue rather
than claimed):

- Trademark search in the relevant jurisdictions and software classes.
- Domain registration and social handle reservation.
- npm scope reservation: a scope only exists once an organisation is created on
  npm and a package is published under it.
- Text search on npm/PyPI/pub.dev for similarity beyond an exact name match.

**Decision (ADR-0010):** keep the personal repository through M0 and transfer to
the `swipeline` organisation before the first publish. GitHub redirects the old
URL after a transfer, so links in this repo and the docs survive.

## 2. Runtimes and tooling

Checked with `https://nodejs.org/dist/index.json` and the npm registry's
`/latest` documents.

| Fact | Verified value | Consequence |
|---|---|---|
| Active LTS lines | Node 24 "Krypton" (24.22.3), Node 26 "Lithium" (26.13.1) | `engines.node: ">=24"`; CI matrix `24` and `26` (not 22 — it is out of support) |
| Node 20 | End of life | Local dev on Node 20 cannot run the toolchain; the repo pins `.nvmrc` to 24 |
| pnpm | 12.23.0 | `packageManager: "pnpm@12.23.0"`; `pnpm/action-setup@v4`+ reads it from `package.json` |
| TypeScript | 7.0.2 (7.1 beta) | Native compiler. `tsc` is fine for typechecking, but compiler-API plugins are risky (see §5) |
| Vitest | 5.1.1 — requires `^22.12 \|\| ^24 \|\| >=26` | Confirms Node 24+ |
| tsup | 9.0.0 — requires `^22.18 \|\| ^24.11 \|\| >=26` | Build tool |
| tsdown | 0.23.7 | Viable alternative, not chosen (ADR-0011) |
| VitePress | **1.6.4 is still the latest stable** (no 2.x) | Docs build on VitePress 1.x; the plan's VitePress choice stands |
| Zod | 4.6.7 | Schema source of truth, JSON Schema export via `zod-to-json-schema` |
| @changesets/cli | 3.0.3 — requires npm `>=10.9`, pnpm `>=10`, Node `^22.11 \|\| ^24 \|\| >=26` | Release workflow must install a current npm before publishing |
| ESLint | 10.15.0 | Flat config, but `typescript-eslint` cannot parse TypeScript 7 (peer range `<6.1.0`) |
| typescript-eslint | 8.74.0 — peer `typescript >=4.8.4 <6.1.0` | Excludes ESLint while TS 7 is current; Biome chosen instead (ADR-0014) |
| Biome | 2.6.8 | Linter and formatter in one binary, parses TypeScript itself |
| Prettier | 3.10.1 | Not used; Biome formats (ADR-0014) |
| React | 19.3.1 | First binding target |
| Hono | 4.13.21 | Server runtime choice if the plan's Hono option is taken |
| fast-check | 4.11.0 | Property-based tests |
| Playwright | 1.65.1 | Binding conformance and e2e |
| publint / attw | 0.3.25 / 0.18.5 | Package linting |
| npm CLI installed with Node 24 | 11.19.1 | Satisfies trusted publishing's `>= 11.5.1` requirement |
| `sqlite-vec` npm | **0.1.9** — still pre-1.0 | Confirms it must not be the default vector path (ADR-0012) |
| `@huggingface/transformers` | 4.3.2 | Optional embedder provider |

## 3. GitHub Actions versions

Fetched from `repos/<owner>/<repo>/releases/latest`.

| Action | Latest release | Pinned in this repo as |
|---|---|---|
| `actions/checkout` | v7.0.1 | major tag, SHA-pinning is a follow-up (needs `gh api` to resolve SHAs) |
| `pnpm/action-setup` | v6.1.1 | major tag |
| `actions/setup-node` | v7.1.0 | major tag |
| `actions/configure-pages` | v6.0.0 | major tag |
| `actions/upload-pages-artifact` | v5.0.0 | major tag |
| `actions/deploy-pages` | v5.0.1 | major tag |
| `github/codeql-action` | `codeql-bundle-v2.27.5` is the latest *bundle* tag; the action major is `v4` | `v4` |
| `ossf/scorecard-action` | v2.6.0 | `v2` |
| `actions/dependency-review-action` | v5.0.1 | `v5` |
| `changesets/action` | v2.1.2 | `v2` |
| `actions/stale` | v11.0.0 | `v11` |

**Gap against the plan:** §10.6 and §11 require third-party actions pinned to
full commit SHAs. This repository pins major version tags for readability at
M0 because Dependabot cannot update a SHA pin without the resolved digest. The
hardening issue (`Pin GitHub Actions to commit SHAs`) is tracked; until it is
closed, the plan's own rule is not satisfied and the docs say so.

## 4. Repository settings observed

| Setting | Observed on 2026-11-24 | Action taken |
|---|---|---|
| Visibility | public | none needed |
| Default branch | `main` (empty until the first push) | trunk-based |
| Issues | enabled | labels and milestones created |
| Wiki | enabled, empty | seeded from the design docs |
| Discussions | disabled | enabled, for Q&A and "show your deck" |
| Secret scanning | enabled | none needed |
| Push protection | enabled | none needed |
| Dependabot security updates | **disabled** | enabled through the repository API |
| Dependabot alerts | not enabled | enabled through the repository API |
| Code scanning | none | CodeQL workflow added |
| Rulesets | none | ruleset added on `main` |
| Pages | not configured | enabled with GitHub Actions as the source |
| Default workflow permissions | read | verified; workflows declare their own `permissions` |

## 5. Decisions this verification forced

1. **Node 24+ only** (ADR-0011). Node 22 is out of support as of this date and
   Vitest 5 will not run on Node 20.
2. **`publint` + `arethetypeswrong` instead of `api-extractor`** (ADR-0011).
   TypeScript 7 is the native compiler; API-extractor depends on the compiler's
   JavaScript API, which is not a stable target yet.
3. **Biome replaces ESLint + Prettier** (ADR-0014): `typescript-eslint` declares
   `typescript <6.1.0`, so no ESLint TypeScript parser works with the current
   compiler. Biome has its own parser and also formats.
3. **VitePress 1.x** stays, since no 2.x exists (ADR-0009).
4. **`sqlite-vec` stays optional** (ADR-0012); 0.1.9 is still pre-1.0.
5. **Personal repo → org before publishing** (ADR-0010), because the org name is
   free but creating it is an account decision, not a code decision.
6. **Pin strategy staged** (§3): major tags now, SHA pins tracked as an issue.
7. **Biome for lint and format** (ADR-0014); the ESLint path is blocked by the
   `typescript-eslint` peer range until it supports TypeScript 7.

## 6. What remains open

| Item | Why it is still open | Where it is tracked |
|---|---|---|
| SHA-pinned actions | Needs a resolved digest per action, updated by Dependabot | Issue "Pin GitHub Actions to commit SHAs" |
| Trademark and domain checks | Requires manual/legal search | Issue "Complete the name-check checklist"; scope in the [trademark brief](2026-11-trademark-brief.md) |
| npm scope creation | Requires an npm organisation account | Blocked on the release milestone |
| First publish per package | Trusted publishers can only be configured for an existing package | M3 release task |
| Real `CODEOWNERS` handles | Only one maintainer today; placeholder team handles will fail validation | M0 uses the owner account |
| Social preview image | GitHub has no API for it; must be uploaded in the UI | Documented in the repo metadata issue |

## 7. Settings applied on 2026-11-24 (verified outcomes)

The table in §4 records what was observed *before* any changes. This section records
what actually happened, because two items behaved differently from the plan.

| Setting | Outcome |
|---|---|
| Repository description and topics | Applied (12 topics: swipe, recommendation, typescript, local-first, …) |
| Homepage | Set to the Pages URL |
| Discussions | Enabled |
| Dependabot alerts and security updates | Enabled (alerts endpoint returned 204, status now `enabled`) |
| CodeQL | Workflow runs on PRs, `main` and weekly; first analysis passed |
| Secret scanning, push protection | Already enabled, unchanged |
| Secret scanning **non-provider patterns** and **validity checks** | **Still disabled.** The repository PATCH accepted the request but the states did not change; these are not settable through the REST API for this repository |
| Pages | Enabled with `build_type: workflow`; the first deploy ran before Pages existed and failed at `configure-pages`, so the workflow was re-run after enabling |
| Rulesets | `main`: PR + 1 approval + CODEOWNERS + conversation resolution + required checks (Node 24, Node 26, DCO, Docs build) + linear history + no force push/deletion, admin bypass. Tags `refs/tags/v*`: deletion and force-update blocked |
| Environments | `npm-publish` (required reviewer, `main` only), `github-pages` (`main` only) |
| Merge settings | Squash only, delete branch on merge, PR title as commit subject |
| Default workflow permissions | Read-only, cannot approve PRs |

### Two deviations worth remembering

1. **GitHub dependency review was unavailable when this was recorded.** The
   dependency-graph compare API returned 403 and `/dependency-graph/sbom`
   returned 404 even though the default branch has a committed `pnpm-lock.yaml`.
   Both endpoints resolved on 2026-11-25, so `dependency-review.yml` runs on every
   pull request again, with `pnpm audit --prod --audit-level=high` kept as the
   second gate (issue #27).
2. **Secret-scanning extras are not API-settable** on this repository. They remain
   disabled and must be enabled in Settings → Code security if the plan's checklist
   is to be complete.

## Name similarity checks (updated 2026-11-26)

First recorded on 2026-11-24; re-checked for #18. The exact-name registries are
clear. The open risk is a **collision with an existing company**, not an
unclaimed name.

### Registry and platform checks

| Check | Result | How it was checked |
|---|---|---|
| npm `swipeline`, `swipelines`, `swipe-line`, `swipe-pipeline` | all HTTP 404 | `registry.npmjs.org/<name>` |
| npm text search for `swipeline` | 0 results | `registry.npmjs.org/-/v1/search?text=swipeline` |
| PyPI `swipeline`, `swipe-line`, `swipe-pipeline` | all HTTP 404 | `pypi.org/pypi/<name>/json` |
| pub.dev search for `swipeline` | no exact or near match; only generic pipeline packages (`pipeliner`, `smf_pipeline`, `flutter_pipeline`, `gpu_pipeline`, `image_pipeline`, …) | `pub.dev/api/search?q=swipeline` |
| GitHub organisation `swipeline` | HTTP 404 on an unauthenticated request, so unclaimed as far as a public check can tell. The project token has no `admin:org` scope, so creating it stays a signed-in step | `GET /orgs/swipeline` |

### Domain status

| Domain | Status on 2026-11-26 | Source |
|---|---|---|
| `swipeline.dev` | **Unregistered** — RDAP returns 404 "not found", and there are no NS records | `rdap.org/domain/swipeline.dev`, `dig NS` |
| `swipeline.io` | **Unregistered** — whois returns "Domain not found", and there are no NS records | `whois swipeline.io`, `dig NS` |
| `swipeline.co` | **Registered 2021-09-14** (GoDaddy) and serving a site | `whois swipeline.co` |

### Name collision: Swipeline Media

An active Turkish technology-media company already uses the name:

- `swipeline.co`, "Swipeline" — startup and technology news in short formats;
  Istanbul; a 2019 podcast that became a media company in 2021.
- Company pages on LinkedIn (`swipelinetr`), Dealroom and CB Insights, an
  Instagram account (`@swipeline_tr`), and a reported $250K round in 2022.

It is a different field (media publishing, not a developer toolkit) and a
different TLD, so it does not by itself block the name. It does mean:

- the name is not unique on the open web, so search results will mix the two;
- handles matching the project name are likely taken, so plan on adapted
  handles rather than `@swipeline`;
- a trademark search in classes 9 and 42 matters **more**, not less, because the
  other user sits in the same broad technology sector.

### Not done here

- **Trademark search.** USPTO's `tmsearch` endpoint rejects automated requests
  (HTTP 405) and WIPO's Global Brand Database terms forbid automated queries, so
  this needs a person in a browser or a paid search service. Classes 9 and 42.
  The scope, registries, questions and decision gates are written up in the
  [trademark search brief](2026-11-trademark-brief.md) so the search can be run
  without re-doing this note.
- Domain purchase and social-handle reservation — needs payment and accounts.
- Pronunciation and spelling check with developers.

Still outstanding (#18): trademark clearance, buying `swipeline.dev` and
`swipeline.io` while both are free, reserving handles, and the spelling check.
