# @antoine-bouteiller/lint-config

Shared Oxlint config and custom rules for my projects. Works with raw `oxlint`, with Vite+ (`vp lint`), and with `bun lint`.

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

React projects also extend `react`, after `base`. It turns on the React Compiler rules and forbids importing `useMemo` and `useCallback`:

```ts
import { base, react } from '@antoine-bouteiller/lint-config'

export default defineConfig({ extends: [base, react] })
```

A project that sets `no-restricted-imports` replaces the `useMemo` and `useCallback` restriction, so it must repeat it.

Oxlint reads `options` only from the root config, so each project sets it. `filename-case` also stays per project.

## Bun

`bun lint` reads `oxlint.config.ts` and needs neither `oxlint` nor `oxlint-tsgolint` installed. Without an `oxlint.config.ts`, point `bunfig.toml` at the JSON copy of a preset:

```toml
[lint]
config = "node_modules/@antoine-bouteiller/lint-config/dist/base.json" # or dist/react.json
typeAware = true
typeCheck = true

[lint.rules]
"filename-case" = ["error", { cases = { snakeCase = true } }]
```

`config` takes a file path, not a package specifier. Bun reads a `.js` config as an ESLint config, so the presets ship as JSON. `effect` has no JSON copy, because it builds on `@effect/tsgo`'s preset.

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

Oxlint refuses a config that names a rule it does not know. The presets may therefore only use rules available in the oldest `oxlint` allowed by `peerDependencies`. The dev toolchain pins that version, and Renovate does not bump it. To use a newer rule, raise the peer minimum and the dev pins together.

`bun lint` runs the rules of the oxlint version it bundles, 1.87 as of Bun 1.4.6, and exits with code 2 on a rule it does not know. A new rule must also exist in that version. `bun lint --no-script --doctor` lists the rules Bun does not run.

## Release

The package ships compiled JS in `dist/`, because Node refuses to strip types from files under `node_modules`.

Every push to `main` runs the `Release` workflow. After the quality checks pass, semantic-release reads the Conventional Commits since the last `v*` tag. `feat` publishes a minor, `fix` and `perf` a patch, and a breaking change a major. Other types, including Renovate's `chore(deps)`, publish nothing.

semantic-release tags the commit, creates the GitHub release, and runs `pnpm publish` through npm trusted publishing. The `version` in `package.json` is a placeholder; the git tags hold the real version.
