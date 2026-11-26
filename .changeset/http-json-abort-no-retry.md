---
"@swipeline/adapter-http-json": patch
---

When a pending HTTP JSON request settles after cancellation, reject with `HttpJsonError('request aborted')` without retry backoff. Discard responses and parsed bodies that arrive after cancellation.
