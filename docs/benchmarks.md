# Benchmarks

Most swipe and recommendation demos never measure whether personalization works.
`@swipeline/bench` simulates users, replays swipes and reports numbers.

::: tip Status
The harness ships in `packages/bench` and the regression gate runs in `ci.yml` as
`pnpm bench:gate`. The numbers below are from that harness, and every one of them
is synthetic.
:::

## What the harness does

1. **Synthetic users.** Each user has a hidden weight per tag and a noisy
   decision rule: the probability of `like` rises with affinity, and per-card
   noise is seeded so the run is reproducible.
2. **Replay.** A seeded RNG picks `k` cards per user against one strategy, and the
   profile is updated after each like or dislike as it would be in a real deck.
3. **Strategies.** `default` (the shipped pipeline), `random`, `popularity` and
   `tagOnly` (affinity only, no exploration or diversity). `random` and
   `popularity` are the two baselines the milestone is measured against.
4. **Report.** Precision@k, time-to-first-like, regret against an oracle,
   intra-list diversity, catalog coverage and exploration rate.

The harness reports one aggregate per strategy across users; per-checkpoint
curves (10/30/100 swipes) are a planned extension, not something the current
export contains.

## Metrics

| Metric | Definition | Better |
|---|---|---|
| Precision@k | Fraction of the `k` picks the user liked | Higher |
| Time-to-first-like | Swipes until the first like (`null` if none) | Lower |
| Regret vs oracle | Expected likes lost against an always-best pick | Lower |
| Intra-list diversity | Distinct tags among picks, divided by picks | Higher, up to a point |
| Catalog coverage | Distinct cards picked / catalog size | Higher |
| Exploration rate | Share of picks below the pool's median popularity | Configurable target |

## Measured results (2026-11-26)

`runBenchmark({ seed: 42, users: 20, cards: 60, k: 10 })` — 200 picks per
strategy over a 60-card synthetic catalog:

| Strategy | Precision@10 | Regret | Diversity | Coverage | Exploration |
|---|---|---|---|---|---|
| **default** | **0.665** | 50.44 | 0.055 | 0.967 | 0.390 |
| random | 0.600 | 58.91 | 0.055 | 0.967 | 0.535 |
| popularity | 0.630 | 60.45 | 0.040 | 0.167 | 0.000 |
| tagOnly | 0.595 | 59.79 | 0.045 | 0.167 | 0.400 |

The default pipeline beats random by **0.065 precision@10 (+10.8% relative)** and
popularity by **0.035 (+5.6% relative)**, with roughly six times the catalog
coverage of the popularity baseline.

The margin the gate actually enforces is narrower than "beats popularity": it
requires the default to stay **within 0.05 below** popularity, which is a
regression guard rather than a quality claim. Read the table as "the mechanics
behave as configured", not as a product claim — see the section below.

## The CI gate

`ci.yml` runs `pnpm bench:gate` (which is
`vitest run packages/bench/test/bench.test.ts`) on every pull request. On the
fixed seed the default pipeline must:

- beat random by more than 10% (`default > random × 1.1`),
- stay within 0.05 below popularity,
- keep diversity above 0.03 and coverage above 0.3.

The thresholds live in `packages/bench/test/gate.test.ts`, not in a person's head,
so "it feels better" is not the argument. A nightly re-run against the previous
`main` result, and a PR comment with the diff, are still to be wired: today the
gate runs per pull request only.

## What this proves and what it does not

**Proves:** the mechanics work, changes are measurable and seeded, regressions in
precision, diversity or coverage fail CI.

**Does not prove:** real-world satisfaction. Synthetic users are a proxy, and the
noise model is ours. Real evaluation requires opt-in feedback from actual users,
which is a later, clearly labelled study. Any published number says "synthetic"
next to it.

## Running locally

```bash
pnpm bench:gate                      # the CI gate, fixed seed
```

```ts
import { runBenchmark } from '@swipeline/bench'

const report = await runBenchmark({ seed: 42, users: 20, cards: 60, k: 10 })
console.log(report.strategies.default.precisionAtK)
```

Reports are plain JSON, so a pull request can attach one and CI can diff it.
`swipeline bench` on the command line is part of the M3 CLI contract and exits
with code 2 until it is implemented.

## Datasets

The catalog is generated from the seed, so nothing is redistributed today. A
public sample would be added only when its license permits redistribution, with
the license recorded next to the data.
