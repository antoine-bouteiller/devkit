# @antoine-bouteiller/devkit

Shared Oxlint config and custom rules for my projects. Works with raw `oxlint`, with Vite+ (`vp lint`), and with `bun lint`.

## Usage

```sh
pnpm add -D @antoine-bouteiller/devkit
```

`oxlint.config.ts`:

```ts
import { base, options } from '@antoine-bouteiller/devkit'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base],
  options,
  rules: {
    'filename-case': ['error', { cases: { snakeCase: true } }],
  },
})
```

Vite+ (`vite.config.ts`) also extends `vitePlus`, after `base` and before `react`. It adds the browser environments, the `vite-plus` plugin, and the rules both Vite+ projects loosen:

```ts
import { base, fmt, options, parentImportRestriction, staged, vitePlus } from '@antoine-bouteiller/devkit'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt,
  lint: {
    extends: [base, vitePlus],
    options,
    rules: { 'no-restricted-imports': ['error', { patterns: [parentImportRestriction] }] },
  },
  staged,
})
```

`parentImportRestriction` forbids imports that climb more than one parent directory. It is a `no-restricted-imports` pattern rather than a rule, because a project's rule options replace a preset's.

Effect projects also extend `effect`, after `@effect/tsgo`'s preset:

```ts
import { base, effect } from '@antoine-bouteiller/devkit'
import { recommended } from '@effect/tsgo/oxlint-presets'

export default defineConfig({ extends: [recommended, base, effect] })
```

React projects also extend `react`, after `base`. It turns on the React Compiler rules and forbids importing `useMemo` and `useCallback`:

```ts
import { base, react } from '@antoine-bouteiller/devkit'

export default defineConfig({ extends: [base, react] })
```

A project that sets `no-restricted-imports` replaces the `useMemo` and `useCallback` restriction, so it must repeat it.

Oxlint reads `options` only from the root config, so each project sets it to the shared `options`. `filename-case` stays per project.

## Bun

`bun lint` reads `oxlint.config.ts` and needs neither `oxlint` nor `oxlint-tsgolint` installed. Without an `oxlint.config.ts`, point `bunfig.toml` at the JSON copy of a preset:

```toml
[lint]
config = "node_modules/@antoine-bouteiller/devkit/dist/base.json" # or dist/react.json
typeAware = true
typeCheck = true

[lint.rules]
"filename-case" = ["error", { cases = { snakeCase = true } }]
```

`config` takes a file path, not a package specifier. Bun reads a `.js` config as an ESLint config, so the presets ship as JSON. `effect` has no JSON copy, because it builds on `@effect/tsgo`'s preset.

## Formatting

`fmt` holds the format options. Vite+ projects set it as `fmt`, and standalone oxfmt spreads it in `oxfmt.config.ts`:

```ts
import { fmt } from '@antoine-bouteiller/devkit'
import { defineConfig } from 'oxfmt'

export default defineConfig({ ...fmt, ignorePatterns: ['dist/**'] })
```

`bun fmt` reads the JSON copy:

```toml
[fmt]
config = "node_modules/@antoine-bouteiller/devkit/dist/fmt.json"
```

## Custom rules

`base` enables every rule of the bundled `devkit` plugin:

- `devkit/no-conditional-empty-object-spread`
- `devkit/no-known-value-widening`
- `devkit/no-low-signal-symbol-names`
- `devkit/no-module-mocking`
- `devkit/no-object-parameters`
- `devkit/no-spec-ids-in-test-names`
- `devkit/no-unknown-type-aliases`
- `devkit/no-unsafe-dictionary-type`

## Oxlint version

Oxlint refuses a config that names a rule it does not know. The presets may therefore only use rules available in the oldest `oxlint` allowed by `peerDependencies`. The dev toolchain pins that version, and Renovate does not bump it. To use a newer rule, raise the peer minimum and the dev pins together.

`bun lint` runs the rules of the oxlint version it bundles, 1.87 as of Bun 1.4.6, and exits with code 2 on a rule it does not know. A new rule must also exist in that version. `bun lint --no-script --doctor` lists the rules Bun does not run.

## Release

The package ships compiled JS in `dist/`, because Node refuses to strip types from files under `node_modules`.

Every push to `main` runs the `Release` workflow. After the quality checks pass, semantic-release reads the Conventional Commits since the last `v*` tag. `feat` publishes a minor, `fix` and `perf` a patch, and a breaking change a major. Other types, including Renovate's `chore(deps)`, publish nothing.

semantic-release tags the commit, creates the GitHub release, and runs `pnpm publish` through npm trusted publishing. The `version` in `package.json` is a placeholder; the git tags hold the real version.
