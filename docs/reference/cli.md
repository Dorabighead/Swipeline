# CLI

The `swipeline` command runs the optional server and checks a history export.
Everything it does is also a library call; the CLI exists to remove setup friction.

::: warning Milestone M3 in progress
`serve` and `validate` are implemented in `@swipeline/cli`. Everything under
[Planned](#planned-v03-contract) is the v0.3 contract and exits with code 2 today.
:::

## Implemented

| Command | What it does |
|---|---|
| `swipeline serve [--port <port>] [--host <host>] [--cors <origin>]…` | Starts the HTTP API with the in-memory event log |
| `swipeline validate <history.jsonl>` | Validates every non-empty line against the `SwipeEvent` schema and reports line numbers |
| `swipeline help` | Prints usage |

```bash
# Serve the API for a local client
swipeline serve --port 8787 --cors http://localhost:5173

# Check an exported history before importing it somewhere else
swipeline validate ./history.jsonl
```

`serve` uses the in-memory log, so history is lost when the process exits. SQLite
and Postgres storage are the next M3 slice — see
[Self-host the server](/guides/self-host-the-server).

`validate` ignores blank lines, so a file with a trailing newline is fine:

```text
$ swipeline validate ./history.jsonl
line 2: id: Invalid string: must match pattern ...
1 invalid line(s).
```

## Planned (v0.3 contract)

| Command | What it will do |
|---|---|
| `npm create swipeline@latest <dir> -- --template <name>` | Scaffold a project (`blank`, `books`, `papers`, `recipes`, `products`) |
| `swipeline init` | Detect the framework, write `deck.config.ts`, print the install command |
| `swipeline source add <url \| adapter>` | Fetch a sample, preview normalized cards, write the mapping |
| `swipeline dev` | Local playground with a ranker inspector and "why this card" |
| `swipeline bench` | Run the synthetic-user benchmark against a pipeline |
| `swipeline export` / `import` | Portable history in JSONL |
| `swipeline doctor` | Diagnose versions, peer dependencies and configuration |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Validation failed or a file could not be read |
| `2` | Bad usage, missing configuration or a command that is not implemented yet |
| `3` | Benchmark regression beyond the configured threshold (planned with `bench`) |

CI relies on these codes, so they are part of the contract.
