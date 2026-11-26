---
"@swipeline/adapter-http-json": patch
---

Stop retrying or parsing HTTP JSON adapter requests after an abort signal fires. In-flight cancellations now reject immediately with `HttpJsonError('request aborted')` without sleeping, and responses resolving after abort are discarded.
