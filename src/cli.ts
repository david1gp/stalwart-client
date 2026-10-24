#!/usr/bin/env bun
import { run } from "@stricli/core"
import { stalwartClientApp } from "./cli/cliApp.js"

await run(stalwartClientApp, process.argv.slice(2), { process })
