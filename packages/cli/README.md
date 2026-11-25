# @swipeline/cli

The `swipeline` command. Two commands work today; the rest of the v0.3 contract is
tracked in the roadmap.

```bash
swipeline serve --port 8787 --cors https://app.example.com
swipeline validate ./history.jsonl
```

## `swipeline serve`

Starts `@swipeline/server` with the in-memory event log, so history lasts as long
as the process. Storage (SQLite, Postgres) and the remote store are the next M3
slice; until then this is useful for testing a client against the real routes.

| Flag | Default | Meaning |
|---|---|---|
| `--port` | `8787` | Listen port |
| `--host` | `127.0.0.1` | Bind address |
| `--cors` | none | Allowed origin; repeat for more |

## `swipeline validate`

Reads a JSONL export and validates every non-empty line against the `SwipeEvent`
schema. Errors print with their line number:

```text
$ swipeline validate ./history.jsonl
line 2: id: Invalid string: must match pattern ...
1 invalid line(s).
```

Blank lines are ignored, so an export with a trailing newline is fine.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Validation failed or a file could not be read |
| `2` | Bad usage |

`3` (benchmark regression) belongs to the planned `swipeline bench` command.

## Planned

`init`, `source add`, `dev`, `bench`, `export`, `import` and `doctor` are the v0.3
contract; they are not implemented yet, and the command says so rather than
pretending otherwise.
