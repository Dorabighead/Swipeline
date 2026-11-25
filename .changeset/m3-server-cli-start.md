---
"@swipeline/server": minor
"@swipeline/cli": minor
---

Start M3 with a working slice: `@swipeline/server` serves `/health`, validates and appends `POST /events` idempotently, exports a JSONL history, erases an actor, and supports an auth hook plus allow-listed CORS. `@swipeline/cli` ships the `swipeline` binary with `serve` and `validate`, and reports exit codes 0/1/2.
