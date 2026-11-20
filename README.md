# @antoine-bouteiller/lint-config

Shared Oxlint config and custom rules for my projects. Works with raw `oxlint` and with Vite+ (`vp lint`).

## Usage

```sh
pnpm add -D @antoine-bouteiller/lint-config
```

`oxlint.config.ts`:

```ts
import { base } from '@antoine-bouteiller/lint-config'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base],
  options: { typeAware: true, typeCheck: true },
  rules: {
    'filename-case': ['error', { cases: { snakeCase: true } }],
  },
})
```

Vite+ (`vite.config.ts`):

```ts
import { base } from '@antoine-bouteiller/lint-config'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: { extends: [base], options: { typeAware: true, typeCheck: true } },
})
```

Effect projects also extend `effect`, after `@effect/tsgo`'s preset:

```ts
import { base, effect } from '@antoine-bouteiller/lint-config'
import { recommended } from '@effect/tsgo/oxlint-presets'

export default defineConfig({ extends: [recommended, base, effect] })
```

Oxlint reads `options` only from the root config, so each project sets it. `filename-case` also stays per project.

## Custom rules

`base` enables every rule of the bundled `lint-config` plugin:

- `lint-config/no-conditional-empty-object-spread`
- `lint-config/no-known-value-widening`
- `lint-config/no-low-signal-symbol-names`
- `lint-config/no-module-mocking`
- `lint-config/no-object-parameters`
- `lint-config/no-unknown-type-aliases`
- `lint-config/no-unsafe-dictionary-type`

## Oxlint version

Oxlint refuses a config that names a rule it does not know. `base` and `effect` may therefore only use rules available in the oldest `oxlint` allowed by `peerDependencies`. The dev toolchain pins that version, and Renovate does not bump it. To use a newer rule, raise the peer minimum and the dev pins together.

## Release

The package ships compiled JS in `dist/`, because Node refuses to strip types from files under `node_modules`.

1. Bump `version` in `package.json` and commit.
2. Push a `v<version>` tag. The `Release` workflow tests and runs `pnpm publish` through npm trusted publishing.
