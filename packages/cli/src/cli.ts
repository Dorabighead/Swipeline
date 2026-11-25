#!/usr/bin/env node
import { run } from './index.js'

run(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code
  })
  .catch((cause: unknown) => {
    console.error(cause instanceof Error ? cause.message : cause)
    process.exitCode = 1
  })
