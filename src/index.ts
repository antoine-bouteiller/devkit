import type { OxlintConfig } from 'oxlint'

/*
 * Every rule named here must exist in the oldest `oxlint` allowed by `peerDependencies`:
 * Oxlint refuses to load a config that names an unknown rule.
 */

/** Settings shared by every project. `options` and `filename-case` stay in each project: Oxlint reads `options` only from the root config. */
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
  jsPlugins: [{ name: 'lint-config', specifier: '@antoine-bouteiller/lint-config/plugin' }],
  plugins: ['typescript', 'unicorn', 'import'],
  rules: {
    // Restriction
    complexity: ['error', 15],
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
    'max-statements': 'off',
    'no-magic-numbers': 'off',
    'no-named-export': 'off',
    'no-nodejs-modules': 'off',
    'no-ternary': 'off',
    'one-var': 'off',
    'prefer-default-export': 'off',
    'sort-imports': 'off',

    'lint-config/no-conditional-empty-object-spread': 'error',
    'lint-config/no-known-value-widening': 'error',
    'lint-config/no-low-signal-symbol-names': 'error',
    'lint-config/no-module-mocking': 'error',
    'lint-config/no-object-parameters': 'error',
    'lint-config/no-unknown-type-aliases': 'error',
    'lint-config/no-unsafe-dictionary-type': 'error',
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
