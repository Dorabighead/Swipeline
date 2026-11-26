# Trademark search brief: "Swipeline"

**Prepared:** 2026-11-26. **Purpose:** give a person or attorney everything needed
to run the trademark clearance that #18 requires, without repeating the research
in [`2026-11-m0-verification.md`](2026-11-m0-verification.md).

This is a brief, not legal advice and not a clearance opinion. Nothing below
concludes that the mark is available. The automated lookups that could be made
were made; the ones that require a browser, a paid service or a lawyer are listed
as tasks.

## 1. The mark and what it covers

| Item | Detail |
|---|---|
| Word mark | **Swipeline** (one word, no space) |
| Variants to search | `swipeline`, `swipe-line`, `swipelines`, `swipe line`, phonetic `swipe-lyne` |
| Owner (today) | Joey Hammoth, as an individual; intended to move to the `swipeline` organisation with the repository (ADR-0010) |
| Use | Open-source JavaScript/TypeScript toolkit: adapters, a ranking pipeline, a deck engine and UI bindings, plus an optional self-hosted HTTP server and CLI |
| Delivery | npm packages under the `@swipeline` scope, a documentation site, a playground, and a future command `npx swipeline` |
| Logo | `docs/public/brand/logo.svg`; the word mark matters more than the logo for clearance |

## 2. Classes to search

| Class | Covers | Why it matters here |
|---|---|---|
| **9** | Downloadable software, software libraries, apps | The npm packages and any bundled app are goods in class 9 |
| **42** | Software design and development, SaaS, API and platform services | The optional hosted server, and developer services generally |
| 35 | Advertising, marketing, business data services | Only if a commercial recommendation service is ever offered; the project has no hosted offering planned (open question 9) |
| 41 | Publishing, entertainment | Relevant only because the known third party is a media publisher; check it to understand *their* coverage, not to claim it |

Priority: **9 and 42 in the US and the EU**, then Turkey (§3), then any other
market the project would publish from or market into.

## 3. Known third-party use: Swipeline Media

This is the one collision already found, and it is why the search matters more
rather than less:

- `swipeline.co`, registered **2021-09-14** through GoDaddy, serving a Turkish
  startup/technology news site written in short formats.
- Istanbul-based; a 2019 podcast that became a media company in 2021.
- Company pages on LinkedIn (`swipelinetr`), Instagram (`@swipeline_tr`),
  Dealroom and CB Insights; a reported **$250K round in 2022**.

What is *not* known and is the first question for the search: **whether they hold
a registered trademark**, in which classes, and in which jurisdictions. A domain
and a company name are not a trademark registration, so the answer could be
"nothing registered" or "registered in class 41 in Turkey" — both change the
risk picture.

Likely impact if they hold nothing in 9/42: coexistence is normal across different
fields, but search results will always mix the two, and social handles matching
the bare name are already taken.

## 4. Searches to run

Record each result with source, date and a screenshot or reference number.

### 4.1 Registries

| Registry | URL | What to look for |
|---|---|---|
| USPTO (US) | `tmsearch.uspto.gov` | Exact and near marks in classes 9, 42; live and dead |
| EUIPO (EU) | `euipo.europa.eu/eSearch` | Same, plus EU-wide earlier rights |
| TÜRKPATENT (TR) | `turkpatent.gov.tr` | Swipeline Media's own filings first |
| UKIPO (UK) | `gov.uk/search-for-trademark` | Only if the UK is a target market |
| WIPO Global Brand Database | `branddb.wipo.int` | Cross-registry sweep, including Madrid designations |

Automated access is blocked or forbidden for all of these: USPTO's `tmsearch`
endpoint returns HTTP 405 to scripts, and the WIPO database's terms prohibit
automated queries. This part needs a browser or a paid search service.

### 4.2 Common-law and unregistered use

- App stores (Apple App Store, Google Play) for "Swipeline" and "Swipe Line".
- GitHub organisation and repository search; npm, PyPI, pub.dev text search.
- Product Hunt, Crunchbase, Dealroom, LinkedIn company search.
- A plain web search for `"swipeline" swipe`, `"swipeline" recommend`, and
  `swipeline library`.

### 4.3 Pronunciation and spelling

Ask five developers to spell the name after hearing it, and to pronounce it after
reading it. The relevant failure is someone typing `swipeline` or `swipe-line`
and landing nowhere. This is a five-minute task and closes the last box in the
design plan's §17.3 checklist.

## 5. Questions the search must answer

1. Is there a live registered mark identical or confusingly similar to
   "Swipeline" in class 9 or 42 in the US or the EU?
2. Does Swipeline Media hold any registration, and in which classes and
   countries?
3. Are there near marks (`Swipe Line`, `Swipline`, `Swipe Pipeline`) in software
   classes that a registrar would treat as confusingly similar?
4. Is the name descriptive or generic for a swipe-based recommendation toolkit?
   Both halves are ordinary words in this field, so expect a registrar to
   consider a descriptiveness objection in class 9. The answer decides how much
   a registration would be worth, and whether it is worth filing at all.
5. If a conflict exists, what is the cheapest mitigation: a different class, a
   coexistence agreement, a slightly different mark, or a rename?

## 6. Decision gates

| Outcome | Action |
|---|---|
| Nothing confusingly similar in 9/42 in US/EU | Proceed: create the org, transfer (#1), register `swipeline.dev` and `swipeline.io`, file an application in 9/42 if the budget allows |
| Similar mark exists but in an unrelated class or country | Proceed with the name, record the risk, and avoid implying endorsement; revisit before a paid offering |
| Confusingly similar live mark in 9 or 42 in a target market | **Rename before the organisation is created and before the first npm publish.** The npm scope, domain and handles all follow the name, so this is the last cheap moment to change it |
| Swipeline Media holds a registration covering software | Take advice before publishing; coexistence may still be fine, but it is a lawyer's call, not a maintainer's |

The order matters: the organisation name, npm scope and domains are all
downstream of this decision, and renaming after publishing is the expensive path.

## 7. What a paid search should include

If this goes to a search service or attorney, ask for:

- a knockout search first (identical marks only) to decide within days whether to
  continue;
- a full availability search in classes 9 and 42 for US and EU, with Turkey as a
  watch item;
- a written opinion on the likelihood of confusion with Swipeline Media;
- the cost and timeline for an application in each jurisdiction, if the decision
  is to file.

## 8. Status

| Item | State |
|---|---|
| Exact-name registry checks (npm, PyPI, pub.dev) | Done, all clear — see the verification note |
| GitHub organisation name | Free as far as a public check can tell |
| `swipeline.dev`, `swipeline.io` | Unregistered on 2026-11-26 |
| Known third-party company | Swipeline Media (Istanbul), documented above |
| Trademark registries | **Not searched** — blocked to automation |
| Common-law web/app-store search | Not done |
| Pronunciation and spelling check | Not done |
| Legal opinion | Not obtained |

When the searches in §4 are done, record the outcome in §8 and in the
verification note, then close #18 or open a rename decision.
