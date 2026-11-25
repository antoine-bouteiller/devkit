import type { OxfmtConfig } from 'oxfmt'
import type { OxlintConfig } from 'oxlint'

export type { KnipConfig } from 'knip'

export { defineKnipConfig } from './knip.ts'

/*
 * Every rule named here must exist in the pinned `oxlint` and in the one each consumer's Vite+ bundles:
 * Oxlint refuses to load a config that names an unknown rule.
 */

/** Settings shared by every project. `filename-case` stays in each project. */
export const base = {
  categories: {
    correctness: 'error',
    perf: 'error',
    style: 'error',
    suspicious: 'error',
  },
  env: {
    builtin: true,
    commonjs: true,
    node: true,
  },
  jsPlugins: [{ name: 'devkit', specifier: '@antoine-bouteiller/devkit/plugin' }],
  plugins: ['typescript', 'unicorn', 'import'],
  rules: {
    // Restriction
    complexity: ['error', 15],
    'default-case': 'error',
    'no-array-for-each': 'error',
    'no-console': 'error',
    'no-empty': 'error',
    'no-empty-function': 'error',
    'no-explicit-any': 'error',
    'no-non-null-assertion': 'error',
    'no-unused-expressions': 'error',
    'no-unused-vars': 'error',
    'prefer-modern-math-apis': 'error',
    'prefer-number-properties': 'error',

    // Pedantic
    'no-deprecated': 'error',
    'no-negated-condition': 'error',
    'prefer-string-replace-all': 'error',

    // Suspicious
    'no-unassigned-import': 'off',

    // Style
    'exports-last': 'off',
    'group-exports': 'off',
    'max-nested-calls': 'off',
    // Contradicts `devkit/no-object-parameters`.
    'max-params': 'off',
    'max-statements': 'off',
    // Separate `import type` lines keep type-only dependencies visible.
    'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
    'no-magic-numbers': 'off',
    'no-named-export': 'off',
    'no-nodejs-modules': 'off',
    'no-ternary': 'off',
    'one-var': 'off',
    'prefer-default-export': 'off',
    'sort-imports': 'off',

    'devkit/no-conditional-empty-object-spread': 'error',
    'devkit/no-known-value-widening': 'error',
    'devkit/no-low-signal-symbol-names': 'error',
    'devkit/no-module-mocking': 'error',
    'devkit/no-object-parameters': 'error',
    'devkit/no-spec-ids-in-test-names': 'error',
    'devkit/no-unknown-type-aliases': 'error',
    'devkit/no-unsafe-dictionary-type': 'error',
  },
} satisfies OxlintConfig

/** Settings shared by Effect projects, layered after `base` and `@effect/tsgo`'s `recommended` preset. */
export const effect = {
  // Extended configs union their `plugins`; `effecttsgo` comes from the `recommended` preset.
  plugins: ['node'],
  rules: {
    'consistent-type-specifier-style': ['error', 'prefer-inline'],
    'custom-error-definition': 'off',
    'func-names': ['error', 'as-needed', { generators: 'never' }],
    'init-declarations': 'off',
    'new-cap': 'off',
    'no-await-in-loop': 'off',
    'no-continue': 'off',
    // Synchronous callbacks bridge through `Effect.runSync` and `Schema.*Sync`.
    'no-sync': 'off',
    // `_tag` is Effect's discriminant on Exit, Cause, and tagged errors; reading it is public API.
    'no-underscore-dangle': ['error', { allow: ['_tag'] }],
    // Flags the `Schema.TaggedError<X>()(...)` heritage clause, which cannot use `new`.
    'throw-new-error': 'off',

    // Pipeable data-last overloads are for library APIs composed through `pipe`.
    'effecttsgo/missing-pipeable-signature': 'off',
    // FileSystem, Path, Crypto, HTTP, and the platform layers have no stable alternative.
    'effecttsgo/unstable-api-usage': 'off',
  },
} satisfies OxlintConfig

/** Settings shared by React projects, layered after `base`. They assume React Compiler handles memoization. */
export const react = {
  plugins: ['react'],
  rules: {
    // Conflicts with `func-style`.
    'function-component-definition': 'off',
    'jsx-max-depth': 'off',
    'jsx-no-constructed-context-values': 'off',
    'jsx-props-no-spreading': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            importNames: ['useMemo', 'useCallback'],
            message: 'Rely on React Compiler instead of manual memoization with useMemo or useCallback.',
            name: 'react',
          },
        ],
      },
    ],
    'react-in-jsx-scope': 'off',
    'style-prop-object': 'off',

    'react/capitalized-calls': 'error',
    'react/error-boundaries': 'error',
    'react/globals': 'error',
    'react/hooks': 'error',
    'react/immutability': 'error',
    'react/incompatible-library': 'error',
    'react/invariant': 'error',
    'react/preserve-manual-memoization': 'error',
    'react/purity': 'error',
    'react/refs': 'error',
    'react/rule-suppression': 'error',
    'react/set-state-in-effect': 'error',
    'react/set-state-in-render': 'error',
    'react/static-components': 'error',
    'react/syntax': 'error',
    'react/todo': 'error',
    'react/unsupported-syntax': 'error',
    'react/use-memo': 'error',
    'react/void-use-memo': 'error',
  },
} satisfies OxlintConfig

/** Settings shared by Vite+ projects, layered after `base` and before `react`. */
export const vitePlus = {
  env: { browser: true, 'shared-node-browser': true },
  jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
  // Without `plugins`, an extended config brings Oxlint's default plugins, which add `oxc`.
  plugins: [],
  rules: {
    'id-length': ['error', { exceptions: ['$', 'x', 'y', 'z'] }],
    'no-namespace': 'off',
    'no-null': 'off',
    'no-underscore-dangle': 'off',
    'no-unneeded-ternary': 'off',
    'vite-plus/prefer-vite-plus-imports': 'error',
  },
} satisfies OxlintConfig

/** Each root config sets these itself: Oxlint reads `options` only from the root config, so `extends` cannot carry them. */
export const options = { reportUnusedDisableDirectives: 'error', typeAware: true, typeCheck: true } satisfies OxlintConfig['options']

/** A `no-restricted-imports` pattern. Not part of `base`, because a project's rule options replace a preset's. */
export const parentImportRestriction = {
  message: 'Imports must not traverse more than one parent directory. Use an alias instead.',
  regex: String.raw`^\.\./\.\.(/|$)`,
}

/** Format options shared by Vite+ (`fmt`), standalone oxfmt, and `bun fmt` through `dist/fmt.json`. */
export const fmt = { printWidth: 150, semi: false, singleQuote: true, sortImports: {}, trailingComma: 'es5' } satisfies OxfmtConfig

/** Vite+ `staged` config. */
export const staged = { '*': 'vp check --fix' }
