import { writeFileSync } from 'node:fs'

import { base, react } from '../src/index.ts'

/*
 * `bunfig.toml` can name an oxlint config only by file path, and Bun reads a `.js` config as an ESLint config.
 * `effect` is not written: it depends on `@effect/tsgo`'s preset, which a JSON file cannot import.
 */
const configs = {
  base,
  react: { extends: ['./base.json'], ...react },
}

for (const [name, config] of Object.entries(configs)) {
  writeFileSync(new URL(`../dist/${name}.json`, import.meta.url), `${JSON.stringify(config, null, 2)}\n`)
}
