import { defineConfig } from 'oxlint'

import { base, options } from './src/index.ts'

export default defineConfig({
  extends: [base],
  ignorePatterns: ['dist/**'],
  options,
  rules: {
    'filename-case': ['error', { cases: { kebabCase: true } }],
    // ESTree uses `null` for absent nodes.
    'no-null': 'off',
    'sort-keys': ['error', 'asc', { allowLineSeparatedGroups: true, natural: true }],
  },
})
